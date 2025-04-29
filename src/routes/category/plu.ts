import { z } from "zod";
import { CreateAndUpdateCategoryDTO } from "./dto";
import { db } from "../../lib/db";
import { err, ok } from "neverthrow";
import { createPluError } from "../../lib/utils/plu-output-handler";
import { StatusCodes } from "http-status-codes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function getCategory() {
    try {
        const categories = await db.category.findMany()
        return ok(categories)
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function getCategoryById(id: string) {
    try {
        const category = await db.category.findUnique({ where: { id } });

        if (!category) {
            return err(createPluError("Category tidak ditemukan", StatusCodes.NOT_FOUND));
        }
        return ok(category);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function createCategory(category: z.infer<typeof CreateAndUpdateCategoryDTO>) {
    try {
        const newCategory = await db.category.create({ data: category })

        if (!newCategory) {
            return err(createPluError("Terjadi kesalahan saat menulis data", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        return ok(newCategory);
    } catch (error) {
        console.error(error);
        return err(createPluError("Internal Server Error"));
    }
}

export async function updateCategory(id: string, category: z.infer<typeof CreateAndUpdateCategoryDTO>) {
    try {
        if (!id) return err(createPluError("Id tidak ditemukan", StatusCodes.NOT_FOUND));

        const updatedData = await db.category.update({
            where: {
                id
            },
            data: category
        });

        return ok(updatedData);
    } catch (error) {
        console.error(error);
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return err(createPluError("Category Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}

export async function deleteArticle(id: string) {
    try {
        if (!id)
            return err(createPluError("ID Tidak Ditemukan", StatusCodes.NOT_FOUND));

        const DeletedArticle = await db.category.delete({
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
            return err(createPluError("Category Tidak Ditemukan", StatusCodes.NOT_FOUND));
        }

        return err(createPluError("Internal Server Error"));
    }
}