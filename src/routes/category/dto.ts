import { z } from "zod";

export const CreateAndUpdateCategoryDTO = z.object({
    name: z.string().min(1, "name must be more than one characters")
});