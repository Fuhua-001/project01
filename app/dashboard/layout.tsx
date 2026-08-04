import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.jpg" 
            alt="Premier Automation" 
            className="w-10 h-10 object-contain rounded-lg shadow-md border border-white/10" 
          />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              System CRM
            </h2>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Premier Automation</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white">
            📊 แดชบอร์ด (Dashboard)
          </Link>
          <Link href="/dashboard/quotations" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white">
            📝 ใบเสนอราคา (Quotations)
          </Link>
          <Link href="/dashboard/quotations/ai" className="block px-4 py-3 pl-8 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-violet-300 text-sm font-medium">
            ✨ AI CRM Copilot
          </Link>
          <Link href="/dashboard/customers" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white">
            👥 ฐานข้อมูลลูกค้า (Customers)
          </Link>
          <Link href="/dashboard/users" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white">
            🔐 จัดการผู้ใช้งาน (Users)
          </Link>
          <Link href="/dashboard/inventory" className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-slate-300 hover:text-white">
            📦 คลังสินค้า (Inventory)
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <Link href="/" className="block text-center w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2 rounded-lg transition-colors">
            ออกจากระบบ
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
