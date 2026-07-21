"use client";

import { useEffect, useState } from "react";
import { checkRpcHealth, RpcNodeHealth } from "@/lib/rpc";
import { RefreshCw, Server, Cpu, ShieldAlert } from "lucide-react";

export function Header() {
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
    <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search / Title Context */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          System Administration Console
        </h2>
      </div>

      {/* Network Metrics Pill & Action */}
      <div className="flex items-center gap-4">
        {/* RPC Status Indicator */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 font-medium">RPC Node:</span>
            {health?.connected ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                <ShieldAlert className="w-3 h-3" />
                Offline
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400 font-medium">Chain ID:</span>
            <span className="font-mono font-semibold text-slate-200">
              {health?.chainId !== undefined ? health.chainId : "---"}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Block:</span>
            <span className="font-mono font-semibold text-blue-400">
              #{health?.blockNumber !== undefined ? health.blockNumber : "---"}
            </span>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-all border border-slate-700/60 disabled:opacity-50"
          title="Refresh Network Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            SA
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Super Admin</span>
            <span className="text-[10px] text-slate-400">admin@certchain.edu</span>
          </div>
        </div>
      </div>
    </header>
  );
}
