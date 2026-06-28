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
  hintLevel: z.number().describe('The progression level (0 = clue, 1 = guidance, 2 = approach, 3 = deep algorithm walk-through).'),
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
  prompt: `You are a high-level coding mentor. Your goal is to guide the student to the solution with BRIEF, educational hints.

IMPORTANT: The student's code has already passed a syntax and typo check.
Focus ENTIRELY on logic, algorithms, edge cases, and optimization.

Progression Strategy (BASED ON HINT LEVEL {{{hintLevel}}}):
- Level 0: Provide a tiny logic clue or a nudge toward a specific concept.
- Level 1: Provide stronger guidance with a bit more explanation of the "why."
- Level 2: Explain the approach in more detail, suggesting a specific structure or technique.
- Level 3 (Final): Describe the algorithm step by step in plain English. DO NOT provide code.

CONSTRAINTS:
- MAXIMUM 3 lines.
- NO code snippets.
- NO complete implementations.

Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`

TASK:
1. Analyze Progress: Determine if the student is stuck, on the wrong path, or almost there.
2. Generate Hint: Provide a hint appropriate for Level {{{hintLevel}}}.

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
