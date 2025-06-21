// src/ai/flows/generate-preliminary-memo.ts
'use server';

/**
 * @fileOverview Generates a preliminary case memorandum by synthesizing key facts,
 * legal concepts, and relevant precedents from a given document and similar cases.
 *
 * - generatePreliminaryMemo - A function that handles the memo generation process.
 * - GeneratePreliminaryMemoInput - The input type for the generatePreliminaryMemo function.
 * - GeneratePreliminaryMemoOutput - The return type for the generatePreliminaryMemo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreliminaryMemoInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the primary document.'),
  similarCases: z
    .array(z.string())
    .describe('An array of text content from similar court cases.'),
  userInstructions: z
    .string()
    .optional()
    .describe('Optional instructions to refine the memo generation.'),
});
export type GeneratePreliminaryMemoInput = z.infer<
  typeof GeneratePreliminaryMemoInputSchema
>;

const GeneratePreliminaryMemoOutputSchema = z.object({
  preliminaryMemo: z.string().describe('The generated preliminary case memorandum.'),
  identifiedLaws: z.array(z.string()).describe('List of identified laws.'),
  summary: z.string().describe('Summary of document.'),
});
export type GeneratePreliminaryMemoOutput = z.infer<
  typeof GeneratePreliminaryMemoOutputSchema
>;

export async function generatePreliminaryMemo(
  input: GeneratePreliminaryMemoInput
): Promise<GeneratePreliminaryMemoOutput> {
  return generatePreliminaryMemoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePreliminaryMemoPrompt',
  input: {schema: GeneratePreliminaryMemoInputSchema},
  output: {schema: GeneratePreliminaryMemoOutputSchema},
  prompt: `You are an expert legal assistant tasked with generating a preliminary case memorandum.

  Synthesize the key facts, legal concepts, and relevant precedents from the provided document and similar cases to generate a well-structured memorandum.

  Primary Document Text: {{{documentText}}}

  Similar Cases:
  {{#each similarCases}}
  ---
  {{{this}}}
  {{/each}}

  User Instructions: {{#if userInstructions}}{{{userInstructions}}}{{else}}None{{/if}}

  Output the preliminary memo, a list of identified laws, and a summary of the document.

  Preliminary Case Memorandum:
  {
    "preliminaryMemo": "...",
    "identifiedLaws": ["Law1", "Law2", ...],
    "summary": "..."
  }
  `,
});

const generatePreliminaryMemoFlow = ai.defineFlow(
  {
    name: 'generatePreliminaryMemoFlow',
    inputSchema: GeneratePreliminaryMemoInputSchema,
    outputSchema: GeneratePreliminaryMemoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
