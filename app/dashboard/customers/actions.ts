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