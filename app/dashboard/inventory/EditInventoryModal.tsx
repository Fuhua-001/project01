"use client";

import { useState } from "react";
import { updateProduct } from "./actions";

export default function EditInventoryModal({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prodName, setProdName] = useState(product.PROD_NAME || "");
  const [prodAlias, setProdAlias] = useState(product.PROD_ALIAS || "");
  const [unit, setUnit] = useState(String(product.UNIT || 1));
  const [buyPrice, setBuyPrice] = useState(String(product.BUY_PRICE || 0));
  const [salesPrice, setSalesPrice] = useState(String(product.SALES_PRICE || 0));
  const [brand, setBrand] = useState(product.BRAND || "");
  const [prodGrp, setProdGrp] = useState(product.PROD_GRP || "");
  const [status, setStatus] = useState(product.Status || "พร้อมขาย");
  const [updatedBy, setUpdatedBy] = useState("Admin");
  const [note, setNote] = useState(product.NOTE || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!prodName.trim()) {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    setIsLoading(true);
    const res = await updateProduct({
      id: product.id,
      PROD_NAME: prodName,
      PROD_ALIAS: prodAlias || prodName,
      UNIT: parseInt(unit, 10) || 1,
      BUY_PRICE: parseInt(buyPrice, 10) || 0,
      SALES_PRICE: parseInt(salesPrice, 10) || 0,
      BRAND: brand,
      PROD_GRP: prodGrp,
      Status: status,
      UpdatedBy: updatedBy || "Admin",
      NOTE: note,
    });
    setIsLoading(false);

    if (res.success) {
      alert("✅ อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว");
      setIsOpen(false);
    } else {
      alert("❌ เกิดข้อผิดพลาดในการอัปเดต: " + res.error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 bg-amber-600/80 hover:bg-amber-600 text-white text-xs rounded transition-colors"
      >
        ✏️ แก้ไข
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[70] text-left">
          <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-white">✏️ แก้ไขข้อมูลสินค้า ({product.id})</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อเรียกอื่น</label>
                <input
                  type="text"
                  value={prodAlias}
                  onChange={(e) => setProdAlias(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ราคาขาย (บาท) *</label>
                <input
                  type="number"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ราคาซื้อ/ต้นทุน (บาท)</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">หน่วยนับ</label>
                <input
                  type="number"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ยี่ห้อ (Brand)</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">กลุ่มสินค้า</label>
                <input
                  type="text"
                  value={prodGrp}
                  onChange={(e) => setProdGrp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">สถานะ</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อผู้อัปเดต (UpdatedBy)</label>
                <input
                  type="text"
                  value={updatedBy}
                  onChange={(e) => setUpdatedBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-xs text-slate-500">ระบบจะอัปเดต UPD_TIME และ LAST_UPD เป็นเวลาปัจจุบันโดยอัตโนมัติ</span>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
                <button onClick={handleUpdate} disabled={isLoading} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-bold">
                  {isLoading ? "⏳ กำลังอัปเดต..." : "✅ บันทึกการอัปเดต"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
