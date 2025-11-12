'use server';

/**
 * @fileOverview Automatically generates test cases for a given coding problem.
 *
 * - generateTestCases - A function that generates test cases for a coding problem.
 * - TestCasesGenerationInput - The input type for the generateTestCases function.
 * - TestCasesGenerationOutput - The return type for the generateTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestCasesGenerationInputSchema = z.object({
  problemDescription: z
    .string()
    .describe('The detailed description of the coding problem.'),
  functionSignature: z
    .string()
    .describe('The function signature for which test cases need to be generated, including parameter types and return type.'),
});
export type TestCasesGenerationInput = z.infer<typeof TestCasesGenerationInputSchema>;

const TestCasesGenerationOutputSchema = z.object({
  testCases: z
    .array(
      z.object({
        input: z.string().describe('The input values for the test case.'),
        expectedOutput: z.string().describe('The expected output for the given input.'),
        explanation: z
          .string()
          .optional()
          .describe('Optional explanation of the test case.'),
      })
    )
    .describe('An array of test cases for the given problem.'),
});
export type TestCasesGenerationOutput = z.infer<typeof TestCasesGenerationOutputSchema>;

export async function generateTestCases(input: TestCasesGenerationInput): Promise<TestCasesGenerationOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'testCasesGenerationPrompt',
  input: {schema: TestCasesGenerationInputSchema},
  output: {schema: TestCasesGenerationOutputSchema},
  prompt: `You are an expert at generating comprehensive test cases for coding problems.

  Given the problem description and function signature, generate a diverse set of test cases that cover various scenarios, including edge cases and boundary conditions. Ensure that the test cases are designed to thoroughly test the correctness and robustness of any code solution.

  Problem Description:
  {{problemDescription}}

  Function Signature:
  {{functionSignature}}

  Generate at least 5 test cases.

  Format the output as a JSON array of test case objects, where each object has 'input', 'expectedOutput', and optionally 'explanation' fields.
  `,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: TestCasesGenerationInputSchema,
    outputSchema: TestCasesGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
