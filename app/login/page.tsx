"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth, getMetaMaskNonce } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BrowserProvider } from "ethers";
import { ShieldCheck, Wallet, ArrowRight, AlertCircle, RefreshCw, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const { user, loginWithMetaMask, isLoading } = useAdminAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleMetaMaskLogin = async () => {
    setError(null);

    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError(t.login.noMetaMask);
      return;
    }

    setSubmitting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      
      // Request wallet account connection
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 1. Fetch challenge nonce from backend
      const { message, tempToken } = await getMetaMaskNonce(walletAddress);

      // 2. Request user to sign challenge message in MetaMask
      const signature = await signer.signMessage(message);

      // 3. Verify signature & check DB SystemAdmin authorization
      const result = await loginWithMetaMask(walletAddress, signature, tempToken);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || t.login.forbidden);
      }
    } catch (err: any) {
      const code = err?.code;
      const msg = err?.message || "";
      if (code === "ACTION_REJECTED" || code === 4001 || msg.includes("rejected") || msg.includes("User rejected")) {
        setError(t.login.rejected);
      } else if (msg.includes("not found") || msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("403") || msg.includes("401")) {
        setError(t.login.forbidden);
      } else {
        setError(err?.message || t.login.failed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Top Bar Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LanguageToggle />
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#147D74]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 sm:w-80 h-64 sm:h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Header Branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-[#147D74] via-teal-600 to-emerald-500 items-center justify-center shadow-xl shadow-teal-700/25 mb-3 sm:mb-4 border border-teal-400/30">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.login.brand}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.login.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/80 backdrop-blur-xl space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> {t.login.badge}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t.login.cardTitle}
            </h2>
          </div>

          {error && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">{t.login.accessDenied}</span>
                <p className="text-rose-200/80">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleMetaMaskLogin}
            disabled={submitting}
            className="w-full py-3.5 sm:py-4 px-4 rounded-xl bg-gradient-to-r from-[#147D74] via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-teal-700/25 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>{t.login.authenticating}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t.login.loginBtn}</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" /> {t.login.dbSecurity}
            </div>
            <p className="leading-relaxed">
              {t.login.securityNote}
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] sm:text-xs text-slate-500 mt-6">
          {t.login.footer}
        </p>
      </div>
    </div>
  );
}
