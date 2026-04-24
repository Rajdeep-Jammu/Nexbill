"use server";

import { z } from "zod";
import { productSchema } from "./product-schema";
import { generateProductDescription } from "@/ai/flows/generate-product-description";

type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  description?: string;
};

export async function addProduct(
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
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // Simulate saving the product
  console.log("Product saved:", parsed.data);

  return { message: "Product added successfully!" };
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
      message: "Invalid form data for description generation",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }
  
  const { productName, category, features } = parsed.data;

  try {
    const result = await generateProductDescription({
      productName,
      category,
      features: features || "",
    });

    return {
      message: "Description generated",
      description: result.description,
      fields: parsed.data,
    };
  } catch (error) {
    return {
      message: "Error generating description",
      fields: parsed.data,
      issues: ["AI service failed. Please try again or write a description manually."]
    }
  }
}
