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
    docDate?: Date;
};

export const QuotationPDF = React.forwardRef<HTMLDivElement, QuotationPDFProps>(({
    number, customerVendor, contact, phone, email, idPIC, creatorName,
    transactionType, paymentTerms, creditTerms, priceValidity, items, docDate
}, ref) => {
    
    const displayDate = docDate ? new Date(docDate).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');
    
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
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#e2e8f0', padding: '16px' }}>
            {pages.map((pageItems, pageIndex) => {
                const isLastPage = pageIndex === pages.length - 1;
                const startIndex = pageIndex * ITEMS_PER_PAGE;
                
                return (
                    <div 
                        key={pageIndex}
                        className="pdf-page box-border relative shadow-lg bg-white overflow-hidden"
                        style={{ width: '210mm', height: '297mm', padding: '32px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#000000' }}
                    >
                        {/* Header (Repeated on every page) */}
                        <div className="flex justify-between items-center" style={{ marginBottom: '32px', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px' }}>
                            <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src="/logo.jpg" 
                                    alt="Company Logo" 
                                    style={{ height: '70px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
                                />
                                <div>
                                    <h1 className="text-3xl font-bold" style={{ color: '#4338ca', margin: 0, lineHeight: 1.1 }}>ใบเสนอราคา</h1>
                                    <p className="text-base font-medium tracking-wide" style={{ color: '#475569', marginTop: '4px', margin: 0 }}>QUOTATION</p>
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">หน้า (Page):</span> {pageIndex + 1} / {pages.length}</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">เลขที่ (No):</span> {number || '-'}</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">วันที่ (Date):</span> {displayDate}</p>
                                <p style={{ margin: 0 }}><span className="font-semibold">ประเภท (Type):</span> {transactionType}</p>
                            </div>
                        </div>

                        {/* Customer Info and Terms - Reverted to first print layout */}
                        <div className="flex justify-between text-sm" style={{ marginBottom: '32px' }}>
                            <div style={{ width: '48%', paddingRight: '16px' }}>
                                <h2 className="font-bold text-base" style={{ marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>ข้อมูลลูกค้า (Customer Info)</h2>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">ชื่อลูกค้า:</span> {customerVendor || '-'}</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">ผู้ติดต่อ:</span> {contact || '-'}</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">เบอร์โทรศัพท์:</span> {phone || '-'}</p>
                                <p style={{ margin: 0 }}><span className="font-semibold">อีเมล:</span> {email || '-'}</p>
                            </div>
                            <div style={{ width: '48%', paddingLeft: '16px' }}>
                                <h2 className="font-bold text-base" style={{ marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>เงื่อนไข (Terms)</h2>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">พนักงานขาย:</span> {creatorName} ({idPIC})</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">เงื่อนไขชำระเงิน:</span> {paymentTerms || '-'}</p>
                                <p style={{ margin: '0 0 4px 0' }}><span className="font-semibold">เครดิต (วัน):</span> {creditTerms || '0'}</p>
                                <p style={{ margin: 0 }}><span className="font-semibold">ยืนยันราคา:</span> {priceValidity || '-'}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ minHeight: '400px' }}>
                            <table className="text-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                                        <th className="text-center" style={{ width: '50px', padding: '8px', border: '1px solid #cbd5e1' }}>ลำดับ<br/>(Item)</th>
                                        <th className="text-left" style={{ padding: '8px 16px', border: '1px solid #cbd5e1' }}>รหัส/รายละเอียด<br/>(Code/Description)</th>
                                        <th className="text-center" style={{ width: '80px', padding: '8px', border: '1px solid #cbd5e1' }}>จำนวน<br/>(Qty)</th>
                                        <th className="text-right" style={{ width: '100px', padding: '8px', border: '1px solid #cbd5e1' }}>ราคา/หน่วย<br/>(Unit Price)</th>
                                        <th className="text-right" style={{ width: '120px', padding: '8px', border: '1px solid #cbd5e1' }}>จำนวนเงิน<br/>(Amount)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.map((item, localIndex) => (
                                        <tr key={localIndex} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td className="text-center" style={{ padding: '8px', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>{startIndex + localIndex + 1}</td>
                                            <td className="text-left" style={{ padding: '8px 16px', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                                                <p className="font-medium" style={{ margin: '0 0 4px 0' }}>{item.PROD_NAME || '-'}</p>
                                                <p className="text-xs" style={{ color: '#64748b', margin: 0 }}>{item.ITEM_CODE} {item.SPEC ? `| ${item.SPEC}` : ''}</p>
                                            </td>
                                            <td className="text-center" style={{ padding: '8px', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>{item.Quantity || 0}</td>
                                            <td className="text-right" style={{ padding: '8px', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>{(Number(item.UNIT_PRICE) || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                                            <td className="text-right" style={{ padding: '8px', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>{(Number(item.Amount) || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary and Signatures (Only on the last page) */}
                        {isLastPage && (
                            <div style={{ position: 'absolute', bottom: '32px', left: '32px', right: '32px' }}>
                                <div className="flex justify-end" style={{ marginBottom: '32px' }}>
                                    <div className="text-sm" style={{ width: '250px' }}>
                                        <div className="flex justify-between" style={{ padding: '4px 0' }}>
                                            <span>รวมเงิน (Sub Total):</span>
                                            <span>{subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                        <div className="flex justify-between" style={{ padding: '4px 0' }}>
                                            <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                            <span>{vat.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-base" style={{ padding: '8px 0', borderTop: '2px solid #cbd5e1', borderBottom: '2px solid #cbd5e1', marginTop: '4px' }}>
                                            <span>ยอดรวมสุทธิ (Grand Total):</span>
                                            <span>{total.toLocaleString('th-TH', {minimumFractionDigits: 2})} ฿</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-center text-sm">
                                    <div style={{ width: '30%' }}>
                                        <p style={{ borderTop: '1px solid #94a3b8', paddingTop: '8px', margin: '0 16px' }}>ผู้เสนอราคา (Prepared By)</p>
                                        <p className="font-semibold" style={{ marginTop: '4px', margin: 0 }}>{creatorName}</p>
                                        <p className="text-xs" style={{ color: '#64748b', marginTop: '4px', margin: 0 }}>วันที่ {displayDate}</p>
                                    </div>
                                    <div style={{ width: '30%' }}>
                                        <p style={{ borderTop: '1px solid #94a3b8', paddingTop: '8px', margin: '0 16px' }}>ผู้อนุมัติ (Authorized By)</p>
                                        <p style={{ color: '#94a3b8', marginTop: '4px', margin: 0 }}>(________________________)</p>
                                        <p className="text-xs" style={{ color: '#64748b', marginTop: '4px', margin: 0 }}>วันที่ ______________</p>
                                    </div>
                                    <div style={{ width: '30%' }}>
                                        <p style={{ borderTop: '1px solid #94a3b8', paddingTop: '8px', margin: '0 16px' }}>ผู้รับใบเสนอราคา (Accepted By)</p>
                                        <p style={{ color: '#94a3b8', marginTop: '4px', margin: 0 }}>(________________________)</p>
                                        <p className="text-xs" style={{ color: '#64748b', marginTop: '4px', margin: 0 }}>วันที่ ______________</p>
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
