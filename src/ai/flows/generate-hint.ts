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
  hintLevel: z.number().describe('The progression level (0 = clue, 1 = guidance, 2 = approach, 3+ = deep algorithm walk-through).'),
  previousHints: z.array(z.string()).optional().describe('A history of hints already provided for this code to avoid repetition.'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The generated corrective hint text (MAX 3-5 short lines).'),
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
  prompt: `You are a high-level coding mentor. Your goal is to guide the student with BRIEF, educational hints.

IMPORTANT: The student's code has already passed a local syntax and typo check.
Focus ENTIRELY on logic, algorithms, edge cases, and optimization.

OPTIMALITY CHECK:
First, determine if the student's current code is already optimal (best possible Big O Time and Space complexity) for this problem.
If it IS optimal:
- Set category to "progress".
- Return a message like: "✅ Excellent Work! Your solution is already optimal."
- Briefly mention the Time and Space complexity (e.g., "Time: O(n), Space: O(1)").
- Explain in 1 sentence why it is optimal.
- DO NOT suggest any further changes or improvements.

If it is NOT yet optimal:
Choose a category ("logic" or "optimization") and follow the progression strategy.

Progression Strategy (CURRENT HINT LEVEL: {{{hintLevel}}}):
- As the level increases, provide more specific and detailed guidance.
- Level 0: A tiny logic clue or a nudge toward a specific concept.
- Level 1-2: Stronger guidance with a bit more explanation of the "why."
- Level 3-4: Explain the approach in detail, suggesting specific structures or techniques.
- Level 5+: Describe the algorithm step by step in plain English. 

CONSTRAINTS:
- MAXIMUM 3-5 short lines total.
- NO code snippets unless absolutely necessary for a tiny concept.
- NEVER provide a complete implementation.
- DO NOT repeat these previous hints: {{#each previousHints}} - {{{this}}} {{/each}}

Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`

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
