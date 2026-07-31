'use client';

import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QuotationPDF } from '../QuotationPDF';
import { createQuotation } from '../actions';

interface QuotationData {
  customerVendor: string;
  contact: string;
  phone: string;
  email: string;
  idPIC: string;
  transactionType: string;
  paymentTerms: string;
  creditTerms: number;
  priceValidity: string;
  items: any[];
  aiNote?: string;
}

const EMPTY_QUOTATION: QuotationData = {
  customerVendor: '',
  contact: '',
  phone: '',
  email: '',
  idPIC: '',
  transactionType: 'ขาย',
  paymentTerms: 'เงินสด',
  creditTerms: 0,
  priceValidity: '30 Days',
  items: [],
};

function generateNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-AI-${yyyymmdd}-${rand}`;
}

export default function AIQuotationClient({
  customers,
  employees,
  products,
}: {
  customers: any[];
  employees: any[];
  products: any[];
}) {
  // AI state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiNote, setAiNote] = useState('');

  // Quotation state
  const [number, setNumber] = useState(generateNumber());
  const [quotation, setQuotation] = useState<QuotationData>(EMPTY_QUOTATION);
  const [hasGenerated, setHasGenerated] = useState(false);

  // PDF / Save state
  const [isPreviewingPDF, setIsPreviewingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // ---------- Handlers ----------

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    setAiNote('');

    try {
      const res = await fetch('/api/ai-quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, customers, employees, products }),  
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAiError(data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      const q: QuotationData = data.quotation;
      setQuotation(q);
      setAiNote(q.aiNote || '');
      setHasGenerated(true);
      setNumber(generateNumber());
    } catch (e: any) {
      setAiError(e.message || 'ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    const newItems = [...quotation.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    if (['Quantity', 'UNIT_PRICE'].includes(field)) {
      const qty = Number(newItems[idx].Quantity) || 0;
      const price = Number(newItems[idx].UNIT_PRICE) || 0;
      newItems[idx].Amount = qty * price;
      newItems[idx].VAT = newItems[idx].Amount * 0.07;
      newItems[idx].TOTAL = newItems[idx].Amount + newItems[idx].VAT;
    }
    setQuotation({ ...quotation, items: newItems });
  };

  const handleAddItem = () => {
    setQuotation({
      ...quotation,
      items: [
        ...quotation.items,
        { ITEM_CODE: '', PROD_NAME: '', SPEC: '', Quantity: 1, UNIT: 1, UNIT_PRICE: 0, Amount: 0, VAT: 0, TOTAL: 0 },
      ],
    });
  };

  const handleRemoveItem = (idx: number) => {
    setQuotation({ ...quotation, items: quotation.items.filter((_, i) => i !== idx) });
  };

  const handleProductSelect = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const newItems = [...quotation.items];
    if (prod) {
      const qty = Number(newItems[idx].Quantity) || 1;
      const amount = qty * prod.SALES_PRICE;
      newItems[idx] = {
        ...newItems[idx],
        ITEM_CODE: prod.id,
        PROD_NAME: prod.PROD_NAME,
        UNIT: prod.UNIT,
        UNIT_PRICE: prod.SALES_PRICE,
        Amount: amount,
        VAT: amount * 0.07,
        TOTAL: amount * 1.07,
      };
    } else {
      newItems[idx].ITEM_CODE = productId;
    }
    setQuotation({ ...quotation, items: newItems });
  };

  const handleCustomerChange = (custName: string) => {
    const cust = customers.find((c) => c.name === custName);
    setQuotation({
      ...quotation,
      customerVendor: custName,
      contact: cust?.CT_PERS || quotation.contact,
      phone: cust?.PHONE || quotation.phone,
      email: cust?.email || quotation.email,
      idPIC: cust?.idPIC || quotation.idPIC,
    });
  };

  const handleSaveAndPDF = async () => {
    if (!quotation.customerVendor || !quotation.idPIC) {
      alert('กรุณาตรวจสอบข้อมูลลูกค้าและพนักงาน');
      return;
    }
    setIsPreviewingPDF(true);
  };

  const confirmAndSave = async () => {
    setIsSaving(true);
    try {
      if (pdfRef.current) {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageEls = pdfRef.current.querySelectorAll('.pdf-page');
        for (let i = 0; i < pageEls.length; i++) {
          const pageEl = pageEls[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2, useCORS: true, scrollY: 0, scrollX: 0,
            windowWidth: pageEl.scrollWidth, windowHeight: pageEl.scrollHeight,
          });
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save(`Quotation_${number}.pdf`);
      }

      const employee = employees.find((e) => e.IdPIC === quotation.idPIC);
      const creatorName = employee?.Name_PIC || 'AI-Generated';

      const result = await createQuotation(
        {
          Number: number,
          IdPIC: quotation.idPIC,
          Customer_Vendor: quotation.customerVendor,
          CONTACT: quotation.contact,
          Phone: quotation.phone,
          PriceValidity: quotation.priceValidity,
          Email: quotation.email,
          CreditTerms: Number(quotation.creditTerms) || 0,
          TransactionType: quotation.transactionType,
          PaymentTerms: quotation.paymentTerms,
          CreatedBy: creatorName,
          UpdatedBy: creatorName,
        },
        quotation.items
      );

      if (result.success) {
        alert('บันทึกและดาวน์โหลด PDF สำเร็จ!');
        setIsPreviewingPDF(false);
        setHasGenerated(false);
        setQuotation(EMPTY_QUOTATION);
        setPrompt('');
        setNumber(generateNumber());
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result as any).error);
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการสร้าง PDF: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = quotation.items.reduce((s, i) => s + (i.TOTAL || 0), 0);
  const creatorName = employees.find((e) => e.IdPIC === quotation.idPIC)?.Name_PIC || '';

  // ---------- Render ----------
  return (
    <div className="space-y-6">

      {/* ── API Key & Prompt ───────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/10 p-6 space-y-4"
        style={{ background: 'rgba(15,20,40,0.8)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="text-lg font-bold text-white">พิมใบเสนอราคาด้วย AI</h2>
            <p className="text-slate-400 text-sm">บอก AI ว่าต้องการสินค้าอะไร สำหรับลูกค้าไหน — AI จะสร้างใบเสนอราคาให้อัตโนมัติ</p>
          </div>
        </div>



        {/* ── Quick Prompts ── */}
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium">⚡ ตัวอย่าง Prompt — คลิกเพื่อใช้</p>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: '📦 สินค้า 3 รายการให้ลูกค้า 1',
                text: 'ขอสร้างใบเสนอราคาประเภทขายให้กับ บริษัท ลูกค้าจำกัด 1 โดยลูกค้าต้องการสั่งซื้อสินค้าจำนวน 3 รายการ ได้แก่ สินค้าตัวอย่างรุ่น 1 จำนวน 5 ชิ้น, สินค้าตัวอย่างรุ่น 2 จำนวน 3 ชิ้น และสินค้าตัวอย่างรุ่น 3 จำนวน 2 ชิ้น ใช้ราคาสินค้าตามที่กำหนดไว้ในระบบทุกรายการ เงื่อนไขการชำระเป็นเงินสด ไม่มีเครดิต และยืนยันราคาภายใน 30 วัน',
              },
              {
                label: '💼 ออเดอร์ใหญ่ให้ลูกค้า 5',
                text: 'ปลายเดือนนี้ลูกค้ารายใหญ่ขอสั่งซื้อสินค้าหลายรายการ ขอสร้างใบเสนอราคาประเภทขายให้ บริษัท ลูกค้าจำกัด 5 โดยมีรายการสินค้ารวม 5 รายการ ได้แก่ สินค้าตัวอย่างรุ่น 4 จำนวน 10 ชิ้น, สินค้าตัวอย่างรุ่น 5 จำนวน 8 ชิ้น, สินค้าตัวอย่างรุ่น 6 จำนวน 5 ชิ้น, สินค้าตัวอย่างรุ่น 7 จำนวน 3 ชิ้น และสินค้าตัวอย่างรุ่น 8 จำนวน 2 ชิ้น ใช้ราคาตามระบบทุกรายการ เงื่อนไขการชำระเป็นเครดิต 30 วันหลังจากวันส่งมอบสินค้า และยืนยันราคาภายใน 30 วัน',
              },
              {
                label: '🛒 ขอซื้อสินค้าราคาสูง',
                text: 'ฝ่ายจัดซื้อต้องการเสนอราคาสินค้าราคาสูง สร้างใบขอซื้อ (PR) ให้ บริษัท ลูกค้าจำกัด 10 โดยมีรายการสินค้า 3 รายการ ได้แก่ สินค้าตัวอย่างรุ่น 20 จำนวน 2 ชิ้น ราคาสินค้ระ  3,000 บาทต่อชิ้น, สินค้าตัวอย่างรุ่น 22 จำนวน 1 ชิ้น ราคาสินค้า 3,300 บาท และสินค้าตัวอย่างรุ่น 25 จำนวน 3 ชิ้น ราคาสินค้า 3,750 บาท เงื่อนไขการชำระเป็นโอนเงิน เครดิต 60 วันหลังจากรับสินค้า',
              },
              {
                label: '🎯 สินค้าทดสอบรุ่นล่าสุด',
                text: 'ทีมงานขายต้องการนำสินค้ารุ่นใหม่สุดไปทดสอบกับลูกค้า โปรดสร้างใบเสนอราคาประเภทขายให้ บริษัท ลูกค้าจำกัด 3 โดยสั่ง สินค้าตัวอย่างรุ่น 10 จำนวน 1 ชิ้น ใช้ราคาตามระบบ 1,500 บาท การชำระเป็นเงินสดทันที ยืนยันราคาภายใน 15 วันนับตั้งแต่วันออกใบเสนอราคา',
              },
              {
                label: '📋 เสนอราคาครบชุด 5 รายการ',
                text: 'ลูกค้าต้องการซื้อสินค้าหลายชนิดในครั้งเดียว เพื่อนำไปใช้ในโครงการนั้นๆ โปรดสร้างใบเสนอราคาประเภทขายให้ บริษัท ลูกค้าจำกัด 7 โดยมีสินค้ารวม 5 รายการ ได้แก่ สินค้าตัวอย่างรุ่น 1 รุ่น 3 รุ่น 5 รุ่น 7 และรุ่น 9 อย่างละ 2 ชิ้นทุกรายการ ใช้ราคาตามระบบ เงื่อนไขการชำระโอนเงิน เครดิต 45 วัน ยืนยันราคา 30 วัน',
              },
              {
                label: '🏭 ออเดอร์ต่อเนื่องลูกค้า 15',
                text: 'บริษัท ลูกค้าจำกัด 15 เป็นลูกค้าประจำที่สั่งซื้อสินค้ากับเราเป็นประจำ เดือนนี้เขาต้องการสั่งซื้อเพิ่มเติม โปรดสร้างใบเสนอราคาประเภทขายให้เขา โดยสั่งสินค้าตัวอย่างรุ่น 15 จำนวน 4 ชิ้น ราคาชิ้นละ 2,250 บาท และสินค้าตัวอย่างรุ่น 16 จำนวน 2 ชิ้น ราคาชิ้นละ 2,400 บาท ชำระเครดิต 30 วันหลังจากวันส่งมอบ ชำระด้วยวิธีโอนเงิน',
              },
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(chip.text)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                  border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400
                  active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            บอก AI ว่าต้องการสร้างใบเสนอราคาแบบไหน
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={`พิมพ์หรือคลิกตัวอย่างด้านบน เช่น:\n• สร้างใบเสนอราคาให้ บริษัท ลูกค้าจำกัด 1 สั่ง สินค้าตัวอย่างรุ่น 1 จำนวน 5 ชิ้น เงินสด\n• ทำ PR ให้ บริษัท ลูกค้าจำกัด 10 สั่ง รุ่น 20 จำนวน 2 ชิ้น เครดิต 30 วัน`}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {aiError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex gap-2">
            <span>⚠️</span>
            <span>{aiError}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          id="ai-generate-btn"
          className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              AI กำลังวิเคราะห์และสร้างใบเสนอราคา...
            </>
          ) : (
            <>✨ สร้างใบเสนอราคาด้วย AI</>
          )}
        </button>
      </div>

      {/* ── AI Note ─────────────────────────────────────────────── */}
      {aiNote && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-indigo-300 text-sm flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-semibold mb-1">หมายเหตุจาก AI</p>
            <p className="leading-relaxed">{aiNote}</p>
          </div>
        </div>
      )}

      {/* ── Quotation Form (shown after generation OR empty to fill manually) ── */}
      {hasGenerated && (
        <div
          className="rounded-2xl border border-emerald-500/20 p-6 space-y-6"
          style={{ background: 'rgba(15,20,40,0.8)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">ตรวจสอบ / แก้ไขข้อมูล</h2>
            <span className="ml-auto text-xs text-slate-500">สร้างโดย AI — สามารถแก้ไขได้ทุกช่อง</span>
          </div>

          {/* Document header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl">
            <h3 className="col-span-3 text-sm font-semibold text-indigo-400 border-b border-white/10 pb-2">ข้อมูลหลัก</h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">เลขที่เอกสาร</label>
              <input value={number} onChange={(e) => setNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ประเภทธุรกรรม</label>
              <select value={quotation.transactionType}
                onChange={(e) => setQuotation({ ...quotation, transactionType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="ขาย">ขาย (Sales)</option>
                <option value="ขอซื้อ">ขอซื้อ (PR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ลูกค้า / ผู้จำหน่าย *</label>
              <select value={quotation.customerVendor} onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ผู้ติดต่อ</label>
              <input value={quotation.contact} onChange={(e) => setQuotation({ ...quotation, contact: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">โทรศัพท์</label>
              <input value={quotation.phone} onChange={(e) => setQuotation({ ...quotation, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">อีเมล</label>
              <input value={quotation.email} onChange={(e) => setQuotation({ ...quotation, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">รหัสพนักงาน (ID PIC)</label>
              <input value={quotation.idPIC} onChange={(e) => setQuotation({ ...quotation, idPIC: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">เงื่อนไขการชำระ</label>
              <input value={quotation.paymentTerms} onChange={(e) => setQuotation({ ...quotation, paymentTerms: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">เครดิตเทอม (วัน)</label>
              <input type="number" value={quotation.creditTerms}
                onChange={(e) => setQuotation({ ...quotation, creditTerms: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ระยะเวลายืนยันราคา</label>
              <input value={quotation.priceValidity}
                onChange={(e) => setQuotation({ ...quotation, priceValidity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Items table */}
          <div className="bg-slate-900/50 p-4 rounded-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
              <h3 className="text-sm font-semibold text-indigo-400">รายการสินค้า</h3>
              <button onClick={handleAddItem}
                className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1 rounded transition-colors">
                + เพิ่มรายการ
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-max">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 px-2">รหัสสินค้า</th>
                    <th className="py-2 px-2">ชื่อสินค้า</th>
                    <th className="py-2 px-2">สเปค</th>
                    <th className="py-2 px-2 w-20">จำนวน</th>
                    <th className="py-2 px-2 w-28">ราคา/หน่วย</th>
                    <th className="py-2 px-2 w-28">ยอดสุทธิ (฿)</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-1 px-1">
                        <select value={item.ITEM_CODE}
                          onChange={(e) => handleProductSelect(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none text-xs">
                          <option value="">-- เลือก --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.id} - {p.PROD_NAME}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <input value={item.PROD_NAME}
                          onChange={(e) => handleItemChange(idx, 'PROD_NAME', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs" />
                      </td>
                      <td className="py-1 px-1">
                        <input value={item.SPEC}
                          onChange={(e) => handleItemChange(idx, 'SPEC', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs" />
                      </td>
                      <td className="py-1 px-1">
                        <input type="number" value={item.Quantity}
                          onChange={(e) => handleItemChange(idx, 'Quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs" />
                      </td>
                      <td className="py-1 px-1">
                        <input type="number" value={item.UNIT_PRICE}
                          onChange={(e) => handleItemChange(idx, 'UNIT_PRICE', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs" />
                      </td>
                      <td className="py-1 px-2 text-right font-semibold text-white">
                        {(item.TOTAL || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1 px-1 text-center">
                        <button onClick={() => handleRemoveItem(idx)}
                          className="text-red-400 hover:text-red-300 font-bold text-sm">✕</button>
                      </td>
                    </tr>
                  ))}
                  {quotation.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">ยังไม่มีรายการสินค้า</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4 gap-8 text-sm pr-2">
              <span className="text-slate-400">รวมทั้งสิ้น:</span>
              <span className="font-bold text-white text-base">
                ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setHasGenerated(false); setQuotation(EMPTY_QUOTATION); setAiNote(''); }}
              className="px-5 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors text-sm"
            >
              ล้างข้อมูล
            </button>
            <button
              onClick={handleSaveAndPDF}
              id="preview-pdf-btn"
              disabled={!quotation.customerVendor}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed
                text-white font-bold rounded-lg transition-all text-sm flex items-center gap-2"
            >
              📄 พรีวิว PDF และบันทึก
            </button>
          </div>
        </div>
      )}

      {/* ── PDF Preview Modal ─────────────────────────────────── */}
      {isPreviewingPDF && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">ตรวจสอบความถูกต้อง (PDF Preview)</h2>
              <button onClick={() => setIsPreviewingPDF(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 flex justify-center items-start">
              <div className="shadow-2xl">
                <QuotationPDF
                  ref={pdfRef}
                  number={number}
                  customerVendor={quotation.customerVendor}
                  contact={quotation.contact}
                  phone={quotation.phone}
                  email={quotation.email}
                  idPIC={quotation.idPIC}
                  creatorName={creatorName || quotation.idPIC}
                  transactionType={quotation.transactionType}
                  paymentTerms={quotation.paymentTerms}
                  creditTerms={String(quotation.creditTerms)}
                  priceValidity={quotation.priceValidity}
                  items={quotation.items}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-slate-700">
              <button onClick={() => setIsPreviewingPDF(false)}
                className="px-6 py-2 text-slate-300 hover:text-white bg-slate-700 rounded-lg transition-colors">
                กลับไปแก้ไข
              </button>
              <button onClick={confirmAndSave} disabled={isSaving}
                id="confirm-save-btn"
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                {isSaving ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> กำลังประมวลผล...</>
                ) : (
                  '✅ ยืนยัน โหลด PDF & บันทึก DB'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
