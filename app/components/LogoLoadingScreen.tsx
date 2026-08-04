"use client";

import React from "react";

interface LogoLoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LogoLoadingScreen({
  message = "กำลังเข้าสู่ระบบ...",
  subMessage = "ระบบกำลังจัดเตรียมข้อมูลและโหลดหน้าต่างการทำงาน"
}: LogoLoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute w-[350px] h-[350px] bg-indigo-600/30 blur-[100px] rounded-full top-[20%] left-[30%] animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] bg-amber-500/20 blur-[100px] rounded-full bottom-[20%] right-[30%] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-amber-400 to-red-500 rounded-3xl blur-lg opacity-75 animate-pulse group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-slate-900/90 border border-white/20 p-5 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Premier Automation Logo"
              className="w-32 h-32 object-contain rounded-2xl shadow-md animate-bounce"
              style={{ animationDuration: '2.5s' }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-2">
          {message}
        </h2>

        {/* Subtext */}
        <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
          {subMessage}
        </p>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-900 border border-white/10 h-2.5 rounded-full overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-red-500 rounded-full animate-loading-bar" />
        </div>

        {/* Animated pulse dots */}
        <div className="flex items-center gap-1.5 mt-4 text-slate-400 text-xs font-mono">
          <span>Loading assets</span>
          <span className="animate-ping text-indigo-400">.</span>
          <span className="animate-ping text-amber-400" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="animate-ping text-red-400" style={{ animationDelay: '0.4s' }}>.</span>
        </div>
      </div>
    </div>
  );
}
