export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">ภาพรวมระบบ (Dashboard)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 mb-2">ยอดขายเดือนนี้</h3>
          <p className="text-3xl font-bold text-indigo-400">฿ 150,000</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 mb-2">ลูกค้าทั้งหมด</h3>
          <p className="text-3xl font-bold text-pink-400">120 ราย</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <h3 className="text-slate-400 mb-2">สินค้าในคลัง</h3>
          <p className="text-3xl font-bold text-emerald-400">845 ชิ้น</p>
        </div>
      </div>
    </div>
  );
}
