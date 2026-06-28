'use server';

/**
 * @fileOverview Provides intelligent coding hints acting as a mentor.
 *
 * - generateHint - A function that generates a corrective hint for the user.
 * - GenerateHintInput - The input type for the generateHint function.
 * - GenerateHintOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  code: z.string().describe("The user's current code."),
  language: z.string().describe('The programming language being used.'),
  problemDescription: z.string().describe('The description of the problem.'),
  hintLevel: z.number().describe('The number of times the user has asked for a hint (0-based).'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The generated corrective hint text.'),
  isSyntaxError: z.boolean().describe('Whether the hint addresses a syntax/compilation error.'),
  category: z.enum(['syntax', 'logic', 'direction', 'optimization']).describe('The category of the hint for UI styling.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert coding mentor. Your goal is to guide the student to the solution with BRIEF, CONCISE hints.

Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`
Hint Level: {{{hintLevel}}} (0 = clue, 1 = guidance, 2 = approach, 3+ = algorithm explanation)

Constraints:
- Maximum 2-4 short lines of text.
- Never return code snippets.
- Be encouraging but professional.

Your Task:
1. CHECK SYNTAX: If there's a syntax error, set isSyntaxError: true, category: 'syntax', and explain only that error (including line number).
2. LOGIC ANALYZE: If syntax is okay, analyze progress.
   - If approach is wrong: category 'logic', explain why.
   - If on right track: category 'direction', give the next logical step.
   - If almost done: category 'optimization', suggest a final polish.

Return the result in the specified JSON format.`,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
