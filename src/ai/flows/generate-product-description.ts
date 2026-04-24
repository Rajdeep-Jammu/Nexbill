'use server';
/**
 * @fileOverview A Genkit flow for generating creative and informative product descriptions.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product (e.g., Electronics, Apparel, Home Goods).'),
  features: z
    .string()
    .describe(
      'Key features of the product, separated by commas (e.g., "waterproof, long battery life, ergonomic design").'
    ),
});
export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A creative and informative product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert product copywriter for an inventory and billing system. Your goal is to generate creative and informative product descriptions for a shop owner, focusing on appealing and consistent content.

Generate a product description based on the following details:

Product Name: {{{productName}}}
Category: {{{category}}}
Features: {{{features}}}

Please provide a description that is engaging, highlights the key features, and encourages purchase. The description should be concise but comprehensive, suitable for an e-commerce platform.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
