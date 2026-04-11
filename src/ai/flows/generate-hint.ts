'use server';

/**
 * @fileOverview Provides coding hints that identify errors and guide the user.
 *
 * - generateHint - A function that generates a corrective hint for the user.
 * - GenerateHintInput - The input type for the generateHint function.
 * - GenerateHintOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  code: z.string().describe('The user\'s current code.'),
  language: z.string().describe('The programming language being used.'),
  problemDescription: z.string().describe('The description of the problem.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The generated corrective hint as a comment.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert coding tutor and technical debugger.

Analyze the user's current implementation for the following problem:

Problem Description:
{{{problemDescription}}}

User's Current Code (Language: {{{language}}}):
\`\`\`
{{{code}}}
\`\`\`

Your Task:
1. Check for syntax errors, common language-specific pitfalls, or logical bugs.
2. If there is a syntax error (e.g., missing colon in Python, semicolon in C++, or type mismatch), identify it clearly.
3. If the logic is incorrect or incomplete, explain why without giving away the entire solution.
4. If the code is correct so far, suggest the immediate next logical step.
5. Provide a short, helpful hint that guides them specifically on their current path.
6. The hint MUST be formatted as a comment for the specified programming language (e.g., # for Python, // for Java/C++).

Example Hint:
# You have a syntax error: missing ":" at the end of your "if" statement.
OR
// Your logic for reversing the string is almost there, but remember that the loop should only go up to the middle of the array.`,
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
