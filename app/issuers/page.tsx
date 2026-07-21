"use client";

import { useState, useEffect } from "react";
import { checkIssuerAuthStatus, DEFAULT_CONTRACT_ADDRESS } from "@/lib/rpc";
import { 
  School, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  Mail,
  Wallet,
  Building2,
  RefreshCw,
  X
} from "lucide-react";

interface IssuingSchool {
  organization_id: string;
  organization_name: string;
  contact_email: string;
  wallet_address: string;
  is_verified: boolean;
  is_onchain_authorized?: boolean;
  logo_url?: string;
  created_at: string;
}

// Initial sample data representing issuing schools
const INITIAL_SCHOOLS: IssuingSchool[] = [
  {
    organization_id: "org-hust-001",
    organization_name: "Đại học Bách Khoa Hà Nội (HUST)",
    contact_email: "contact@hust.edu.vn",
    wallet_address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    is_verified: true,
    created_at: "2026-01-15T08:00:00Z",
  },
  {
    organization_id: "org-vnu-002",
    organization_name: "Đại học Quốc gia Hà Nội (VNU)",
    contact_email: "admin@vnu.edu.vn",
    wallet_address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    is_verified: true,
    created_at: "2026-02-10T09:30:00Z",
  },
  {
    organization_id: "org-hcmut-003",
    organization_name: "Đại học Bách Khoa TP.HCM (HCMUT)",
    contact_email: "cert@hcmut.edu.vn",
    wallet_address: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
    is_verified: false,
    created_at: "2026-03-01T14:15:00Z",
  },
];

export default function IssuerManagementPage() {
  const [schools, setSchools] = useState<IssuingSchool[]>(INITIAL_SCHOOLS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New School Form State
  const [newSchool, setNewSchool] = useState({
    organization_name: "",
    contact_email: "",
    wallet_address: "",
  });

  const checkAllOnchainAuth = async () => {
    setCheckingAuth(true);
    const updated = await Promise.all(
      schools.map(async (school) => {
        if (!school.wallet_address) return { ...school, is_onchain_authorized: false };
        const isAuth = await checkIssuerAuthStatus(school.wallet_address);
        return { ...school, is_onchain_authorized: isAuth };
      })
    );
    setSchools(updated);
    setCheckingAuth(false);
  };

  useEffect(() => {
    checkAllOnchainAuth();
  }, []);

  const toggleVerification = (orgId: string) => {
    setSchools((prev) =>
      prev.map((s) =>
        s.organization_id === orgId ? { ...s, is_verified: !s.is_verified } : s
      )
    );
  };

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.organization_name || !newSchool.contact_email) return;

    const created: IssuingSchool = {
      organization_id: `org-${Date.now()}`,
      organization_name: newSchool.organization_name,
      contact_email: newSchool.contact_email,
      wallet_address: newSchool.wallet_address || "0x0000000000000000000000000000000000000000",
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    setSchools((prev) => [created, ...prev]);
    setNewSchool({ organization_name: "", contact_email: "", wallet_address: "" });
    setIsAddModalOpen(false);
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.wallet_address.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "VERIFIED") return matchesSearch && s.is_verified;
    if (filterStatus === "PENDING") return matchesSearch && !s.is_verified;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <School className="w-7 h-7 text-indigo-400" />
            School Issuer Account Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorize and manage issuing educational institution accounts and smart contract wallet permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkAllOnchainAuth}
            disabled={checkingAuth}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${checkingAuth ? "animate-spin text-indigo-400" : ""}`} />
            Check On-Chain Auth
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add School Account
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search school name, email, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {(["ALL", "VERIFIED", "PENDING"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === status
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {status === "ALL" ? "All Issuers" : status === "VERIFIED" ? "Verified" : "Pending Verification"}
            </button>
          ))}
        </div>
      </div>

      {/* Issuers Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Registered School Issuers ({filteredSchools.length})
          </h3>
          <span className="text-xs text-slate-500">Only authorized issuers can sign credentials</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">School / Institution</th>
                <th className="px-6 py-3.5">Contact Email</th>
                <th className="px-6 py-3.5">Issuer Wallet Address</th>
                <th className="px-6 py-3.5">DB Status</th>
                <th className="px-6 py-3.5">Contract Auth</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-sans">
                    No school accounts found.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.organization_id} className="hover:bg-slate-900/40 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                          {school.organization_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{school.organization_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{school.organization_id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {school.contact_email}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        <span title={school.wallet_address}>
                          {school.wallet_address
                            ? `${school.wallet_address.slice(0, 8)}...${school.wallet_address.slice(-6)}`
                            : "Not set"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {school.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {school.is_onchain_authorized ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" /> Authorized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <ShieldAlert className="w-3.5 h-3.5" /> Unauthorized
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleVerification(school.organization_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          school.is_verified
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {school.is_verified ? "Revoke Verification" : "Approve School"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 space-y-6 border border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Add School Issuer Account</h3>
                  <p className="text-xs text-slate-400">Register a new educational institution account.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">School / Institution Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Đại học Bách Khoa"
                  value={newSchool.organization_name}
                  onChange={(e) => setNewSchool({ ...newSchool, organization_name: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Contact Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="contact@school.edu.vn"
                  value={newSchool.contact_email}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Issuer Ethereum Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newSchool.wallet_address}
                  onChange={(e) => setNewSchool({ ...newSchool, wallet_address: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Save & Authorize Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
