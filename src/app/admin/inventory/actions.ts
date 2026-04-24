'use server';

import { z } from 'zod';
import { productSchema } from './product-schema';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { initializeFirebase } from '@/firebase/init';
import { collection, doc, setDoc } from 'firebase/firestore';

type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  description?: string;
};

const extendedProductSchema = productSchema.extend({
  shopId: z.string(),
  shopOwnerId: z.string(),
});

export async function addProduct(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = extendedProductSchema.safeParse(formData);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: 'Invalid form data',
      fields,
      issues: parsed.error.issues.map(issue => issue.message),
    };
  }

  const { shopId, shopOwnerId, ...productData } = parsed.data;

  try {
    const { firestore } = initializeFirebase();
    const productsRef = collection(firestore, 'shops', shopId, 'products');
    const newDocRef = doc(productsRef);

    await setDoc(newDocRef, {
      ...productData,
      id: newDocRef.id,
      shopId: shopId,
      shopOwnerId: shopOwnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mocked for now, you can replace with a real image upload service
      imageUrl: `https://picsum.photos/seed/${newDocRef.id}/400/400`,
      imageHint: productData.category,
    });
  } catch (e: any) {
    return {
      message: `Error saving product: ${e.message}`,
      fields: parsed.data,
      issues: [e.message]
    }
  }


  return { message: 'Product added successfully!' };
}

export async function generateDescriptionAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  const parsed = productSchema.safeParse(formData);

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

    return {
      message: 'Description generated',
      description: result.description,
      fields: parsed.data,
    };
  } catch (error) {
    return {
      message: 'Error generating description',
      fields: parsed.data,
      issues: ['AI service failed. Please try again or write a description manually.'],
    };
  }
}
