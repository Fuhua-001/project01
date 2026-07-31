import DashboardCharts from './DashboardCharts';

export const dynamic = 'force-dynamic';

export default function DashboardHome() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-slate-400 mt-1 text-sm">ข้อมูลสรุปยอดขายและกิจกรรมในระบบ — ดึงจากฐานข้อมูลแบบเรียลไทม์</p>
      </div>

      {/* Charts Section */}
      <DashboardCharts />
    </div>
  );
}
