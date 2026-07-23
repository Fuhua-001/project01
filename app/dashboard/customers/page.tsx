export default function CustomersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการข้อมูลลูกค้า (Customers)</h1>
        <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors">
          + เพิ่มลูกค้าใหม่
        </button>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px] flex items-center justify-center text-slate-400">
        <p>ตารางรายชื่อลูกค้าและฟอร์มเพิ่มข้อมูลจะแสดงที่นี่</p>
      </div>
    </div>
  );
}
