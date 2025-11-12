'use server';

/**
 * @fileOverview A flow for running user-submitted code against a set of test cases.
 *
 * - runCodeWithTests - A function that executes code and evaluates it against test cases.
 * - RunCodeWithTestsInput - The input type for the runCodeWithTests function.
 * - RunCodeWithTestsOutput - The return type for the runCodeWithTests function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestCaseSchema = z.object({
  input: z.string().describe('The input for the test case.'),
  expectedOutput: z.string().describe('The expected output for the test case.'),
});

const RunCodeWithTestsInputSchema = z.object({
  code: z.string().describe('The user-submitted code to be executed.'),
  language: z.enum(['python', 'java', 'cpp']).describe('The programming language of the code.'),
  problemDescription: z.string().describe('The description of the problem to solve.'),
  functionSignature: z.string().describe('The function signature to be tested.'),
  testCases: z.array(TestCaseSchema).describe('An array of test cases to evaluate the code against.'),
});
export type RunCodeWithTestsInput = z.infer<typeof RunCodeWithTestsInputSchema>;

const TestResultSchema = z.object({
    input: z.string(),
    expectedOutput: z.string(),
    actualOutput: z.string(),
    passed: z.boolean(),
});

const RunCodeWithTestsOutputSchema = z.object({
  results: z.array(TestResultSchema).describe('The results of running the code against the test cases.'),
  executionError: z.string().optional().describe('Any error that occurred during code execution.'),
});
export type RunCodeWithTestsOutput = z.infer<typeof RunCodeWithTestsOutputSchema>;

export async function runCodeWithTests(input: RunCodeWithTestsInput): Promise<RunCodeWithTestsOutput> {
  return runCodeWithTestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runCodeWithTestsPrompt',
  input: { schema: RunCodeWithTestsInputSchema },
  output: { schema: RunCodeWithTestsOutputSchema },
  prompt: `You are an expert code evaluator. You will be given a coding problem, a user's code solution, and a series of test cases. Your task is to execute the user's code against each test case and determine if it passes.

Language: {{{language}}}

Problem Description:
{{{problemDescription}}}

Function Signature:
\`\`\`
{{{functionSignature}}}
\`\`\`

User's Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Test Cases:
{{#each testCases}}
- Input: {{{this.input}}}, Expected Output: {{{this.expectedOutput}}}
{{/each}}

Please execute the code for each test case and return the actual output and whether it matches the expected output. If the code fails to run or produces an error for a specific test case, capture that as the actual output. If the code has a syntax error or fails to compile, return an executionError.

Your response must be a JSON object matching the output schema.`,
});

const runCodeWithTestsFlow = ai.defineFlow(
  {
    name: 'runCodeWithTestsFlow',
    inputSchema: RunCodeWithTestsInputSchema,
    outputSchema: RunCodeWithTestsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
