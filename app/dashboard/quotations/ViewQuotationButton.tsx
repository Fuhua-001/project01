"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { QuotationPDF } from "./QuotationPDF";

export default function ViewQuotationButton({ doc, items, creatorName }: { doc: any, items: any[], creatorName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        setIsDownloading(true);
        try {
            if (pdfRef.current) {
                const canvas = await html2canvas(pdfRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Quotation_${doc.Number}.pdf`);
            }
        } catch (error: any) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการโหลด PDF: " + (error?.message || String(error)));
        }
        setIsDownloading(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)} 
                className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-1 rounded text-xs transition-colors"
            >
                ดู PDF
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[95vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">ดูใบเสนอราคา (PDF)</h2>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕ ปิด</button>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 flex justify-center items-start">
                            <div className="shadow-2xl">
                                <QuotationPDF 
                                    ref={pdfRef}
                                    number={doc.Number}
                                    customerVendor={doc.Customer_Vendor}
                                    contact={doc.CONTACT}
                                    phone={doc.Phone}
                                    email={doc.Email}
                                    idPIC={doc.IdPIC}
                                    creatorName={creatorName}
                                    transactionType={doc.TransactionType}
                                    paymentTerms={doc.PaymentTerms}
                                    creditTerms={doc.CreditTerms.toString()}
                                    priceValidity={doc.PriceValidity}
                                    items={items}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={() => setIsOpen(false)} className="px-6 py-2 text-slate-300 hover:text-white bg-slate-700 rounded-lg">ปิดหน้าต่าง</button>
                            <button onClick={downloadPDF} disabled={isDownloading} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                {isDownloading ? "กำลังประมวลผล..." : "ดาวน์โหลด PDF"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
