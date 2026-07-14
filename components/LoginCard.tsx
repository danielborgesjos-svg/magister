"use client"

import { motion } from "framer-motion"
import LoginForm from "./LoginForm"

export default function LoginCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[520px] bg-white rounded-[24px] p-8 sm:p-[48px] border border-[#E5E7EB] mx-4 sm:mx-auto"
      style={{
        boxShadow: "0 20px 60px rgba(15,23,42,.08)"
      }}
    >
      <div className="flex flex-col items-center mb-8">
        {/* Logo Placeholder */}
        <div className="flex items-center gap-2 mb-6 text-xl font-bold tracking-tight text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
            M
          </div>
          Magister Tech <span className="text-slate-300 mx-1">+</span> Jamper
        </div>
        
        <h1 className="text-[32px] sm:text-[42px] font-bold text-slate-900 tracking-tight leading-tight mb-2 text-center">
          Bem-vindo!
        </h1>
        
        <p className="text-[16px] text-[#64748B] text-center">
          Acesse sua conta para continuar.
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-slate-500 leading-relaxed">
        Ao entrar você concorda com nossos{" "}
        <a href="#" className="font-semibold text-slate-700 hover:text-blue-600 transition-colors">
          Termos de Uso
        </a>{" "}
        e{" "}
        <a href="#" className="font-semibold text-slate-700 hover:text-blue-600 transition-colors">
          Política de Privacidade
        </a>
      </p>
    </motion.div>
  )
}
