import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { NavTab, UserRole } from '../types';
import {
  Zap,
  Home,
  LayoutDashboard,
  MapPin,
  Calculator,
  ShieldCheck,
  User,
  Radio,
  Menu,
  X,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileMenuOpen = false,
  setMobileMenuOpen = (_open: boolean) => {},
}) => {
  const { activeTab, setActiveTab, userRole, switchRole, currentUser, triggerSync } = useTransformers();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'landing', label: 'หน้าเริ่ม', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'ภาพรวม', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'detail', label: 'พิกัด/แผนที่', icon: <MapPin className="w-4 h-4" /> },
    { id: 'calculator', label: 'คำนวณฟิวส์', icon: <Calculator className="w-4 h-4" /> },
    { id: 'admin', label: 'จัดการแอดมิน', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="h-14 sm:h-16 w-full px-3 sm:px-6 flex items-center justify-between gap-2 max-w-[1720px] mx-auto">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Quick Portal Home button on mobile */}
          <button
            type="button"
            onClick={() => setActiveTab('landing')}
            className="p-1.5 rounded-lg bg-emerald-50 text-[#006948] hover:bg-emerald-100 transition-colors md:hidden"
            title="กลับสู่หน้าเริ่มต้น"
          >
            <Home className="w-4 h-4" />
          </button>

          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#006948] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight leading-tight group-hover:text-[#006948] transition-colors truncate">
                <span className="hidden sm:inline">Smart Transformer Load &amp; Protection</span>
                <span className="sm:hidden font-bold">PEA Smart Grid</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase truncate flex items-center gap-1.5">
                <span>PEA SCADA System</span>
                <span className="hidden lg:inline text-slate-300">•</span>
                <span className="hidden lg:inline text-emerald-700 font-semibold">Live Fleet Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Central Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#006948] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Read-only Status & Role Display (Non-clickable) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 select-none">
          {/* Live Cloud Sync indicator & button */}
          <button
            type="button"
            onClick={() => triggerSync()}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#006948] px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all shadow-xs"
            title="คลิกเพื่อซิงก์ข้อมูลคลาวด์ Firebase และตรวจสอบข้อมูลระหว่างทุกอุปกรณ์"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006948]"></span>
            </span>
            <Cloud className="w-3.5 h-3.5 hidden sm:inline" />
            <span className="font-semibold">ซิงก์คลาวด์สด</span>
            <RefreshCw className="w-3 h-3 text-emerald-600 hover:rotate-180 transition-transform" />
          </button>

          {/* Role Indicator - Read-only, cannot be clicked */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold pointer-events-none cursor-default shadow-xs ${
              userRole === 'superadmin'
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : userRole === 'admin'
                ? 'bg-emerald-50 border-emerald-200 text-[#006948]'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {userRole === 'superadmin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>คุณเป็นชุปเปอร์แอดมิน</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#006948]" />
                <span>คุณเป็นแอดมิน</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>คุณเป็นยูสธรรมดา</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
