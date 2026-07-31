"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchFormData() {
    try {
        const customers = await prisma.customer.findMany();
        const employees = await prisma.empolyee.findMany();
        const products = await prisma.product.findMany();
        
        return { customers, employees, products };
    } catch (error) {
        console.error("Error fetching form data:", error);
        return { customers: [], employees: [], products: [] };
    }
}

type QuotationInput = {
    Number: string;
    IdPIC: string;
    Customer_Vendor: string;
    CONTACT: string;
    Phone: string;
    PriceValidity: string;
    Email: string;
    CreditTerms: number;
    TransactionType: string;
    PaymentTerms: string;
    CreatedBy: string;
    UpdatedBy: string;
};

type QuotationItemInput = {
    ITEM_CODE: string;
    PROD_NAME: string;
    SPEC: string;
    Quantity: number;
    UNIT: number;
    UNIT_PRICE: number;
    Amount: number;
    VAT: number;
    TOTAL: number;
};

export async function createQuotation(data: QuotationInput, items: QuotationItemInput[]) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const quotation = await tx.sales_pr.create({
                data: {
                    Number: data.Number,
                    IdPIC: data.IdPIC,
                    Customer_Vendor: data.Customer_Vendor,
                    CONTACT: data.CONTACT,
                    Phone: data.Phone,
                    PriceValidity: data.PriceValidity,
                    Email: data.Email,
                    CreditTerms: data.CreditTerms,
                    TransactionType: data.TransactionType,
                    PaymentTerms: data.PaymentTerms,
                    CreatedBy: data.CreatedBy,
                    UpdatedBy: data.UpdatedBy,
                }
            });

            if (items && items.length > 0) {
                const itemsData = items.map(item => ({
                    ...item,
                    sales_pr_Id: quotation.Id
                }));
                await tx.sub_sales_pr.createMany({
                    data: itemsData
                });
            }

            return quotation;
        });

        revalidatePath("/dashboard/quotations");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error creating quotation:", error);
        return { success: false, error: error.message || String(error) };
    }
}
