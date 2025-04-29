import { z } from "zod";
import { CreateAndUpdateCommentDTO } from "./dto";
import { db } from "../../lib/db";
import { err, ok } from "neverthrow";
import { createPluError } from "../../lib/utils/plu-output-handler";
import { StatusCodes } from "http-status-codes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function getComment() {
    try {
        const comments = await db.comment.findMany()
        return ok(comments)
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function getCommentById(id: string) {
    try {
        const comment = await db.comment.findUnique({ where: { id } });

        if (!comment) {
            return err(createPluError("Comment tidak ditemukan", StatusCodes.NOT_FOUND));
        }
        return ok(comment);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function createComment(comment: z.infer<typeof CreateAndUpdateCommentDTO>) {
    try {
        const newComment = await db.comment.create({ data: comment })

        if (!newComment) {
            return err(createPluError("Terjadi kesalahan saat menulis data", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        return ok(newComment);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function updateComment(id: string, comment: z.infer<typeof CreateAndUpdateCommentDTO>) {
    try {
        if (!id) return err(createPluError("Id tidak ditemukan", StatusCodes.NOT_FOUND));

        const updatedData = await db.comment.update({
            where: {
                id
            },
            data: comment
        });

        return ok(updatedData);
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return err(createPluError("Comment Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}

export async function deleteComment(id: string) {
    try {
        if (!id)
            return err(createPluError("ID Tidak Ditemukan", StatusCodes.NOT_FOUND));

        const DeletedComment = await db.comment.delete({
            where: {
                id
            }
        });

        return ok(DeletedComment);
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return err(createPluError("Comment Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}