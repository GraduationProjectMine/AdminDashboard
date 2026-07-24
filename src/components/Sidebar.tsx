"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Blocks, 
  School, 
  FileCode2, 
  ShieldCheck,
  Activity
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    description: "System stats & network overview",
  },
  {
    name: "System & Node Monitor",
    href: "/system",
    icon: Activity,
    description: "EVM RPC, IPFS Pinata & Signer health",
  },
  {
    name: "Blockchain Explorer",
    href: "/blocks",
    icon: Blocks,
    description: "Monitor live blocks & transactions",
  },
  {
    name: "Issuer & School Accounts",
    href: "/issuers",
    icon: School,
    description: "Manage school issuer permissions",
  },
  {
    name: "Smart Contract",
    href: "/contract",
    icon: FileCode2,
    description: "Registry state & on-chain events",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2">
              CertChain
              <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Governance & Node Monitor</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Control Panel
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{item.name}</span>
                  <span
                    className={`text-[11px] mt-1 ${
                      isActive ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="glass-card p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Local RPC Node</span>
              <span className="text-[10px] text-emerald-400 font-mono">127.0.0.1:8545</span>
            </div>
          </div>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
