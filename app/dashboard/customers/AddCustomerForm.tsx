"use client";

import { useState } from "react";

export default function AddCustomerForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
                เพิ่มลูกค้าใหม่
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">เพิ่มลูกค้าใหม่</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                รหัสลูกค้า (ID)
                            </label>
                            <input
                                type="text"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                                placeholder="กรอกรหัสลูกค้า..."
                            />
                        </div>

                        {/* ปุ่ม ปิด/ยกเลิก */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white"
                            >
                                ยกเลิก
                            </button>
                            <button className="bg-pink-600 text-white px-4 py-2 rounded-lg">
                                ถัดไป
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
