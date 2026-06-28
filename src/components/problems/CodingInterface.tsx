"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import type { Problem, TestCase } from "@/lib/problems";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Send, 
  BrainCircuit, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Lightbulb, 
  Zap, 
  Settings, 
  Terminal, 
  AlertCircle,
  Info,
  Sparkles,
  Type,
  Code2
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { explainAndImproveCode } from "@/ai/flows/code-explanation-and-improvement";
import { useToast } from "@/hooks/use-toast";
import { generateHint } from "@/ai/flows/generate-hint";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { executeCode, type Judge0SubmissionResult } from "@/lib/judge0";

type Language = "python" | "java" | "cpp" | "javascript";

type TestCaseResult = {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    error?: string;
};

type AIFeedback = {
    explanation: string;
    optimalSolutionHint: string;
    codeImprovements: string;
};

type HintCategory = 'syntax' | 'typo' | 'api' | 'runtime' | 'logic' | 'optimization' | 'progress';

type Hint = {
  text: string;
  category: HintCategory;
  lineNumber?: number;
  level?: number;
};

const getDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; matrix[0][j] = j++);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
};

const findCorrection = (word: string, dictionary: string[]): string | null => {
  if (word.length < 3) return null;
  for (const target of dictionary) {
    if (word.toLowerCase() === target.toLowerCase()) return target;
    if (getDistance(word.toLowerCase(), target.toLowerCase()) === 1) return target;
  }
  return null;
};

const DICTIONARIES: Record<string, string[]> = {
  java: ['length', 'println', 'parseInt', 'Scanner', 'Arrays', 'equals', 'ArrayList', 'HashMap', 'Integer', 'String', 'System', 'public', 'static', 'void', 'main', 'return', 'class', 'import', 'System.out.println'],
  cpp: ['cout', 'endl', 'vector', 'string', 'cin', 'push_back', 'size', 'begin', 'end', 'std', 'include', 'return', 'main', 'using', 'namespace', 'std::cout', 'std::endl'],
  python: ['print', 'append', 'range', 'enumerate', 'split', 'join', 'strip', 'len', 'input', 'return', 'def', 'class', 'import', 'self', 'if', 'else', 'elif', 'while', 'for', 'in'],
  javascript: ['console', 'log', 'document', 'window', 'length', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'map', 'filter', 'reduce', 'function', 'const', 'let', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'console.log']
};

export default function CodingInterface({ problem }: { problem: Problem }) {
    const db = useFirestore();
    const { user } = useUser();
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState(problem.starterCode.python);
    const [fontSize, setFontSize] = useState(14);
    
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [feedbackError, setFeedbackError] = useState(false);
    const [activeTab, setActiveTab] = useState("output");
    const [runResult, setRunResult] = useState<{ output: string; passed?: boolean; status?: string } | null>(null);
    const [hints, setHints] = useState<Hint[]>([]);
    
    const lastNormalizedCode = useRef<string>("");
    const hintLevel = useRef<number>(0);
    const hintCache = useRef<Record<string, Hint>>({});

    useEffect(() => {
        setCode(problem.starterCode[language]);
        setHints([]);
        lastNormalizedCode.current = "";
        hintLevel.current = 0;
        hintCache.current = {};
        setRunResult(null);
        setTestResults([]);
        setAIFeedback(null);
        setFeedbackError(false);
    }, [problem, language]);

    const [isExecuting, startExecuting] = useTransition();
    const [isSubmitting, startSubmitting] = useTransition();
    const [isGeneratingFeedback, startGeneratingFeedback] = useTransition();
    const [isGeneratingHint, startGeneratingHint] = useTransition();
    
    const { toast } = useToast();

    const normalizeCode = (str: string) => {
        return str
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
            .replace(/#.*/g, "")
            .replace(/\s+/g, "");
    };

    const handleLanguageChange = (value: string) => {
        const lang = value as Language;
        setLanguage(lang);
    };

    const performIntelligentLocalChecks = (code: string, lang: Language): Hint | null => {
        const lines = code.split('\n');
        const stack: {char: string, line: number}[] = [];
        const pairs: Record<string, string> = { '}': '{', ']': '[', ')': '(' };
        const quotesStack: {char: string, line: number}[] = [];

        // Structural Balancing
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                // Quote balancing (ignoring escaped quotes)
                if ((char === '"' || char === "'") && (j === 0 || line[j-1] !== '\\')) {
                    if (quotesStack.length > 0 && quotesStack[quotesStack.length-1].char === char) {
                        quotesStack.pop();
                    } else {
                        quotesStack.push({char, line: i+1});
                    }
                    continue;
                }
                
                if (quotesStack.length > 0) continue; // Skip brackets inside strings

                if (['{', '[', '('].includes(char)) {
                    stack.push({char, line: i + 1});
                } else if (['}', ']', ')'].includes(char)) {
                    const last = stack.pop();
                    if (!last || last.char !== pairs[char]) {
                        return {
                            text: `🔴 Unmatched closing '${char}' detected on line ${i + 1}.\nSuggestion: Check your structure and ensure every bracket has a matching pair.`,
                            category: 'syntax',
                            lineNumber: i + 1
                        };
                    }
                }
            }
        }
        
        if (quotesStack.length > 0) {
            return {
                text: `🔴 Unclosed quote (${quotesStack[0].char}) detected on line ${quotesStack[0].line}.\nSuggestion: Ensure your strings are properly terminated.`,
                category: 'syntax',
                lineNumber: quotesStack[0].line
            };
        }
        
        if (stack.length > 0) {
            const last = stack[stack.length - 1];
            return {
                text: `🔴 Missing closing character for '${last.char}' from line ${last.line}.\nSuggestion: Close your blocks to continue.`,
                category: 'syntax',
                lineNumber: last.line
            };
        }

        // Typo Detection
        const dictionary = DICTIONARIES[lang] || [];
        for (let i = 0; i < lines.length; i++) {
            const lineText = lines[i].trim();
            // Skip comments and empty lines
            if (lineText.startsWith('//') || lineText.startsWith('#') || lineText === '') continue;

            const words = lineText.split(/[^a-zA-Z0-9_.]/).filter(w => w.length > 3);
            for (const word of words) {
                // Fuzzy match against dictionary
                const correction = findCorrection(word, dictionary);
                if (correction && correction !== word) {
                    return {
                        text: `🟠 Unknown identifier "${word}" on line ${i + 1}.\nSuggestion: Did you mean "${correction}"?`,
                        category: 'typo',
                        lineNumber: i + 1
                    };
                }
            }
        }

        // Common API Misuse Checks
        if (lang === 'java') {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('.length()') && /\w+\[\]/.test(lines[i])) {
                    return {
                        text: `🟡 API Misuse on line ${i + 1}.\nSuggestion: In Java, arrays use ".length", not ".length()". Strings use ".length()".`,
                        category: 'api',
                        lineNumber: i + 1
                    };
                }
            }
        }

        return null;
    };

    const handleRunCode = () => {
        startExecuting(async () => {
            setActiveTab("output");
            setRunResult(null);
            
            const visibleCases = problem.testCases.filter(tc => !tc.hidden);
            const testCase = visibleCases[0];
            
            if (!testCase) {
                setRunResult({ output: "No test cases defined for this problem.", passed: false });
                return;
            }

            try {
                const result = await executeCode(code, language, testCase.input);
                const output = (result.stdout || result.stderr || result.compile_output || "No output").trim();
                const passed = result.status.id === 3 && output === testCase.expectedOutput;
                
                setRunResult({ 
                  output: `Input:\n${testCase.input}\n\nOutput:\n${output}\n\nExpected:\n${testCase.expectedOutput}`, 
                  passed,
                  status: result.status.description 
                });
            } catch (error: any) {
                setRunResult({ 
                    output: "Code execution service is temporarily unavailable. Please try again later.", 
                    passed: false 
                });
            }
        });
    };

    const handleSubmitCode = () => {
        startSubmitting(async () => {
            setActiveTab("test-results");
            setTestResults([]);
            
            const results: TestCaseResult[] = [];
            let allPassed = true;
            let finalStatus = "Accepted";

            for (const tc of problem.testCases) {
                try {
                    const result = await executeCode(code, language, tc.input);
                    const actualOutput = (result.stdout || "").trim();
                    const passed = result.status.id === 3 && actualOutput === tc.expectedOutput.trim();
                    
                    if (!passed) {
                        allPassed = false;
                        if (result.status.id !== 3) finalStatus = result.status.description;
                        else finalStatus = "Wrong Answer";
                    }

                    results.push({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: actualOutput || (result.stderr || result.compile_output || "No output"),
                        passed,
                        error: result.status.id !== 3 ? result.status.description : undefined
                    });
                } catch (error: any) {
                    allPassed = false;
                    finalStatus = "Internal Error";
                    results.push({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: "Execution Service Error",
                        passed: false,
                        error: "Internal Error"
                    });
                }
            }

            setTestResults(results);
            saveSubmission(finalStatus);
            
            if (allPassed) {
                toast({ title: "Success!", description: "All test cases passed." });
            } else {
                toast({ variant: "destructive", title: "Submission Failed", description: `Result: ${finalStatus}` });
            }
        });
    };

    const handleRequestAIFeedback = () => {
        startGeneratingFeedback(async () => {
            setAIFeedback(null);
            setFeedbackError(false);
            try {
                const feedback = await explainAndImproveCode({ code, language });
                setAIFeedback(feedback as AIFeedback);
            } catch (error) {
                setFeedbackError(true);
            }
        });
    };

    const saveSubmission = (status: string) => {
        if (!user || !db) return;
        
        const submissionData = {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            problemId: problem.id,
            problemTitle: problem.title,
            difficulty: problem.difficulty,
            language: language,
            submittedCode: code,
            submissionStatus: status,
            executionTime: "0.1s",
            memoryUsage: 1024,
            AIHintLevelUsed: hintLevel.current,
            submittedAt: serverTimestamp(),
            estimatedTimeComplexity: aiFeedback?.optimalSolutionHint.match(/O\(.*?\)/)?.[0] || "O(n)",
            estimatedSpaceComplexity: "O(1)"
        };
        
        const colRef = collection(db, 'users', user.uid, 'submissions');
        addDoc(colRef, submissionData)
            .catch(async () => {
                const permissionError = new FirestorePermissionError({
                    path: colRef.path,
                    operation: 'create',
                    requestResourceData: submissionData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const handleGetHint = () => {
        const normalized = normalizeCode(code);
        
        // Reset check
        if (normalized !== lastNormalizedCode.current) {
            lastNormalizedCode.current = normalized;
            hintLevel.current = 0;
            setHints([]);
            hintCache.current = {};
        }

        // 1. LOCAL-FIRST STRATEGY: Run local syntax and typo checks
        const localError = performIntelligentLocalChecks(code, language);
        if (localError) {
            // STOP: Do not call Gemini if a local issue is found
            setHints(prev => [...prev, { ...localError, level: -1 }]);
            setActiveTab("hints");
            return;
        }

        // 2. CACHE CHECK: If logic hint for this level exists
        const cacheKey = `${problem.id}-${language}-${normalized}-${hintLevel.current}`;
        if (hintCache.current[cacheKey]) {
            setHints(prev => [...prev, hintCache.current[cacheKey]]);
            hintLevel.current += 1;
            setActiveTab("hints");
            return;
        }

        // 3. AI MENTOR: Call Gemini for algorithmic/logic progression
        startGeneratingHint(async () => {
            try {
                setActiveTab("hints");
                const currentHintsText = hints.map(h => h.text);
                const { hint, category } = await generateHint({
                    code,
                    language,
                    problemDescription: problem.description,
                    hintLevel: hintLevel.current,
                    previousHints: currentHintsText,
                });

                if (hint) {
                    const newHint: Hint = { 
                        text: hint, 
                        category: category as any, 
                        level: hintLevel.current 
                    };
                    
                    // Cache and increment
                    const currentCacheKey = `${problem.id}-${language}-${normalized}-${hintLevel.current}`;
                    hintCache.current[currentCacheKey] = newHint;
                    hintLevel.current += 1;
                    
                    setHints(prev => [...prev, newHint]);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Mentor Unavailable",
                    description: "AI mentor is temporarily busy.",
                });
            }
        });
    };

    const getHintIcon = (category: HintCategory) => {
      switch (category) {
        case 'syntax': return <AlertCircle className="w-4 h-4 text-destructive" />;
        case 'typo': return <Type className="w-4 h-4 text-orange-500" />;
        case 'api': return <Code2 className="w-4 h-4 text-amber-500" />;
        case 'runtime': return <Terminal className="w-4 h-4 text-blue-500" />;
        case 'logic': return <Lightbulb className="w-4 h-4 text-green-500" />;
        case 'optimization': return <Zap className="w-4 h-4 text-primary" />;
        case 'progress': return <CheckCircle className="w-4 h-4 text-green-600" />;
        default: return <Info className="w-4 h-4" />;
      }
    };

    const getHintStyles = (category: HintCategory) => {
      switch (category) {
        case 'syntax': return "bg-destructive/5 border-destructive/20";
        case 'typo': return "bg-orange-500/5 border-orange-500/20";
        case 'api': return "bg-amber-500/5 border-amber-500/20";
        case 'runtime': return "bg-blue-500/5 border-blue-500/20";
        case 'logic': return "bg-green-500/5 border-green-500/20";
        case 'optimization': return "bg-primary/5 border-primary/20";
        case 'progress': return "bg-green-600/5 border-green-600/20";
        default: return "bg-secondary/5 border-border";
      }
    };

    const getCategoryLabel = (hint: Hint) => {
      if (hint.category === 'progress') return "✅ Excellent Work!";
      if (hint.level !== undefined && hint.level >= 0) {
          return `💡 Hint ${hint.level + 1}`;
      }
      switch (hint.category) {
        case 'syntax': return '🔴 Syntax Error';
        case 'typo': return '🟠 Typo';
        case 'api': return '🟡 API Misuse';
        case 'runtime': return '🔵 Runtime Issue';
        case 'logic': return '🟢 Logic Hint';
        case 'optimization': return '⚡ Optimization';
        default: return '💡 Info';
      }
    };

    return (
        <div className="grid md:grid-cols-2 gap-4 p-4 h-[calc(100vh-4rem)] bg-background">
            <Card className="flex flex-col border-none shadow-md overflow-hidden bg-card">
                <ScrollArea className="flex-1">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-primary border-primary/20">Problem</Badge>
                            <Badge variant={problem.difficulty === 'Easy' ? 'secondary' : problem.difficulty === 'Medium' ? 'default' : 'destructive'} className="font-semibold uppercase text-[10px] tracking-wider">
                                {problem.difficulty}
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 font-headline">{problem.title}</h2>
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none font-body leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: problem.description }}
                        />
                    </CardContent>
                </ScrollArea>
            </Card>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Select onValueChange={handleLanguageChange} value={language}>
                            <SelectTrigger className="w-[140px] h-9 bg-card border-none shadow-sm font-medium">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(v) => setFontSize(Number(v))} defaultValue={String(fontSize)}>
                            <SelectTrigger className="w-[100px] h-9 bg-card border-none shadow-sm font-medium">
                                <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12">12px</SelectItem>
                                <SelectItem value="14">14px</SelectItem>
                                <SelectItem value="16">16px</SelectItem>
                                <SelectItem value="18">18px</SelectItem>
                                <SelectItem value="20">20px</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleRunCode} disabled={isExecuting} size="sm" className="h-9 px-4">
                            {isExecuting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                            Run
                        </Button>
                        <Button onClick={handleSubmitCode} disabled={isSubmitting} size="sm" variant="outline" className="h-9 px-4">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit
                        </Button>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col border-none shadow-inner bg-[#1e1e1e] rounded-lg overflow-hidden">
                    <div className="flex-1 min-h-[300px]">
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{ fontSize, minimap: { enabled: true }, scrollBeyondLastLine: false, automaticLayout: true, wordWrap: "on", padding: { top: 16 } }}
                        />
                    </div>
                </Card>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[280px] flex flex-col">
                    <TabsList className="grid grid-cols-4 bg-card border-none h-10 p-1 shadow-sm">
                        <TabsTrigger value="output" className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Console</TabsTrigger>
                        <TabsTrigger value="hints" className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Hint</TabsTrigger>
                        <TabsTrigger value="test-results" disabled={testResults.length === 0 && !isSubmitting} className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Tests</TabsTrigger>
                        <TabsTrigger value="ai-feedback" className="flex items-center gap-2 text-accent"><BrainCircuit className="w-4 h-4" /> AI Feedback</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="output" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1">
                                <div className="p-4 font-code text-sm">
                                    {isExecuting ? <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground animate-pulse"><Loader2 className="h-6 w-6 animate-spin" /><p>Executing code locally...</p></div> : runResult ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-secondary/30 p-2 rounded">
                                                Status: <span className={runResult.passed ? "text-green-500" : "text-destructive"}>{runResult.status || (runResult.passed ? "Finished" : "Error")}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground">Standard Output / Details:</p>
                                                <pre className="p-3 bg-secondary/20 rounded-md text-foreground font-code min-h-[40px] whitespace-pre-wrap">{runResult.output}</pre>
                                            </div>
                                        </div>
                                    ) : <div className="flex flex-col items-center justify-center h-32 gap-3 text-center text-muted-foreground opacity-60"><Terminal className="w-8 h-8" /><p>Click 'Run' to execute against sample case.</p></div>}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hints" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {hints.length === 0 && !isGeneratingHint && (
                                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center text-muted-foreground opacity-60"><Lightbulb className="w-8 h-8" /><p>Need some help? Get progressive logic guidance.</p></div>
                                    )}
                                    {hints.map((hint, idx) => (
                                        <div key={idx} className={cn("p-3 rounded-lg border flex gap-3 animate-in slide-in-from-bottom-2", getHintStyles(hint.category))}>
                                            <div className="mt-0.5">{getHintIcon(hint.category)}</div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">{getCategoryLabel(hint)}{hint.lineNumber && ` • Line ${hint.lineNumber}`}</p>
                                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{hint.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isGeneratingHint && <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-secondary/20 rounded-lg animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /><span>Mentor is analyzing...</span></div>}
                                    <div className="pt-2">
                                        <Button onClick={handleGetHint} disabled={isGeneratingHint} variant="secondary" size="sm" className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-500 border border-amber-500/20">
                                          {isGeneratingHint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                          Get Hint
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="test-results" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4 space-y-4">
                                {isSubmitting && <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <p>Evaluating test cases...</p></div>}
                                {testResults.map((result, index) => (
                                    <div key={index} className="p-3 border border-border/50 rounded-lg bg-card/50">
                                        <div className="flex items-center justify-between font-semibold mb-2">
                                            <p className="text-xs text-muted-foreground">Test Case {index + 1} {problem.testCases[index].hidden ? "(Hidden)" : "(Visible)"}</p>
                                            {result.passed ? <span className="flex items-center text-[11px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full"><CheckCircle className="mr-1 h-3 w-3"/> PASSED</span> : <span className="flex items-center text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><XCircle className="mr-1 h-3 w-3"/> {result.error || "FAILED"}</span>}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-code space-y-2 bg-muted/30 p-3 rounded-md">
                                            {problem.testCases[index].hidden ? (
                                                <div className="italic">Hidden test case input/output concealed for academic integrity.</div>
                                            ) : (
                                                <>
                                                    <div><strong className="text-foreground">Input:</strong> {result.input}</div>
                                                    <div><strong className="text-foreground">Expected:</strong> {result.expectedOutput}</div>
                                                    <div><strong className={result.passed ? "text-green-600" : "text-destructive"}>Actual:</strong> {result.actualOutput}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai-feedback" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                {feedbackError && (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6 text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 text-orange-500" />
                                        <p className="font-semibold">AI feedback is temporarily unavailable.</p>
                                        <Button variant="outline" size="sm" onClick={handleRequestAIFeedback} className="mt-2">Try Analysis Again</Button>
                                    </div>
                                )}
                                {(!aiFeedback && !isGeneratingFeedback && !feedbackError) && (
                                     <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                                        <div className="p-4 rounded-full bg-accent/10"><Zap className="h-10 w-10 text-accent" /></div>
                                        <div><h3 className="font-bold text-xl mb-1">Deeper Analysis</h3><p className="text-sm text-muted-foreground mb-6">Review code complexity and the most optimal solution path.</p></div>
                                        <Button onClick={handleRequestAIFeedback} disabled={isGeneratingFeedback} className="bg-accent hover:bg-accent/90"><BrainCircuit className="mr-2 h-4 w-4" />Analyze & Suggest Optimal</Button>
                                     </div>
                                )}
                                {isGeneratingFeedback && <div className="flex flex-col items-center justify-center h-32 gap-3 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-accent" /> <p>Consulting AI expert...</p></div>}
                                {aiFeedback && !feedbackError && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 pb-4">
                                        <div className="p-5 bg-accent/5 rounded-xl border border-accent/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="h-20 w-20 text-accent" /></div>
                                            <h4 className="font-bold text-accent text-lg mb-3 flex items-center gap-2"><Zap className="h-5 w-5" /> Optimal Solution Hint</h4>
                                            <p className="text-foreground leading-relaxed relative z-10">{aiFeedback.optimalSolutionHint}</p>
                                        </div>
                                        <Separator className="bg-border/50" />
                                        <div><h4 className="font-bold text-base mb-2 text-foreground">Technical Breakdown</h4><p className="text-muted-foreground leading-relaxed">{aiFeedback.explanation}</p></div>
                                        <div><h4 className="font-bold text-base mb-2 text-foreground">Optimization Tips</h4><p className="text-muted-foreground leading-relaxed">{aiFeedback.codeImprovements}</p></div>
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
