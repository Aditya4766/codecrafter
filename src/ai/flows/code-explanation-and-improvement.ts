'use server';

/**
 * @fileOverview Provides code explanation and optimal solution suggestions.
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
  explanation: z.string().describe('The explanation of the current implementation.'),
  optimalSolutionHint: z.string().describe('A description of the most optimal approach (Big O complexity) for this problem.'),
  codeImprovements: z.string().describe('Specific suggestions for improving the user\'s current code style or logic.'),
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
  prompt: `You are an expert software engineer and technical interviewer. 

Review the following code solution:

Language: {{{language}}}
Code:
\`\`\`
{{{code}}}
\`\`\`

Provide feedback in three parts:
1. Explanation: Briefly explain what the current code does and any issues it has.
2. Optimal Solution Hint: Describe the most efficient way to solve this problem (mentioning Time and Space complexity). Do not give the full code, but explain the algorithm clearly.
3. Code Improvements: Suggest specific changes to make the user's current code cleaner, faster, or more idiomatic.`,
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
