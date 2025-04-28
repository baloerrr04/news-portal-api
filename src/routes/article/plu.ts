import { z } from "zod";
import { CreateAndUpdateArticleDTO } from "./dto";
import { db } from "../../lib/db";
import { err, ok } from "neverthrow";
import { createPluError } from "../../lib/utils/plu-output-handler";
import { StatusCodes } from "http-status-codes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function getArticles() {
    try {
        const articles = await db.article.findMany()
        return ok(articles)
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function getArticleById(id: string) {
    try {
        const article = await db.article.findUnique({ where: { id } });

        if (!article) {
            return err(createPluError("Article tidak ditemukan", StatusCodes.NOT_FOUND));
        }
        return ok(article);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function createArticle(article: z.infer<typeof CreateAndUpdateArticleDTO>) {
    try {
        const newArticle = await db.article.create({ data: article })

        if (!newArticle) {
            return err(createPluError("Terjadi kesalahan saat menulis data", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        return ok(newArticle);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function updateArticle(id: string, article: z.infer<typeof CreateAndUpdateArticleDTO>) {
    try {
        if (!id) return err(createPluError("Id tidak ditemukan", StatusCodes.NOT_FOUND));

        const updatedData = await db.article.update({
            where: {
                id
            },
            data: article
        });

        return ok(updatedData);
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return err(createPluError("TODO Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}

export async function deleteArticle(id: string) {
    try {
        if (!id)
            return err(createPluError("ID Tidak Ditemukan", StatusCodes.NOT_FOUND));

        const DeletedArticle = await db.article.delete({
            where: {
                id
            }
        });

        return ok(DeletedArticle);
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return err(createPluError("TODO Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}