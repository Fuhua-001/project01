import { prisma } from "@/lib/prisma";
import AddQuotationForm from "./AddQuotation";
import ViewQuotationButton from "./ViewQuotationButton";
import DeleteButton from "../DeleteButton";
import { fetchFormData, deleteQuotationAction } from "./actions";
import Link from "next/link";

export default async function QuotationsPage(props: { searchParams?: Promise<{ page?: string }> }) {
    // Pagination params
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams?.page || "1", 10);
    const take = 20;
    const skip = (page - 1) * take;

    // Fetch formData for the add form
    const { customers, employees, products } = await fetchFormData();
    
    // Fetch existing quotations
    const [quotations, total] = await Promise.all([
        prisma.sales_pr.findMany({
            orderBy: { DATE: 'desc' },
            skip,
            take
        }),
        prisma.sales_pr.count()
    ]);
    const totalPages = Math.ceil(total / take);
    
    // Fetch all sub items to calculate total
    const subItems = await prisma.sub_sales_pr.findMany();

    return (
        <div className="p-8 max-w-7xl mx-auto text-slate-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">ใบเสนอราคา (Quotations)</h1>
                    <p className="text-slate-400">ระบบจัดการเอกสารการขายและขอซื้อ</p>
                </div>
                <AddQuotationForm customers={customers} employees={employees} products={products} />
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-900/80">
                            <th className="py-3 px-4 font-semibold text-slate-300">วันที่</th>
                            <th className="py-3 px-4 font-semibold text-slate-300">เลขที่เอกสาร</th>
                            <th className="py-3 px-4 font-semibold text-slate-300">ลูกค้า / ผู้จำหน่าย</th>
                            <th className="py-3 px-4 font-semibold text-slate-300">พนักงาน (ID)</th>
                            <th className="py-3 px-4 font-semibold text-slate-300">ประเภท</th>
                            <th className="py-3 px-4 font-semibold text-slate-300 text-right">ยอดรวมสุทธิ</th>
                            <th className="py-3 px-4 font-semibold text-slate-300 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">ยังไม่มีข้อมูลใบเสนอราคา</td>
                            </tr>
                        ) : (
                            quotations.map((doc) => {
                                const docItems = subItems.filter(item => item.sales_pr_Id === doc.Id);
                                const totalAmount = docItems.reduce((sum, item) => sum + item.TOTAL, 0);
                                
                                return (
                                <tr key={doc.Id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 px-4">{doc.DATE.toLocaleDateString('th-TH')}</td>
                                    <td className="py-3 px-4 font-medium text-indigo-400">{doc.Number}</td>
                                    <td className="py-3 px-4">{doc.Customer_Vendor}</td>
                                    <td className="py-3 px-4">{doc.IdPIC}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs ${doc.TransactionType === 'ขาย' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {doc.TransactionType}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-white">
                                        {totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <ViewQuotationButton doc={doc} items={docItems} creatorName={doc.CreatedBy} />
                                            <DeleteButton id={doc.Id} itemName={`ใบเสนอราคา ${doc.Number}`} onDelete={deleteQuotationAction} />
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">ก่อนหน้า</Link>}
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded">หน้า {page} จาก {totalPages}</span>
                    {page < totalPages && <Link href={`?page=${page + 1}`} className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">ถัดไป</Link>}
                </div>
            )}
        </div>
    );
}
