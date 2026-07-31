import React from 'react';

type QuotationPDFProps = {
    number: string;
    customerVendor: string;
    contact: string;
    phone: string;
    email: string;
    idPIC: string;
    creatorName: string;
    transactionType: string;
    paymentTerms: string;
    creditTerms: string;
    priceValidity: string;
    items: any[];
};

export const QuotationPDF = React.forwardRef<HTMLDivElement, QuotationPDFProps>(({
    number, customerVendor, contact, phone, email, idPIC, creatorName,
    transactionType, paymentTerms, creditTerms, priceValidity, items
}, ref) => {
    
    const subtotal = items.reduce((sum, item) => sum + item.Amount, 0);
    const vat = items.reduce((sum, item) => sum + item.VAT, 0);
    const total = items.reduce((sum, item) => sum + item.TOTAL, 0);

    const ITEMS_PER_PAGE = 12;
    const pages = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        pages.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    
    if (pages.length === 0) {
        pages.push([]); // Ensure at least one page if there are no items
    }

    return (
        <div ref={ref} className="flex flex-col gap-4 bg-slate-200 p-4">
            {pages.map((pageItems, pageIndex) => {
                const isLastPage = pageIndex === pages.length - 1;
                const startIndex = pageIndex * ITEMS_PER_PAGE;
                
                return (
                    <div 
                        key={pageIndex}
                        className="pdf-page p-8 w-[210mm] h-[297mm] mx-auto box-border relative shadow-lg bg-white overflow-hidden"
                        style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#000000' }}
                    >
                        {/* Header (Repeated on every page) */}
                        <div className="flex justify-between items-start mb-8 border-b-2 pb-6" style={{ borderColor: '#e2e8f0' }}>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: '#4338ca' }}>ใบเสนอราคา</h1>
                                <p className="text-lg mt-1" style={{ color: '#475569' }}>QUOTATION</p>
                            </div>
                            <div className="text-right text-sm">
                                <p><span className="font-semibold">หน้า (Page):</span> {pageIndex + 1} / {pages.length}</p>
                                <p><span className="font-semibold">เลขที่ (No):</span> {number || '-'}</p>
                                <p><span className="font-semibold">วันที่ (Date):</span> {new Date().toLocaleDateString('th-TH')}</p>
                                <p><span className="font-semibold">ประเภท (Type):</span> {transactionType}</p>
                            </div>
                        </div>

                        <div className="flex justify-between mb-8 text-sm">
                            <div className="w-1/2 pr-4">
                                <h2 className="font-bold text-base mb-2 border-b pb-1" style={{ borderColor: '#e2e8f0' }}>ข้อมูลลูกค้า (Customer Info)</h2>
                                <p><span className="font-semibold">ชื่อลูกค้า:</span> {customerVendor || '-'}</p>
                                <p><span className="font-semibold">ผู้ติดต่อ:</span> {contact || '-'}</p>
                                <p><span className="font-semibold">เบอร์โทรศัพท์:</span> {phone || '-'}</p>
                                <p><span className="font-semibold">อีเมล:</span> {email || '-'}</p>
                            </div>
                            <div className="w-1/2 pl-4">
                                <h2 className="font-bold text-base mb-2 border-b pb-1" style={{ borderColor: '#e2e8f0' }}>เงื่อนไข (Terms)</h2>
                                <p><span className="font-semibold">พนักงานขาย:</span> {creatorName} ({idPIC})</p>
                                <p><span className="font-semibold">เงื่อนไขชำระเงิน:</span> {paymentTerms || '-'}</p>
                                <p><span className="font-semibold">เครดิต (วัน):</span> {creditTerms || '0'}</p>
                                <p><span className="font-semibold">ยืนยันราคา:</span> {priceValidity || '-'}</p>
                            </div>
                        </div>

                        {/* Table (Content changes per page) */}
                        <div className="min-h-[400px]">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border" style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}>
                                        <th className="py-2 px-2 border w-12 text-center" style={{ borderColor: '#cbd5e1' }}>ลำดับ<br/>(Item)</th>
                                        <th className="py-2 px-2 border" style={{ borderColor: '#cbd5e1' }}>รหัส/รายละเอียด<br/>(Code/Description)</th>
                                        <th className="py-2 px-2 border w-20 text-center" style={{ borderColor: '#cbd5e1' }}>จำนวน<br/>(Qty)</th>
                                        <th className="py-2 px-2 border w-24 text-right" style={{ borderColor: '#cbd5e1' }}>ราคา/หน่วย<br/>(Unit Price)</th>
                                        <th className="py-2 px-2 border w-28 text-right" style={{ borderColor: '#cbd5e1' }}>จำนวนเงิน<br/>(Amount)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((item, localIndex) => (
                                        <tr key={localIndex} className="border-b" style={{ borderColor: '#e2e8f0' }}>
                                            <td className="py-2 px-2 border-x text-center" style={{ borderColor: '#cbd5e1' }}>{startIndex + localIndex + 1}</td>
                                            <td className="py-2 px-2 border-x" style={{ borderColor: '#cbd5e1' }}>
                                                <p className="font-medium">{item.PROD_NAME || '-'}</p>
                                                <p className="text-xs" style={{ color: '#64748b' }}>{item.ITEM_CODE} {item.SPEC ? `| ${item.SPEC}` : ''}</p>
                                            </td>
                                            <td className="py-2 px-2 border-x text-center" style={{ borderColor: '#cbd5e1' }}>{item.Quantity || 0}</td>
                                            <td className="py-2 px-2 border-x text-right" style={{ borderColor: '#cbd5e1' }}>{(Number(item.UNIT_PRICE) || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                                            <td className="py-2 px-2 border-x text-right" style={{ borderColor: '#cbd5e1' }}>{(Number(item.Amount) || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary and Signatures (Only on the last page) */}
                        {isLastPage && (
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex justify-end mb-8">
                                    <div className="w-64 text-sm">
                                        <div className="flex justify-between py-1">
                                            <span>รวมเงิน (Sub Total):</span>
                                            <span>{subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                            <span>{vat.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-t-2 border-b-2 font-bold text-base mt-1" style={{ borderColor: '#cbd5e1' }}>
                                            <span>ยอดรวมสุทธิ (Grand Total):</span>
                                            <span>{total.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-center text-sm">
                                    <div className="w-1/3">
                                        <p className="border-t pt-2 mx-4" style={{ borderColor: '#94a3b8' }}>ผู้เสนอราคา (Prepared By)</p>
                                        <p className="mt-1 font-semibold">{creatorName}</p>
                                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>วันที่ ______________</p>
                                    </div>
                                    <div className="w-1/3">
                                        <p className="border-t pt-2 mx-4" style={{ borderColor: '#94a3b8' }}>ผู้อนุมัติ (Authorized By)</p>
                                        <p className="mt-1">&nbsp;</p>
                                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>วันที่ ______________</p>
                                    </div>
                                    <div className="w-1/3">
                                        <p className="border-t pt-2 mx-4" style={{ borderColor: '#94a3b8' }}>ผู้รับใบเสนอราคา (Accepted By)</p>
                                        <p className="mt-1">&nbsp;</p>
                                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>วันที่ ______________</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

QuotationPDF.displayName = 'QuotationPDF';
