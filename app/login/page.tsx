"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth, getMetaMaskNonce } from "@/context/AuthContext";
import { BrowserProvider } from "ethers";
import { ShieldCheck, Wallet, ArrowRight, AlertCircle, RefreshCw, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const { user, loginWithMetaMask, isLoading } = useAdminAuth();
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
      setError("MetaMask extension not found. Please install MetaMask in your browser.");
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
        setError(result.error || "Wallet signature verification failed.");
      }
    } catch (err: any) {
      console.error("MetaMask Login Error:", err);
      setError(err?.message || "Connection or signature request rejected.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 items-center justify-center shadow-xl shadow-blue-500/25 mb-4 border border-blue-400/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            CertChain Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System Administration Console
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/80 backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Web3 Web3 Admin Access
            </div>
            <h2 className="text-lg font-bold text-white">
              Authenticate via MetaMask
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your authorized Web3 wallet to verify cryptographic signature against system administrator database records.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Access Denied</span>
                <p className="text-rose-200/80">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleMetaMaskLogin}
            disabled={submitting}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Verifying Wallet Signature...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect MetaMask Wallet</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </button>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Database Authorization Security
            </div>
            <p>
              Only public wallet addresses explicitly pre-registered in the <code className="text-blue-400 font-mono">system_admins</code> database table can access this dashboard.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          CertChain System Governance Console v1.0
        </p>
      </div>
    </div>
  );
}
