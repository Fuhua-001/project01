'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';

interface DashboardStats {
  kpi: {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    thisMonthDocCount: number;
    totalDocuments: number;
    totalSalesDocuments: number;
    totalCustomers: number;
    totalProducts: number;
  };
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  salesByEmployee: { name: string; revenue: number }[];
  topProducts: { name: string; revenue: number; quantity: number }[];
}

const GRADIENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#3b82f6',
];

function formatThaiCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('th-TH');
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl">
      <p className="text-slate-300 text-sm mb-2 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-sm">
          {entry.name === 'revenue' ? 'ยอดขาย' : entry.name === 'count' ? 'จำนวน' : entry.name}:{' '}
          <span className="font-bold">
            {entry.name === 'count' ? entry.value : `฿${entry.value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
          </span>
        </p>
      ))}
    </div>
  );
};

function KPICard({
  title, value, sub, color, icon,
}: {
  title: string; value: string; sub?: string; color: string; icon: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 border border-white/5"
      style={{ background: 'rgba(15,20,40,0.7)' }}
    >
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 blur-xl"
        style={{ background: color }}
      />
      <span className="text-3xl">{icon}</span>
      <p className="text-slate-400 text-sm mt-3 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-red-400 font-medium">ไม่สามารถโหลดข้อมูลได้</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  const { kpi, monthlyRevenue, salesByEmployee, topProducts } = stats;
  const growthRate =
    kpi.lastMonthRevenue > 0
      ? (((kpi.thisMonthRevenue - kpi.lastMonthRevenue) / kpi.lastMonthRevenue) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="ยอดขายเดือนนี้"
          value={`฿${formatThaiCurrency(kpi.thisMonthRevenue)}`}
          sub={growthRate ? `${Number(growthRate) >= 0 ? '▲' : '▼'} ${Math.abs(Number(growthRate))}% จากเดือนก่อน` : undefined}
          color="#6366f1"
          icon="💰"
        />
        <KPICard
          title="ยอดขายรวมทั้งหมด"
          value={`฿${formatThaiCurrency(kpi.totalRevenue)}`}
          sub={`${kpi.totalSalesDocuments} เอกสาร`}
          color="#10b981"
          icon="📈"
        />
        <KPICard
          title="ลูกค้าทั้งหมด"
          value={`${kpi.totalCustomers.toLocaleString('th-TH')} ราย`}
          color="#ec4899"
          icon="👥"
        />
        <KPICard
          title="สินค้าในระบบ"
          value={`${kpi.totalProducts.toLocaleString('th-TH')} รายการ`}
          sub={`เอกสารทั้งหมด ${kpi.totalDocuments} รายการ`}
          color="#f59e0b"
          icon="📦"
        />
      </div>

      {/* Monthly Revenue Area Chart */}
      {monthlyRevenue.length > 0 ? (
        <div
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: 'rgba(15,20,40,0.7)' }}
        >
          <h2 className="text-lg font-bold text-white mb-1">ยอดขายรายเดือน</h2>
          <p className="text-slate-400 text-sm mb-6">แสดงยอดขายสุทธิ (฿) ย้อนหลัง 12 เดือน</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatThaiCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-white/5 p-10 text-center"
          style={{ background: 'rgba(15,20,40,0.7)' }}
        >
          <p className="text-slate-500">ยังไม่มีข้อมูลยอดขายรายเดือน</p>
        </div>
      )}

      {/* Bottom 2-column: Employee + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Employee */}
        <div
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: 'rgba(15,20,40,0.7)' }}
        >
          <h2 className="text-lg font-bold text-white mb-1">ยอดขายแยกตามพนักงาน</h2>
          <p className="text-slate-400 text-sm mb-5">Top 8 พนักงานยอดขายสูงสุด</p>
          {salesByEmployee.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={salesByEmployee}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatThaiCurrency}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="revenue" radius={[0, 6, 6, 0]}>
                  {salesByEmployee.map((_, i) => (
                    <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-10">ยังไม่มีข้อมูล</p>
          )}
        </div>

        {/* Top Products */}
        <div
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: 'rgba(15,20,40,0.7)' }}
        >
          <h2 className="text-lg font-bold text-white mb-1">สินค้าขายดีสูงสุด</h2>
          <p className="text-slate-400 text-sm mb-5">Top 10 สินค้าแยกตามยอดขาย</p>
          {topProducts.length > 0 ? (
            <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
              {topProducts.map((product, i) => {
                const max = topProducts[0].revenue;
                const pct = max > 0 ? (product.revenue / max) * 100 : 0;
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-xs truncate max-w-[60%]" title={product.name}>
                        <span className="text-slate-500 mr-1">#{i + 1}</span>
                        {product.name}
                      </span>
                      <span className="text-white text-xs font-semibold">
                        ฿{product.revenue.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]}, ${GRADIENT_COLORS[(i + 2) % GRADIENT_COLORS.length]})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-10">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}
