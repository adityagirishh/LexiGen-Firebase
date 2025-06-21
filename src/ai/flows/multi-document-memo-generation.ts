// src/ai/flows/multi-document-memo-generation.ts
'use server';
/**
 * @fileOverview Generates a legal memorandum based on multiple documents.
 *
 * - generateMemoFromDocuments - A function that generates a legal memorandum from multiple documents.
 * - GenerateMemoFromDocumentsInput - The input type for the generateMemoFromDocuments function.
 * - GenerateMemoFromDocumentsOutput - The return type for the generateMemoFromDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMemoFromDocumentsInputSchema = z.object({
  documentTexts: z.array(
    z.string().describe('The text content of a legal document.')
  ).describe('An array of legal documents to analyze.'),
  userInstructions: z.string().optional().describe('Optional instructions from the user to refine the memo generation.'),
});
export type GenerateMemoFromDocumentsInput = z.infer<typeof GenerateMemoFromDocumentsInputSchema>;

const GenerateMemoFromDocumentsOutputSchema = z.object({
  memo: z.string().describe('The generated legal memorandum.'),
});
export type GenerateMemoFromDocumentsOutput = z.infer<typeof GenerateMemoFromDocumentsOutputSchema>;

export async function generateMemoFromDocuments(input: GenerateMemoFromDocumentsInput): Promise<GenerateMemoFromDocumentsOutput> {
  return multiDocumentMemoGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multiDocumentMemoGenerationPrompt',
  input: {schema: GenerateMemoFromDocumentsInputSchema},
  output: {schema: GenerateMemoFromDocumentsOutputSchema},
  prompt: `You are an expert legal assistant tasked with generating a preliminary case memorandum based on the provided documents.

  Analyze the following documents and synthesize the key facts, legal concepts, and relevant precedents to generate a well-structured legal memorandum.

  Documents:
  {{#each documentTexts}}
  --Document {{@index}}--:
  {{{this}}}
  {{/each}}

  {{#if userInstructions}}
  User Instructions: {{{userInstructions}}}
  {{/if}}

  Memorandum:
  `,
});

const multiDocumentMemoGenerationFlow = ai.defineFlow(
  {
    name: 'multiDocumentMemoGenerationFlow',
    inputSchema: GenerateMemoFromDocumentsInputSchema,
    outputSchema: GenerateMemoFromDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
