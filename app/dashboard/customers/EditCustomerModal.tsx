"use client";

import { useState } from "react";
import { updateCustomer } from "./actions";

export default function EditCustomerModal({ customer }: { customer: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(customer.name || "");
  const [ctPers, setCtPers] = useState(customer.CT_PERS || "");
  const [phone, setPhone] = useState(customer.PHONE || "");
  const [email, setEmail] = useState(customer.email || "");
  const [idPIC, setIdPIC] = useState(customer.idPIC || "");
  const [taxIDNumber, setTaxIDNumber] = useState(customer.TaxIDNumber || "");
  const [accGrp, setAccGrp] = useState(customer.ACC_GRP || "");
  const [address, setAddress] = useState(customer.Address || "");
  const [note, setNote] = useState(customer.NOTE || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }

    setIsLoading(true);
    const res = await updateCustomer({
      id: customer.id,
      name,
      ctPers,
      phone,
      email,
      idPIC,
      taxIDNumber,
      accGrp,
      address,
      note,
    });
    setIsLoading(false);

    if (res.success) {
      alert("✅ อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว");
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
              <h2 className="text-xl font-bold text-white">✏️ แก้ไขข้อมูลลูกค้า ({customer.id})</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อลูกค้า *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ผู้ติดต่อ (CT_PERS)</label>
                <input
                  type="text"
                  value={ctPers}
                  onChange={(e) => setCtPers(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">รหัสผู้รับผิดชอบ (ID PIC)</label>
                <input
                  type="text"
                  value={idPIC}
                  onChange={(e) => setIdPIC(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">กลุ่มลูกค้า (ACC_GRP)</label>
                <input
                  type="text"
                  value={accGrp}
                  onChange={(e) => setAccGrp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">เลขผู้เสียภาษี</label>
                <input
                  type="text"
                  value={taxIDNumber}
                  onChange={(e) => setTaxIDNumber(e.target.value)}
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
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">ที่อยู่</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
              <button onClick={handleUpdate} disabled={isLoading} className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-bold">
                {isLoading ? "⏳ กำลังอัปเดต..." : "✅ บันทึกการอัปเดต"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
