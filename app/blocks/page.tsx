"use client";

import { useEffect, useState } from "react";
import { getRecentBlocks, checkRpcHealth, BlockItem, RpcNodeHealth } from "@/lib/rpc";
import { useI18n } from "@/context/I18nContext";
import { Pagination } from "@/components/Pagination";
import { 
  Blocks, 
  Search, 
  RefreshCw, 
  Clock, 
  Layers, 
  ChevronRight,
  X
} from "lucide-react";

export default function BlocksPage() {
  const { t } = useI18n();
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [health, setHealth] = useState<RpcNodeHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);
  const [blockLimit, setBlockLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchBlocks = async () => {
    setLoading(true);
    const [hData, bData] = await Promise.all([
      checkRpcHealth(),
      getRecentBlocks(blockLimit),
    ]);
    setHealth(hData);
    setBlocks(bData);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlocks();
    setCurrentPage(1);
  }, [blockLimit]);

  const filteredBlocks = blocks.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      b.number.toString().includes(term) ||
      (b.hash && b.hash.toLowerCase().includes(term)) ||
      (b.miner && b.miner.toLowerCase().includes(term))
    );
  });

  const paginatedBlocks = filteredBlocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Blocks className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400 shrink-0" />
            {t.blocks.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchBlocks}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? "animate-spin text-teal-400" : ""}`} />
            {t.blocks.refreshStream}
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Limit Filter */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t.blocks.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 font-medium">
          <span className="shrink-0">{t.blocks.showLatest}</span>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => setBlockLimit(num)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  blockLimit === num
                    ? "bg-[#147D74] border-teal-500 text-white font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {num} {t.blocks.blocksUnit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Block Stream Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400 shrink-0" />
            {t.blocks.streamTitle} ({filteredBlocks.length})
          </h3>
          <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
            {t.blocks.nodeLabel} {health?.rpcUrl || "Default RPC"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800 whitespace-nowrap">
              <tr>
                <th className="px-5 sm:px-6 py-3.5">{t.blocks.colHeight}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.blocks.colHash}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.blocks.colTime}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.blocks.colTxs}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.blocks.colGas}</th>
                <th className="px-5 sm:px-6 py-3.5 text-right">{t.blocks.colInspect}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    {loading ? t.common.refreshing : t.blocks.noBlocks}
                  </td>
                </tr>
              ) : (
                paginatedBlocks.map((block) => {
                  const gasPercent = block.gasLimit && block.gasLimit !== "0"
                    ? Math.round((Number(block.gasUsed) / Number(block.gasLimit)) * 100)
                    : 0;

                  return (
                    <tr
                      key={block.number}
                      onClick={() => setSelectedBlock(block)}
                      className="hover:bg-slate-900/50 cursor-pointer transition-all group"
                    >
                      <td className="px-5 sm:px-6 py-4 font-bold text-teal-400 flex items-center gap-2">
                        <span>#{block.number}</span>
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-slate-300">
                        <span className="truncate block max-w-[180px] sm:max-w-[220px] text-slate-400 group-hover:text-slate-200" title={block.hash || ""}>
                          {block.hash || "Pending..."}
                        </span>
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-slate-400 font-sans whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{new Date(block.timestamp * 1000).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700 text-[11px] font-semibold">
                          {block.transactionCount} txs
                        </span>
                      </td>

                      <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-teal-400 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, gasPercent))}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] text-slate-400">{gasPercent}%</span>
                        </div>
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-right whitespace-nowrap font-sans">
                        <span className="text-teal-400 group-hover:text-teal-300 text-xs font-semibold inline-flex items-center gap-1">
                          {t.blocks.colInspect} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBlocks.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-5 sm:p-6 space-y-4 border border-teal-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {t.blocks.modalTitle} #{selectedBlock.number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] uppercase">{t.blocks.colHash}</span>
                <div className="text-teal-300 break-all">{selectedBlock.hash}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] uppercase">{t.blocks.parentHash}</span>
                <div className="text-slate-300 break-all">{selectedBlock.parentHash}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">{t.blocks.timestamp}</span>
                  <span className="text-slate-200 font-semibold">{new Date(selectedBlock.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">{t.blocks.txCount}</span>
                  <span className="text-teal-400 font-semibold">{selectedBlock.transactionCount} transactions</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
                  <span className="text-slate-500 text-[11px] block font-sans">{t.blocks.gasUsed}</span>
                  <span className="text-slate-200">{selectedBlock.gasUsed}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono">
                  <span className="text-slate-500 text-[11px] block font-sans">{t.blocks.gasLimit}</span>
                  <span className="text-slate-200">{selectedBlock.gasLimit}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[11px] uppercase">{t.blocks.miner}</span>
                <div className="text-slate-300 break-all">{selectedBlock.miner}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 rounded-xl bg-[#147D74] hover:bg-teal-600 text-white font-semibold text-xs cursor-pointer"
              >
                {t.blocks.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
