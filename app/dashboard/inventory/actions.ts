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
