"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CustomerInput = {
    id: string;
    name: string;
    idPIC: string;
    taxIDNumber?: string;
    accGrp: string;
    ctPers: string;
    address?: string;
    email: string;
    phone: string;
    allCont?: string;
    note?: string;
};

export async function createCustomer(data: CustomerInput) {
    try {
        await prisma.customer.create({
            data: {
                id: data.id,
                name: data.name,
                idPIC: data.idPIC,
                ...(data.taxIDNumber ? { TaxIDNumber: data.taxIDNumber } : {}),
                ACC_GRP: data.accGrp,
                CT_PERS: data.ctPers,
                Address: data.address,
                email: data.email,
                PHONE: data.phone,
                ALL_CONT: data.allCont,
                NOTE: data.note,
            },
        });

        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateCustomer(data: Partial<CustomerInput> & { id: string }) {
    try {
        await prisma.customer.update({
            where: { id: data.id },
            data: {
                ...(data.name ? { name: data.name } : {}),
                ...(data.idPIC ? { idPIC: data.idPIC } : {}),
                ...(data.taxIDNumber !== undefined ? { TaxIDNumber: data.taxIDNumber } : {}),
                ...(data.accGrp ? { ACC_GRP: data.accGrp } : {}),
                ...(data.ctPers ? { CT_PERS: data.ctPers } : {}),
                ...(data.address !== undefined ? { Address: data.address } : {}),
                ...(data.email ? { email: data.email } : {}),
                ...(data.phone ? { PHONE: data.phone } : {}),
                ...(data.allCont !== undefined ? { ALL_CONT: data.allCont } : {}),
                ...(data.note !== undefined ? { NOTE: data.note } : {}),
            },
        });

        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({
            where: { id },
        });

        revalidatePath("/dashboard/customers");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting customer:", error);
        return { success: false, error: error.message || String(error) };
    }
}