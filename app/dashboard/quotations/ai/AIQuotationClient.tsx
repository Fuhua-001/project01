"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { QuotationPDF } from "../QuotationPDF";
import {
  createQuotation,
  createCustomer,
  updateCustomerAction,
  deleteCustomerAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  createEmployeeAction,
  updateEmployeeAction,
  deleteEmployeeAction,
} from "../actions";

type Item = {
  ITEM_CODE: string;
  PROD_NAME: string;
  SPEC: string;
  Quantity: number;
  UNIT: number;
  UNIT_PRICE: number;
  Amount: number;
  VAT: number;
  TOTAL: number;
};

type QuotationData = {
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
  items: Item[];
};

type CustomerData = {
  id?: string;
  name: string;
  idPIC?: string;
  CT_PERS?: string;
  PHONE?: string;
  email?: string;
  ACC_GRP?: string;
  Address?: string;
  TaxIDNumber?: string;
};

type ProductData = {
  id?: string;
  PROD_NAME: string;
  PROD_ALIAS?: string;
  UNIT?: number;
  SALES_PRICE: number;
  BUY_PRICE?: number;
  BARCODE?: string;
  BRAND?: string;
  PROD_GRP?: string;
};

type EmployeeData = {
  IdPIC?: string;
  Name_PIC: string;
  NemeEN_PIC?: string;
  Department?: string;
  ContactNumber?: string;
};

const generateNumber = () => {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000).toString();
  return `QT-${yyyymmdd}-${rand}`;
};

export default function AIQuotationClient({
  customers,
  employees,
  products,
}: {
  customers: any[];
  employees: any[];
  products: any[];
}) {
  // Chat state
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Intent & Draft states
  const [intent, setIntent] = useState<string | null>(null);

  // Quotation state
  const [editDraft, setEditDraft] = useState<QuotationData | null>(null);
  const [number, setNumber] = useState(generateNumber());

  // Customer state
  const [customerDraft, setCustomerDraft] = useState<CustomerData | null>(null);

  // Product state
  const [productDraft, setProductDraft] = useState<ProductData | null>(null);

  // Employee state
  const [employeeDraft, setEmployeeDraft] = useState<EmployeeData | null>(null);

  // PDF state
  const [isPreviewingPDF, setIsPreviewingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Helper to sanitize & calculate quotation numbers cleanly
  const sanitizeQuotationData = (qData: QuotationData): QuotationData => {
    if (!qData) return qData;
    const items = (qData.items || []).map((item: any) => {
      const qty = Math.max(1, Number(item.Quantity) || 1);
      const price = Number(item.UNIT_PRICE) || 0;
      const amount = qty * price;
      const vat = amount * 0.07;
      const total = amount + vat;
      return {
        ITEM_CODE: String(item.ITEM_CODE || "PROD-001"),
        PROD_NAME: String(item.PROD_NAME || "สินค้า"),
        SPEC: String(item.SPEC || "-"),
        Quantity: qty,
        UNIT: Number(item.UNIT) || 1,
        UNIT_PRICE: price,
        Amount: amount,
        VAT: vat,
        TOTAL: total,
      };
    });

    const matchedCust = customers.find(
      (c) => c.name.trim().toLowerCase() === (qData.customerVendor || "").trim().toLowerCase()
    );
    const matchedEmp = matchedCust ? employees.find((e) => e.IdPIC === matchedCust.idPIC) : null;

    return {
      customerVendor: matchedCust ? matchedCust.name : qData.customerVendor || customers[0]?.name || "บริษัท สยามเทค จำกัด",
      contact: matchedCust ? (matchedCust.CT_PERS || "-") : qData.contact || "-",
      phone: matchedCust ? (matchedCust.PHONE || "-") : qData.phone || "-",
      email: matchedCust ? (matchedCust.email || "-") : qData.email || "-",
      idPIC: matchedCust ? (matchedCust.idPIC || "-") : qData.idPIC || employees[0]?.IdPIC || "EMP-001",
      creatorName: matchedEmp ? matchedEmp.Name_PIC : qData.creatorName || employees[0]?.Name_PIC || "Unknown",
      transactionType: qData.transactionType || "ขาย",
      paymentTerms: qData.paymentTerms || "เงินสด",
      creditTerms: String(qData.creditTerms || "0"),
      priceValidity: qData.priceValidity || "30 Days",
      items: items,
    };
  };

  const syncCustomerWithDraft = (qData: QuotationData): QuotationData => {
    return sanitizeQuotationData(qData);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user" as const, text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Reset current active drafts
    setIntent(null);
    setEditDraft(null);
    setCustomerDraft(null);
    setProductDraft(null);
    setEmployeeDraft(null);

    try {
      const res = await fetch("/api/smart-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, customers, employees, products }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "เกิดข้อผิดพลาด");
      }

      const data = json.data;
      const detectedIntent = data.intent || "general_chat";
      setIntent(detectedIntent);

      if (detectedIntent === "quotation" && data.quotationData) {
        const sanitized = sanitizeQuotationData(data.quotationData);
        setEditDraft(JSON.parse(JSON.stringify(sanitized)));
      } else if (
        ["add_customer", "update_customer", "delete_customer"].includes(detectedIntent) &&
        data.targetCustomer
      ) {
        setCustomerDraft(data.targetCustomer);
      } else if (
        ["add_product", "update_product", "delete_product"].includes(detectedIntent) &&
        data.targetProduct
      ) {
        setProductDraft(data.targetProduct);
      } else if (
        ["add_employee", "update_employee", "delete_employee"].includes(detectedIntent) &&
        data.targetEmployee
      ) {
        setEmployeeDraft(data.targetEmployee);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.explanation || "✅ ดำเนินการสำเร็จ",
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `❌ เกิดข้อผิดพลาด: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Quotation Handlers ─────────────────────────────────────
  const updateEditField = (field: keyof QuotationData, value: string) => {
    if (!editDraft) return;
    const updated = { ...editDraft, [field]: value };
    if (field === "customerVendor") {
      setEditDraft(syncCustomerWithDraft(updated));
    } else {
      setEditDraft(updated);
    }
  };

  const updateItem = (idx: number, field: keyof Item, value: any) => {
    if (!editDraft) return;
    const newItems = [...editDraft.items];
    newItems[idx] = { ...newItems[idx], [field]: value };

    if (["Quantity", "UNIT_PRICE"].includes(field as string)) {
      const qty = Number(newItems[idx].Quantity);
      const price = Number(newItems[idx].UNIT_PRICE);
      newItems[idx].Amount = qty * price;
      newItems[idx].VAT = newItems[idx].Amount * 0.07;
      newItems[idx].TOTAL = newItems[idx].Amount + newItems[idx].VAT;
    }
    setEditDraft({ ...editDraft, items: newItems });
  };

  const addItem = () => {
    if (!editDraft) return;
    setEditDraft({
      ...editDraft,
      items: [
        ...editDraft.items,
        { ITEM_CODE: "", PROD_NAME: "", SPEC: "", Quantity: 1, UNIT: 1, UNIT_PRICE: 0, Amount: 0, VAT: 0, TOTAL: 0 },
      ],
    });
  };

  const removeItem = (idx: number) => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, items: editDraft.items.filter((_, i) => i !== idx) });
  };

  const confirmAndSaveQuotation = async () => {
    if (!editDraft) return;
    setIsSaving(true);
    try {
      if (pdfRef.current) {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageElements = pdfRef.current.querySelectorAll(".pdf-page");
        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: pageEl.scrollWidth,
            windowHeight: pageEl.scrollHeight,
          });
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save(`Quotation_${number}.pdf`);
      }

      const result = await createQuotation(
        {
          Number: number,
          IdPIC: editDraft.idPIC || "",
          Customer_Vendor: editDraft.customerVendor,
          CONTACT: editDraft.contact,
          Phone: editDraft.phone,
          PriceValidity: editDraft.priceValidity || "30 Days",
          Email: editDraft.email,
          CreditTerms: parseInt(editDraft.creditTerms, 10) || 0,
          TransactionType: editDraft.transactionType || "ขาย",
          PaymentTerms: editDraft.paymentTerms || "เงินสด",
          CreatedBy: editDraft.creatorName || "Unknown",
          UpdatedBy: editDraft.creatorName || "Unknown",
        },
        editDraft.items
      );

      if (result.success) {
        alert("✅ บันทึกและดาวน์โหลด PDF เรียบร้อยแล้ว");
        setEditDraft(null);
        setIntent(null);
        setIsPreviewingPDF(false);
        setNumber(generateNumber());
      } else {
        alert("❌ เกิดข้อผิดพลาดในการบันทึก: " + (result as any).error);
      }
    } catch (error: any) {
      alert("❌ เกิดข้อผิดพลาด: " + (error?.message || String(error)));
    }
    setIsSaving(false);
  };

  // ─── Save / Update / Delete Handlers ───────────────────────
  const saveCustomer = async () => {
    if (!customerDraft) {
      alert("ไม่พบข้อมูลลูกค้า");
      return;
    }
    setIsSaving(true);
    let res;
    if (intent === "delete_customer" && customerDraft.id) {
      res = await deleteCustomerAction(customerDraft.id);
    } else if (intent === "update_customer" && customerDraft.id) {
      res = await updateCustomerAction({
        id: customerDraft.id,
        name: customerDraft.name,
        CT_PERS: customerDraft.CT_PERS,
        PHONE: customerDraft.PHONE,
        email: customerDraft.email,
        Address: customerDraft.Address,
        TaxIDNumber: customerDraft.TaxIDNumber,
      });
    } else {
      res = await createCustomer(customerDraft);
    }
    setIsSaving(false);
    if (res.success) {
      const actionText = intent === "delete_customer" ? "ลบ" : intent === "update_customer" ? "อัปเดต" : "เพิ่ม";
      alert(`✅ ${actionText}ลูกค้า "${customerDraft.name || 'ใหม่'}" เรียบร้อยแล้ว`);
      setCustomerDraft(null);
      setIntent(null);
    } else {
      alert(`❌ เกิดข้อผิดพลาด: ${res.error || "ไม่สามารถทำรายการได้"}`);
    }
  };

  const saveProduct = async () => {
    if (!productDraft) {
      alert("ไม่พบข้อมูลสินค้า");
      return;
    }
    setIsSaving(true);
    let res;
    if (intent === "delete_product" && productDraft.id) {
      res = await deleteProductAction(productDraft.id);
    } else if (intent === "update_product" && productDraft.id) {
      res = await updateProductAction({
        id: productDraft.id,
        PROD_NAME: productDraft.PROD_NAME,
        PROD_ALIAS: productDraft.PROD_ALIAS,
        UNIT: productDraft.UNIT,
        SALES_PRICE: productDraft.SALES_PRICE,
        BUY_PRICE: productDraft.BUY_PRICE,
        BRAND: productDraft.BRAND,
        PROD_GRP: productDraft.PROD_GRP,
        UpdatedBy: "AI Assistant",
      });
    } else {
      res = await createProductAction(productDraft);
    }
    setIsSaving(false);
    if (res.success) {
      const actionText = intent === "delete_product" ? "ลบ" : intent === "update_product" ? "อัปเดต" : "เพิ่ม";
      alert(`✅ ${actionText}สินค้า "${productDraft.PROD_NAME || 'ใหม่'}" เรียบร้อยแล้ว`);
      setProductDraft(null);
      setIntent(null);
    } else {
      alert(`❌ เกิดข้อผิดพลาด: ${res.error || "ไม่สามารถทำรายการได้"}`);
    }
  };

  const saveEmployee = async () => {
    if (!employeeDraft) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }
    setIsSaving(true);
    let res;
    if (intent === "delete_employee" && employeeDraft.IdPIC) {
      res = await deleteEmployeeAction(employeeDraft.IdPIC);
    } else if (intent === "update_employee" && employeeDraft.IdPIC) {
      res = await updateEmployeeAction({
        IdPIC: employeeDraft.IdPIC,
        Name_PIC: employeeDraft.Name_PIC,
        NemeEN_PIC: employeeDraft.NemeEN_PIC,
        Department: employeeDraft.Department,
        ContactNumber: employeeDraft.ContactNumber,
      });
    } else {
      res = await createEmployeeAction(employeeDraft);
    }
    setIsSaving(false);
    if (res.success) {
      const actionText = intent === "delete_employee" ? "ลบ" : intent === "update_employee" ? "อัปเดต" : "เพิ่ม";
      alert(`✅ ${actionText}พนักงาน "${employeeDraft.Name_PIC || 'ใหม่'}" เรียบร้อยแล้ว`);
      setEmployeeDraft(null);
      setIntent(null);
    } else {
      alert(`❌ เกิดข้อผิดพลาด: ${res.error || "ไม่สามารถทำรายการได้"}`);
    }
  };

  // Is current draft matched with an existing customer in DB?
  const matchedCustomer = editDraft
    ? customers.find((c) => c.name.trim().toLowerCase() === (editDraft.customerVendor || "").trim().toLowerCase())
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Chat Panel ─────────────────────────────────────── */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {/* Messages */}
        <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
              <p className="font-semibold text-slate-300">💬 พิมพ์คำสั่งสั่งงาน AI ได้ เช่น:</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="bg-slate-800 border border-white/10 px-3 py-1.5 rounded-xl text-indigo-300">📝 "สร้างใบเสนอราคาให้ลูกค้า ABC..."</span>
                <span className="bg-slate-800 border border-white/10 px-3 py-1.5 rounded-xl text-amber-300">✏️ "แก้ไขราคาสินค้า PROD-001..."</span>
                <span className="bg-slate-800 border border-white/10 px-3 py-1.5 rounded-xl text-red-300">🗑️ "ลบสินค้า PROD-001"</span>
                <span className="bg-slate-800 border border-white/10 px-3 py-1.5 rounded-xl text-emerald-300">👤 "เพิ่มลูกค้าใหม่..."</span>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-800 border border-white/10 text-slate-200 rounded-bl-sm"
                }`}
              >
                {msg.role === "ai" && <span className="mr-1.5">🤖</span>}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm text-slate-400 text-sm">
                <span className="inline-flex gap-1.5 items-center">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4 flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์สั่ง AI ได้เลย... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
            rows={2}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors self-end"
          >
            {isLoading ? "⏳" : "ส่ง ↵"}
          </button>
        </div>
      </div>

      {/* ─── Intent: Customer Card (Add/Update/Delete) ──────── */}
      {["add_customer", "update_customer", "delete_customer"].includes(intent || "") && customerDraft && (
        <div
          className={`bg-slate-900/60 border rounded-2xl p-6 ${
            intent === "delete_customer" ? "border-red-500/50 bg-red-950/20" : "border-emerald-500/30"
          }`}
        >
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${
                intent === "delete_customer" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              <span>{intent === "delete_customer" ? "🗑️" : "👤"}</span>{" "}
              {intent === "delete_customer"
                ? `ยืนยันการลบลูกค้า (${customerDraft.name})`
                : intent === "update_customer"
                ? "ตรวจสอบและยืนยันการแก้ไขลูกค้า"
                : "ตรวจสอบข้อมูลลูกค้าใหม่"}
            </h2>
            <button onClick={() => { setCustomerDraft(null); setIntent(null); }} className="text-xs text-slate-400 hover:text-white">✕ ยกเลิก</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-slate-400 mb-1">รหัสลูกค้า (ID)</label>
              <input
                type="text"
                disabled
                value={customerDraft.id || ""}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ชื่อลูกค้า *</label>
              <input
                type="text"
                disabled={intent === "delete_customer"}
                value={customerDraft.name || ""}
                onChange={(e) => setCustomerDraft({ ...customerDraft, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ผู้ติดต่อ (CT_PERS)</label>
              <input
                type="text"
                disabled={intent === "delete_customer"}
                value={customerDraft.CT_PERS || ""}
                onChange={(e) => setCustomerDraft({ ...customerDraft, CT_PERS: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                disabled={intent === "delete_customer"}
                value={customerDraft.PHONE || ""}
                onChange={(e) => setCustomerDraft({ ...customerDraft, PHONE: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button onClick={() => { setCustomerDraft(null); setIntent(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
            <button
              onClick={saveCustomer}
              disabled={isSaving}
              className={`text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                intent === "delete_customer" ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {isSaving
                ? "⏳ กำลังดำเนินการ..."
                : intent === "delete_customer"
                ? "🗑️ ยืนยันลบลูกค้าออกจาก DB"
                : intent === "update_customer"
                ? "✅ ยืนยันการอัปเดตลง DB"
                : "✅ บันทึกลูกค้าเข้า DB"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Intent: Product Card (Add/Update/Delete) ───────── */}
      {["add_product", "update_product", "delete_product"].includes(intent || "") && productDraft && (
        <div
          className={`bg-slate-900/60 border rounded-2xl p-6 ${
            intent === "delete_product" ? "border-red-500/50 bg-red-950/20" : "border-amber-500/30"
          }`}
        >
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${
                intent === "delete_product" ? "text-red-400" : "text-amber-400"
              }`}
            >
              <span>{intent === "delete_product" ? "🗑️" : "📦"}</span>{" "}
              {intent === "delete_product"
                ? `ยืนยันการลบสินค้า (${productDraft.PROD_NAME})`
                : intent === "update_product"
                ? `ตรวจสอบและยืนยันการแก้ไขสินค้า (${productDraft.id})`
                : "ตรวจสอบข้อมูลสินค้าใหม่"}
            </h2>
            <button onClick={() => { setProductDraft(null); setIntent(null); }} className="text-xs text-slate-400 hover:text-white">✕ ยกเลิก</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs text-slate-400 mb-1">ชื่อสินค้า *</label>
              <input
                type="text"
                disabled={intent === "delete_product"}
                value={productDraft.PROD_NAME || ""}
                onChange={(e) => setProductDraft({ ...productDraft, PROD_NAME: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ราคาขาย (บาท) *</label>
              <input
                type="number"
                disabled={intent === "delete_product"}
                value={productDraft.SALES_PRICE || 0}
                onChange={(e) => setProductDraft({ ...productDraft, SALES_PRICE: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                disabled={intent === "delete_product"}
                value={productDraft.BRAND || "ทั่วไป"}
                onChange={(e) => setProductDraft({ ...productDraft, BRAND: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button onClick={() => { setProductDraft(null); setIntent(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
            <button
              onClick={saveProduct}
              disabled={isSaving}
              className={`text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                intent === "delete_product" ? "bg-red-600 hover:bg-red-500" : "bg-amber-600 hover:bg-amber-500"
              }`}
            >
              {isSaving
                ? "⏳ กำลังดำเนินการ..."
                : intent === "delete_product"
                ? "🗑️ ยืนยันลบสินค้าออกจาก DB"
                : intent === "update_product"
                ? "✅ ยืนยันการอัปเดตลง DB"
                : "✅ บันทึกสินค้าเข้า DB"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Intent: Employee Card (Add/Update/Delete) ──────── */}
      {["add_employee", "update_employee", "delete_employee"].includes(intent || "") && employeeDraft && (
        <div
          className={`bg-slate-900/60 border rounded-2xl p-6 ${
            intent === "delete_employee" ? "border-red-500/50 bg-red-950/20" : "border-purple-500/30"
          }`}
        >
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
            <h2
              className={`text-lg font-bold flex items-center gap-2 ${
                intent === "delete_employee" ? "text-red-400" : "text-purple-400"
              }`}
            >
              <span>{intent === "delete_employee" ? "🗑️" : "👔"}</span>{" "}
              {intent === "delete_employee"
                ? `ยืนยันการลบพนักงาน (${employeeDraft.Name_PIC})`
                : intent === "update_employee"
                ? `ตรวจสอบและยืนยันการแก้ไขพนักงาน (${employeeDraft.IdPIC})`
                : "ตรวจสอบข้อมูลพนักงานใหม่"}
            </h2>
            <button onClick={() => { setEmployeeDraft(null); setIntent(null); }} className="text-xs text-slate-400 hover:text-white">✕ ยกเลิก</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-slate-400 mb-1">ชื่อพนักงาน (ภาษาไทย) *</label>
              <input
                type="text"
                disabled={intent === "delete_employee"}
                value={employeeDraft.Name_PIC || ""}
                onChange={(e) => setEmployeeDraft({ ...employeeDraft, Name_PIC: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">แผนก (Department)</label>
              <input
                type="text"
                disabled={intent === "delete_employee"}
                value={employeeDraft.Department || "ฝ่ายขาย"}
                onChange={(e) => setEmployeeDraft({ ...employeeDraft, Department: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button onClick={() => { setEmployeeDraft(null); setIntent(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
            <button
              onClick={saveEmployee}
              disabled={isSaving}
              className={`text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                intent === "delete_employee" ? "bg-red-600 hover:bg-red-500" : "bg-purple-600 hover:bg-purple-500"
              }`}
            >
              {isSaving
                ? "⏳ กำลังดำเนินการ..."
                : intent === "delete_employee"
                ? "🗑️ ยืนยันลบพนักงานออกจาก DB"
                : intent === "update_employee"
                ? "✅ ยืนยันการอัปเดตลง DB"
                : "✅ บันทึกพนักงานเข้า DB"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Intent: Quotation Draft Editor ─────────────────── */}
      {intent === "quotation" && editDraft && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white">✏️ ตรวจสอบ / แก้ไขใบเสนอราคา</h2>
            <div className="flex gap-2">
              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-white/10">
                เลขที่: {number}
              </span>
            </div>
          </div>

          {/* Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Vendor Select / Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">ลูกค้า *</label>
              <select
                value={editDraft.customerVendor || ""}
                onChange={(e) => updateEditField("customerVendor", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={editDraft.customerVendor}>{editDraft.customerVendor ? editDraft.customerVendor : "-- เลือกลูกค้า --"}</option>
                {customers
                  .filter((c) => c.name !== editDraft.customerVendor)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Locked vs Editable fields based on DB match */}
            {[
              { label: "ผู้ติดต่อ", field: "contact", isLocked: !!matchedCustomer },
              { label: "เบอร์โทร", field: "phone", isLocked: !!matchedCustomer },
              { label: "อีเมล", field: "email", isLocked: !!matchedCustomer },
              { label: "รหัสพนักงาน (ID PIC)", field: "idPIC", isLocked: !!matchedCustomer },
              { label: "ชื่อพนักงาน", field: "creatorName", isLocked: !!matchedCustomer },
              { label: "เงื่อนไขชำระ", field: "paymentTerms", isLocked: false },
              { label: "เครดิต (วัน)", field: "creditTerms", isLocked: false },
              { label: "ระยะเวลายืนยันราคา", field: "priceValidity", isLocked: false },
            ].map(({ label, field, isLocked }) => (
              <div key={field}>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-400">{label}</label>
                  {isLocked && <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/20 px-1.5 py-0.5 rounded">🔒 ล็อกตามลูกค้า</span>}
                </div>
                <input
                  type="text"
                  disabled={isLocked}
                  value={(editDraft as any)[field] || ""}
                  onChange={(e) => updateEditField(field as keyof QuotationData, e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${
                    isLocked
                      ? "bg-slate-800/80 border-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-slate-800 border-slate-700 text-white focus:border-indigo-500"
                  }`}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">ประเภทธุรกรรม</label>
              <select
                value={editDraft.transactionType || "ขาย"}
                onChange={(e) => updateEditField("transactionType", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ขาย">ขาย (Sales)</option>
                <option value="ขอซื้อ">ขอซื้อ (Purchase Request)</option>
              </select>
            </div>
          </div>

          {/* Items table */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-indigo-400">รายการสินค้า</h3>
              <button onClick={addItem} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg transition-colors">
                + เพิ่มรายการ
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300 min-w-max">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 px-2 text-left">รหัสสินค้า</th>
                    <th className="py-2 px-2 text-left">ชื่อสินค้า</th>
                    <th className="py-2 px-2 text-left">สเปค</th>
                    <th className="py-2 px-2 w-20">จำนวน</th>
                    <th className="py-2 px-2 w-28">ราคา/หน่วย</th>
                    <th className="py-2 px-2 w-28 text-right">ยอดสุทธิ</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {editDraft.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800">
                      <td className="py-1 px-1">
                        <select
                          value={item.ITEM_CODE}
                          onChange={(e) => {
                            const prodId = e.target.value;
                            const prod = products.find((p) => p.id === prodId);
                            if (prod) {
                              const newItems = [...editDraft.items];
                              newItems[idx] = {
                                ...newItems[idx],
                                ITEM_CODE: prod.id,
                                PROD_NAME: prod.PROD_NAME,
                                UNIT: prod.UNIT,
                                UNIT_PRICE: prod.SALES_PRICE,
                                Amount: newItems[idx].Quantity * prod.SALES_PRICE,
                                VAT: newItems[idx].Quantity * prod.SALES_PRICE * 0.07,
                                TOTAL: newItems[idx].Quantity * prod.SALES_PRICE * 1.07,
                              };
                              setEditDraft({ ...editDraft, items: newItems });
                            } else {
                              updateItem(idx, "ITEM_CODE", prodId);
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none"
                        >
                          <option value={item.ITEM_CODE}>{item.ITEM_CODE ? item.ITEM_CODE : "-- เลือกสินค้า --"}</option>
                          {products
                            .filter((p) => p.id !== item.ITEM_CODE)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.id} - {p.PROD_NAME}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="text"
                          value={item.PROD_NAME}
                          onChange={(e) => updateItem(idx, "PROD_NAME", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="text"
                          value={item.SPEC}
                          onChange={(e) => updateItem(idx, "SPEC", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={item.Quantity}
                          onChange={(e) => updateItem(idx, "Quantity", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="number"
                          value={item.UNIT_PRICE}
                          onChange={(e) => updateItem(idx, "UNIT_PRICE", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none"
                        />
                      </td>
                      <td className="py-1 px-2 text-right text-white font-medium">
                        {(item.TOTAL || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1 px-1 text-center">
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {editDraft.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500">ยังไม่มีรายการสินค้า</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-3 text-slate-300 font-semibold text-sm">
              รวมทั้งสิ้น:{" "}
              <span className="text-white text-base">
                {editDraft.items.reduce((s, i) => s + (i.TOTAL || 0), 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button
              onClick={() => { setEditDraft(null); setIntent(null); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              ยกเลิก
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPreviewingPDF(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔍 ขยายดูแบบเต็มจอ
              </button>
              <button
                onClick={confirmAndSaveQuotation}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                {isSaving ? "⏳ กำลังประมวลผล..." : "✅ บันทึก DB & ดาวน์โหลด PDF"}
              </button>
            </div>
          </div>

          {/* ─── Real-time Live PDF Preview ──────────────────────────── */}
          <div className="mt-4 border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span>📄</span> พรีวิวใบเสนอราคาแบบ Real-time (PDF Live Preview)
              </h3>
              <span className="text-xs text-slate-400">อัปเดตอัตโนมัติตามข้อมูลด้านบน</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-white/10 overflow-x-auto flex justify-center items-start max-h-[650px]">
              <div className="shadow-2xl">
                <QuotationPDF
                  ref={pdfRef}
                  number={number}
                  customerVendor={editDraft.customerVendor}
                  contact={editDraft.contact}
                  phone={editDraft.phone}
                  email={editDraft.email}
                  idPIC={editDraft.idPIC}
                  creatorName={editDraft.creatorName}
                  transactionType={editDraft.transactionType}
                  paymentTerms={editDraft.paymentTerms}
                  creditTerms={editDraft.creditTerms}
                  priceValidity={editDraft.priceValidity}
                  items={editDraft.items}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PDF Preview Modal (Full Screen) ─────────────────── */}
      {isPreviewingPDF && editDraft && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">ตรวจสอบความถูกต้อง (PDF Preview)</h2>
              <button onClick={() => setIsPreviewingPDF(false)} className="text-slate-400 hover:text-white">✕ ปิด</button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 flex justify-center items-start">
              <div className="shadow-2xl">
                <QuotationPDF
                  number={number}
                  customerVendor={editDraft.customerVendor}
                  contact={editDraft.contact}
                  phone={editDraft.phone}
                  email={editDraft.email}
                  idPIC={editDraft.idPIC}
                  creatorName={editDraft.creatorName}
                  transactionType={editDraft.transactionType}
                  paymentTerms={editDraft.paymentTerms}
                  creditTerms={editDraft.creditTerms}
                  priceValidity={editDraft.priceValidity}
                  items={editDraft.items}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => setIsPreviewingPDF(false)}
                className="px-6 py-2 text-slate-300 hover:text-white bg-slate-700 rounded-lg"
              >
                กลับไปแก้ไข
              </button>
              <button
                onClick={confirmAndSaveQuotation}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                {isSaving ? "⏳ กำลังประมวลผล..." : "✅ ยืนยัน โหลด PDF & บันทึก DB"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
