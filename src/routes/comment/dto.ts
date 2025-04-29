import { z } from "zod";

export const CreateAndUpdateCommentDTO = z.object({
    userId: z.string().uuid("Invalid user ID format"),
    articleId: z.string().uuid("Invalid article ID format"),
    content: z.string().min(1, "Content must be at least 1 characters"),
});