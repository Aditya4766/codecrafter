'use server';

/**
 * @fileOverview Provides coding hints based on current progress.
 *
 * - generateHint - A function that generates a hint for the user.
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
  hint: z.string().describe('The generated hint as a comment.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert coding tutor. 

Analyze the user's current implementation carefully. 

Problem Description:
{{{problemDescription}}}

User's Current Code (Language: {{{language}}}):
\`\`\`
{{{code}}}
\`\`\`

Your Task:
1. Identify what the user has implemented correctly.
2. Identify the immediate next logical step or a bug in their current approach.
3. Provide a short, helpful hint that guides them specifically on their current path without giving away the full answer.
4. The hint MUST be formatted as a comment for the specified programming language (e.g., starting with # for Python or // for Java/C++).

Do not provide a generic hint. Make it specific to the code they have written.`,
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
