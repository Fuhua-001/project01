export default function QuotationsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ออกใบเสนอราคา (Quotations)</h1>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors">
          + สร้างใบเสนอราคา
        </button>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px] flex items-center justify-center text-slate-400">
        <p>ฟอร์มและตารางสำหรับออกใบเสนอราคาจะแสดงที่นี่</p>
      </div>
    </div>
  );
}
