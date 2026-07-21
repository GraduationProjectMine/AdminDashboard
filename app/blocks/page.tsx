"use client";

import { useEffect, useState } from "react";
import { getRecentBlocks, checkRpcHealth, BlockItem, RpcNodeHealth } from "@/lib/rpc";
import { 
  Blocks, 
  Search, 
  RefreshCw, 
  Clock, 
  Layers, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  Info,
  X
} from "lucide-react";

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [health, setHealth] = useState<RpcNodeHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);
  const [blockLimit, setBlockLimit] = useState(15);

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Blocks className="w-7 h-7 text-blue-400" />
            Blockchain Block Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time height monitor & RPC block stream inspector for the EVM network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlocks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Limit Filter */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search block height or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span>Show latest:</span>
          {[10, 15, 25, 50].map((num) => (
            <button
              key={num}
              onClick={() => setBlockLimit(num)}
              className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
                blockLimit === num
                  ? "bg-blue-600 border-blue-500 text-white font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {num} blocks
            </button>
          ))}
        </div>
      </div>

      {/* Block Stream Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Live Block Height Stream ({filteredBlocks.length} items)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Node: {health?.rpcUrl || "Default RPC"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Block Height</th>
                <th className="px-6 py-3.5">Block Hash</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Transactions</th>
                <th className="px-6 py-3.5">Gas Used / Limit</th>
                <th className="px-6 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    {loading ? "Fetching latest blocks from RPC node..." : "No blocks found matching filter."}
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((block) => {
                  const gasPercent = block.gasLimit && block.gasLimit !== "0"
                    ? Math.round((Number(block.gasUsed) / Number(block.gasLimit)) * 100)
                    : 0;

                  return (
                    <tr
                      key={block.number}
                      className="hover:bg-slate-900/40 transition-all cursor-pointer"
                      onClick={() => setSelectedBlock(block)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-400 flex items-center gap-1.5">
                          <Blocks className="w-3.5 h-3.5" />
                          #{block.number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-mono hover:text-blue-300" title={block.hash || ""}>
                          {block.hash ? `${block.hash.slice(0, 10)}...${block.hash.slice(-8)}` : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(block.timestamp * 1000).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-sans">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {block.transactionCount} txs
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 w-36">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{block.gasUsed}</span>
                            <span>{gasPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(2, gasPercent))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-blue-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold">
                  #{selectedBlock.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Block #{selectedBlock.number} Details</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedBlock.hash}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/60 space-y-2 border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Parent Hash:</span>
                  <span className="text-slate-200 truncate max-w-xs">{selectedBlock.parentHash}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-200">
                    {new Date(selectedBlock.timestamp * 1000).toUTCString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transactions Count:</span>
                  <span className="text-blue-400 font-bold">{selectedBlock.transactionCount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gas Used:</span>
                  <span className="text-purple-400">{selectedBlock.gasUsed}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gas Limit:</span>
                  <span className="text-slate-300">{selectedBlock.gasLimit}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Miner / Sequencer:</span>
                  <span className="text-emerald-400">{selectedBlock.miner}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
