import AddInventoryForm from "./AddInventory";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const products = await prisma.product.findMany();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">คลังสินค้า (Inventory)</h1>
        <AddInventoryForm />
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px]">
        <h2 className="text-xl text-white mb-4">รายการสินค้าทั้งหมด ({products.length} รายการ)</h2>
        
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-slate-300 min-w-max">
            <thead>
                <tr className="border-b border-slate-700">
                <th className="py-2 px-4">รหัส (ID)</th>
                <th className="py-2 px-4">ชื่อสินค้า</th>
                <th className="py-2 px-4">บาร์โค้ด</th>
                <th className="py-2 px-4">หมวดหมู่ 1</th>
                <th className="py-2 px-4">หมวดหมู่ 2</th>
                <th className="py-2 px-4">ยี่ห้อ</th>
                <th className="py-2 px-4">กลุ่มสินค้า</th>
                <th className="py-2 px-4">สถานะ</th>
                <th className="py-2 px-4">ราคาซื้อ</th>
                <th className="py-2 px-4">ราคาขาย</th>
                <th className="py-2 px-4">หน่วยนับ</th>
                <th className="py-2 px-4">หมายเหตุ</th>
                </tr>
            </thead>
            <tbody>
                {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-2 px-4">{p.id}</td>
                    <td className="py-2 px-4">{p.PROD_NAME}</td>
                    <td className="py-2 px-4">{p.BARCODE}</td>
                    <td className="py-2 px-4">{p.ProductType1}</td>
                    <td className="py-2 px-4">{p.ProductType2}</td>
                    <td className="py-2 px-4">{p.BRAND}</td>
                    <td className="py-2 px-4">{p.PROD_GRP}</td>
                    <td className="py-2 px-4">{p.Status}</td>
                    <td className="py-2 px-4">{p.BUY_PRICE}</td>
                    <td className="py-2 px-4">{p.SALES_PRICE}</td>
                    <td className="py-2 px-4">{p.UNIT}</td>
                    <td className="py-2 px-4">{p.NOTE || "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {products.length === 0 && (
          <p className="text-center text-slate-500 mt-6">ยังไม่มีข้อมูลสินค้า</p>
        )}
      </div>
    </div>
  );
}
