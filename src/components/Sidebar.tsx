"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Blocks, 
  School, 
  FileCode2, 
  ShieldCheck,
  Activity,
  X
} from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    {
      name: t.sidebar.nav.overview,
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: t.sidebar.nav.system,
      href: "/system",
      icon: Activity,
    },
    {
      name: t.sidebar.nav.blocks,
      href: "/blocks",
      icon: Blocks,
    },
    {
      name: t.sidebar.nav.issuers,
      href: "/issuers",
      icon: School,
    },
    {
      name: t.sidebar.nav.contract,
      href: "/contract",
      icon: FileCode2,
    },
  ];

  const handleLinkClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#147D74] via-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight shrink-0">
                {t.sidebar.brand}
              </h1>
              <span className="text-[11px] bg-teal-500/20 text-teal-400 font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/30 whitespace-nowrap shrink-0">
                {t.sidebar.badge}
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0 ml-2"
              aria-label={t.common.closeMenu}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="p-3 sm:p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.sidebar.controlPanel}
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#147D74] to-teal-600 text-white shadow-lg shadow-teal-700/25 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-teal-400"
                  }`}
                />
                <span className="text-sm font-medium leading-none truncate">{item.name}</span>
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
              <span className="text-xs font-semibold text-slate-200">{t.sidebar.localNode}</span>
              <span className="text-[10px] text-emerald-400 font-mono">127.0.0.1:8545</span>
            </div>
          </div>
          <Activity className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and up) */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 h-screen sticky top-0 z-40 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (screens < lg) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-72 bg-slate-900 border-r border-slate-800 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
