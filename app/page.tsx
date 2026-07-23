"use client";

import React, { useState } from "react";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Shapes */}
      <div className="absolute w-[300px] h-[300px] bg-indigo-600/20 blur-[80px] rounded-full top-[-10%] left-[-10%]"></div>
      <div className="absolute w-[250px] h-[250px] bg-pink-600/20 blur-[80px] rounded-full bottom-[-10%] right-[-10%]"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500">
          <div className={`transition-opacity duration-300 ${isLogin ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
            <LoginForm onToggle={toggleForm} />
          </div>
          
          <div className={`transition-opacity duration-300 ${!isLogin ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
            <RegisterForm onToggle={toggleForm} />
          </div>
        </div>
      </div>
    </div>
  );
}
