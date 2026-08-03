"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { createQuotation } from "./actions";
import { QuotationPDF } from "./QuotationPDF";

export default function AddQuotationForm({ customers, employees, products }: { customers: any[], employees: any[], products: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPreviewingPDF, setIsPreviewingPDF] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    
    const generateNumber = () => {
        const date = new Date();
        const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
        const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
        return `QT-${yyyymmdd}-${randomStr}`;
    };

    // Main Document State
    const [number, setNumber] = useState(generateNumber());
    const [idPIC, setIdPIC] = useState("");
    const [customerVendor, setCustomerVendor] = useState("");
    const [contact, setContact] = useState("");
    const [phone, setPhone] = useState("");
    const [priceValidity, setPriceValidity] = useState("30 Days");
    const [email, setEmail] = useState("");
    const [creditTerms, setCreditTerms] = useState("0");
    const [transactionType, setTransactionType] = useState("ขาย");
    const [paymentTerms, setPaymentTerms] = useState("เงินสด");
    
    // Sub Items State
    const [items, setItems] = useState<any[]>([]);

    const matchedCustomer = customerVendor ? customers.find(c => c.name === customerVendor) : null;
    const isLocked = !customerVendor || !!matchedCustomer;
    const lockBadgeText = !customerVendor ? "🔒 กรุณาเลือกลูกค้าก่อน" : matchedCustomer ? "🔒 ล็อกตามลูกค้า" : "";

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const custName = e.target.value;
        setCustomerVendor(custName);
        const cust = customers.find(c => c.name === custName);
        if (cust) {
            setContact(cust.CT_PERS || "");
            setPhone(cust.PHONE || "");
            setEmail(cust.email || "");
            setIdPIC(cust.idPIC || "");
        } else {
            setContact("");
            setPhone("");
            setEmail("");
            setIdPIC("");
        }
    };

    const handleAddItem = () => {
        if (!customerVendor) {
            alert("กรุณาเลือกลูกค้าก่อนเพิ่มรายการสินค้า");
            return;
        }
        setItems([...items, {
            ITEM_CODE: "",
            PROD_NAME: "",
            SPEC: "",
            Quantity: 1,
            UNIT: 1,
            UNIT_PRICE: 0,
            Amount: 0,
            VAT: 0,
            TOTAL: 0
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        
        if (field === 'ITEM_CODE') {
            const prod = products.find(p => p.id === value);
            if (prod) {
                newItems[index].ITEM_CODE = prod.id;
                newItems[index].PROD_NAME = prod.PROD_NAME;
                newItems[index].UNIT = prod.UNIT;
                newItems[index].UNIT_PRICE = prod.SALES_PRICE;
                newItems[index].Amount = newItems[index].Quantity * prod.SALES_PRICE;
                newItems[index].VAT = newItems[index].Amount * 0.07;
                newItems[index].TOTAL = newItems[index].Amount + newItems[index].VAT;
            } else {
                newItems[index].ITEM_CODE = value;
            }
        } else {
            newItems[index][field] = value;
            if (['Quantity', 'UNIT_PRICE'].includes(field)) {
                newItems[index].Amount = Number(newItems[index].Quantity) * Number(newItems[index].UNIT_PRICE);
                newItems[index].VAT = newItems[index].Amount * 0.07;
                newItems[index].TOTAL = newItems[index].Amount + newItems[index].VAT;
            }
        }
        
        setItems(newItems);
    };

    const handlePreview = () => {
        if (!number || !customerVendor || !idPIC) {
            alert("กรุณากรอกข้อมูลบังคับ (เลขที่เอกสาร, เลือกลูกค้า) ให้ครบถ้วน");
            return;
        }
        setIsPreviewingPDF(true);
    };

    const confirmAndSave = async () => {
        if (!number || !customerVendor || !idPIC) {
            alert("กรุณากรอกข้อมูลบังคับ (เลขที่เอกสาร, เลือกลูกค้า) ให้ครบถ้วน");
            return;
        }

        setIsSaving(true);
        try {
            if (pdfRef.current) {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pageElements = pdfRef.current.querySelectorAll('.pdf-page');
                
                for (let i = 0; i < pageElements.length; i++) {
                    const pageElement = pageElements[i] as HTMLElement;
                    
                    const canvas = await html2canvas(pageElement, {
                        scale: 2,
                        useCORS: true,
                        scrollY: 0,
                        scrollX: 0,
                        windowWidth: pageElement.scrollWidth,
                        windowHeight: pageElement.scrollHeight
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    
                    if (i > 0) {
                        pdf.addPage();
                    }
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                }
                
                pdf.save(`Quotation_${number}.pdf`);
            }

            const creatorName = employees.find(e => e.IdPIC === idPIC)?.Name_PIC || "Unknown";
            
            const result = await createQuotation({
                Number: number,
                IdPIC: idPIC,
                Customer_Vendor: customerVendor,
                CONTACT: contact,
                Phone: phone,
                PriceValidity: priceValidity,
                Email: email,
                CreditTerms: parseInt(creditTerms, 10) || 0,
                TransactionType: transactionType,
                PaymentTerms: paymentTerms,
                CreatedBy: creatorName,
                UpdatedBy: creatorName,
            }, items);

            if (result.success) {
                alert("บันทึกข้อมูลและโหลด PDF ใบเสนอราคาเรียบร้อยแล้ว");
                setIsOpen(false);
                setIsPreviewingPDF(false);
                setNumber(generateNumber());
                setCustomerVendor("");
                setContact("");
                setPhone("");
                setEmail("");
                setIdPIC("");
                setItems([]);
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึก: " + (result as any).error);
            }
        } catch (error: any) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการสร้าง PDF: " + (error?.message || String(error)));
        }
        setIsSaving(false);
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
                + สร้างใบเสนอราคาใหม่
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-white">สร้างเอกสาร (Sales / PR)</h2>
                        
                        {/* Main Document Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl">
                            <h3 className="col-span-3 text-lg font-semibold text-indigo-400 border-b border-white/10 pb-2">ข้อมูลหลัก</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">เลขที่เอกสาร *</label>
                                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="เช่น QT-2026-001" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทธุรกรรม</label>
                                <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                                    <option value="ขาย">ขาย (Sales)</option>
                                    <option value="ขอซื้อ">ขอซื้อ (Purchase Request)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">เลือกลูกค้า (ออโต้ฟิลล์ข้อมูล) *</label>
                                <select value={customerVendor} onChange={handleCustomerChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 ring-2 ring-indigo-500/50">
                                    <option value="">-- กรุณาเลือกลูกค้าก่อน --</option>
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-300">พนักงานที่รับผิดชอบ (ID PIC) *</label>
                                    {lockBadgeText && <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">{lockBadgeText}</span>}
                                </div>
                                <select
                                    value={idPIC}
                                    disabled={isLocked}
                                    onChange={(e) => setIdPIC(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none ${
                                        isLocked
                                            ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-900 border-slate-700 text-white focus:border-indigo-500"
                                    }`}
                                >
                                    <option value="">-- ออโต้ฟิลล์ตามลูกค้า --</option>
                                    {employees.map(e => <option key={e.IdPIC} value={e.IdPIC}>{e.Name_PIC}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-300">ผู้ติดต่อ (Contact)</label>
                                    {lockBadgeText && <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">{lockBadgeText}</span>}
                                </div>
                                <input
                                    type="text"
                                    value={contact}
                                    disabled={isLocked}
                                    placeholder={!customerVendor ? "กรุณาเลือกลูกค้าก่อน..." : ""}
                                    onChange={(e) => setContact(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none ${
                                        isLocked
                                            ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-900 border-slate-700 text-white focus:border-indigo-500"
                                    }`}
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-300">เบอร์โทรศัพท์</label>
                                    {lockBadgeText && <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">{lockBadgeText}</span>}
                                </div>
                                <input
                                    type="text"
                                    value={phone}
                                    disabled={isLocked}
                                    placeholder={!customerVendor ? "กรุณาเลือกลูกค้าก่อน..." : ""}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none ${
                                        isLocked
                                            ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-900 border-slate-700 text-white focus:border-indigo-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-300">อีเมล</label>
                                    {lockBadgeText && <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">{lockBadgeText}</span>}
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    disabled={isLocked}
                                    placeholder={!customerVendor ? "กรุณาเลือกลูกค้าก่อน..." : ""}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none ${
                                        isLocked
                                            ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
                                            : "bg-slate-900 border-slate-700 text-white focus:border-indigo-500"
                                    }`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ระยะเวลายืนยันราคา</label>
                                <input type="text" value={priceValidity} onChange={(e) => setPriceValidity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">เครดิตเทอม (วัน)</label>
                                    <input type="number" value={creditTerms} onChange={(e) => setCreditTerms(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">เงื่อนไขจ่าย</label>
                                    <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>

                        {/* Sub Items */}
                        <div className="bg-slate-900/50 p-4 rounded-xl mb-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                                <h3 className="text-lg font-semibold text-indigo-400">รายการสินค้า (Items)</h3>
                                <button
                                    onClick={handleAddItem}
                                    disabled={!customerVendor}
                                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs px-3 py-1 rounded"
                                >
                                    + เพิ่มรายการ
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300 min-w-max">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="py-2 px-2">รหัสสินค้า</th>
                                            <th className="py-2 px-2">ชื่อสินค้า</th>
                                            <th className="py-2 px-2">สเปค</th>
                                            <th className="py-2 px-2 w-20">จำนวน</th>
                                            <th className="py-2 px-2 w-24">ราคา/หน่วย</th>
                                            <th className="py-2 px-2">ยอดรวมสุทธิ</th>
                                            <th className="py-2 px-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-800">
                                                <td className="py-1 px-1">
                                                    <select value={item.ITEM_CODE} onChange={(e) => handleItemChange(idx, 'ITEM_CODE', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none">
                                                        <option value="">เลือกสินค้า</option>
                                                        {products.map(p => <option key={p.id} value={p.id}>{p.id} - {p.PROD_NAME}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-1 px-1"><input type="text" value={item.PROD_NAME} onChange={(e) => handleItemChange(idx, 'PROD_NAME', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                <td className="py-1 px-1"><input type="text" value={item.SPEC} onChange={(e) => handleItemChange(idx, 'SPEC', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                <td className="py-1 px-1"><input type="number" value={item.Quantity} onChange={(e) => handleItemChange(idx, 'Quantity', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                <td className="py-1 px-1"><input type="number" value={item.UNIT_PRICE} onChange={(e) => handleItemChange(idx, 'UNIT_PRICE', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1" /></td>
                                                <td className="py-1 px-1">{item.TOTAL.toFixed(2)}</td>
                                                <td className="py-1 px-1 text-center">
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300 font-bold">X</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-4 text-slate-500">
                                                    {!customerVendor ? "🔒 กรุณาเลือกลูกค้าด้านบนก่อนเพิ่มรายการสินค้า" : "ยังไม่มีรายการสินค้า"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-right mt-4 text-slate-300 font-semibold">
                                รวมทั้งสิ้น: {items.reduce((sum, item) => sum + item.TOTAL, 0).toFixed(2)} บาท
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">ยกเลิก</button>
                            <div className="flex gap-3">
                                <button onClick={handlePreview} disabled={!customerVendor} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm">🔍 ขยายดูแบบเต็มจอ</button>
                                <button onClick={confirmAndSave} disabled={isSaving || !customerVendor} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-sm">
                                    {isSaving ? "⏳ กำลังบันทึก..." : "✅ บันทึก DB & ดาวน์โหลด PDF"}
                                </button>
                            </div>
                        </div>

                        {/* ─── Real-time Live PDF Preview ──────────────────────────── */}
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                                    <span>📄</span> พรีวิวใบเสนอราคาแบบ Real-time (PDF Live Preview)
                                </h3>
                                <span className="text-xs text-slate-400">อัปเดตอัตโนมัติตามข้อมูลที่กรอกด้านบน</span>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-white/10 overflow-x-auto flex justify-center items-start max-h-[600px]">
                                <div className="shadow-2xl">
                                    <QuotationPDF 
                                        ref={pdfRef}
                                        number={number}
                                        customerVendor={customerVendor}
                                        contact={contact}
                                        phone={phone}
                                        email={email}
                                        idPIC={idPIC}
                                        creatorName={employees.find(e => e.IdPIC === idPIC)?.Name_PIC || "Unknown"}
                                        transactionType={transactionType}
                                        paymentTerms={paymentTerms}
                                        creditTerms={creditTerms}
                                        priceValidity={priceValidity}
                                        items={items}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Preview Modal (Full Screen) */}
            {isPreviewingPDF && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[95vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">ตรวจสอบความถูกต้อง (PDF Preview)</h2>
                            <button onClick={() => setIsPreviewingPDF(false)} className="text-slate-400 hover:text-white">✕ ปิด</button>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 flex justify-center items-start">
                            <div className="shadow-2xl">
                                <QuotationPDF 
                                    number={number}
                                    customerVendor={customerVendor}
                                    contact={contact}
                                    phone={phone}
                                    email={email}
                                    idPIC={idPIC}
                                    creatorName={employees.find(e => e.IdPIC === idPIC)?.Name_PIC || "Unknown"}
                                    transactionType={transactionType}
                                    paymentTerms={paymentTerms}
                                    creditTerms={creditTerms}
                                    priceValidity={priceValidity}
                                    items={items}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-700">
                            <button onClick={() => setIsPreviewingPDF(false)} className="px-6 py-2 text-slate-300 hover:text-white bg-slate-700 rounded-lg">กลับไปแก้ไข</button>
                            <button onClick={confirmAndSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                {isSaving ? "กำลังประมวลผล..." : "✅ ยืนยัน โหลด PDF & บันทึกเข้า DB"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
