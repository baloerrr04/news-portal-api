import { z } from "zod";

export const CreateAndUpdateArticleDTO = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    authorId: z.string().uuid("Invalid author ID format"),
    categoryIds: z.array(
        z.string().uuid("Invalid category ID format")
    ).optional(),
    publishedAt: z.coerce.date().optional(),
});

