'use server';

/**
 * @fileOverview A flow for generating a problem description from a simple prompt.
 *
 * - generateProblemDescription - A function that generates a problem description.
 * - GenerateProblemDescriptionInput - The input type for the generateProblemDescription function.
 * - GenerateProblemDescriptionOutput - The return type for the generateProblemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProblemDescriptionInputSchema = z.object({
  prompt: z.string().describe('A simple prompt describing the desired problem.'),
});
export type GenerateProblemDescriptionInput = z.infer<
  typeof GenerateProblemDescriptionInputSchema
>;

const GenerateProblemDescriptionOutputSchema = z.object({
  problemDescription: z.string().describe('The generated problem description.'),
});
export type GenerateProblemDescriptionOutput = z.infer<
  typeof GenerateProblemDescriptionOutputSchema
>;

export async function generateProblemDescription(
  input: GenerateProblemDescriptionInput
): Promise<GenerateProblemDescriptionOutput> {
  return generateProblemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProblemDescriptionPrompt',
  input: {schema: GenerateProblemDescriptionInputSchema},
  output: {schema: GenerateProblemDescriptionOutputSchema},
  prompt: `Generate a detailed problem description based on the following prompt: {{{prompt}}}. The problem description should be suitable for a coding exercise, clearly stating the problem, input format, output format, constraints, and example test cases.`,
});

const generateProblemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProblemDescriptionFlow',
    inputSchema: GenerateProblemDescriptionInputSchema,
    outputSchema: GenerateProblemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
