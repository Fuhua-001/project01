"use client";

import { useState } from "react";
import { createEmployee } from "./actions";

export default function AddUserForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [idPIC, setIdPIC] = useState("");
    const [namePIC, setNamePIC] = useState("");
    const [nameENPIC, setNameENPIC] = useState("");
    const [keyword, setKeyword] = useState("");
    const [department, setDepartment] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [picImageUrl, setPicImageUrl] = useState("");
    const [note, setNote] = useState("");

    const handleSave = async () => {
        if (!idPIC || !namePIC || !nameENPIC || !department || !contactNumber) {
            alert("กรุณากรอกข้อมูลบังคับให้ครบถ้วน");
            return;
        }

        const result = await createEmployee({
            IdPIC: idPIC,
            Name_PIC: namePIC,
            NemeEN_PIC: nameENPIC, // Note: using exact field name from schema
            Keyword: keyword || undefined,
            Department: department,
            ContactNumber: contactNumber,
            PIC_IMAG_URL: picImageUrl || undefined,
            NOTE: note || undefined,
        });

        if (result.success) {
            alert("บันทึกข้อมูลพนักงานเรียบร้อยแล้ว");
            setIsOpen(false);
            setIdPIC("");
            setNamePIC("");
            setNameENPIC("");
            setKeyword("");
            setDepartment("");
            setContactNumber("");
            setPicImageUrl("");
            setNote("");
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน: " + (result as any).error);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
                + เพิ่มผู้ใช้งานใหม่
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">เพิ่มผู้ใช้งานใหม่ (Employee)</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">รหัสพนักงาน (ID PIC) *</label>
                                <input type="text" value={idPIC} onChange={(e) => setIdPIC(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="กรอกรหัสพนักงาน..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อพนักงาน *</label>
                                <input type="text" value={namePIC} onChange={(e) => setNamePIC(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="กรอกชื่อพนักงาน..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อพนักงาน (ภาษาอังกฤษ) *</label>
                                <input type="text" value={nameENPIC} onChange={(e) => setNameENPIC(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="กรอกชื่อภาษาอังกฤษ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">แผนก (Department) *</label>
                                <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="กรอกแผนก..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="กรอกเบอร์โทรศัพท์..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">คำค้นหาพนักงาน (Keyword)</label>
                                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="เว้นว่างได้..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">หมายเหตุ</label>
                                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="เว้นว่างได้..." />
                            </div>
                        </div>

                        {/* ปุ่ม ปิด/ยกเลิก */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">ยกเลิก</button>
                            <button onClick={handleSave} className="bg-sky-600 text-white px-4 py-2 rounded-lg">บันทึกข้อมูล</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
