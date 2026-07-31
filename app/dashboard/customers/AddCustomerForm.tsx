"use client";

import { useState } from "react";
import { createCustomer } from "./actions";

export default function AddCustomerForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [idPIC, setIdPIC] = useState("");
    const [taxIDNumber, setTaxIDNumber] = useState("");
    const [accGrp, setAccGrp] = useState("");
    const [ctPers, setCtPers] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [allCont, setAllCont] = useState("");
    const [note, setNote] = useState("");

    const handleSave = async () => {
        if (!id || !name || !idPIC || !accGrp || !ctPers || !email || !phone) {
            alert("กรุณากรอกข้อมูลบังคับให้ครบถ้วน");
            return;
        }

        const result = await createCustomer({
            id,
            name,
            idPIC,
            taxIDNumber: taxIDNumber || undefined,
            accGrp,
            ctPers,
            address: address || undefined,
            email,
            phone,
            allCont: allCont || undefined,
            note: note || undefined,
        });

        if (result.success) {
            alert("บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว");
            setIsOpen(false);
            setId("");
            setName("");
            setIdPIC("");
            setTaxIDNumber("");
            setAccGrp("");
            setCtPers("");
            setAddress("");
            setEmail("");
            setPhone("");
            setAllCont("");
            setNote("");
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า: " + (result as any).error);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
                เพิ่มลูกค้าใหม่
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">เพิ่มลูกค้าใหม่</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">รหัสลูกค้า (ID) *</label>
                                <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกรหัสลูกค้า..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อลูกค้า (Name) *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกชื่อลูกค้า..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">รหัสผู้รับผิดชอบ (ID PIC) *</label>
                                <input type="text" value={idPIC} onChange={(e) => setIdPIC(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกรหัสผู้รับผิดชอบ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">เลขผู้เสียภาษี (Tax ID)</label>
                                <input type="text" value={taxIDNumber} onChange={(e) => setTaxIDNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="เว้นว่างได้..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">กลุ่มบัญชีลูกค้า (ACC_GRP) *</label>
                                <input type="text" value={accGrp} onChange={(e) => setAccGrp(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกกลุ่มบัญชีลูกค้า..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ผู้ติดต่อ (CT_PERS) *</label>
                                <input type="text" value={ctPers} onChange={(e) => setCtPers(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกชื่อผู้ติดต่อ..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">ที่อยู่ (Address)</label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="เว้นว่างได้..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">อีเมล (Email) *</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="example@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">เบอร์โทรศัพท์ (Phone) *</label>
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="กรอกเบอร์โทรศัพท์ (ตัวเลขเท่านั้น)..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ช่องทางการติดต่ออื่นๆ (ALL_CONT)</label>
                                <input type="text" value={allCont} onChange={(e) => setAllCont(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="เว้นว่างได้..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">หมายเหตุ (Note)</label>
                                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500" placeholder="เว้นว่างได้..." />
                            </div>
                        </div>

                        {/* ปุ่ม ปิด/ยกเลิก */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">ยกเลิก</button>
                            <button onClick={handleSave} className="bg-pink-600 text-white px-4 py-2 rounded-lg">บันทึกข้อมูล</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
