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
  Layers,
  User,
  Sparkles,
  Check,
  GraduationCap,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setActiveTab, transformers, userRole } = useTransformers();

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between font-sans relative overflow-hidden select-none bg-emerald-50/20">
      {/* Background Image: User Attached Transformer & Protection Infrastructure */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/0074548e-a930-4474-adc7-abd040964db6.png"
          onError={(e) => {
            e.currentTarget.src = '/transformer-bg.jpg';
          }}
          alt="Electrical Transformer and Protective Fuse Infrastructure"
          className="w-full h-full object-cover object-center scale-100 filter brightness-[0.98] contrast-[1.02]"
          referrerPolicy="no-referrer"
        />
        {/* Soft, soothing atmospheric wash (สีซอฟๆ) that keeps the transformer picture vividly visible while providing soothing pastel-glass contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45 sm:to-white/50 backdrop-blur-[0.8px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/70 via-transparent to-white/80" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* TOP BAR - Soft Glassmorphism */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 sm:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10 shadow-xs">
        {/* Brand Left: Official RMUTL Emblem + Institution Details */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Official RMUTL Emblem Badge */}
          <div className="relative group shrink-0">
            <div className="w-10 h-12 sm:w-13 sm:h-16 flex items-center justify-center p-1 bg-white rounded-xl shadow-md border border-amber-300/70 backdrop-blur-md transition-transform group-hover:scale-105">
              <img
                src="/rmutl-logo.png"
                alt="ตรามหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา"
                className="h-full w-auto object-contain drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 uppercase font-sans truncate">
                มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                RMUTL
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-[#006948] tracking-wider truncate">
                PEA SMART TRANSFORMER SYSTEM
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 hidden sm:inline-block shrink-0">
                FIELD READY v4.2
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-600 hidden md:inline truncate">
              ระบบบริหารจัดการโหลดและพิกัดอุปกรณ์ป้องกันหม้อแปลงไฟฟ้า (เขตพื้นที่ อ.บ้านโฮ่ง)
            </span>
          </div>
        </div>

        {/* Telemetry Status & Role Indicator Right */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-slate-700 font-mono text-[11px] shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CENTRAL SCADA: <strong className="text-emerald-700">ONLINE</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">50.02 Hz</span>
          </div>

          {/* Role Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold pointer-events-none cursor-default select-none shadow-xs backdrop-blur-sm shrink-0 ${
              userRole === 'superadmin'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : userRole === 'admin'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {userRole === 'superadmin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>ซูเปอร์แอดมิน</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ผู้ดูแลระบบ</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>โหมดสาธารณะ</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-12 flex flex-col justify-center z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Hero text & action */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-5">
            {/* Tag chip: ระบบบริหารข้อมูลวิศวกรรม (Soft Mint) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300/80 text-emerald-800 text-[11px] sm:text-xs font-semibold w-fit shadow-xs backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="leading-snug">ระบบบริหารข้อมูลวิศวกรรมและการคำนวณอุปกรณ์ป้องกัน กฟภ.</span>
            </div>

            {/* Student Project Affiliation (Soft Warm Amber Glass) */}
            <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3 sm:p-3.5 backdrop-blur-md text-xs sm:text-sm text-slate-800 shadow-sm flex items-start gap-2.5 sm:gap-3 max-w-2xl">
              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-200/60 text-amber-800 shrink-0 mt-0.5 border border-amber-300">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-amber-800 tracking-wider uppercase font-mono">
                  โครงงานวิศวกรรมไฟฟ้า มทร.ล้านนา (RMUTL)
                </div>
                <p className="text-slate-700 font-medium leading-relaxed break-words text-[11px] sm:text-sm">
                  ภายใต้โครงงานนักศึกษา เรื่อง ระบบจัดการโหลดเพื่อแสดงข้อมูลตำแหน่งที่ตั้งพร้อมอุปกรณ์ป้องกันในระบบจำหน่ายไฟฟ้า ของเขตพื้นที่อำเภอบ้านโฮ่ง ผ่านเว็บไซต์
                </p>
              </div>
            </div>

            {/* Main Headline - High contrast readable soft colors */}
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight drop-shadow-xs break-words">
                Smart Transformer Load &amp;
              </h1>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-[#006948] drop-shadow-xs break-words">
                Protection Management
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-base text-slate-700 leading-relaxed max-w-2xl break-words">
              ศูนย์กลางการติดตามสถานะหม้อแปลงไฟฟ้าแบบเรียลไทม์ ตรวจสอบพารามิเตอร์ วิเคราะห์โหลด คำนวณขนาดฟิวส์แรงสูง (High-Voltage Fuse Links) ตามมาตรฐาน กฟภ. พร้อมระบบแผนที่พิกัดดาวเทียมสำหรับทีมช่างหน้างาน
            </p>

            {/* Equipment Recognition Badge (Soft Pastel Pills) */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-700 pt-0.5">
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/90 border border-slate-200 font-mono text-emerald-800 flex items-center gap-1.5 shadow-xs backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>หม้อแปลงจำหน่ายแขวนเสา &amp; ลานหม้อแปลง</span>
              </span>
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/90 border border-slate-200 font-mono text-teal-800 flex items-center gap-1.5 shadow-xs backdrop-blur-sm">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ดรอปเอาท์ฟิวส์คัทเอาท์ (Drop-out Fuse &amp; Fuse Link)</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#006948] hover:bg-[#00573c] active:scale-[0.98] text-white font-bold text-xs sm:text-base flex items-center justify-center gap-2 sm:gap-2.5 shadow-md shadow-emerald-900/20 border border-emerald-500/40 transition-all cursor-pointer min-h-[44px]"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>กดเริ่มต้นเข้าสู่ระบบ (Start Application)</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('calculator')}
                className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs backdrop-blur-sm transition-all cursor-pointer min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>คำนวณฟิวส์ PEA ด่วน</span>
              </button>
            </div>

            {/* Metric KPI Cards (Bottom Left) - Soft Crisp Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full sm:max-w-sm">
              <div className="bg-white/90 border border-emerald-100 p-3 sm:p-3.5 rounded-xl flex flex-col shadow-xs backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">ACTIVE FLEET</span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#006948] mt-0.5">
                  {transformers.length} เครื่อง
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">100% เชื่อมต่อปกติ</span>
              </div>

              <div className="bg-white/90 border border-emerald-100 p-3 sm:p-3.5 rounded-xl flex flex-col shadow-xs backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">DATABASE</span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#006948] mt-0.5">
                  Synced
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">SCADA Live State</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Gateways Box (Soft Frosted Glass) */}
          <div className="lg:col-span-5">
            <div className="bg-white/90 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col gap-3 sm:gap-4 relative">
              {/* Header inside gateways */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2.5 sm:pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-emerald-800 uppercase font-mono tracking-wider">
                    เลือกโมดูลที่ต้องการใช้งาน (SYSTEM GATEWAYS)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Single Central DB</span>
              </div>

              {/* Gateway 1: Public Overview Dashboard */}
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className="w-full text-left p-3 sm:p-3.5 rounded-xl bg-slate-50/90 hover:bg-emerald-50/90 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shrink-0">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#006948] transition-colors truncate">
                        Public Overview Dashboard
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        เปิดดูทันที
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 break-words">
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
                className="w-full text-left p-3 sm:p-3.5 rounded-xl bg-slate-50/90 hover:bg-teal-50/90 border border-slate-200/80 hover:border-teal-300 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:scale-105 transition-transform shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-800 transition-colors truncate">
                        Transformer Detail &amp; GPS Map
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                        พิกัดเสาไฟ
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 break-words">
                      ข้อมูลวิศวกรรมเชิงลึก แผนที่ดาวเทียม และปุ่มเปิดพิกัด Google Maps
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Gateway 2.5: Line Cutout Management & Load Sizing */}
              <button
                type="button"
                onClick={() => handleNavigate('linecutout')}
                className="w-full text-left p-3 sm:p-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/90 hover:border-amber-300 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 group-hover:scale-105 transition-transform shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                        ฟิวส์ตัดไลน์สายสาขา (Line Cutout)
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300 shrink-0 font-bold">
                        คำนวณรวมโหลด
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 break-words">
                      รวมโหลดหม้อแปลงในฟิวส์ตัดไลน์ คำนวณขนาดฟิวส์ใหม่ และดูรายชื่อหม้อแปลงในสาย
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-800 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Gateway 3: PEA Fuse Sizing Calculator */}
              <button
                type="button"
                onClick={() => handleNavigate('calculator')}
                className="w-full text-left p-3 sm:p-3.5 rounded-xl bg-slate-50/90 hover:bg-amber-50/90 border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                        PEA Fuse Sizing Calculator
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        สูตร กฟภ.
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 break-words">
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
                className="w-full text-left p-3 sm:p-3.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-slate-800 transition-colors truncate">
                        Backend Management (Admin)
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 border border-slate-300 shrink-0">
                        ความปลอดภัย
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 line-clamp-1 break-words">
                      จัดการฐานข้อมูลหม้อแปลง (CRUD), อนุมัติวิศวกรผู้ใช้งาน
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Card Footer notice */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#006948] shrink-0" />
                  <span>สลับเมนูได้ตลอดเวลาผ่านแถบเมนูด้านซ้ายและด้านล่าง</span>
                </span>
                <span className="font-mono text-[#006948] font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
