export default function UsersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน (Users)</h1>
        <button className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors">
          + เพิ่มผู้ใช้งานใหม่
        </button>
      </div>
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 min-h-[400px] flex items-center justify-center text-slate-400">
        <p>ตารางจัดการสิทธิ์และข้อมูลผู้ใช้งานในระบบจะแสดงที่นี่</p>
      </div>
    </div>
  );
}
