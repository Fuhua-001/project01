"use client";

import { useState } from "react";
import { updateEmployee } from "./actions";

export default function EditUserModal({ employee }: { employee: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [namePIC, setNamePIC] = useState(employee.Name_PIC || "");
  const [nemeENPIC, setNemeENPIC] = useState(employee.NemeEN_PIC || "");
  const [department, setDepartment] = useState(employee.Department || "");
  const [contactNumber, setContactNumber] = useState(employee.ContactNumber || "");
  const [keyword, setKeyword] = useState(employee.Keyword || "");
  const [note, setNote] = useState(employee.NOTE || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!namePIC.trim()) {
      alert("กรุณากรอกชื่อพนักงาน");
      return;
    }

    setIsLoading(true);
    const res = await updateEmployee({
      IdPIC: employee.IdPIC,
      Name_PIC: namePIC,
      NemeEN_PIC: nemeENPIC || namePIC,
      Department: department,
      ContactNumber: contactNumber,
      Keyword: keyword,
      NOTE: note,
    });
    setIsLoading(false);

    if (res.success) {
      alert("✅ อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว");
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
          <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-white">✏️ แก้ไขข้อมูลพนักงาน ({employee.IdPIC})</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อพนักงาน (TH) *</label>
                <input
                  type="text"
                  value={namePIC}
                  onChange={(e) => setNamePIC(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ชื่อพนักงาน (EN)</label>
                <input
                  type="text"
                  value={nemeENPIC}
                  onChange={(e) => setNemeENPIC(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">แผนก (Department)</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">คำค้นหา (Keyword)</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
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
