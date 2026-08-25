"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: "bg-slate-900/95 border-emerald-500/40 text-emerald-300",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      accent: "bg-emerald-500",
    },
    error: {
      bg: "bg-slate-900/95 border-rose-500/40 text-rose-300",
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
      accent: "bg-rose-500",
    },
    info: {
      bg: "bg-slate-900/95 border-teal-500/40 text-teal-300",
      icon: <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />,
      accent: "bg-teal-500",
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all animate-in slide-in-from-right duration-300 ${config.bg}`}
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.accent}`} />
      <div className="flex items-start gap-3 pl-1">
        {config.icon}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-slate-200 leading-relaxed break-words font-medium">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer shrink-0 ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
