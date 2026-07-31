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

    return (
        <div 
            ref={ref} 
            className="p-8 w-[210mm] min-h-[297mm] mx-auto box-border"
            style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff', color: '#000000' }}
        >
            <div className="flex justify-between items-start mb-8 border-b-2 pb-6" style={{ borderColor: '#e2e8f0' }}>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#4338ca' }}>ใบเสนอราคา</h1>
                    <p className="text-lg mt-1" style={{ color: '#475569' }}>QUOTATION</p>
                </div>
                <div className="text-right text-sm">
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
                        {items.map((item, index) => (
                            <tr key={index} className="border-b" style={{ borderColor: '#e2e8f0' }}>
                                <td className="py-2 px-2 border-x text-center" style={{ borderColor: '#cbd5e1' }}>{index + 1}</td>
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

            <div className="flex justify-end mt-4">
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

            <div className="flex justify-between mt-16 pt-8 text-center text-sm">
                <div className="w-1/3">
                    <p className="border-t pt-2 mx-4" style={{ borderColor: '#94a3b8' }}>ผู้เสนอราคา (Prepared By)</p>
                    <p className="mt-1">{creatorName}</p>
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
    );
});

QuotationPDF.displayName = 'QuotationPDF';
