"use client";

import React from "react";

interface RegisterFormProps {
  onToggle: () => void;
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("ระบบกำลังสมัครสมาชิก (จำลอง)");
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent">
          สร้างบัญชีใหม่
        </h1>
        <p className="text-slate-400 text-sm">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">ชื่อ</label>
          <input 
            type="text" 
            required 
            placeholder="ชื่อ - นามสกุล"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">อีเมล</label>
          <input 
            type="email" 
            required 
            placeholder="name@example.com"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-400 mb-2">รหัสผ่าน</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl px-4 py-3.5 mt-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(236,72,153,0.5)] active:translate-y-0"
        >
          สมัครสมาชิก
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400">
        มีบัญชีอยู่แล้วใช่หรือไม่?{" "}
        <button 
          onClick={onToggle}
          className="text-pink-400 font-semibold hover:text-pink-300 hover:underline transition-colors"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}
