import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const productSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().int().min(0, "Quantity must be a positive integer"),
  category: z.string().min(3, "Category is required"),
  features: z.string().optional(),
  description: z.string().optional(),
  image: z.any()
    .refine(
        (file) => file, "Image is required."
    )
    .refine(
        (file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, 
        `Max file size is 5MB.`
    )
    .refine(
        (file) => !(file instanceof File) || ACCEPTED_IMAGE_TYPES.includes(file.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  imageHint: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
