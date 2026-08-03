"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ProductInput = {
    id: string;
    PROD_NAME: string;
    PROD_ALIAS: string;
    UNIT: number;
    ProductType1: string;
    ProductType2: string;
    BUY_PRICE: number;
    SALES_PRICE: number;
    INPUT_VAT: number;
    OUTPUT_VAT: number;
    BARCODE: string;
    KEYWORD?: string;
    LIMIT: number;
    Status: string;
    BRAND: string;
    PROD_GRP: string;
    CREATOR: string;
    UpdatedBy: string;
    NOTE?: string;
};

export async function createProduct(data: ProductInput) {
    try {
        await prisma.product.create({
            data: {
                id: data.id,
                PROD_NAME: data.PROD_NAME,
                PROD_ALIAS: data.PROD_ALIAS,
                UNIT: data.UNIT,
                ProductType1: data.ProductType1,
                ProductType2: data.ProductType2,
                BUY_PRICE: data.BUY_PRICE,
                SALES_PRICE: data.SALES_PRICE,
                INPUT_VAT: data.INPUT_VAT,
                OUTPUT_VAT: data.OUTPUT_VAT,
                BARCODE: data.BARCODE,
                KEYWORD: data.KEYWORD,
                LIMIT: data.LIMIT,
                Status: data.Status,
                BRAND: data.BRAND,
                PROD_GRP: data.PROD_GRP,
                CREATOR: data.CREATOR,
                UpdatedBy: data.UpdatedBy,
                NOTE: data.NOTE,
            },
        });

        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateProduct(data: Partial<ProductInput> & { id: string }) {
    try {
        await prisma.product.update({
            where: { id: data.id },
            data: {
                ...(data.PROD_NAME ? { PROD_NAME: data.PROD_NAME } : {}),
                ...(data.PROD_ALIAS ? { PROD_ALIAS: data.PROD_ALIAS } : {}),
                ...(data.UNIT !== undefined ? { UNIT: Number(data.UNIT) } : {}),
                ...(data.ProductType1 ? { ProductType1: data.ProductType1 } : {}),
                ...(data.ProductType2 ? { ProductType2: data.ProductType2 } : {}),
                ...(data.BUY_PRICE !== undefined ? { BUY_PRICE: Number(data.BUY_PRICE) } : {}),
                ...(data.SALES_PRICE !== undefined ? { SALES_PRICE: Number(data.SALES_PRICE) } : {}),
                ...(data.BARCODE ? { BARCODE: data.BARCODE } : {}),
                ...(data.LIMIT !== undefined ? { LIMIT: Number(data.LIMIT) } : {}),
                ...(data.Status ? { Status: data.Status } : {}),
                ...(data.BRAND ? { BRAND: data.BRAND } : {}),
                ...(data.PROD_GRP ? { PROD_GRP: data.PROD_GRP } : {}),
                ...(data.NOTE !== undefined ? { NOTE: data.NOTE } : {}),
                UpdatedBy: data.UpdatedBy || "User",
                UPD_TIME: new Date(),
                LAST_UPD: new Date(),
            },
        });

        revalidatePath("/dashboard/inventory");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Remove stock entry if linked
            await tx.stock.deleteMany({ where: { CODE: id } });
            await tx.product.delete({ where: { id } });
        });
        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message || String(error) };
    }
}
