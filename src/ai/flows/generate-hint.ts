'use server';

/**
 * @fileOverview Provides intelligent, progressive coding hints.
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
  hintLevel: z.number().describe('The progression level (0 = clue, 1 = guidance, 2 = approach, 3+ = deep algorithm).'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The generated corrective hint text (2-4 short lines).'),
  isSyntaxError: z.boolean().describe('Whether the hint addresses a structural syntax error.'),
  category: z.enum(['syntax', 'logic', 'direction', 'optimization', 'progress']).describe('The UI category for the hint.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are a high-level coding mentor. Your goal is to guide the student to the solution with extremely BRIEF, educational hints.

Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`
Hint Level: {{{hintLevel}}} 
(0 = tiny clue, 1 = moderate guidance, 2 = clear approach, 3+ = algorithm walk-through without code)

CONSTRAINTS:
- MAXIMUM 2-4 short lines.
- NO code snippets.
- NO complete solutions.
- Be encouraging but surgical in your advice.

TASK:
1. Logic Analyze: Determine if the student is stuck, on the wrong path, or almost there.
2. Select Category:
   - 'logic': if they have a conceptual misunderstanding.
   - 'direction': if they are on track but need the next step.
   - 'optimization': if they solved it but in an inefficient way.
   - 'progress': if they are very close.
3. Generate Hint: Provide a hint appropriate for the Hint Level. If level is 0, stay very vague. If level 3, explain the logic of the algorithm.

Return as JSON.`,
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
