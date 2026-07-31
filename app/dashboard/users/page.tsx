import AddUserForm from "./AddUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function UsersPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10);
  const take = 20;
  const skip = (page - 1) * take;

  const [users, total] = await Promise.all([
    prisma.empolyee.findMany({ skip, take }),
    prisma.empolyee.count()
  ]);
  const totalPages = Math.ceil(total / take);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน (Users)</h1>
        <AddUserForm />
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px]">
        <h2 className="text-xl text-white mb-4">รายชื่อพนักงานทั้งหมด (รวม {total} คน)</h2>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-slate-300 min-w-max">
            <thead>
                <tr className="border-b border-slate-700">
                <th className="py-2 px-4">รหัส (ID PIC)</th>
                <th className="py-2 px-4">ชื่อ (ไทย)</th>
                <th className="py-2 px-4">ชื่อ (อังกฤษ)</th>
                <th className="py-2 px-4">แผนก (Department)</th>
                <th className="py-2 px-4">เบอร์โทรศัพท์</th>
                <th className="py-2 px-4">คำค้นหา (Keyword)</th>
                <th className="py-2 px-4">หมายเหตุ</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                <tr key={user.IdPIC} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-4">{user.IdPIC}</td>
                    <td className="py-2 px-4">{user.Name_PIC}</td>
                    <td className="py-2 px-4">{user.NemeEN_PIC}</td>
                    <td className="py-2 px-4">{user.Department}</td>
                    <td className="py-2 px-4">{user.ContactNumber}</td>
                    <td className="py-2 px-4">{user.Keyword || "-"}</td>
                    <td className="py-2 px-4">{user.NOTE || "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {users.length === 0 && (
          <p className="text-center text-slate-500 mt-6">ยังไม่มีข้อมูลผู้ใช้งาน</p>
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
