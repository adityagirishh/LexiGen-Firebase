'use server';

/**
 * @fileOverview Document embedding flow.
 *
 * - generateDocumentEmbedding - A function that generates a document embedding.
 * - GenerateDocumentEmbeddingInput - The input type for the generateDocumentEmbedding function.
 * - GenerateDocumentEmbeddingOutput - The return type for the generateDocumentEmbedding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentEmbeddingInputSchema = z.object({
  documentUrl: z
    .string()
    .describe(
      'The public URL of the document to embed.'
    ),
});
export type GenerateDocumentEmbeddingInput = z.infer<
  typeof GenerateDocumentEmbeddingInputSchema
>;

const GenerateDocumentEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding of the document.'),
});
export type GenerateDocumentEmbeddingOutput = z.infer<
  typeof GenerateDocumentEmbeddingOutputSchema
>;

export async function generateDocumentEmbedding(
  input: GenerateDocumentEmbeddingInput
): Promise<GenerateDocumentEmbeddingOutput> {
  return generateDocumentEmbeddingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentEmbeddingPrompt',
  input: {schema: GenerateDocumentEmbeddingInputSchema},
  output: {schema: GenerateDocumentEmbeddingOutputSchema},
  prompt: `Generate a vector embedding for the following legal document. Return the embedding as a JSON array of numbers.

Document: {{media url=documentUrl}}`,
});

const generateDocumentEmbeddingFlow = ai.defineFlow(
  {
    name: 'generateDocumentEmbeddingFlow',
    inputSchema: GenerateDocumentEmbeddingInputSchema,
    outputSchema: GenerateDocumentEmbeddingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
