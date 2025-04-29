import express, { Request, Response } from "express";
import { createComment, deleteComment, getComment, getCommentById, updateComment } from "./plu";
import { validateData } from "../../middlewares/validator";
import { CreateAndUpdateCommentDTO } from "./dto";
import { z } from "zod";

export const categoryRouter = express.Router();

categoryRouter.get("/", async (_, res: Response) => {
    const commentRes = await getComment()

    if (commentRes.isErr()) {
        res.status(commentRes.error.code).json({ message: commentRes.error.message });
        return;
    }

    res
        .status(200)
        .json({ message: "Successfully Queried Comments", data: commentRes.value });
    return;
})

categoryRouter.post("/", async (req: Request, res: Response) => {
    const newCommentRequest = req.body as z.infer<typeof CreateAndUpdateCommentDTO>;
    const newCommentRes = await createComment(newCommentRequest)

    if (newCommentRes.isErr()) {
        res
            .status(newCommentRes.error.code)
            .json({ message: newCommentRes.error.message });
        return
    }

    res
        .status(200)
        .json({ message: "Successfully Created Comment", data: newCommentRes.value });
});

categoryRouter.put("/:id", async (req: Request, res: Response) => {
    const updateCategoryRequest = req.body as z.infer<typeof CreateAndUpdateCommentDTO>;
    const updateCategoryRes = await updateComment(req.params.id, updateCategoryRequest);

    if (updateCategoryRes.isErr()) {
        res
            .status(updateCategoryRes.error.code)
            .json({ message: updateCategoryRes.error.message });
        return
    }

    res
        .status(200)
        .json({ message: "Successfully Updated Comment", data: updateCategoryRes.value });
});

categoryRouter.delete("/:id", async (req: Request, res: Response) => {
    const deleteCommentId = req.params.id as string;
    const deleteCommentRes = await deleteComment(deleteCommentId);

    if (deleteCommentRes.isErr()) {
        res
            .status(deleteCommentRes.error.code)
            .json({ message: deleteCommentRes.error.message });
        return;
    }

    res.status(200).json({
        message: "Successfully Deleted Comment",
        data: deleteCommentRes.value,
    });
});