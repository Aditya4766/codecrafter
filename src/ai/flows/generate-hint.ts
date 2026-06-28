'use server';

/**
 * @fileOverview Provides intelligent, progressive coding hints focused strictly on logic and algorithm.
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
  hint: z.string().describe('The generated corrective hint text (MAX 3 short lines).'),
  category: z.enum(['logic', 'optimization', 'progress']).describe('The UI category for the hint.'),
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

IMPORTANT: The student's code has already passed a rigorous local syntax and typo check. 
NEVER mention:
- Syntax errors (brackets, semicolons, etc.)
- Typos or misspelled keywords
- Basic API misuse (e.g., .length vs .length())

Focus ENTIRELY on logic, algorithms, edge cases, and optimization.

Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`
Hint Level: {{{hintLevel}}} 
(0 = tiny logic clue, 1 = moderate guidance, 2 = clear algorithm approach, 3+ = deep algorithm walk-through without code)

CONSTRAINTS:
- MAXIMUM 3 short lines.
- NO code snippets.
- NO complete solutions.
- NO basic syntax/typo advice.

TASK:
1. Logic Analyze: Determine if the student is stuck, on the wrong path, or almost there logically.
2. Select Category:
   - 'logic': if they have a conceptual misunderstanding or edge case issue.
   - 'optimization': if they solved it but in an inefficient way (e.g., O(n^2) instead of O(n)).
   - 'progress': if they are very close.
3. Generate Hint: Provide a hint appropriate for the Hint Level. 

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
