// refine-memo-generation.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for refining memo generation based on user feedback.
 *
 * - refineMemoGeneration - A function that takes user feedback and re-runs the memo generation flow with refined instructions.
 * - RefineMemoGenerationInput - The input type for the refineMemoGeneration function.
 * - RefineMemoGenerationOutput - The return type for the refineMemoGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the refineMemoGeneration flow
const RefineMemoGenerationInputSchema = z.object({
  originalMemo: z.string().describe('The original generated memorandum.'),
  userFeedback: z.string().describe('User feedback on the original memo.'),
  originalInput: z.string().describe('The original input documents'),
});
export type RefineMemoGenerationInput = z.infer<typeof RefineMemoGenerationInputSchema>;

// Define the output schema for the refineMemoGeneration flow
const RefineMemoGenerationOutputSchema = z.object({
  refinedMemo: z.string().describe('The refined memorandum based on user feedback.'),
});
export type RefineMemoGenerationOutput = z.infer<typeof RefineMemoGenerationOutputSchema>;

// Exported function to refine memo generation
export async function refineMemoGeneration(input: RefineMemoGenerationInput): Promise<RefineMemoGenerationOutput> {
  return refineMemoGenerationFlow(input);
}

// Define the prompt for refining memo generation
const refineMemoGenerationPrompt = ai.definePrompt({
  name: 'refineMemoGenerationPrompt',
  input: {schema: RefineMemoGenerationInputSchema},
  output: {schema: RefineMemoGenerationOutputSchema},
  prompt: `You are an expert legal assistant. You will improve an existing legal memorandum based on user feedback.

Original Memorandum:
{{{originalMemo}}}

User Feedback:
{{{userFeedback}}}

Original input documents:
{{{originalInput}}}

Based on the user feedback and the original documents, rewrite the memorandum to address the user's concerns and improve its quality and relevance. Return only the rewritten memorandum.
`,
});

// Define the Genkit flow for refining memo generation
const refineMemoGenerationFlow = ai.defineFlow(
  {
    name: 'refineMemoGenerationFlow',
    inputSchema: RefineMemoGenerationInputSchema,
    outputSchema: RefineMemoGenerationOutputSchema,
  },
  async input => {
    const {output} = await refineMemoGenerationPrompt(input);
    return output!;
  }
);
