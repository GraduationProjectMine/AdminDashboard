"use client";

import { useEffect, useState } from "react";
import { checkRpcHealth, RpcNodeHealth } from "@/lib/rpc";
import { useAdminAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { RefreshCw, Server, Cpu, ShieldAlert, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAdminAuth();
  const { t } = useI18n();
  const [health, setHealth] = useState<RpcNodeHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    const data = await checkRpcHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 sm:h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 cursor-pointer shrink-0"
            aria-label={t.common.menu}
          >
            <Menu className="w-5 h-5 text-teal-400" />
          </button>
        )}
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-100 tracking-tight truncate">
          {t.header.title}
        </h2>
      </div>

      {/* Right: Network Metrics Pill, Language Toggle & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Full RPC Status Indicator (Desktop xl) */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            <span className="text-slate-400 font-medium">{t.header.rpcNode}</span>
            {health?.connected ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {t.header.connected}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                <ShieldAlert className="w-3 h-3" />
                {t.header.offline}
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="text-slate-400 font-medium">{t.header.chainId}</span>
            <span className="font-mono font-semibold text-slate-200">
              {health?.chainId !== undefined ? health.chainId : "---"}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t.header.block}</span>
            <span className="font-mono font-semibold text-teal-400">
              #{health?.blockNumber !== undefined ? health.blockNumber : "---"}
            </span>
          </div>
        </div>

        {/* Compact RPC Status Indicator (Medium screens md to lg) */}
        <div className="hidden md:flex xl:hidden items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className={`h-2 w-2 rounded-full ${health?.connected ? "bg-emerald-400" : "bg-rose-400"}`}></span>
          <span className="text-teal-400 font-semibold">
            #{health?.blockNumber !== undefined ? health.blockNumber : "---"}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-all border border-slate-700/60 disabled:opacity-50 cursor-pointer shrink-0"
          title={t.header.refreshTooltip}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-400" : ""}`} />
        </button>

        {/* Language Toggle */}
        <LanguageToggle />

        {/* Profile Pill */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-slate-800 shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-[#147D74] to-emerald-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden 2xl:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{user.name}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-all cursor-pointer"
              title={t.header.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
