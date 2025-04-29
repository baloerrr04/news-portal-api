import express, { Request, RequestHandler, Response } from "express";
import { createArticle, deleteArticle, getArticles, updateArticle, getArticleById } from "./plu";
import { validateData } from "../../middlewares/validator";
import { CreateAndUpdateArticleDTO } from "./dto";
import { z } from "zod";
import { authenticate, requireAdmin } from "../../middlewares/auth";


export const articleRouter = express.Router();

articleRouter.get("/",
    authenticate as unknown as RequestHandler,
    requireAdmin as unknown as RequestHandler,
    async (_, res: Response) => {
        const articleRes = await getArticles()

        if (articleRes.isErr()) {
            res.status(articleRes.error.code).json({ message: articleRes.error.message });
            return;
        }

        res
            .status(200)
            .json({ message: "Successfully Queried Articles", data: articleRes.value });
        return;
    })

articleRouter.post("/",
    authenticate as unknown as RequestHandler,
    requireAdmin as unknown as RequestHandler,
    validateData(CreateAndUpdateArticleDTO),
    async (req: Request, res: Response) => {
        const newArticleRequest = req.body as z.infer<typeof CreateAndUpdateArticleDTO>;
        const newArticleRes = await createArticle(newArticleRequest)

        if (newArticleRes.isErr()) {
            res
                .status(newArticleRes.error.code)
                .json({ message: newArticleRes.error.message });
            return
        }

        res
            .status(200)
            .json({ message: "Successfully Created Article", data: newArticleRes.value });
    });

articleRouter.put("/:id", 
    authenticate as unknown as RequestHandler, 
    requireAdmin as unknown as RequestHandler,  
    validateData(CreateAndUpdateArticleDTO), 
    async (req: Request, res: Response) => {
    const updateArticleRequest = req.body as z.infer<typeof CreateAndUpdateArticleDTO>;
    const updateArticleRes = await updateArticle(req.params.id, updateArticleRequest);

    if (updateArticleRes.isErr()) {
        res
            .status(updateArticleRes.error.code)
            .json({ message: updateArticleRes.error.message });
        return
    }

    res
        .status(200)
        .json({ message: "Successfully Updated Article", data: updateArticleRes.value });
});

articleRouter.delete("/:id",
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
        message: "Successfully Deleted Article",
        data: deleteArticleRes.value,
    });
});