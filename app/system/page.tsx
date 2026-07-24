"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  fetchSystemMonitor, 
  retryRevocation, 
  MonitorOverview 
} from "@/lib/rpc";
import { 
  Activity, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  ArrowUpRight
} from "lucide-react";

function shortenHash(value: string | null, size = 8) {
  if (!value) return "—";
  return value.length > size * 2 ? `${value.slice(0, size)}…${value.slice(-6)}` : value;
}

export default function SystemMonitorPage() {
  const [data, setData] = useState<MonitorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const monitorData = await fetchSystemMonitor();
    if (monitorData) {
      setData(monitorData);
    } else {
      setError("Unable to connect to backend system monitor service. Make sure backend is running.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetryRevoke = async (certificateId: string) => {
    setRetryingId(certificateId);
    const success = await retryRevocation(certificateId);
    if (success) {
      await loadData();
    } else {
      alert("Retry revocation failed. Check server logs.");
    }
    setRetryingId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" /> Web3 Infrastructure Health
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              System & Node Monitor
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Real-time monitoring of EVM RPC Node, Signer Wallet balance, IPFS / Pinata Storage Gateway, CIDs, and transaction execution logs.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Status Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blockchain RPC Status */}
            <div className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Blockchain Node (EVM)
                </span>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {data.blockchain.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> DISCONNECTED
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    Chain ID {data.blockchain.chainId ?? "—"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  Block #{data.blockchain.blockNumber?.toLocaleString() ?? "—"}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono truncate" title={data.blockchain.contractAddress || ""}>
                  Contract: {shortenHash(data.blockchain.contractAddress, 10)}
                </p>
              </div>
            </div>

            {/* Wallet Signer */}
            <div className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Signer Wallet
                </span>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400 truncate mb-1" title={data.blockchain.walletAddress || ""}>
                  {shortenHash(data.blockchain.walletAddress, 10)}
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {data.blockchain.walletBalance ? `${Number(data.blockchain.walletBalance).toFixed(4)} ETH` : "—"}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <span>Total Tx: <strong className="text-slate-200">{data.totals.transactions}</strong></span>
                  <span>Failed Tx: <strong className={data.totals.failedTransactions > 0 ? "text-red-400" : "text-emerald-400"}>{data.totals.failedTransactions}</strong></span>
                </div>
              </div>
            </div>

            {/* IPFS Pinata Status */}
            <div className="glass-card p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  IPFS / Pinata Storage
                </span>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <HardDrive className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {data.ipfs.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> READY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> UNHEALTHY
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {data.totals.cids} Pinata CIDs
                </div>
                <p className="text-xs text-slate-400 mt-2 truncate font-mono">
                  Gateway: {data.ipfs.gateway}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-100 tracking-tight">
                  Recent Blockchain Transactions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Log of issue and revoke on-chain contract transactions
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Showing top {data.transactions.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <th className="p-4 font-semibold">Timestamp</th>
                    <th className="p-4 font-semibold">Certificate Code / ID</th>
                    <th className="p-4 font-semibold">Action</th>
                    <th className="p-4 font-semibold">Tx Hash</th>
                    <th className="p-4 font-semibold">Block</th>
                    <th className="p-4 font-semibold">Gas Used</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.transactions.map((tx, idx) => (
                    <tr key={`${tx.action}-${tx.transactionHash || tx.certificateId}-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="p-4 font-bold text-slate-200">
                        {tx.certificateCode || shortenHash(tx.certificateId)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          tx.action === "ISSUE" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {tx.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-indigo-400">
                        {tx.transactionHash ? (
                          <span title={tx.transactionHash}>{shortenHash(tx.transactionHash)}</span>
                        ) : "—"}
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{tx.blockNumber ?? "—"}</td>
                      <td className="p-4 text-slate-400 font-mono">{tx.gasUsed ?? "—"}</td>
                      <td className="p-4">
                        {tx.status === "SUCCESS" ? (
                          <span className="font-bold text-emerald-400">SUCCESS</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-400">FAILED</span>
                            {tx.action === "REVOKE" && (
                              <button
                                onClick={() => handleRetryRevoke(tx.certificateId)}
                                disabled={retryingId === tx.certificateId}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded border border-red-500/30 text-[10px] font-semibold transition-all disabled:opacity-50"
                              >
                                {retryingId === tx.certificateId ? "Retrying..." : "Retry Revoke"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-sm">
                        No recent blockchain transactions logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CIDs Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-100 tracking-tight">
                  Pinned IPFS Content Hashes (CIDs)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recent certificate metadata pinned to IPFS Pinata network
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {data.cids.slice(0, 10).map((item) => (
                <div key={item.certificateId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-200">
                      {item.certificateCode || shortenHash(item.certificateId)}
                    </span>
                  </div>
                  <a
                    href={`${data.ipfs.gateway}/ipfs/${item.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 break-all"
                  >
                    <span>{item.cid}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
              {data.cids.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No IPFS CIDs stored.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
