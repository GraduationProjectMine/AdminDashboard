"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  fetchSystemMonitor, 
  retryRevocation, 
  MonitorOverview 
} from "@/lib/rpc";
import { useI18n } from "@/context/I18nContext";
import { Pagination } from "@/components/Pagination";
import { 
  Activity, 
  RefreshCw, 
  Cpu, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  ArrowUpRight, 
  Database 
} from "lucide-react";

function shortenHash(value: string | null, size = 8) {
  if (!value) return "—";
  return value.length > size * 2 ? `${value.slice(0, size)}…${value.slice(-6)}` : value;
}

export default function SystemMonitorPage() {
  const { t } = useI18n();
  const [data, setData] = useState<MonitorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Pagination states
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);
  const [cidPage, setCidPage] = useState(1);
  const [cidPageSize, setCidPageSize] = useState(5);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const monitorData = await fetchSystemMonitor();
    if (monitorData) {
      setData(monitorData);
    } else {
      setError(t.system.errorConnect);
    }
    setLoading(false);
  }, [t.system.errorConnect]);

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

  const paginatedTransactions = data?.transactions
    ? data.transactions.slice((txPage - 1) * txPageSize, txPage * txPageSize)
    : [];

  const paginatedCids = data?.cids
    ? data.cids.slice((cidPage - 1) * cidPageSize, cidPage * cidPageSize)
    : [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 shrink-0" /> {t.system.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {t.system.title}
            </h1>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#147D74] hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-700/20 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? "animate-spin" : ""}`} />
            {loading ? t.common.refreshing : t.system.refreshBtn}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs sm:text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Status Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Blockchain RPC Status */}
            <div className="glass-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
                  {t.system.evmNode}
                </span>
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {data.blockchain.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.common.online}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> {t.common.disconnected}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    Chain ID {data.blockchain.chainId ?? "—"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  #{data.blockchain.blockNumber?.toLocaleString() ?? "—"}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono truncate" title={data.blockchain.contractAddress || ""}>
                  Contract: {shortenHash(data.blockchain.contractAddress, 10)}
                </p>
              </div>
            </div>

            {/* Wallet Signer */}
            <div className="glass-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
                  {t.system.signerWallet}
                </span>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
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
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <span>{t.system.totalTx} <strong className="text-slate-200">{data.totals.transactions}</strong></span>
                  <span>{t.system.failedTx} <strong className={data.totals.failedTransactions > 0 ? "text-red-400" : "text-emerald-400"}>{data.totals.failedTransactions}</strong></span>
                </div>
              </div>
            </div>

            {/* IPFS Pinata Status */}
            <div className="glass-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider break-words">
                  {t.system.ipfsStorage}
                </span>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {data.ipfs.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.system.pinataConfigured}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t.system.pinataNotConfigured}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {data.totals.cids} Pinata CIDs
                </div>
                <p className="text-xs text-slate-400 mt-2 truncate font-mono" title={data.ipfs.gateway || ""}>
                  Gateway: {data.ipfs.gateway || "Default"}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
              <h3 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                {t.system.transactionsTitle}
              </h3>
              <div className="text-xs text-slate-400 font-mono shrink-0">
                {data.transactions.length} txs
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 whitespace-nowrap">
                    <th className="p-4 font-semibold">{t.system.colTimestamp}</th>
                    <th className="p-4 font-semibold">{t.system.colCertCode}</th>
                    <th className="p-4 font-semibold">{t.system.colAction}</th>
                    <th className="p-4 font-semibold">{t.system.colTxHash}</th>
                    <th className="p-4 font-semibold">{t.system.colBlock}</th>
                    <th className="p-4 font-semibold">{t.system.colGas}</th>
                    <th className="p-4 font-semibold">{t.system.colStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedTransactions.map((tx, idx) => (
                    <tr key={`${tx.action}-${tx.transactionHash || tx.certificateId}-${idx}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "—"}
                      </td>
                      <td className="p-4 font-bold text-slate-200 whitespace-nowrap">
                        {tx.certificateCode || shortenHash(tx.certificateId)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          tx.action === "ISSUE" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {tx.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-teal-400 whitespace-nowrap">
                        {tx.transactionHash ? (
                          <span title={tx.transactionHash}>{shortenHash(tx.transactionHash)}</span>
                        ) : "—"}
                      </td>
                      <td className="p-4 text-slate-300 font-mono whitespace-nowrap">{tx.blockNumber ?? "—"}</td>
                      <td className="p-4 text-slate-400 font-mono whitespace-nowrap">{tx.gasUsed ?? "—"}</td>
                      <td className="p-4 whitespace-nowrap">
                        {tx.status === "SUCCESS" ? (
                          <span className="font-bold text-emerald-400">{t.common.success}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-400">{t.common.failed}</span>
                            {tx.action === "REVOKE" && (
                              <button
                                onClick={() => handleRetryRevoke(tx.certificateId)}
                                disabled={retryingId === tx.certificateId}
                                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded border border-red-500/30 text-[10px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {retryingId === tx.certificateId ? t.system.retrying : t.system.retryRevoke}
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
                        {t.system.noTx}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Transactions */}
            <Pagination
              currentPage={txPage}
              totalItems={data.transactions.length}
              pageSize={txPageSize}
              onPageChange={setTxPage}
              onPageSizeChange={(newSize) => {
                setTxPageSize(newSize);
                setTxPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>

          {/* CIDs Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                {t.system.cidsTitle} ({data.cids.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-800/60">
              {paginatedCids.map((item) => (
                <div key={item.certificateId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate">
                      {item.certificateCode || shortenHash(item.certificateId)}
                    </span>
                  </div>
                  <a
                    href={`${data.ipfs.gateway}/ipfs/${item.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 break-all"
                  >
                    <span className="truncate max-w-[260px] sm:max-w-xs">{item.cid}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="text-slate-500 font-mono text-[11px] shrink-0">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
              {data.cids.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  {t.system.noCids}
                </div>
              )}
            </div>

            {/* Pagination for CIDs */}
            <Pagination
              currentPage={cidPage}
              totalItems={data.cids.length}
              pageSize={cidPageSize}
              onPageChange={setCidPage}
              onPageSizeChange={(newSize) => {
                setCidPageSize(newSize);
                setCidPage(1);
              }}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </>
      )}
    </div>
  );
}
