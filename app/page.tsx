"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  checkRpcHealth, 
  getRecentBlocks, 
  getContractState, 
  getContractEvents, 
  BlockItem, 
  RpcNodeHealth, 
  ContractState,
  ContractEventItem 
} from "@/lib/rpc";
import { useI18n } from "@/context/I18nContext";
import { 
  Blocks, 
  School, 
  FileCode2, 
  Activity, 
  Zap, 
  ArrowRight,
  Clock,
  Layers
} from "lucide-react";

export default function OverviewPage() {
  const { t } = useI18n();
  const [health, setHealth] = useState<RpcNodeHealth | null>(null);
  const [contract, setContract] = useState<ContractState | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<BlockItem[]>([]);
  const [events, setEvents] = useState<ContractEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOverviewData = async () => {
    setLoading(true);
    const [hData, cData, bData, eData] = await Promise.all([
      checkRpcHealth(),
      getContractState(),
      getRecentBlocks(5),
      getContractEvents(),
    ]);

    setHealth(hData);
    setContract(cData);
    setRecentBlocks(bData);
    setEvents(eData.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => {
    loadOverviewData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/20 p-5 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 shrink-0" /> {t.overview.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {t.overview.title}
            </h1>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/blocks"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#147D74] hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-700/20 shrink-0"
            >
              <Blocks className="w-4 h-4 shrink-0" /> {t.overview.liveExplorer}
            </Link>
            <Link
              href="/issuers"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all shrink-0"
            >
              <School className="w-4 h-4 shrink-0" /> {t.overview.schoolAccounts}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Block Height */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
              {t.overview.kpi.blockHeight}
            </span>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <Blocks className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : health?.blockNumber ? `#${health.blockNumber}` : "N/A"}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 truncate">
              <span className={`h-2 w-2 rounded-full shrink-0 ${health?.connected ? "bg-emerald-400" : "bg-rose-400"}`}></span>
              <span>{t.overview.kpi.rpcStatus} {health?.connected ? t.header.connected : t.header.offline}</span>
            </p>
          </div>
        </div>

        {/* Gas Price */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
              {t.overview.kpi.gasPrice}
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : `${health?.gasPriceGwei || "0"} Gwei`}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 truncate">
              Chain ID: {health?.chainId || "Unknown"} ({health?.networkName || "Localhost"})
            </p>
          </div>
        </div>

        {/* Contract Address */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
              {t.overview.kpi.smartContract}
            </span>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 truncate" title={contract?.address}>
              {contract?.address || "0x..."}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 truncate">
              {t.overview.kpi.owner} {contract?.owner ? `${contract.owner.slice(0, 8)}...${contract.owner.slice(-6)}` : "Unknown"}
            </p>
          </div>
        </div>

        {/* Total Events */}
        <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
              {t.overview.kpi.contractEvents}
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : events.length}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 truncate">
              {t.overview.kpi.recordedEvents}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Blocks & Contract Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Blocks Card */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Blocks className="w-5 h-5 text-teal-400 shrink-0" />
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">{t.overview.recentBlocks.title}</h3>
            </div>
            <Link
              href="/blocks"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 shrink-0"
            >
              {t.common.viewAll} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBlocks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                {t.overview.recentBlocks.noBlocks}
              </div>
            ) : (
              recentBlocks.map((block) => (
                <div
                  key={block.number}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 font-mono text-xs font-bold shrink-0">
                      #{block.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono text-slate-300 truncate max-w-[180px] sm:max-w-[220px] md:max-w-xs" title={block.hash || ""}>
                        {block.hash}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {new Date(block.timestamp * 1000).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>{block.transactionCount} {t.overview.recentBlocks.txs}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono text-xs text-slate-400 shrink-0">
                    <div>{t.overview.recentBlocks.gas} {block.gasUsed}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contract On-Chain Events Feed */}
        <div className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <FileCode2 className="w-5 h-5 text-teal-400 shrink-0" />
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">{t.overview.contractEvents.title}</h3>
            </div>
            <Link
              href="/contract"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 shrink-0"
            >
              {t.overview.contractEvents.inspectorBtn} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                {t.overview.contractEvents.noEvents}
              </div>
            ) : (
              events.map((ev, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 shrink-0">
                        {ev.actionLabel || ev.actionType}
                      </span>
                      <span className="text-xs font-mono text-slate-400 truncate">
                        #{ev.blockNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1 truncate max-w-[200px] sm:max-w-[240px]" title={ev.transactionHash}>
                      Tx: {ev.transactionHash}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono shrink-0">
                    {ev.creator
                      ? `${t.overview.contractEvents.issuer} ${ev.creator.slice(0, 6)}...${ev.creator.slice(-4)}`
                      : "Triggered"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
