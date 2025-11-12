'use server';

/**
 * @fileOverview Provides code explanation and improvement suggestions.
 *
 * - explainAndImproveCode - A function that accepts code and provides feedback.
 * - CodeExplanationAndImprovementInput - The input type for the explainAndImproveCode function.
 * - CodeExplanationAndImprovementOutput - The return type for the explainAndImproveCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExplanationAndImprovementInputSchema = z.object({
  code: z.string().describe('The code to be explained and improved.'),
  language: z.string().describe('The programming language of the code.'),
});
export type CodeExplanationAndImprovementInput = z.infer<typeof CodeExplanationAndImprovementInputSchema>;

const CodeExplanationAndImprovementOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code.'),
  improvementSuggestions: z.string().describe('Suggestions for improving the code.'),
  alternativeApproaches: z.string().describe('Alternative approaches to solve the problem.'),
});
export type CodeExplanationAndImprovementOutput = z.infer<typeof CodeExplanationAndImprovementOutputSchema>;

export async function explainAndImproveCode(
  input: CodeExplanationAndImprovementInput
): Promise<CodeExplanationAndImprovementOutput> {
  return explainAndImproveCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAndImproveCodePrompt',
  input: {schema: CodeExplanationAndImprovementInputSchema},
  output: {schema: CodeExplanationAndImprovementOutputSchema},
  prompt: `You are an expert software engineer. Provide an explanation, improvement suggestions, and alternative approaches for the given code.

Language: {{{language}}}
Code:
\\\`\\\`\\\`
{{{code}}}
\\\`\\\`\\\`

Explanation:
Improvement Suggestions:
Alternative Approaches:`,
});

const explainAndImproveCodeFlow = ai.defineFlow(
  {
    name: 'explainAndImproveCodeFlow',
    inputSchema: CodeExplanationAndImprovementInputSchema,
    outputSchema: CodeExplanationAndImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
