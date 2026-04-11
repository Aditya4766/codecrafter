"use client";

import { useState, useTransition, useEffect } from "react";
import type { Problem } from "@/lib/problems";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Send, BrainCircuit, CheckCircle, XCircle, Loader2, Lightbulb } from "lucide-react";
import { explainAndImproveCode } from "@/ai/flows/code-explanation-and-improvement";
import { useToast } from "@/hooks/use-toast";
import { generateTestCases } from "@/ai/flows/test-cases-generation";
import { runCodeWithTests } from "@/ai/flows/run-code-with-tests";
import { generateHint } from "@/ai/flows/generate-hint";

type Language = "python" | "java" | "cpp";

type TestCaseResult = {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
};

type AIFeedback = {
    explanation: string;
    improvementSuggestions: string;
    alternativeApproaches: string;
};

// Helper function for retrying promises
const retry = <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    return new Promise((resolve, reject) => {
        const attempt = (n: number) => {
            fn()
                .then(resolve)
                .catch(err => {
                    if (n > 0 && (err.message.includes("503") || err.message.toLowerCase().includes("overloaded"))) {
                        console.log(`AI service busy. Retrying in ${delay}ms... (${n} retries left)`);
                        setTimeout(() => attempt(n - 1), delay);
                    } else {
                        reject(err);
                    }
                });
        };
        attempt(retries);
    });
};


export default function CodingInterface({ problem }: { problem: Problem }) {
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState(problem.starterCode.python);
    const [output, setOutput] = useState("Click 'Run' to see the output of your code here.");
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [activeTab, setActiveTab] = useState("output");

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        // On component mount, set the code for the default language
        setCode(problem.starterCode[language]);
    }, [problem, language]);

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
        if (!isClient) return;
        setOutput(`Running your code...\n\n// This is a simulated execution.\n// Actual output will vary based on your implementation.\n\nSample Output for input "test":\n${Math.random() > 0.5 ? 'Passed' : 'Failed'}`);
        setActiveTab("output");
    };

    const handleSubmitCode = () => {
        startSubmitting(async () => {
            setActiveTab("test-results");
            setTestResults([]);
            setAIFeedback(null);
            
            try {
                // 1. Generate test cases with retry logic
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

                // 2. Run code with generated test cases with retry logic
                const { results, executionError } = await retry(() => runCodeWithTests({
                    code,
                    language,
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
                    // Show error in output tab
                    setOutput(`Execution Error:\n${executionError}`);
                    setActiveTab("output");
                    setTestResults([]); // Clear any partial results
                    return;
                }

                setTestResults(results);

            } catch (error) {
                console.error("Failed to submit code:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

                if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
                     toast({
                        variant: "destructive",
                        title: "AI Service Unavailable",
                        description: "The AI service is currently busy. Please try again in a few moments.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Submission Error",
                        description: `Could not evaluate your code. ${errorMessage}`,
                    });
                }
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
                setAIFeedback(feedback);
            } catch (error) {
                console.error("Failed to get AI feedback:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                 if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
                     toast({
                        variant: "destructive",
                        title: "AI Service Unavailable",
                        description: "The AI service is currently busy. Please try again in a few moments.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "AI Feedback Error",
                        description: "There was an issue generating AI feedback.",
                    });
                }
            }
        });
    };

    const handleGetHint = () => {
        startGeneratingHint(async () => {
            try {
                const { hint } = await retry(() => generateHint({
                    code: code,
                    language: language,
                    problemDescription: problem.description,
                }));

                if (hint) {
                    setCode(prev => prev + "\n\n" + hint);
                    toast({
                        title: "Hint added",
                        description: "Check your code editor for a new hint comment.",
                    });
                }
            } catch (error) {
                console.error("Failed to get hint:", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                 if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
                     toast({
                        variant: "destructive",
                        title: "AI Service Unavailable",
                        description: "The AI service is currently busy. Please try again in a few moments.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Hint Error",
                        description: "There was an issue generating a hint.",
                    });
                }
            }
        });
    };

    return (
        <div className="grid md:grid-cols-2 gap-4 p-4 h-[calc(100vh-4rem)]">
            <Card className="flex flex-col">
                <ScrollArea className="flex-1">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold mb-2 font-headline">{problem.title}</h2>
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none font-body"
                            dangerouslySetInnerHTML={{ __html: problem.description }}
                        />
                    </CardContent>
                </ScrollArea>
            </Card>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Select onValueChange={handleLanguageChange} defaultValue={language}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Card className="flex-1 flex flex-col">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your code here..."
                        className="flex-1 font-code text-sm p-4 rounded-md border-0 focus-visible:ring-1 focus-visible:ring-ring resize-none bg-secondary/30"
                    />
                </Card>
                <div className="flex gap-2">
                    <Button onClick={handleRunCode}>
                        <Play className="mr-2 h-4 w-4" /> Run
                    </Button>
                    <Button onClick={handleSubmitCode} disabled={isSubmitting} variant="outline">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit
                    </Button>
                    <Button onClick={handleGetHint} disabled={isGeneratingHint} variant="secondary">
                        {isGeneratingHint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                        Get Hint
                    </Button>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                    <TabsList>
                        <TabsTrigger value="output">Console</TabsTrigger>
                        <TabsTrigger value="test-results" disabled={testResults.length === 0 && !isSubmitting}>Test Results</TabsTrigger>
                        <TabsTrigger value="ai-feedback" disabled={testResults.length === 0 || isSubmitting}>AI Feedback</TabsTrigger>
                    </TabsList>
                    <TabsContent value="output" className="flex-grow mt-2">
                        <Card className="h-full">
                            <ScrollArea className="h-full">
                                <pre className="p-4 font-code text-sm whitespace-pre-wrap">{output}</pre>
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                    <TabsContent value="test-results" className="flex-grow mt-2">
                        <Card className="h-full">
                            <ScrollArea className="h-full p-4 space-y-4">
                                {isSubmitting && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> <p>Running tests...</p></div>}
                                {testResults.map((result, index) => (
                                    <div key={index} className="p-3 border rounded-md">
                                        <div className="flex items-center justify-between font-semibold mb-2">
                                            <p>Test Case {index + 1}</p>
                                            {result.passed ? (
                                                <span className="flex items-center text-green-600"><CheckCircle className="mr-1.5 h-4 w-4"/> Passed</span>
                                            ) : (
                                                <span className="flex items-center text-destructive"><XCircle className="mr-1.5 h-4 w-4"/> Failed</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-code space-y-1 bg-muted p-2 rounded-sm">
                                            <p><strong>Input:</strong> {result.input}</p>
                                            <p><strong>Expected:</strong> {result.expectedOutput}</p>
                                            <p><strong>Your Output:</strong> {result.actualOutput}</p>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </Card>
                    </TabsContent>
                    <TabsContent value="ai-feedback" className="flex-grow mt-2">
                        <Card className="h-full">
                            <ScrollArea className="h-full p-4">
                                {(!aiFeedback && !isGeneratingFeedback) && (
                                     <div className="flex items-center justify-center h-full">
                                        <Button onClick={handleGetAIFeedback} disabled={isGeneratingFeedback}>
                                            <BrainCircuit className="mr-2 h-4 w-4" />
                                            Generate AI Feedback
                                        </Button>
                                     </div>
                                )}
                                {isGeneratingFeedback && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> <p>Generating feedback...</p></div>}
                                {aiFeedback && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-base mb-1">Code Explanation</h4>
                                            <p className="text-muted-foreground">{aiFeedback.explanation}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base mb-1">Improvement Suggestions</h4>
                                            <p className="text-muted-foreground">{aiFeedback.improvementSuggestions}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base mb-1">Alternative Approaches</h4>
                                            <p className="text-muted-foreground">{aiFeedback.alternativeApproaches}</p>
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
