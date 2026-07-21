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
import { 
  Blocks, 
  School, 
  FileCode2, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Layers,
  Database
} from "lucide-react";

export default function OverviewPage() {
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-blue-500/20 p-8">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" /> Blockchain Monitoring Console
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              CertChain System Overview
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Monitor real-time EVM block height, inspect smart contract state, and govern authorized educational issuer accounts.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/blocks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <Blocks className="w-4 h-4" /> Live Explorer
            </Link>
            <Link
              href="/issuers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <School className="w-4 h-4" /> School Accounts
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Block Height */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Latest Block Height
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Blocks className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : health?.blockNumber ? `#${health.blockNumber}` : "N/A"}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              RPC Status: {health?.connected ? "Online" : "Disconnected"}
            </p>
          </div>
        </div>

        {/* Gas Price */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Network Gas Price
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : `${health?.gasPriceGwei || "0"} Gwei`}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Chain ID: {health?.chainId || "Unknown"} ({health?.networkName || "Localhost"})
            </p>
          </div>
        </div>

        {/* Contract Address */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Smart Contract
            </span>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileCode2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-mono font-bold text-cyan-300 truncate" title={contract?.address}>
              {contract?.address || "0x..."}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Owner: {contract?.owner ? `${contract.owner.slice(0, 8)}...${contract.owner.slice(-6)}` : "Unknown"}
            </p>
          </div>
        </div>

        {/* Total Events */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contract Events Logged
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {loading ? "..." : events.length}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recorded on CertificateRegistry contract
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Blocks & Contract Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blocks Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Blocks className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100">Recent Blockchain Blocks</h3>
            </div>
            <Link
              href="/blocks"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBlocks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No blocks fetched or RPC node unreachable.
              </div>
            ) : (
              recentBlocks.map((block) => (
                <div
                  key={block.number}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
                      #{block.number}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-300 truncate max-w-[200px]">
                        {block.hash}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(block.timestamp * 1000).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>{block.transactionCount} txs</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400">
                    <div>Gas: {block.gasUsed}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contract On-Chain Events Feed */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <FileCode2 className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-slate-100">Smart Contract Events</h3>
            </div>
            <Link
              href="/contract"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Contract Inspector <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No events emitted yet or contract not deployed.
              </div>
            ) : (
              events.map((ev, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {ev.eventName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Block #{ev.blockNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1 truncate max-w-[280px]">
                      Tx: {ev.transactionHash}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {ev.args.issuer
                      ? `Issuer: ${ev.args.issuer.slice(0, 6)}...${ev.args.issuer.slice(-4)}`
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
