'use server';

import { z } from 'zod';
import { productSchema } from './product-schema';
import { generateProductDescription } from '@/ai/flows/generate-product-description';

type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  description?: string;
};

export async function generateDescriptionAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  // We don't need to validate image here, just the fields for description generation.
  const partialSchema = productSchema.pick({
    productName: true,
    category: true,
    features: true,
  });
  const parsed = partialSchema.safeParse(formData);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: 'Invalid form data for description generation',
      fields,
      issues: parsed.error.issues.map(issue => issue.message),
    };
  }

  const { productName, category, features } = parsed.data;

  try {
    const result = await generateProductDescription({
      productName,
      category,
      features: features || '',
    });

    // Re-serialize fields for the form
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }

    return {
      message: 'Description generated',
      description: result.description,
      fields: {
        ...fields,
        description: result.description,
      },
    };
  } catch (error) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: 'Error generating description',
      fields: fields,
      issues: ['AI service failed. Please try again or write a description manually.'],
    };
  }
}
