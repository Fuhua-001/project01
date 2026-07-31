import AddCustomerForm from "./AddCustomerForm";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany();
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการข้อมูลลูกค้า (Customers)</h1>
        <AddCustomerForm />
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px]">
        <h2 className="text-xl text-white mb-4">รายชื่อลูกค้าทั้งหมด ({customers.length} คน)</h2>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-slate-300 min-w-max">
            <thead>
                <tr className="border-b border-slate-700">
                <th className="py-2 px-4">รหัส (ID)</th>
                <th className="py-2 px-4">ชื่อลูกค้า (Name)</th>
                <th className="py-2 px-4">อีเมล (Email)</th>
                <th className="py-2 px-4">โทรศัพท์ (Phone)</th>
                <th className="py-2 px-4">รหัสผู้รับผิดชอบ (ID PIC)</th>
                <th className="py-2 px-4">เลขประจำตัวผู้เสียภาษี</th>
                <th className="py-2 px-4">กลุ่มลูกค้า (ACC_GRP)</th>
                <th className="py-2 px-4">ผู้ติดต่อ (CT_PERS)</th>
                <th className="py-2 px-4">ที่อยู่</th>
                <th className="py-2 px-4">หมายเหตุ</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-4">{customer.id}</td>
                    <td className="py-2 px-4">{customer.name}</td>
                    <td className="py-2 px-4">{customer.email}</td>
                    <td className="py-2 px-4">{customer.PHONE}</td>
                    <td className="py-2 px-4">{customer.idPIC}</td>
                    <td className="py-2 px-4">{customer.TaxIDNumber || "-"}</td>
                    <td className="py-2 px-4">{customer.ACC_GRP}</td>
                    <td className="py-2 px-4">{customer.CT_PERS}</td>
                    <td className="py-2 px-4">{customer.Address || "-"}</td>
                    <td className="py-2 px-4">{customer.NOTE || "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {customers.length === 0 && (
          <p className="text-center text-slate-500 mt-6">ยังไม่มีข้อมูลลูกค้า</p>
        )}
      </div>
    </div>
  );
}
