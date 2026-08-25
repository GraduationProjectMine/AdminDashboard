"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { locale, toggleLocale } = useI18n();
  const isVi = locale === "vi";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer shadow-sm ${className}`}
      title={isVi ? "Chuyển sang English" : "Switch to Tiếng Việt"}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-teal-400" />
      <span className="flex items-center gap-1 font-mono text-[11px]">
        <span className={isVi ? "text-teal-400 font-bold" : "text-slate-500"}>VI</span>
        <span className="text-slate-600">/</span>
        <span className={!isVi ? "text-teal-400 font-bold" : "text-slate-500"}>EN</span>
      </span>
    </button>
  );
}
