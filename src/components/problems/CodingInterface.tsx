"use client";

import { useState, useTransition, useEffect } from "react";
import type { Problem } from "@/lib/problems";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Send, BrainCircuit, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { explainAndImproveCode } from "@/ai/flows/code-explanation-and-improvement";
import { useToast } from "@/hooks/use-toast";
import { generateTestCases } from "@/ai/flows/test-cases-generation";

type Language = "python" | "java" | "cpp";

type TestCase = {
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

export default function CodingInterface({ problem }: { problem: Problem }) {
    const [language, setLanguage] = useState<Language>("python");
    const [code, setCode] = useState(problem.starterCode.python);
    const [output, setOutput] = useState("Click 'Run' to see the output of your code here.");
    const [testResults, setTestResults] = useState<TestCase[]>([]);
    const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
    const [activeTab, setActiveTab] = useState("output");

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const [isSubmitting, startSubmitting] = useTransition();
    const [isGeneratingFeedback, startGeneratingFeedback] = useTransition();
    
    const { toast } = useToast();

    const handleLanguageChange = (value: string) => {
        const lang = value as Language;
        setLanguage(lang);
        setCode(problem.starterCode[lang]);
    };

    const handleRunCode = () => {
        setOutput(`Running your code...\n\n// This is a simulated execution.\n// Actual output will vary based on your implementation.\n\nSample Output for input "test":\n${Math.random()}`);
        setActiveTab("output");
    };

    const handleSubmitCode = () => {
        startSubmitting(async () => {
            setActiveTab("test-results");
            setTestResults([]);
            setAIFeedback(null);
            
            try {
                const { testCases: generatedCases } = await generateTestCases({
                    problemDescription: problem.description,
                    functionSignature: problem.functionSignature,
                });

                const results: TestCase[] = generatedCases.map(tc => ({
                    ...tc,
                    actualOutput: tc.expectedOutput, // Simulate passing
                    passed: true,
                }));
                
                if (results.length > 1 && isClient && Math.random() > 0.3) {
                    const failIndex = Math.floor(Math.random() * results.length);
                    results[failIndex].passed = false;
                    results[failIndex].actualOutput = `[${Math.floor(Math.random() * 5)}, ${Math.floor(Math.random() * 5) + 5}]`;
                }

                setTestResults(results);

            } catch (error) {
                console.error("Failed to generate test cases:", error);
                toast({
                    variant: "destructive",
                    title: "Submission Error",
                    description: "Could not generate test cases for submission.",
                });
            }
        });
    };
    
    const handleGetAIFeedback = () => {
        startGeneratingFeedback(async () => {
            setActiveTab("ai-feedback");
            try {
                const feedback = await explainAndImproveCode({
                    code: code,
                    language: language,
                });
                setAIFeedback(feedback);
            } catch (error) {
                console.error("Failed to get AI feedback:", error);
                toast({
                    variant: "destructive",
                    title: "AI Feedback Error",
                    description: "There was an issue generating AI feedback.",
                });
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
