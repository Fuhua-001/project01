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
                    CreditTerms: Math.round(Number(data.CreditTerms) || 0),
                    TransactionType: data.TransactionType,
                    PaymentTerms: data.PaymentTerms,
                    CreatedBy: data.CreatedBy,
                    UpdatedBy: data.UpdatedBy,
                }
            });

            if (items && items.length > 0) {
                const itemsData = items.map(item => ({
                    ITEM_CODE: String(item.ITEM_CODE || ""),
                    PROD_NAME: String(item.PROD_NAME || ""),
                    SPEC: String(item.SPEC || ""),
                    Quantity: Math.round(Number(item.Quantity) || 1),
                    UNIT: Math.round(Number(item.UNIT) || 1),
                    UNIT_PRICE: Number(item.UNIT_PRICE) || 0,
                    Amount: Number(item.Amount) || 0,
                    VAT: Number(item.VAT) || 0,
                    TOTAL: Number(item.TOTAL) || 0,
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

export async function deleteQuotationAction(id: number) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.sub_sales_pr.deleteMany({ where: { sales_pr_Id: id } });
            await tx.sales_pr.delete({ where: { Id: id } });
        });
        revalidatePath("/dashboard/quotations");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting quotation:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function createCustomer(data: {
    id?: string;
    name?: string;
    idPIC?: string;
    ACC_GRP?: string;
    CT_PERS?: string;
    PHONE?: string;
    email?: string;
    Address?: string;
    TaxIDNumber?: string;
}) {
    try {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        let custName = (data.name || "").trim();
        if (!custName) {
            custName = `ลูกค้าใหม่ (CUST-${randomSuffix})`;
        }

        const generatedId = `CUST-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
        const email = (data.email && data.email.includes("@")) ? data.email.trim() : `cust_${Date.now()}_${randomSuffix}@example.com`;

        // First attempt to create customer
        try {
            const customer = await prisma.customer.create({
                data: {
                    id: generatedId,
                    name: custName,
                    idPIC: data.idPIC || "EMP-001",
                    ACC_GRP: data.ACC_GRP || "ลูกค้าทั่วไป",
                    CT_PERS: data.CT_PERS || custName,
                    PHONE: data.PHONE || "-",
                    email: email,
                    Address: data.Address || "-",
                    TaxIDNumber: data.TaxIDNumber || "-",
                }
            });
            revalidatePath("/dashboard/customers");
            revalidatePath("/dashboard/quotations/ai");
            return { success: true, data: customer };
        } catch (innerErr: any) {
            if (innerErr.code === 'P2002') {
                // Duplicate name/email fallback: auto-append random suffix so creation succeeds!
                const fallbackName = `${custName} (${randomSuffix})`;
                const fallbackEmail = `cust_${Date.now()}_${randomSuffix}@example.com`;
                const fallbackCustomer = await prisma.customer.create({
                    data: {
                        id: `CUST-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`,
                        name: fallbackName,
                        idPIC: data.idPIC || "EMP-001",
                        ACC_GRP: data.ACC_GRP || "ลูกค้าทั่วไป",
                        CT_PERS: data.CT_PERS || fallbackName,
                        PHONE: data.PHONE || "-",
                        email: fallbackEmail,
                        Address: data.Address || "-",
                        TaxIDNumber: data.TaxIDNumber || "-",
                    }
                });
                revalidatePath("/dashboard/customers");
                revalidatePath("/dashboard/quotations/ai");
                return { success: true, data: fallbackCustomer };
            }
            throw innerErr;
        }
    } catch (error: any) {
        console.error("Error creating customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteCustomerAction(id: string) {
    try {
        await prisma.customer.delete({ where: { id } });
        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function createProductAction(data: {
    id?: string;
    PROD_NAME: string;
    PROD_ALIAS?: string;
    UNIT?: number;
    ProductType1?: string;
    ProductType2?: string;
    BUY_PRICE?: number;
    SALES_PRICE: number;
    BARCODE?: string;
    BRAND?: string;
    PROD_GRP?: string;
}) {
    try {
        const cleanNumber = (val: any) => Math.round(Number(String(val || 0).replace(/[^0-9.-]/g, "")) || 0);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        let prodName = (data.PROD_NAME || "").trim();
        if (!prodName) {
            prodName = `สินค้าใหม่ (PROD-${randomSuffix})`;
        }

        const salesPrice = cleanNumber(data.SALES_PRICE) || 100;
        const buyPrice = cleanNumber(data.BUY_PRICE) || Math.round(salesPrice * 0.7);
        const unit = cleanNumber(data.UNIT) || 1;
        
        const generatedId = `PROD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
        const barcode = `BC${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

        try {
            const newProduct = await prisma.product.create({
                data: {
                    id: generatedId,
                    PROD_NAME: prodName,
                    PROD_ALIAS: data.PROD_ALIAS || prodName,
                    UNIT: unit,
                    ProductType1: data.ProductType1 || "ทั่วไป",
                    ProductType2: data.ProductType2 || "ทั่วไป",
                    BUY_PRICE: buyPrice,
                    SALES_PRICE: salesPrice,
                    INPUT_VAT: 7,
                    OUTPUT_VAT: 7,
                    BARCODE: barcode,
                    LIMIT: 5,
                    Status: "พร้อมขาย",
                    BRAND: data.BRAND || "ทั่วไป",
                    PROD_GRP: data.PROD_GRP || "ทั่วไป",
                    CREATOR: "AI Assistant",
                    UpdatedBy: "AI Assistant",
                }
            });
            revalidatePath("/dashboard/inventory");
            revalidatePath("/dashboard/quotations/ai");
            return { success: true, data: newProduct };
        } catch (innerErr: any) {
            if (innerErr.code === 'P2002') {
                const fallbackName = `${prodName} (${randomSuffix})`;
                const fallbackProduct = await prisma.product.create({
                    data: {
                        id: `PROD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`,
                        PROD_NAME: fallbackName,
                        PROD_ALIAS: fallbackName,
                        UNIT: unit,
                        ProductType1: data.ProductType1 || "ทั่วไป",
                        ProductType2: data.ProductType2 || "ทั่วไป",
                        BUY_PRICE: buyPrice,
                        SALES_PRICE: salesPrice,
                        INPUT_VAT: 7,
                        OUTPUT_VAT: 7,
                        BARCODE: `BC${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
                        LIMIT: 5,
                        Status: "พร้อมขาย",
                        BRAND: data.BRAND || "ทั่วไป",
                        PROD_GRP: data.PROD_GRP || "ทั่วไป",
                        CREATOR: "AI Assistant",
                        UpdatedBy: "AI Assistant",
                    }
                });
                revalidatePath("/dashboard/inventory");
                revalidatePath("/dashboard/quotations/ai");
                return { success: true, data: fallbackProduct };
            }
            throw innerErr;
        }
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteProductAction(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
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

export async function createEmployeeAction(data: {
    IdPIC?: string;
    Name_PIC?: string;
    NemeEN_PIC?: string;
    Department?: string;
    ContactNumber?: string;
}) {
    try {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        let empName = (data.Name_PIC || "").trim();
        if (!empName) {
            empName = `พนักงานใหม่ (EMP-${randomSuffix})`;
        }

        const generatedId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

        try {
            const newEmp = await prisma.empolyee.create({
                data: {
                    IdPIC: generatedId,
                    Name_PIC: empName,
                    NemeEN_PIC: data.NemeEN_PIC || empName,
                    Department: data.Department || "ฝ่ายขาย",
                    ContactNumber: data.ContactNumber || "-",
                }
            });
            revalidatePath("/dashboard/users");
            revalidatePath("/dashboard/quotations/ai");
            return { success: true, data: newEmp };
        } catch (innerErr: any) {
            if (innerErr.code === 'P2002') {
                const fallbackName = `${empName} (${randomSuffix})`;
                const fallbackEmp = await prisma.empolyee.create({
                    data: {
                        IdPIC: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
                        Name_PIC: fallbackName,
                        NemeEN_PIC: data.NemeEN_PIC || fallbackName,
                        Department: data.Department || "ฝ่ายขาย",
                        ContactNumber: data.ContactNumber || "-",
                    }
                });
                revalidatePath("/dashboard/users");
                revalidatePath("/dashboard/quotations/ai");
                return { success: true, data: fallbackEmp };
            }
            throw innerErr;
        }
    } catch (error: any) {
        console.error("Error creating employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteEmployeeAction(IdPIC: string) {
    try {
        await prisma.empolyee.delete({ where: { IdPIC } });
        revalidatePath("/dashboard/users");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateProductAction(data: {
    id: string;
    PROD_NAME?: string;
    PROD_ALIAS?: string;
    UNIT?: number;
    BUY_PRICE?: number;
    SALES_PRICE?: number;
    BRAND?: string;
    PROD_GRP?: string;
    UpdatedBy?: string;
}) {
    try {
        if (!data.id) return { success: false, error: "กรุณาระบุรหัสสินค้าที่จะแก้ไข" };

        const cleanNumber = (val: any) => Math.round(Number(String(val || 0).replace(/[^0-9.-]/g, "")) || 0);
        const updateData: any = {
            UpdatedBy: data.UpdatedBy || "AI Assistant",
            UPD_TIME: new Date(),
            LAST_UPD: new Date(),
        };

        if (data.PROD_NAME) updateData.PROD_NAME = data.PROD_NAME.trim();
        if (data.PROD_ALIAS) updateData.PROD_ALIAS = data.PROD_ALIAS.trim();
        if (data.UNIT !== undefined) updateData.UNIT = cleanNumber(data.UNIT);
        if (data.BUY_PRICE !== undefined) updateData.BUY_PRICE = cleanNumber(data.BUY_PRICE);
        if (data.SALES_PRICE !== undefined) updateData.SALES_PRICE = cleanNumber(data.SALES_PRICE);
        if (data.BRAND) updateData.BRAND = data.BRAND;
        if (data.PROD_GRP) updateData.PROD_GRP = data.PROD_GRP;

        const updated = await prisma.product.update({
            where: { id: data.id },
            data: updateData,
        });

        revalidatePath("/dashboard/inventory");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateCustomerAction(data: {
    id: string;
    name?: string;
    CT_PERS?: string;
    PHONE?: string;
    email?: string;
    Address?: string;
    TaxIDNumber?: string;
}) {
    try {
        if (!data.id) return { success: false, error: "กรุณาระบุรหัสลูกค้าที่จะแก้ไข" };

        const updateData: any = {};
        if (data.name) updateData.name = data.name.trim();
        if (data.CT_PERS) updateData.CT_PERS = data.CT_PERS.trim();
        if (data.PHONE) updateData.PHONE = data.PHONE.trim();
        if (data.email) updateData.email = data.email.trim();
        if (data.Address) updateData.Address = data.Address;
        if (data.TaxIDNumber) updateData.TaxIDNumber = data.TaxIDNumber;

        const updated = await prisma.customer.update({
            where: { id: data.id },
            data: updateData,
        });

        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Error updating customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateEmployeeAction(data: {
    IdPIC: string;
    Name_PIC?: string;
    NemeEN_PIC?: string;
    Department?: string;
    ContactNumber?: string;
}) {
    try {
        if (!data.IdPIC) return { success: false, error: "กรุณาระบุรหัสพนักงานที่จะแก้ไข" };

        const updateData: any = {};
        if (data.Name_PIC) updateData.Name_PIC = data.Name_PIC.trim();
        if (data.NemeEN_PIC) updateData.NemeEN_PIC = data.NemeEN_PIC.trim();
        if (data.Department) updateData.Department = data.Department;
        if (data.ContactNumber) updateData.ContactNumber = data.ContactNumber;

        const updated = await prisma.empolyee.update({
            where: { IdPIC: data.IdPIC },
            data: updateData,
        });

        revalidatePath("/dashboard/users");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Error updating employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}
