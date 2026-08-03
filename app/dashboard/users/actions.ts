"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type EmployeeInput = {
    IdPIC: string;
    Name_PIC: string;
    NemeEN_PIC: string;
    Keyword?: string;
    Department: string;
    ContactNumber: string;
    PIC_IMAG_URL?: string;
    NOTE?: string;
};

export async function createEmployee(data: EmployeeInput) {
    try {
        await prisma.empolyee.create({
            data: {
                IdPIC: data.IdPIC,
                Name_PIC: data.Name_PIC,
                NemeEN_PIC: data.NemeEN_PIC,
                Keyword: data.Keyword,
                Department: data.Department,
                ContactNumber: data.ContactNumber,
                PIC_IMAG_URL: data.PIC_IMAG_URL,
                NOTE: data.NOTE,
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateEmployee(data: Partial<EmployeeInput> & { IdPIC: string }) {
    try {
        await prisma.empolyee.update({
            where: { IdPIC: data.IdPIC },
            data: {
                ...(data.Name_PIC ? { Name_PIC: data.Name_PIC } : {}),
                ...(data.NemeEN_PIC ? { NemeEN_PIC: data.NemeEN_PIC } : {}),
                ...(data.Keyword !== undefined ? { Keyword: data.Keyword } : {}),
                ...(data.Department ? { Department: data.Department } : {}),
                ...(data.ContactNumber ? { ContactNumber: data.ContactNumber } : {}),
                ...(data.PIC_IMAG_URL !== undefined ? { PIC_IMAG_URL: data.PIC_IMAG_URL } : {}),
                ...(data.NOTE !== undefined ? { NOTE: data.NOTE } : {}),
            },
        });

        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function deleteEmployee(IdPIC: string) {
    try {
        await prisma.empolyee.delete({
            where: { IdPIC },
        });

        revalidatePath("/dashboard/users");
        revalidatePath("/dashboard/quotations/ai");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting employee:", error);
        return { success: false, error: error.message || String(error) };
    }
}
