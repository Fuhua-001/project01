"use client";

import React from "react";
// 1. นำเข้า useRouter จาก next/navigation เพื่อใช้ในการเปลี่ยนหน้าเว็บ
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onToggle: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
  // 2. เรียกใช้งาน router เพื่อเตรียมไว้สั่งเปลี่ยนหน้า
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันเว็บกระพริบ
    
    // 3. สั่งเปลี่ยนหน้าไปที่โฟลเดอร์ /dashboard เมื่อกดล็อกอิน
    // (ในระบบจริงจะมีการเช็ครหัสผ่านก่อนค่อยใช้คำสั่งนี้)
    router.push('/dashboard');
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
          ยินดีต้อนรับกลับมา
        </h1>
        <p className="text-slate-400 text-sm">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">อีเมล</label>
          <input 
            type="email" 
            required 
            placeholder="name@example.com"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">รหัสผ่าน</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-3.5 mt-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)] active:translate-y-0"
        >
          เข้าสู่ระบบ
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400">
        ยังไม่มีบัญชีใช่หรือไม่?{" "}
        <button 
          onClick={onToggle}
          className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
        >
          สมัครสมาชิก
        </button>
      </div>
    </div>
  );
}
