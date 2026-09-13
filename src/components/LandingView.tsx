import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { NavTab } from '../types';
import {
  Zap,
  Play,
  FileText,
  LayoutDashboard,
  MapPin,
  Lock,
  ChevronRight,
  ShieldCheck,
  User,
  Sparkles,
  Check,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setActiveTab, transformers, metrics, userRole } = useTransformers();

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7f4] via-[#f8faf9] to-[#edf4f0] text-slate-800 flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Background ambient lighting effects - Soft, soothing pastels */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP BAR */}
      <header className="w-full border-b border-emerald-950/10 bg-white/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006948] to-[#004d35] flex items-center justify-center text-white shadow-md shadow-emerald-950/15 shrink-0 border border-emerald-600/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 uppercase font-mono">
                PEA SMART TRANSFORMER SYSTEM
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-[#006948] border border-emerald-200">
                FIELD READY v4.2
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              ระบบบริหารจัดการโหลดและพิกัดอุปกรณ์ป้องกันหม้อแปลงไฟฟ้า
            </span>
          </div>
        </div>

        {/* Telemetry Status & Admin Command Right */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-200/80 text-slate-700 font-mono text-[11px] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            <span>CENTRAL SCADA: <strong className="text-[#006948]">ONLINE</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">50.02 Hz</span>
          </div>

          {/* Role Status Indicator - Non-clickable */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold pointer-events-none cursor-default select-none shadow-xs ${
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
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Hero text & action */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-[#006948] text-xs font-semibold w-fit shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบบริหารข้อมูลวิศวกรรมและการคำนวณอุปกรณ์ป้องกัน กฟภ.</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Smart Transformer Load &amp;
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-[#006948]">
                Protection Management
              </h1>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              ศูนย์กลางการติดตามสถานะหม้อแปลงไฟฟ้าแบบเรียลไทม์ ตรวจสอบพารามิเตอร์ วิเคราะห์โหลด คำนวณขนาดฟิวส์แรงสูง (High-Voltage Fuse Links) ตามมาตรฐาน กฟภ. พร้อมระบบแผนที่พิกัดดาวเทียมสำหรับทีมช่างหน้างาน
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-[#006948] hover:bg-[#005137] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>กดเริ่มต้นเข้าสู่ระบบ (Start Application)</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('calculator')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-750 border border-slate-200/90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#006948]" />
                <span>คำนวณฟิวส์ PEA ด่วน</span>
              </button>
            </div>

            {/* Metric KPI Cards (Bottom Left) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2 sm:pt-4">
              <div className="bg-white/90 border border-emerald-100/90 p-3 sm:p-4 rounded-xl flex flex-col shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">ACTIVE FLEET</span>
                <span className="text-lg sm:text-2xl font-mono font-bold text-[#006948] mt-1">
                  {transformers.length} เครื่อง
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">100% เชื่อมต่อปกติ</span>
              </div>

              <div className="bg-white/90 border border-emerald-100/90 p-3 sm:p-4 rounded-xl flex flex-col shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">CAPACITY</span>
                <span className="text-lg sm:text-2xl font-mono font-bold text-[#006948] mt-1">
                  {metrics.totalKva.toLocaleString()} kVA
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">เขต 3 กฟภ.</span>
              </div>

              <div className="bg-white/90 border border-emerald-100/90 p-3 sm:p-4 rounded-xl flex flex-col shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">DATABASE</span>
                <span className="text-lg sm:text-2xl font-mono font-bold text-[#006948] mt-1">
                  Synced
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">SCADA Live State</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Gateways Box */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 border border-emerald-100/90 rounded-2xl p-5 sm:p-6 shadow-xl shadow-emerald-950/5 flex flex-col gap-3.5 sm:gap-4 relative">
              {/* Header inside gateways */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#006948] uppercase font-mono tracking-wider">
                    เลือกโมดูลที่ต้องการใช้งาน (SYSTEM GATEWAYS)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Single Central DB</span>
              </div>

              {/* Gateway 1: Public Overview Dashboard */}
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-200/60 flex items-center justify-center text-[#006948] group-hover:scale-105 transition-transform shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-[#006948] transition-colors">
                        Public Overview Dashboard
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-[#006948] border border-emerald-200">
                        เปิดดูทันที
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      แดชบอร์ดภาพรวมหม้อแปลงไฟฟ้า สถานะโหลด (ปกติ / เฝ้าระวัง / วิกฤต)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#006948] group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Gateway 2: Transformer Detail & GPS Map */}
              <button
                type="button"
                onClick={() => handleNavigate('detail')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/70 border border-teal-200/60 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-teal-800 transition-colors">
                        Transformer Detail &amp; GPS Map
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-200">
                        พิกัดเสาไฟ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      ข้อมูลวิศวกรรมเชิงลึก แผนที่ดาวเทียม และปุ่มเปิดพิกัด Google Maps
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Gateway 3: PEA Fuse Sizing Calculator */}
              <button
                type="button"
                onClick={() => handleNavigate('calculator')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-amber-800 transition-colors">
                        PEA Fuse Sizing Calculator
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        สูตร กฟภ.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      คำนวณ Full Load Current, Fuse Link Type K/T ตามเกณฑ์มาตรฐาน กฟภ.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Gateway 4: Backend Management (Admin) */}
              <button
                type="button"
                onClick={() => handleNavigate('admin')}
                className="w-full text-left p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200/70 border border-slate-300/60 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-slate-950 transition-colors">
                        Backend Management (Admin)
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        ความปลอดภัย
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      จัดการฐานข้อมูลหม้อแปลง (CRUD), อนุมัติวิศวกรผู้ใช้งาน
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Card Footer notice */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#006948]" />
                  <span>สามารถสลับเมนูได้ตลอดเวลาผ่านแถบเมนูด้านซ้ายและด้านล่าง</span>
                </span>
                <span className="font-mono text-[#006948] font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-emerald-950/10 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
          <span>PEA Compliant System • Smart Grid Telemetry &amp; Fault Protection Engine v4.2.0</span>
        </div>
        <div>
          <span>© 2024 Provincial Electricity Authority &amp; Industrial Grid Operations. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
};
