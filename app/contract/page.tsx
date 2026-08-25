"use client";

import { useEffect, useState } from "react";
import { 
  getContractState, 
  getContractActivities, 
  checkIssuerAuthStatus, 
  ContractState, 
  ContractActivityItem,
  DEFAULT_CONTRACT_ADDRESS 
} from "@/lib/rpc";
import { useI18n } from "@/context/I18nContext";
import { Pagination } from "@/components/Pagination";
import { 
  FileCode2, 
  ShieldCheck, 
  Search, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Code2, 
  Key, 
  FileCheck, 
  FileX, 
  UserCheck, 
  UserX, 
  Clock, 
  Copy, 
  Check 
} from "lucide-react";

function shortenAddress(addr: string) {
  if (!addr) return "—";
  return addr.length > 12 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;
}

export default function ContractManagementPage() {
  const { t } = useI18n();
  const [contract, setContract] = useState<ContractState | null>(null);
  const [activities, setActivities] = useState<ContractActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Address Lookup state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupResult, setLookupResult] = useState<{ checked: boolean; authorized: boolean } | null>(null);
  const [checkingAddress, setCheckingAddress] = useState(false);

  const fetchContractData = async () => {
    setLoading(true);
    const [cData, aData] = await Promise.all([
      getContractState(),
      getContractActivities(),
    ]);
    setContract(cData);
    setActivities(aData);
    setLoading(false);
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleCheckAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupAddress) return;
    setCheckingAddress(true);
    const isAuth = await checkIssuerAuthStatus(lookupAddress.trim());
    setLookupResult({ checked: true, authorized: isAuth });
    setCheckingAddress(false);
  };

  const getActionBadge = (actionType: ContractActivityItem["actionType"]) => {
    switch (actionType) {
      case "REGISTER_CERT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
            <FileCheck className="w-3.5 h-3.5" />
            {t.contract.typeIssue}
          </span>
        );
      case "REVOKE_CERT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <FileX className="w-3.5 h-3.5" />
            {t.contract.typeRevoke}
          </span>
        );
      case "AUTHORIZE_ISSUER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            {t.contract.typeAuthorize}
          </span>
        );
      case "DEAUTHORIZE_ISSUER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <UserX className="w-3.5 h-3.5" />
            {t.contract.typeDeauthorize}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Code2 className="w-3.5 h-3.5" />
            {t.contract.typeUnknown}
          </span>
        );
    }
  };

  const paginatedActivities = activities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCode2 className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400 shrink-0" />
            {t.contract.title}
          </h1>
        </div>

        <button
          onClick={fetchContractData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? "animate-spin text-teal-400" : ""}`} />
          {t.contract.reloadBtn}
        </button>
      </div>

      {/* Contract Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Contract Address Card */}
        <div className="glass-card p-5 sm:p-6 space-y-3 border-teal-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.contract.deployedAddress}
            </span>
            <Code2 className="w-5 h-5 text-teal-400 shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-mono font-bold text-teal-300 break-all">
            {contract?.address || DEFAULT_CONTRACT_ADDRESS}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>{t.contract.bytecodeLength} {contract?.codeLength || 0} {t.contract.bytes}</span>
          </div>
        </div>

        {/* Contract Owner Card */}
        <div className="glass-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.contract.contractOwner}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 break-all">
            {contract?.owner || "Not Loaded"}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>{t.contract.privilegedAdmin}</span>
          </div>
        </div>

        {/* Network & Verification Status */}
        <div className="glass-card p-5 sm:p-6 space-y-3 md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.contract.evmNetwork}
            </span>
            <Cpu className="w-5 h-5 text-teal-400 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-200">
            Localhost (31337)
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>{t.contract.directRpc}</span>
          </div>
        </div>
      </div>

      {/* Authorized Issuer Quick Lookup Tool */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-400 shrink-0" />
            {t.contract.lookupTitle}
          </h3>
        </div>

        <form onSubmit={handleCheckAddress} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.contract.lookupPlaceholder}
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={checkingAddress}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-[#147D74] hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-700/20 cursor-pointer whitespace-nowrap"
          >
            {checkingAddress ? t.contract.queryingRpc : t.contract.checkStatusBtn}
          </button>
        </form>

        {lookupResult?.checked && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-start sm:items-center gap-3">
              {lookupResult.authorized ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-200 font-mono break-all">
                  {lookupAddress}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lookupResult.authorized
                    ? t.contract.isAuthorizedMsg
                    : t.contract.notAuthorizedMsg}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Section: Transaction & Creator Activity Monitor */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-teal-400 shrink-0" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              {t.contract.activityTitle}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {activities.length} {t.contract.eventsUnit}
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
              {t.common.refreshing}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans text-sm">
              {t.contract.noActivities}
            </div>
          ) : (
            paginatedActivities.map((item, idx) => (
              <div
                key={`${item.transactionHash}-${idx}`}
                className="p-4 sm:p-5 hover:bg-slate-900/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                {/* Left: Action Type Badge & Creator / Sender */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getActionBadge(item.actionType)}
                    <span className="text-slate-400 font-mono">
                      Block #{item.blockNumber}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(item.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>

                  {/* Creator / Sender Address */}
                  <div className="flex flex-wrap items-center gap-2 text-slate-300">
                    <span className="text-slate-400 font-semibold">{t.contract.colCreator}:</span>
                    <span className="font-mono text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.creator}
                    </span>
                    <button
                      onClick={() => handleCopy(item.creator)}
                      className="text-slate-500 hover:text-teal-300 transition-colors p-1 cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedHash === item.creator ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Decoded Parameters */}
                  {item.args && Object.keys(item.args).length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1 mt-2">
                      {Object.entries(item.args).map(([k, v]) => (
                        <div key={k} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-slate-200 truncate max-w-sm sm:max-w-md md:max-w-lg" title={String(v)}>
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Tx Hash Pill & Status */}
                <div className="lg:text-right shrink-0 space-y-1.5 font-mono">
                  <div className="flex items-center lg:justify-end gap-1.5">
                    <span className="text-slate-400 text-[11px]">Tx:</span>
                    <span className="text-cyan-400 text-[11px]" title={item.transactionHash}>
                      {shortenAddress(item.transactionHash)}
                    </span>
                    <button
                      onClick={() => handleCopy(item.transactionHash)}
                      className="text-slate-500 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                      title="Copy Tx Hash"
                    >
                      {copiedHash === item.transactionHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {t.common.success}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={activities.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
