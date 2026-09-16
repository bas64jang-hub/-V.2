import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { NavTab } from '../types';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Calculator,
  ShieldCheck,
  Layers,
  Zap,
  Activity,
  Radio,
  ExternalLink,
  History,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Compass,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileMenuOpen = false,
  setMobileMenuOpen = (_open: boolean) => {},
}) => {
  const {
    activeTab,
    setActiveTab,
    userRole,
    auditLogs,
    transformers,
    lineCutouts,
    triggerSync,
    openNearbyModal,
    isLocating,
  } = useTransformers();

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    {
      id: 'landing' as NavTab,
      label: 'หน้าเริ่มระบบ (Portal)',
      icon: <Home className="w-5 h-5" />,
      tag: 'Gateways',
    },
    {
      id: 'dashboard' as NavTab,
      label: 'แดชบอร์ดภาพรวม',
      icon: <LayoutDashboard className="w-5 h-5" />,
      tag: `${transformers.length} เครื่อง`,
    },
    {
      id: 'detail' as NavTab,
      label: 'ข้อมูลหม้อแปลงและแผนที่',
      icon: <MapPin className="w-5 h-5" />,
      tag: 'GIS สด',
    },
    {
      id: 'linecutout' as NavTab,
      label: 'ฟิวส์ตัดไลน์ (Line Cutout)',
      icon: <Layers className="w-5 h-5" />,
      tag: `${lineCutouts?.length || 20} จุดสายสาขา`,
    },
    {
      id: 'calculator' as NavTab,
      label: 'คำนวณขนาดฟิวส์ (กฟภ.)',
      icon: <Calculator className="w-5 h-5" />,
      tag: 'เครื่องมือ',
    },
    {
      id: 'admin' as NavTab,
      label: 'ระบบจัดการข้อมูล (แอดมิน)',
      icon: <ShieldCheck className="w-5 h-5" />,
      tag: userRole === 'guest' ? 'ต้องล็อกอิน' : 'Admin Active',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-20 left-0 bottom-0 z-50 lg:z-10 w-72 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } max-h-screen lg:max-h-[calc(100vh-5rem)]`}
      >
        {/* Substation & SCADA Identity Panel */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-auto px-1.5 py-0.5 bg-white border border-amber-300/70 rounded-lg flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/rmutl-logo.png"
                alt="มทร.ล้านนา (RMUTL)"
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#006948] flex items-center justify-center text-white shadow-xs shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate">มทร.ล้านนา • PEA</span>
              <span className="text-[10px] text-slate-500 font-medium truncate">กฟส.บ้านโฮ่ง จ.ลำพูน</span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg flex flex-col gap-1.5 border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">SCADA Frequency</span>
              <span className="text-[#006948] font-bold">50.01 Hz</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">สถานะฐานข้อมูล</span>
              <span className="inline-flex items-center gap-1.5 text-[#006948] font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
                ออนไลน์ (ซิงก์)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">โหมดการเขียน</span>
              <span
                className={`font-semibold text-[11px] ${
                  userRole === 'guest' ? 'text-amber-700' : 'text-[#006948]'
                }`}
              >
                {userRole === 'guest' ? 'อ่านอย่างเดียว (Guest)' : 'เปิดใช้สิทธิ์แอดมิน'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-[#006948] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                    }`}
                  >
                    {link.tag}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick GPS Nearby Radar Button in Sidebar */}
          <button
            type="button"
            onClick={openNearbyModal}
            className="w-full mt-2 p-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Compass className={`w-4 h-4 text-emerald-200 group-hover:rotate-45 transition-transform ${isLocating ? 'animate-spin' : ''}`} />
              <span>หาหม้อแปลงใกล้ฉัน (GPS)</span>
            </div>
            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono uppercase">
              Radar
            </span>
          </button>
        </div>

        {/* Live Sync Bridge Channel Card */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#006948] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              LIVE SYNC BRIDGE
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-200 text-emerald-900">
              REALTIME
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            เชื่อมโยงสองทางผ่าน <code className="bg-white px-1 py-0.5 rounded text-[#006948] font-mono text-[10px] border border-emerald-100">localStorage</code> และ <code className="bg-white px-1 py-0.5 rounded text-[#006948] font-mono text-[10px] border border-emerald-100">BroadcastChannel</code> อัปเดตข้อมูลทุกหน้าจอโดยอัตโนมัติ
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleNav('dashboard')}
              className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-200 shadow-xs transition-colors"
            >
              <span>ดูแดชบอร์ด</span>
            </button>
            <button
              onClick={() => handleNav('detail')}
              className="py-1.5 px-2 rounded bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-200 shadow-xs transition-colors"
            >
              <span>ดูแผนที่หม้อแปลง</span>
            </button>
          </div>
        </div>

        {/* Audit Trail Card */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              บันทึกระบบล่าสุด (Audit Trail)
            </span>
          </div>
          <ul className="flex flex-col gap-2 text-xs text-slate-600">
            {auditLogs.slice(0, 4).map((item) => {
              let dotColor = 'text-[#006948]';
              if (item.type === 'error') dotColor = 'text-red-500';
              if (item.type === 'warning') dotColor = 'text-amber-500';

              return (
                <li key={item.id} className="flex items-start gap-1.5 leading-snug">
                  <span className={`${dotColor} font-bold text-sm leading-none`}>•</span>
                  <span className="text-[11px]">{item.message}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Public Mode Display Card (Read-only, without user switcher) */}
        <div className="mt-auto bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex items-center gap-2.5 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-emerald-100/90 text-[#006948] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
            <Globe className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
              โหมดสาธารณะ
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              บุคคลทั่วไป • การเข้าถึงแบบสาธารณะ
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
