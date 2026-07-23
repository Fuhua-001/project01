export default function InventoryPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">คลังสินค้า (Inventory)</h1>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors">
          + เพิ่มสินค้าใหม่
        </button>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px] flex items-center justify-center text-slate-400">
        <p>ตารางข้อมูลสินค้าคงคลังและการรับเข้า/เบิกออกจะแสดงที่นี่</p>
      </div>
    </div>
  );
}
