"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  fetchIssuers, 
  createIssuerApi, 
  updateIssuerVerificationApi, 
  deleteIssuerApi, 
  checkIssuerAuthStatus, 
  IssuingSchool 
} from "@/lib/rpc";
import { useI18n } from "@/context/I18nContext";
import { Pagination } from "@/components/Pagination";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { 
  School, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Wallet, 
  Building2, 
  RefreshCw, 
  Trash2,
  X 
} from "lucide-react";

export default function IssuerManagementPage() {
  const { t } = useI18n();
  const [schools, setSchools] = useState<IssuingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // New School Form State
  const [newSchool, setNewSchool] = useState({
    organization_name: "",
    contact_email: "",
    wallet_address: "",
  });

  const addToast = (type: ToastMessage["type"], message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const loadIssuers = useCallback(async () => {
    setLoading(true);
    const realIssuers = await fetchIssuers();
    
    // Check on-chain authorization for each issuer
    const withAuth = await Promise.all(
      realIssuers.map(async (school) => {
        if (!school.wallet_address) return { ...school, is_onchain_authorized: false };
        const isAuth = await checkIssuerAuthStatus(school.wallet_address);
        return { ...school, is_onchain_authorized: isAuth };
      })
    );

    setSchools(withAuth);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadIssuers();
  }, [loadIssuers]);

  // Toggle Verification status using the is_verified column and sync Smart Contract
  const toggleVerification = async (school: IssuingSchool) => {
    setActionId(`verify-${school.organization_id}`);
    const newVerified = !school.is_verified;
    const { success, data } = await updateIssuerVerificationApi(school.organization_id, newVerified);
    
    if (success) {
      // Check updated on-chain status
      let isAuth = data?.is_onchain_authorized;
      if (typeof isAuth !== "boolean" && school.wallet_address) {
        isAuth = await checkIssuerAuthStatus(school.wallet_address);
      }

      setSchools((prev) =>
        prev.map((s) =>
          s.organization_id === school.organization_id
            ? { ...s, is_verified: newVerified, is_onchain_authorized: !!isAuth }
            : s
        )
      );
      addToast(
        "success",
        newVerified ? t.issuers.toastVerifySuccess : t.issuers.toastUnverifySuccess,
        school.organization_name
      );
    } else {
      addToast("error", t.issuers.toastVerifyError, "Error");
    }
    setActionId(null);
  };

  // Soft delete: sets is_verified to false and revokes on-chain authorization
  const handleSoftDelete = async (school: IssuingSchool) => {
    if (!window.confirm(t.issuers.unverifyConfirm)) return;

    setActionId(`delete-${school.organization_id}`);
    const success = await deleteIssuerApi(school.organization_id);
    if (success) {
      setSchools((prev) =>
        prev.map((s) =>
          s.organization_id === school.organization_id
            ? { ...s, is_verified: false, is_onchain_authorized: false }
            : s
        )
      );
      addToast("info", t.issuers.toastUnverifySuccess, school.organization_name);
    } else {
      addToast("error", t.issuers.toastVerifyError, "Error");
    }
    setActionId(null);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.organization_name || !newSchool.contact_email) return;

    setSubmitting(true);
    try {
      const created = await createIssuerApi({
        organization_name: newSchool.organization_name.trim(),
        contact_email: newSchool.contact_email.trim(),
        wallet_address: newSchool.wallet_address.trim() || undefined,
        is_verified: true,
      });

      if (created) {
        let isAuth = false;
        if (created.wallet_address) {
          isAuth = await checkIssuerAuthStatus(created.wallet_address);
        }
        setSchools((prev) => [{ ...created, is_onchain_authorized: isAuth }, ...prev]);
        setNewSchool({ organization_name: "", contact_email: "", wallet_address: "" });
        setIsAddModalOpen(false);
        addToast("success", t.issuers.toastAddSuccess, created.organization_name);
      }
    } catch (err: any) {
      addToast("error", err.message || t.issuers.toastAddError, "Creation Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.wallet_address && s.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "VERIFIED") return matchesSearch && s.is_verified;
    if (filterStatus === "PENDING") return matchesSearch && !s.is_verified;
    return matchesSearch;
  });

  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* In-App Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <School className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400 shrink-0" />
            {t.issuers.title}
          </h1>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={loadIssuers}
            disabled={loading || checkingAuth}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${loading || checkingAuth ? "animate-spin text-teal-400" : ""}`} />
            {t.issuers.checkAuthBtn}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#147D74] to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-teal-700/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" /> {t.issuers.addSchoolBtn}
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t.issuers.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto shrink-0">
          {(["ALL", "VERIFIED", "PENDING"] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? "bg-[#147D74] text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {status === "ALL"
                ? t.issuers.filterAll
                : status === "VERIFIED"
                ? t.issuers.filterVerified
                : t.issuers.filterPending}
            </button>
          ))}
        </div>
      </div>

      {/* Issuers Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
            {t.issuers.tableTitle} ({filteredSchools.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[780px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800 whitespace-nowrap">
              <tr>
                <th className="px-5 sm:px-6 py-3.5">{t.issuers.colSchool}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.issuers.colEmail}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.issuers.colWallet}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.issuers.colDbStatus}</th>
                <th className="px-5 sm:px-6 py-3.5">{t.issuers.colContractAuth}</th>
                <th className="px-5 sm:px-6 py-3.5 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                    {t.common.refreshing}
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    {t.issuers.noSchools}
                  </td>
                </tr>
              ) : (
                paginatedSchools.map((school) => (
                  <tr key={school.organization_id} className="hover:bg-slate-900/40 transition-all">
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
                          {school.organization_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{school.organization_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{school.organization_id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 sm:px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{school.contact_email}</span>
                      </div>
                    </td>

                    <td className="px-5 sm:px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span title={school.wallet_address || ""}>
                          {school.wallet_address
                            ? `${school.wallet_address.slice(0, 8)}...${school.wallet_address.slice(-6)}`
                            : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Verification Status (is_verified) */}
                    <td className="px-5 sm:px-6 py-4 whitespace-nowrap">
                      {school.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {t.issuers.verifiedBadge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <XCircle className="w-3.5 h-3.5 shrink-0" /> {t.issuers.pendingBadge}
                        </span>
                      )}
                    </td>

                    {/* On-Chain Auth */}
                    <td className="px-5 sm:px-6 py-4 font-mono whitespace-nowrap">
                      {school.is_onchain_authorized ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {t.common.authorized}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {t.common.unauthorized}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 sm:px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* Verify / Unverify Button */}
                        <button
                          onClick={() => toggleVerification(school)}
                          disabled={actionId === `verify-${school.organization_id}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer disabled:opacity-50 ${
                            school.is_verified
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {school.is_verified ? t.issuers.revokeBtn : t.issuers.approveBtn}
                        </button>

                        {/* Soft Delete button */}
                        {school.is_verified && (
                          <button
                            onClick={() => handleSoftDelete(school)}
                            disabled={actionId === `delete-${school.organization_id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                            title={t.issuers.revokeBtn}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSchools.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add School Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-5 sm:p-6 space-y-5 sm:space-y-6 border border-teal-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">{t.issuers.modalTitle}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">{t.issuers.labelSchoolName} *</label>
                <input
                  type="text"
                  required
                  placeholder={t.issuers.placeholderSchoolName}
                  value={newSchool.organization_name}
                  onChange={(e) => setNewSchool({ ...newSchool, organization_name: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">{t.issuers.labelEmail} *</label>
                <input
                  type="email"
                  required
                  placeholder={t.issuers.placeholderEmail}
                  value={newSchool.contact_email}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">{t.issuers.labelWallet}</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newSchool.wallet_address}
                  onChange={(e) => setNewSchool({ ...newSchool, wallet_address: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#147D74] hover:bg-teal-600 text-white font-semibold shadow-lg shadow-teal-700/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {t.issuers.submitAdd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
