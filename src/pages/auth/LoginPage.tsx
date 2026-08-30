import React from "react";
import { motion } from "motion/react";
import { LoginForm } from "../../features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="auth-organic-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 cursor-pointer">
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="auth-surface relative w-full max-w-[448px] overflow-hidden rounded-[28px] border border-slate-200/90 bg-white px-6 py-7 shadow-[0_22px_55px_rgba(15,23,42,0.12)] sm:px-8 sm:py-8 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#800000] via-[#800000] to-amber-500" />
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-slate-200/80">
            JPCS Academic Portal
          </div>
        </div>

        <LoginForm />
      </motion.section>
    </div>
  );
}
