import AddCustomerForm from "./AddCustomerForm";
import EditCustomerModal from "./EditCustomerModal";
import DeleteButton from "../DeleteButton";
import { deleteCustomer } from "./actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10);
  const take = 20;
  const skip = (page - 1) * take;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ skip, take }),
    prisma.customer.count()
  ]);
  const totalPages = Math.ceil(total / take);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ข้อมูลลูกค้า (Customers)</h1>
        <AddCustomerForm />
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px]">
        <h2 className="text-xl text-white mb-4">รายชื่อลูกค้าทั้งหมด (รวม {total} รายการ)</h2>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-slate-300 min-w-max">
            <thead>
                <tr className="border-b border-slate-700">
                <th className="py-2 px-4">รหัสลูกค้า</th>
                <th className="py-2 px-4">ชื่อลูกค้า / บริษัท</th>
                <th className="py-2 px-4">ผู้ติดต่อ (Contact)</th>
                <th className="py-2 px-4">เบอร์โทรศัพท์</th>
                <th className="py-2 px-4">อีเมล</th>
                <th className="py-2 px-4">กลุ่มบัญชี</th>
                <th className="py-2 px-4">เลขผู้เสียภาษี</th>
                <th className="py-2 px-4">รหัสพนักงานดูแล</th>
                <th className="py-2 px-4 text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-4 font-mono text-xs text-indigo-400">{c.id}</td>
                    <td className="py-2 px-4 font-medium text-white">{c.name}</td>
                    <td className="py-2 px-4">{c.CT_PERS}</td>
                    <td className="py-2 px-4 font-mono text-xs">{c.PHONE}</td>
                    <td className="py-2 px-4 text-xs">{c.email}</td>
                    <td className="py-2 px-4">{c.ACC_GRP}</td>
                    <td className="py-2 px-4 text-xs font-mono">{c.TaxIDNumber || "-"}</td>
                    <td className="py-2 px-4 text-xs font-mono">{c.idPIC}</td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <EditCustomerModal customer={c} />
                        <DeleteButton id={c.id} itemName={c.name} onDelete={deleteCustomer} />
                      </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {customers.length === 0 && (
          <p className="text-center text-slate-500 mt-6">ยังไม่มีข้อมูลลูกค้า</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">ก่อนหน้า</Link>}
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded">หน้า {page} จาก {totalPages}</span>
            {page < totalPages && <Link href={`?page=${page + 1}`} className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">ถัดไป</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
