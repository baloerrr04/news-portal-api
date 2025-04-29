import express, { Request, RequestHandler, Response } from "express";
import { createCategory, deleteArticle, getCategory, getCategoryById, updateCategory } from "./plu";
import { validateData } from "../../middlewares/validator";
import { CreateAndUpdateCategoryDTO } from "./dto";
import { z } from "zod";
import { authenticate, requireAdmin } from "../../middlewares/auth";

export const categoryRouter = express.Router();

categoryRouter.get("/",
    authenticate as unknown as RequestHandler,
    requireAdmin as unknown as RequestHandler,
    async (_, res: Response) => {
        const categoryRes = await getCategory()

        if (categoryRes.isErr()) {
            res.status(categoryRes.error.code).json({ message: categoryRes.error.message });
            return;
        }

        res
            .status(200)
            .json({ message: "Successfully Queried Categories", data: categoryRes.value });
        return;
    })

categoryRouter.post("/", 
    authenticate as unknown as RequestHandler, 
    requireAdmin as unknown as RequestHandler,  
    async (req: Request, res: Response) => {
    const newCategoryRequest = req.body as z.infer<typeof CreateAndUpdateCategoryDTO>;
    const newCategoryRes = await createCategory(newCategoryRequest)

    if (newCategoryRes.isErr()) {
        res
            .status(newCategoryRes.error.code)
            .json({ message: newCategoryRes.error.message });
        return
    }

    res
        .status(200)
        .json({ message: "Successfully Created Category", data: newCategoryRes.value });
});

categoryRouter.put("/:id", 
    authenticate as unknown as RequestHandler, 
    requireAdmin as unknown as RequestHandler,  
    async (req: Request, res: Response) => {
    const updateCategoryRequest = req.body as z.infer<typeof CreateAndUpdateCategoryDTO>;
    const updateCategoryRes = await updateCategory(req.params.id, updateCategoryRequest);

    if (updateCategoryRes.isErr()) {
        res
            .status(updateCategoryRes.error.code)
            .json({ message: updateCategoryRes.error.message });
        return
    }

    res
        .status(200)
        .json({ message: "Successfully Updated Category", data: updateCategoryRes.value });
});

categoryRouter.delete("/:id", 
    authenticate as unknown as RequestHandler, 
    requireAdmin as unknown as RequestHandler,  
    async (req: Request, res: Response) => {
    const deleteArticleId = req.params.id as string;
    const deleteArticleRes = await deleteArticle(deleteArticleId);

    if (deleteArticleRes.isErr()) {
        res
            .status(deleteArticleRes.error.code)
            .json({ message: deleteArticleRes.error.message });
        return;
    }

    res.status(200).json({
        message: "Successfully Deleted Category",
        data: deleteArticleRes.value,
    });
});