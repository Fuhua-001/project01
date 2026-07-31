"use client";

import { useState } from "react";
import { createProduct } from "./actions";

export default function AddInventoryForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [id, setId] = useState("");
    const [prodName, setProdName] = useState("");
    const [prodAlias, setProdAlias] = useState("");
    const [unit, setUnit] = useState("");
    const [productType1, setProductType1] = useState("");
    const [productType2, setProductType2] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [salesPrice, setSalesPrice] = useState("");
    const [inputVat, setInputVat] = useState("");
    const [outputVat, setOutputVat] = useState("");
    const [barcode, setBarcode] = useState("");
    const [keyword, setKeyword] = useState("");
    const [limit, setLimit] = useState("");
    const [status, setStatus] = useState("พร้อมขาย");
    const [brand, setBrand] = useState("");
    const [prodGrp, setProdGrp] = useState("");
    const [creator, setCreator] = useState("");
    const [updatedBy, setUpdatedBy] = useState("");
    const [note, setNote] = useState("");

    const handleSave = async () => {
        if (!id || !prodName || !prodAlias || !unit || !productType1 || !productType2 || !buyPrice || !salesPrice || !inputVat || !outputVat || !barcode || !limit || !status || !brand || !prodGrp || !creator || !updatedBy) {
            alert("กรุณากรอกข้อมูลบังคับให้ครบถ้วน");
            return;
        }

        const unitNum = parseInt(unit, 10);
        const buyPriceNum = parseInt(buyPrice, 10);
        const salesPriceNum = parseInt(salesPrice, 10);
        const inputVatNum = parseInt(inputVat, 10);
        const outputVatNum = parseInt(outputVat, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(unitNum) || isNaN(buyPriceNum) || isNaN(salesPriceNum) || isNaN(inputVatNum) || isNaN(outputVatNum) || isNaN(limitNum)) {
            alert("กรุณากรอกข้อมูลตัวเลขให้ถูกต้องในช่องที่ต้องการตัวเลข");
            return;
        }

        const result = await createProduct({
            id: id,
            PROD_NAME: prodName,
            PROD_ALIAS: prodAlias,
            UNIT: unitNum,
            ProductType1: productType1,
            ProductType2: productType2,
            BUY_PRICE: buyPriceNum,
            SALES_PRICE: salesPriceNum,
            INPUT_VAT: inputVatNum,
            OUTPUT_VAT: outputVatNum,
            BARCODE: barcode,
            KEYWORD: keyword || undefined,
            LIMIT: limitNum,
            Status: status,
            BRAND: brand,
            PROD_GRP: prodGrp,
            CREATOR: creator,
            UpdatedBy: updatedBy,
            NOTE: note || undefined,
        });

        if (result.success) {
            alert("บันทึกข้อมูลสินค้าเรียบร้อยแล้ว");
            setIsOpen(false);
            setId("");
            setProdName("");
            setProdAlias("");
            setUnit("");
            setProductType1("");
            setProductType2("");
            setBuyPrice("");
            setSalesPrice("");
            setInputVat("");
            setOutputVat("");
            setBarcode("");
            setKeyword("");
            setLimit("");
            setStatus("พร้อมขาย");
            setBrand("");
            setProdGrp("");
            setCreator("");
            setUpdatedBy("");
            setNote("");
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า: " + (result as any).error);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
                + เพิ่มสินค้าใหม่
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">เพิ่มสินค้าใหม่</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">รหัสสินค้า (ID) *</label>
                                <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="กรอกรหัสสินค้า..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อสินค้า *</label>
                                <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="กรอกชื่อสินค้า..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ชื่อเรียกอื่น *</label>
                                <input type="text" value={prodAlias} onChange={(e) => setProdAlias(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="กรอกชื่อเรียกอื่น..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">บาร์โค้ด *</label>
                                <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="กรอกบาร์โค้ด..." />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทสินค้า 1 *</label>
                                <input type="text" value={productType1} onChange={(e) => setProductType1(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ประเภท 1..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ประเภทสินค้า 2 *</label>
                                <input type="text" value={productType2} onChange={(e) => setProductType2(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ประเภท 2..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">กลุ่มสินค้า *</label>
                                <input type="text" value={prodGrp} onChange={(e) => setProdGrp(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="กลุ่มสินค้า..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ยี่ห้อ (Brand) *</label>
                                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ยี่ห้อ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">หน่วยนับ (ตัวเลข) *</label>
                                <input type="number" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="เช่น 1, 2..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">สถานะ *</label>
                                <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="เช่น พร้อมขาย..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ราคาซื้อ *</label>
                                <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ราคาซื้อ..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ราคาขาย *</label>
                                <input type="number" value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ราคาขาย..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ภาษีซื้อ *</label>
                                <input type="number" value={inputVat} onChange={(e) => setInputVat(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ภาษีซื้อ..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ภาษีขาย *</label>
                                <input type="number" value={outputVat} onChange={(e) => setOutputVat(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ภาษีขาย..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">จุดสั่งซื้อ/ขีดจำกัด *</label>
                                <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="เช่น 10..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">คำค้นหาสินค้า (Keyword)</label>
                                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="คำค้นหา..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ผู้สร้าง *</label>
                                <input type="text" value={creator} onChange={(e) => setCreator(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ผู้สร้าง..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">ผู้อัปเดต *</label>
                                <input type="text" value={updatedBy} onChange={(e) => setUpdatedBy(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="ผู้อัปเดต..." />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-slate-300 mb-1">หมายเหตุ</label>
                                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="หมายเหตุ..." />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">ยกเลิก</button>
                            <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">บันทึกข้อมูล</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
