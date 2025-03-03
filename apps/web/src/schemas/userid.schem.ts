import { z } from "zod";

export const userIdSchema = z.object({
  id: z.string().min(1, {
    message: "user id must be at least 1 characters.",
  }).optional(),
  userId: z.string().min(1, {
    message: "user id must be at least 1 characters.",
  }).optional(),
});
