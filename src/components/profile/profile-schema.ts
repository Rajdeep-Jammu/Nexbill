import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const profileSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters").max(50, "Display name can be at most 50 characters"),
  photo: z.any()
    .refine(
        (file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, 
        `Max file size is 5MB.`
    )
    .refine(
        (file) => !(file instanceof File) || ACCEPTED_IMAGE_TYPES.includes(file.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
