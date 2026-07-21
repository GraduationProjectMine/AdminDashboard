"use client";

import { useEffect, useState } from "react";
import { 
  getContractState, 
  getContractEvents, 
  checkIssuerAuthStatus, 
  ContractState, 
  ContractEventItem,
  DEFAULT_CONTRACT_ADDRESS 
} from "@/lib/rpc";
import { CERTIFICATE_REGISTRY_ABI } from "@/lib/contractAbi";
import { 
  FileCode2, 
  ShieldCheck, 
  Search, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Code2,
  Lock
} from "lucide-react";

export default function ContractManagementPage() {
  const [contract, setContract] = useState<ContractState | null>(null);
  const [events, setEvents] = useState<ContractEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Address Lookup state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupResult, setLookupResult] = useState<{ checked: boolean; authorized: boolean } | null>(null);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const fetchContractData = async () => {
    setLoading(true);
    const [cData, eData] = await Promise.all([
      getContractState(),
      getContractEvents(),
    ]);
    setContract(cData);
    setEvents(eData);
    setLoading(false);
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  const handleCheckAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupAddress) return;
    setCheckingAddress(true);
    const isAuth = await checkIssuerAuthStatus(lookupAddress.trim());
    setLookupResult({ checked: true, authorized: isAuth });
    setCheckingAddress(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCode2 className="w-7 h-7 text-purple-400" />
            Smart Contract Inspector & Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Read CertificateRegistry smart contract bytecode, inspect authorized addresses, and stream on-chain event logs.
          </p>
        </div>

        <button
          onClick={fetchContractData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          Reload Contract State
        </button>
      </div>

      {/* Contract Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contract Address Card */}
        <div className="glass-card p-6 space-y-3 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Deployed Address
            </span>
            <Code2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-sm font-mono font-bold text-purple-300 break-all">
            {contract?.address || DEFAULT_CONTRACT_ADDRESS}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Bytecode Length: {contract?.codeLength || 0} bytes
          </div>
        </div>

        {/* Contract Owner Card */}
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contract Owner (Admin)
            </span>
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-sm font-mono font-bold text-blue-300 break-all">
            {contract?.owner || "Fetching..."}
          </div>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Owner has default permission to authorize/deauthorize issuers.
          </div>
        </div>

        {/* Contract Type / ABI Info */}
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contract Specification
            </span>
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-slate-200">
            CertificateRegistry.sol
          </div>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Solidity ^0.8.28 • OpenZeppelin Architecture
          </div>
        </div>
      </div>

      {/* Interactive Permission Lookup Tool */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-100">On-Chain Issuer Permission Checker</h3>
        </div>

        <form onSubmit={handleCheckAddress} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              placeholder="Enter Ethereum wallet address (0x...)"
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={checkingAddress}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20"
          >
            {checkingAddress ? "Querying RPC..." : "Check Status"}
          </button>
        </form>

        {lookupResult?.checked && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {lookupResult.authorized ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  {lookupAddress}
                </div>
                <div className="text-xs text-slate-400">
                  {lookupResult.authorized
                    ? "Is an Authorized Issuer on CertificateRegistry smart contract."
                    : "Not authorized to issue certificates on-chain."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: ABI Methods & Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract ABI Methods List */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100">Smart Contract ABI Interface</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {CERTIFICATE_REGISTRY_ABI.filter((x) => x.type === "function").length} Functions
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {CERTIFICATE_REGISTRY_ABI.filter((x) => x.type === "function").map((func: any, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400">{func.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-bold ${
                      func.stateMutability === "view"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {func.stateMutability}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Inputs: {func.inputs.length === 0 ? "none" : func.inputs.map((inp: any) => `${inp.name} (${inp.type})`).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Event Stream */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-slate-100">Emitted Contract Event Logs</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {events.length} Events Logged
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-sans text-sm">
                No events emitted yet or contract not deployed.
              </div>
            ) : (
              events.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-sans text-xs">
                      {ev.eventName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Block #{ev.blockNumber}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate">
                    Tx: {ev.transactionHash}
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 text-[11px] text-slate-300 space-y-1">
                    {Object.entries(ev.args).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-200 truncate max-w-[240px]">{String(v)}</span>
                      </div>
                    ))}
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
