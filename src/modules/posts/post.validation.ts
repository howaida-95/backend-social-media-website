import { z } from "zod";

const contentSchema = z.string().trim().max(5000);

export const createPostSchema = z.object({
  content: contentSchema.optional(),
  uploadIds: z
    .array(z.number().int().positive())
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Upload IDs must be unique",
    })
    .optional(),
});

export const updatePostSchema = z.object({
  content: contentSchema.optional(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});
