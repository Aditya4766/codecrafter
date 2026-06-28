"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import type { Problem } from "@/lib/problems";
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
  Sparkles
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { explainAndImproveCode } from "@/ai/flows/code-explanation-and-improvement";
import { useToast } from "@/hooks/use-toast";
import { generateTestCases } from "@/ai/flows/test-cases-generation";
import { runCodeWithTests } from "@/ai/flows/run-code-with-tests";
import { generateHint } from "@/ai/flows/generate-hint";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Language = "python" | "java" | "cpp" | "javascript";

type TestCaseResult = {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
};

type AIFeedback = {
    explanation: string;
    optimalSolutionHint: string;
    codeImprovements: string;
};

type Hint = {
  text: string;
  category: 'syntax' | 'logic' | 'direction' | 'optimization' | 'progress';
  lineNumber?: number;
};

// Helper for retrying promises
const retry = <T,>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> => {
    return new Promise((resolve, reject) => {
        const attempt = (n: number, currentDelay: number) => {
            fn()
                .then(resolve)
                .catch(err => {
                    const errorMsg = (err?.message || "").toLowerCase();
                    const isTransient = errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("fetch failed");
                    if (n > 0 && isTransient) {
                        setTimeout(() => attempt(n - 1, currentDelay * 2), currentDelay);
                    } else {
                        reject(err);
                    }
                });
        };
        attempt(retries, delay);
    });
};

export default function CodingInterface({ problem }: { problem: Problem }) {
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState(problem.starterCode.python);
    const [fontSize, setFontSize] = useState(14);
    
    // States
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [activeTab, setActiveTab] = useState("output");
    const [runResult, setRunResult] = useState<{ output: string; passed?: boolean } | null>(null);
    const [hints, setHints] = useState<Hint[]>([]);
    
    // Caching for Hints
    const lastCodeAnalyzed = useRef<string>("");
    const hintCache = useRef<Record<string, Hint[]>>({});
    const hintLevel = useRef<number>(0);

    useEffect(() => {
        setCode(problem.starterCode[language]);
        setHints([]);
        lastCodeAnalyzed.current = "";
        hintLevel.current = 0;
    }, [problem, language]);

    const [isExecuting, startExecuting] = useTransition();
    const [isSubmitting, startSubmitting] = useTransition();
    const [isGeneratingFeedback, startGeneratingFeedback] = useTransition();
    const [isGeneratingHint, startGeneratingHint] = useTransition();
    
    const { toast } = useToast();

    const handleLanguageChange = (value: string) => {
        const lang = value as Language;
        setLanguage(lang);
    };

    /**
     * Performs a local syntax check to catch common structural errors 
     * without calling the AI (Step 1 & 2 of the Hint Engine Redesign).
     */
    const performLocalSyntaxCheck = (code: string, lang: Language): Hint | null => {
        const lines = code.split('\n');
        
        // 1. Bracket/Parentheses balancing (All languages)
        const stack: {char: string, line: number}[] = [];
        const pairs: Record<string, string> = { '}': '{', ']': '[', ')': '(' };
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (['{', '[', '('].includes(char)) {
                    stack.push({char, line: i + 1});
                } else if (['}', ']', ')'].includes(char)) {
                    const last = stack.pop();
                    if (!last || last.char !== pairs[char]) {
                        return {
                            text: `Unmatched closing '${char}' detected.\nSuggestion: Check your structure and ensure every bracket has a matching pair.`,
                            category: 'syntax',
                            lineNumber: i + 1
                        };
                    }
                }
            }
        }
        if (stack.length > 0) {
            const last = stack[stack.length - 1];
            return {
                text: `Missing closing character for '${last.char}'.\nSuggestion: Close your blocks to continue.`,
                category: 'syntax',
                lineNumber: last.line
            };
        }

        // 2. Language Specific Heuristics
        if (lang === 'python') {
            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i].trim();
                // Check for missing colon after if/else/def/for/while/class
                if (/^(if|else|elif|def|for|while|class)\b/.test(lineText) && !lineText.endsWith(':') && !lineText.includes('#')) {
                    return {
                        text: `Missing colon (:) after statement.\nSuggestion: Add a colon at the end of the line.`,
                        category: 'syntax',
                        lineNumber: i + 1
                    };
                }
            }
        }

        if (['java', 'cpp', 'javascript'].includes(lang)) {
            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i].trim();
                // Very basic semicolon check (ignoring comments, empty lines, and lines ending with braces/colons)
                if (lineText !== "" && 
                    !lineText.endsWith('{') && 
                    !lineText.endsWith('}') && 
                    !lineText.endsWith(';') && 
                    !lineText.startsWith('//') && 
                    !lineText.startsWith('#') &&
                    !lineText.startsWith('if') &&
                    !lineText.startsWith('for') &&
                    !lineText.startsWith('while') &&
                    !lineText.startsWith('class') &&
                    !lineText.startsWith('public') &&
                    !lineText.startsWith('static') &&
                    !lineText.includes('main')
                ) {
                    // Java/C++ strictly require semicolons for statements
                    if (lang !== 'javascript') {
                        return {
                            text: `Missing semicolon (;).\nSuggestion: Add a semicolon at the end of the statement.`,
                            category: 'syntax',
                            lineNumber: i + 1
                        };
                    }
                }
                
                // Catch Python keywords in C-style languages
                if (lineText.startsWith('def ')) {
                    return {
                        text: `'def' keyword detected.\nSuggestion: Use '${lang === 'javascript' ? 'function' : 'proper method declaration'}' instead.`,
                        category: 'syntax',
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
            try {
                const { results, executionError } = await retry(() => runCodeWithTests({
                    code,
                    language: language === 'javascript' ? 'python' : language as any,
                    problemDescription: problem.description,
                    functionSignature: problem.functionSignature,
                    testCases: [{ input: "Sample Input", expectedOutput: "Expected Output" }],
                }));

                if (executionError) {
                    setRunResult({ output: executionError, passed: false });
                } else if (results && results.length > 0) {
                    setRunResult({ output: results[0].actualOutput, passed: results[0].passed });
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Execution Error", description: "Simulation failed. Please try again." });
            }
        });
    };

    const handleSubmitCode = () => {
        startSubmitting(async () => {
            setActiveTab("test-results");
            setTestResults([]);
            setAIFeedback(null);
            
            try {
                const { testCases: generatedCases } = await retry(() => generateTestCases({
                    problemDescription: problem.description,
                    functionSignature: problem.functionSignature,
                }));

                const { results, executionError } = await retry(() => runCodeWithTests({
                    code,
                    language: language === 'javascript' ? 'python' : language as any,
                    problemDescription: problem.description,
                    functionSignature: problem.functionSignature,
                    testCases: generatedCases,
                }));

                if (executionError) {
                    setActiveTab("output");
                    setRunResult({ output: executionError, passed: false });
                    return;
                }

                setTestResults(results);
                if (results.every(r => r.passed)) {
                  toast({ title: "Success!", description: "All test cases passed." });
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Submission Failed", description: "Could not evaluate code." });
            }
        });
    };

    const handleGetHint = () => {
        const trimmedCode = code.trim();
        const cacheKey = `${problem.id}-${language}-${trimmedCode}`;

        // 1. Check if code has changed significantly or is cached
        if (trimmedCode === lastCodeAnalyzed.current && hints.length > 0) {
            setActiveTab("hints");
            return;
        }

        if (hintCache.current[cacheKey]) {
            setHints(hintCache.current[cacheKey]);
            setActiveTab("hints");
            return;
        }

        // 2. Perform LOCAL syntax check first (Step 1 & 2)
        const localError = performLocalSyntaxCheck(trimmedCode, language);
        if (localError) {
            const newHints = [...hints, localError];
            setHints(newHints);
            // We don't advance hint level for syntax errors
            setActiveTab("hints");
            return;
        }

        // 3. Only if syntax is correct, call Gemini (Step 3)
        startGeneratingHint(async () => {
            try {
                setActiveTab("hints");
                const { hint, category } = await retry(() => generateHint({
                    code: code,
                    language: language,
                    problemDescription: problem.description,
                    hintLevel: hintLevel.current,
                }));

                if (hint) {
                    const newHint: Hint = { 
                        text: hint, 
                        category: category as any
                    };
                    const newHints = [...hints, newHint];
                    setHints(newHints);
                    
                    // Update Cache & Level
                    hintCache.current[cacheKey] = newHints;
                    lastCodeAnalyzed.current = trimmedCode;
                    hintLevel.current += 1;
                }
            } catch (error: any) {
                const is429 = error?.message?.includes("429") || error?.status === 429;
                toast({
                    variant: "destructive",
                    title: "Hint Unavailable",
                    description: is429 
                        ? "AI hints are temporarily unavailable due to request limits. Please try again in a minute." 
                        : "The mentor is busy. Try again shortly.",
                });
            }
        });
    };

    const getHintIcon = (category: string) => {
      switch (category) {
        case 'syntax': return <AlertCircle className="w-4 h-4 text-destructive" />;
        case 'logic': return <Lightbulb className="w-4 h-4 text-amber-500" />;
        case 'direction': return <Sparkles className="w-4 h-4 text-green-500" />;
        case 'optimization': return <Zap className="w-4 h-4 text-primary" />;
        case 'progress': return <CheckCircle className="w-4 h-4 text-green-600" />;
        default: return <Info className="w-4 h-4" />;
      }
    };

    const getHintStyles = (category: string) => {
      switch (category) {
        case 'syntax': return "bg-destructive/5 border-destructive/20";
        case 'logic': return "bg-amber-500/5 border-amber-500/20";
        case 'direction': return "bg-green-500/5 border-green-500/20";
        case 'optimization': return "bg-primary/5 border-primary/20";
        case 'progress': return "bg-green-500/5 border-green-500/20";
        default: return "bg-secondary/5 border-border";
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
                        <Button onClick={handleRunCode} disabled={isExecuting} size="sm" className="h-9 px-4 bg-primary hover:bg-primary/90">
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
                            options={{
                                fontSize: fontSize,
                                minimap: { enabled: true },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </Card>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[280px] flex flex-col">
                    <TabsList className="grid grid-cols-4 bg-card border-none h-10 p-1 shadow-sm">
                        <TabsTrigger value="output" className="flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Console
                        </TabsTrigger>
                        <TabsTrigger value="hints" className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Hint
                        </TabsTrigger>
                        <TabsTrigger value="test-results" disabled={testResults.length === 0 && !isSubmitting} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Tests
                        </TabsTrigger>
                        <TabsTrigger value="ai-feedback" disabled={testResults.length === 0 || isSubmitting} className="flex items-center gap-2 text-accent">
                            <BrainCircuit className="w-4 h-4" /> AI Feedback
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="output" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1">
                                <div className="p-4 font-code text-sm">
                                    {isExecuting ? (
                                        <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground animate-pulse">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <p>Analyzing code execution via AI...</p>
                                        </div>
                                    ) : runResult ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-secondary/30 p-2 rounded">
                                                <div className="flex items-center gap-1.5">
                                                    Status: <span className={runResult.passed ? "text-green-500" : "text-destructive"}>{runResult.passed ? "Finished" : "Execution Error"}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-muted-foreground">Standard Output:</p>
                                                <pre className="p-3 bg-secondary/20 rounded-md text-foreground font-code min-h-[40px] whitespace-pre-wrap">
                                                    {runResult.output || "No output"}
                                                </pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center text-muted-foreground opacity-60">
                                            <Terminal className="w-8 h-8" />
                                            <p>Click 'Run' to simulate execution.<br/>AI-generated output and errors will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hints" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {hints.length === 0 && !isGeneratingHint && (
                                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-center text-muted-foreground opacity-60">
                                            <Lightbulb className="w-8 h-8" />
                                            <p>Need a nudge? Click below for a smart hint.<br/>We'll analyze your logic once syntax is correct.</p>
                                        </div>
                                    )}

                                    {hints.map((hint, idx) => (
                                        <div 
                                          key={idx} 
                                          className={cn(
                                            "p-3 rounded-lg border flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                                            getHintStyles(hint.category)
                                          )}
                                        >
                                            <div className="mt-0.5">{getHintIcon(hint.category)}</div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">
                                                  {hint.category === 'syntax' ? '🔴 Syntax Error' : `💡 ${hint.category.toUpperCase()} HINT`}
                                                  {hint.lineNumber && ` • Line ${hint.lineNumber}`}
                                                </p>
                                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                                  {hint.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {isGeneratingHint && (
                                        <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-secondary/20 rounded-lg animate-pulse">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>Mentor is analyzing your progress...</span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Button 
                                          onClick={handleGetHint} 
                                          disabled={isGeneratingHint} 
                                          variant="secondary" 
                                          size="sm" 
                                          className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-500 border border-amber-500/20"
                                        >
                                          {isGeneratingHint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                          {hints.length === 0 ? "Get My First Hint" : "Get Next Hint"}
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="test-results" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4 space-y-4">
                                {isSubmitting && <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <p>Generating & running test cases...</p></div>}
                                {testResults.map((result, index) => (
                                    <div key={index} className="p-3 border border-border/50 rounded-lg bg-card/50">
                                        <div className="flex items-center justify-between font-semibold mb-2">
                                            <p className="text-xs text-muted-foreground">Test Case {index + 1}</p>
                                            {result.passed ? (
                                                <span className="flex items-center text-[11px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full"><CheckCircle className="mr-1 h-3 w-3"/> PASSED</span>
                                            ) : (
                                                <span className="flex items-center text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><XCircle className="mr-1 h-3 w-3"/> FAILED</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-code space-y-2 bg-muted/30 p-3 rounded-md">
                                            <div><strong className="text-foreground">Input:</strong> {result.input}</div>
                                            <div><strong className="text-foreground">Expected:</strong> {result.expectedOutput}</div>
                                            <div><strong className={result.passed ? "text-green-600" : "text-destructive"}>Actual:</strong> {result.actualOutput}</div>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai-feedback" className="flex-grow mt-2 overflow-hidden">
                        <Card className="h-full border-none bg-card shadow-sm flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                {(!aiFeedback && !isGeneratingFeedback) && (
                                     <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                                        <div className="p-4 rounded-full bg-accent/10">
                                            <Zap className="h-10 w-10 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl mb-1">Deeper Analysis</h3>
                                            <p className="text-sm text-muted-foreground mb-6">Review your code's complexity and see the most optimal solution path.</p>
                                        </div>
                                        <Button onClick={handleGetAIFeedback} disabled={isGeneratingFeedback} className="bg-accent hover:bg-accent/90">
                                            <BrainCircuit className="mr-2 h-4 w-4" />
                                            Analyze & Suggest Optimal
                                        </Button>
                                     </div>
                                )}
                                {isGeneratingFeedback && <div className="flex flex-col items-center justify-center h-32 gap-3 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-accent" /> <p>Consulting with AI technical expert...</p></div>}
                                {aiFeedback && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 pb-4">
                                        <div className="p-5 bg-accent/5 rounded-xl border border-accent/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Zap className="h-20 w-20 text-accent" />
                                            </div>
                                            <h4 className="font-bold text-accent text-lg mb-3 flex items-center gap-2">
                                                <Zap className="h-5 w-5" /> Optimal Solution Hint
                                            </h4>
                                            <p className="text-foreground leading-relaxed relative z-10">{aiFeedback.optimalSolutionHint}</p>
                                        </div>
                                        <Separator className="bg-border/50" />
                                        <div>
                                            <h4 className="font-bold text-base mb-2 text-foreground">Technical Breakdown</h4>
                                            <p className="text-muted-foreground leading-relaxed">{aiFeedback.explanation}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base mb-2 text-foreground">Optimization Tips</h4>
                                            <p className="text-muted-foreground leading-relaxed">{aiFeedback.codeImprovements}</p>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );

    function handleGetAIFeedback() {
        startGeneratingFeedback(async () => {
            setActiveTab("ai-feedback");
            try {
                const feedback = await retry(() => explainAndImproveCode({
                    code: code,
                    language: language,
                }));
                setAIFeedback(feedback as AIFeedback);
            } catch (error) {
                toast({ variant: "destructive", title: "AI Feedback Error", description: "Generation failed." });
            }
        });
    }
}
