"use client";

import { useState, useTransition, useEffect } from "react";
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
  ChevronRight,
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
  category: 'syntax' | 'logic' | 'direction' | 'optimization';
  isSyntaxError: boolean;
};

// Helper function for retrying promises with exponential backoff
const retry = <T,>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> => {
    return new Promise((resolve, reject) => {
        const attempt = (n: number, currentDelay: number) => {
            fn()
                .then(resolve)
                .catch(err => {
                    const errorMsg = (err?.message || "").toLowerCase();
                    const isTransient = 
                        errorMsg.includes("503") || 
                        errorMsg.includes("overloaded") || 
                        errorMsg.includes("failed to fetch") ||
                        errorMsg.includes("fetch failed") ||
                        errorMsg.includes("network error");

                    if (n > 0 && isTransient) {
                        setTimeout(() => attempt(n - 1, currentDelay * 1.5), currentDelay);
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
    const [theme, setTheme] = useState("vs-dark");
    
    // Execution States
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [activeTab, setActiveTab] = useState("output");
    const [runResult, setRunResult] = useState<{ output: string; passed?: boolean } | null>(null);
    const [hints, setHints] = useState<Hint[]>([]);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setCode(problem.starterCode[language]);
        setHints([]); // Reset hints when changing language
    }, [problem, language]);

    const [isExecuting, startExecuting] = useTransition();
    const [isSubmitting, startSubmitting] = useTransition();
    const [isGeneratingFeedback, startGeneratingFeedback] = useTransition();
    const [isGeneratingHint, startGeneratingHint] = useTransition();
    
    const { toast } = useToast();

    const handleLanguageChange = (value: string) => {
        const lang = value as Language;
        setLanguage(lang);
        setCode(problem.starterCode[lang]);
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
                const msg = error instanceof Error ? error.message : "AI execution failed";
                toast({
                    variant: "destructive",
                    title: "Execution Error",
                    description: msg,
                });
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

                if (!generatedCases || generatedCases.length === 0) {
                    toast({
                        variant: "destructive",
                        title: "Submission Error",
                        description: "Could not generate test cases for submission.",
                    });
                    return;
                }

                const { results, executionError } = await retry(() => runCodeWithTests({
                    code,
                    language: language === 'javascript' ? 'python' : language as any,
                    problemDescription: problem.description,
                    functionSignature: problem.functionSignature,
                    testCases: generatedCases,
                }));

                if (executionError) {
                    toast({
                        variant: "destructive",
                        title: "Execution Error",
                        description: executionError,
                    });
                    setActiveTab("output");
                    setTestResults([]);
                    return;
                }

                setTestResults(results);
                
                const allPassed = results.every(r => r.passed);
                if (allPassed) {
                  toast({
                    title: "Success!",
                    description: "All test cases passed. Check AI Feedback for the optimal solution hint!",
                  });
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: `Could not evaluate your code. ${errorMessage}`,
                });
            }
        });
    };
    
    const handleGetAIFeedback = () => {
        startGeneratingFeedback(async () => {
            setActiveTab("ai-feedback");
            try {
                const feedback = await retry(() => explainAndImproveCode({
                    code: code,
                    language: language,
                }));
                setAIFeedback(feedback as AIFeedback);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    variant: "destructive",
                    title: "AI Feedback Error",
                    description: `There was an issue generating feedback: ${errorMessage}`,
                });
            }
        });
    };

    const handleGetHint = () => {
        startGeneratingHint(async () => {
            try {
                const { hint, isSyntaxError, category } = await retry(() => generateHint({
                    code: code,
                    language: language,
                    problemDescription: problem.description,
                    hintLevel: hints.length,
                }));

                if (hint) {
                    setHints(prev => [...prev, { text: hint, category: category as any, isSyntaxError }]);
                    setActiveTab("hints");
                    
                    if (isSyntaxError) {
                        toast({
                            variant: "destructive",
                            title: "Mentor Check: Syntax Error",
                            description: "Your code has a structural issue. Check the Hint tab.",
                        });
                    } else {
                        toast({
                            title: `Mentor Hint (Level ${hints.length + 1})`,
                            description: "New guidance added to the Hint tab.",
                        });
                    }
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Hint Error",
                    description: `The mentor is busy. Try again in a moment.`,
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
        default: return <Info className="w-4 h-4" />;
      }
    };

    const getHintStyles = (category: string) => {
      switch (category) {
        case 'syntax': return "bg-destructive/5 border-destructive/20";
        case 'logic': return "bg-amber-500/5 border-amber-500/20";
        case 'direction': return "bg-green-500/5 border-green-500/20";
        case 'optimization': return "bg-primary/5 border-primary/20";
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
                        <Select onValueChange={handleLanguageChange} defaultValue={language}>
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
                            theme={theme}
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                fontSize: fontSize,
                                minimap: { enabled: true },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                wordWrap: "on",
                                folding: true,
                                lineNumbers: "on",
                                renderLineHighlight: "all",
                                autoClosingBrackets: "always",
                                matchBrackets: "always",
                                fontLigatures: true,
                                cursorStyle: "line",
                                quickSuggestions: true,
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
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Hints
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
                                            <p>Need a nudge? Click below for a smart hint.<br/>We'll analyze your code without giving it away.</p>
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
                                                  {hint.category} {hint.category === 'syntax' ? 'Error' : 'Hint'} {idx + 1}
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
                                          <span>Mentor is analyzing your code...</span>
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
                                          {hints.length === 0 ? "Get My First Hint" : "Show Next Hint"}
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
}
