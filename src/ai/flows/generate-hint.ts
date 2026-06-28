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
  code: z.string().describe('The user\'s current code.'),
  language: z.string().describe('The programming language being used.'),
  problemDescription: z.string().describe('The description of the problem.'),
  hintLevel: z.number().describe('The number of times the user has asked for a hint (0-based).'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hint: z.string().describe('The generated corrective hint as a comment.'),
  isSyntaxError: z.boolean().describe('Whether the hint addresses a syntax/compilation error.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are an expert coding mentor, similar to those on LeetCode or top technical interview platforms. Your goal is to guide the student to the solution without giving it away.

Current Context:
Problem: {{{problemDescription}}}
Language: {{{language}}}
Student's Code:
\`\`\`
{{{code}}}
\`\`\`
Hint Level: {{{hintLevel}}} (0 = first hint, 1 = second, 2 = third, 3+ = detailed)

Your Task (Follow strictly in order):

1. SYNTAX CHECK:
   - First, scan the code for syntax or compilation errors (e.g., missing colons, brackets, type mismatches, indentation errors).
   - If errors exist, set isSyntaxError: true.
   - Describe ONLY the syntax error. State the line number (if you can infer it) and explain WHY it is wrong.
   - Suggest how to fix it (e.g., "Check your block indentation here") but do NOT provide the corrected line.
   - RETURN IMMEDIATELY.

2. PROGRESS ANALYSIS (If syntax is correct):
   - Set isSyntaxError: false.
   - Determine the student's stage: Not started, partially solved, stuck, wrong approach, or almost finished.

3. PROGRESSIVE GUIDANCE (Based on Hint Level):
   - Level 0 (First click): Provide a subtle nudge. Ask a question about their logic or mention a constraint they might have missed. "Have you considered how to handle negative numbers?"
   - Level 1 (Second click): Provide a stronger hint. Point to a specific part of their algorithm that might be inefficient or missing a step.
   - Level 2 (Third click): Provide detailed guidance. Explain a specific concept or data structure that would help, but still no code.
   - Level 3+ (Final clicks): Provide the almost-complete algorithm in plain English. Describe the step-by-step logic so clearly they can implement it.

MENTOR RULES:
- Never reveal the complete code solution.
- If the user is on the right track, start the hint with encouragement.
- If the approach is fundamentally wrong (e.g., O(N^2) when O(N) is required), explain WHY it is unsuitable before suggesting an alternative.
- Be concise, professional, and encouraging.
- Format the final hint as a single block comment suitable for the language (e.g., /* ... */ for Java/C++/JS, # ... for Python).`,
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
