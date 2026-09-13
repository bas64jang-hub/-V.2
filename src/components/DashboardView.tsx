import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { Transformer } from '../types';
import {
  Zap,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Gauge,
  Compass,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    transformers,
    setSelectedId,
    setActiveTab,
    metrics,
    triggerSync,
  } = useTransformers();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'warning' | 'critical' | 'high-cap'>('all');

  // Filtered transformers list
  const filteredTransformers = useMemo(() => {
    return transformers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.poleId.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (activeFilter === 'normal') return t.status === 'normal' || t.percent <= 80;
      if (activeFilter === 'warning') return t.status === 'warning' || (t.percent > 80 && t.percent <= 90);
      if (activeFilter === 'critical') return t.status === 'critical' || t.percent > 90;
      if (activeFilter === 'high-cap') return t.kva >= 1000;

      return true;
    });
  }, [transformers, searchQuery, activeFilter]);

  const handleSelectTransformer = (id: string) => {
    setSelectedId(id);
    setActiveTab('detail');
  };

  const handleEditInAdmin = (id: string) => {
    setSelectedId(id);
    setActiveTab('admin');
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-5 w-full">
      {/* Top Banner & Title Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-0.5">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span className="text-[#006948]">แดชบอร์ดภาพรวมการจ่ายโหลด (SCADA Grid)</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ระบบติดตามและโหลดหม้อแปลง กฟภ.</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] border border-emerald-200">
              SCADA LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            โครงข่ายจำหน่าย 22 kV / 33 kV พร้อมระบบป้องกันฟิวส์และเฝ้าระวังอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerSync}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
            title="กดเพื่อทดสอบส่งสัญญาณซิงค์ข้อมูล"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#006948]" />
            <span>ซิงค์ข้อมูล</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>+ ปรับพิกัด</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Summary Cards (Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {/* Metric 1: Total */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">ทั้งหมด</span>
            <Zap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.total}
            </span>
            <span className="text-[11px] text-slate-500">เครื่อง</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ออนไลน์ 100%</span>
          </div>
        </div>

        {/* Metric 2: Normal */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">ปกติ (≤80%)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#006948]">
              {metrics.normal}
            </span>
            <span className="text-[11px] text-slate-500">เครื่อง</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#006948] h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.total ? (metrics.normal / metrics.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Warning */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">เฝ้าระวัง</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600">
              {metrics.warning}
            </span>
            <span className="text-[11px] text-slate-500">เครื่อง</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.total ? (metrics.warning / metrics.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Critical */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600">วิกฤต (&gt;90%)</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-red-600">
              {metrics.critical}
            </span>
            <span className="text-[11px] text-slate-500">เครื่อง</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.total ? (metrics.critical / metrics.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 5: Total Capacity */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">กำลังไฟฟ้ารวม</span>
            <Activity className="w-3.5 h-3.5 text-[#006948]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {metrics.totalMva}
            </span>
            <span className="text-[11px] text-slate-500">MVA</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            โหลด: <strong className="text-slate-800 font-sans">{metrics.totalActiveKva.toLocaleString()} kVA</strong> ({metrics.avgLoadPercent}%)
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัสหม้อแปลง, ชื่อโซน, เสา กฟภ. ..."
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006948] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({transformers.length})
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'normal'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ปกติ
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            เฝ้าระวัง
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            วิกฤต
          </button>
          <button
            onClick={() => setActiveFilter('high-cap')}
            className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'high-cap'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ≥1,000 kVA
          </button>
        </div>
      </div>

      {/* Transformer Cards Grid */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#006948]" />
            <span>รายการหม้อแปลง ({filteredTransformers.length} เครื่อง)</span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">50.01 Hz SCADA OK</span>
        </div>

        {filteredTransformers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
            <Search className="w-7 h-7 text-slate-300" />
            <span className="font-bold text-slate-700 text-sm">ไม่พบหม้อแปลงที่ตรงกับคำค้นหา</span>
            <p className="text-xs text-slate-500">กรุณาลองปรับคำค้นหา หรือเลือกตัวกรองเป็น 'ทั้งหมด'</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-1 px-3 py-1.5 bg-[#006948] text-white rounded-lg text-xs font-semibold"
            >
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredTransformers.map((unit) => {
              const isCrit = unit.percent > 90 || unit.status === 'critical';
              const isWarn = !isCrit && (unit.percent > 80 || unit.status === 'warning');

              let badgeBg = 'bg-emerald-50 text-[#006948] border-emerald-200';
              let barBg = 'bg-[#006948]';
              let statusLabel = 'ปกติ';

              if (isCrit) {
                badgeBg = 'bg-red-50 text-red-700 border-red-200';
                barBg = 'bg-red-600';
                statusLabel = 'วิกฤต (>90%)';
              } else if (isWarn) {
                badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                barBg = 'bg-amber-500';
                statusLabel = 'เฝ้าระวัง';
              }

              const mapsUrl = `https://maps.google.com/?q=${unit.lat},${unit.lng}`;

              return (
                <div
                  key={unit.id}
                  className={`bg-white rounded-xl p-3.5 sm:p-4 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isCrit
                      ? 'border-red-300 ring-1 ring-red-200'
                      : isWarn
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm sm:text-base font-mono text-slate-900">{unit.id}</span>
                          {unit.isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#006948] text-white uppercase">
                              NEW
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">({unit.voltage.split(' ')[0]})</span>
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-800 leading-snug mt-0.5 truncate">
                          {unit.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{unit.area}</span>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold shrink-0 font-mono ${badgeBg}`}>
                        {statusLabel}
                      </div>
                    </div>

                    {/* Capacity & Load Matrix Box */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                          พิกัด (Rating)
                        </span>
                        <div className="font-mono text-base sm:text-lg font-bold text-slate-900">
                          {unit.kva.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kVA</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                          โหลดใช้งานจริง
                        </span>
                        <div className="font-mono text-base sm:text-lg font-bold text-[#006948]">
                          {unit.loadKva.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kVA</span>
                        </div>
                      </div>
                    </div>

                    {/* Loading Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 text-[11px]">อัตราส่วนโหลด:</span>
                        <span
                          className={`font-bold text-xs sm:text-sm ${
                            isCrit ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-[#006948]'
                          }`}
                        >
                          {unit.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                          style={{ width: `${Math.min(unit.percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Technical Specs Tags */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block">เสาไฟฟ้า กฟภ.</span>
                        <span className="font-bold text-slate-800 truncate block">{unit.poleId}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200/60">
                        <span className="text-[9px] text-slate-400 block">ฟิวส์แรงสูง กฟภ.</span>
                        <span className="font-bold text-slate-800 truncate block">{unit.fuse}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectTransformer(unit.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>ข้อมูล & แผนที่</span>
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-200 transition-colors flex items-center justify-center"
                      title="เปิดนำทาง Google Maps"
                    >
                      <Compass className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleEditInAdmin(unit.id)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200"
                      title="แก้ไขสเปก"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Architectural Insights: Single Line Diagram & Substation Area Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* SLD Mimic Card */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#006948] animate-pulse"></span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  ผังวงจรจำหน่ายไฟฟ้าและสถานะระบบย่อย (Single Line Diagram - SLD)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948] border border-emerald-200">
                Dyn11 22kV 50Hz
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              แผนภาพเส้นเดี่ยวแสดงการเชื่อมโยงระบบสายส่งแรงสูงเข้าสู่หม้อแปลงจำหน่าย พร้อมระบบป้องกันและเบรกเกอร์ตัดวงจร
            </p>
          </div>

          {/* SVG SLD Circuit Diagram */}
          <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto flex items-center justify-center">
            <svg
              className="w-full max-w-[650px] h-44 text-slate-800 select-none"
              fill="none"
              viewBox="0 0 650 180"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 22kV Main Busbar */}
              <line x1="30" y1="30" x2="620" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <text x="35" y="22" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">
                บัสหลัก 1 • 22kV 3 เฟส 50Hz (สถานีไฟฟ้านครราชสีมา 2)
              </text>

              {/* Feeder 1: TR-001 */}
              <line x1="120" y1="30" x2="120" y2="60" stroke="currentColor" strokeWidth="2" />
              <rect x="112" y="60" width="16" height="16" rx="2" className="fill-[#006948]" />
              <line x1="120" y1="76" x2="120" y2="92" stroke="currentColor" strokeWidth="2" />
              <circle cx="120" cy="100" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="120" cy="112" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="120" y1="122" x2="120" y2="145" stroke="currentColor" strokeWidth="2" />
              <rect x="114" y="145" width="12" height="12" rx="1" className="fill-[#006948]" />
              <text x="135" y="106" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="9">
                {transformers[0]?.id || 'TR-001'} ({transformers[0]?.kva || 500}kVA)
              </text>
              <text x="135" y="120" fill="#006948" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="600">
                {transformers[0]?.percent || 65}% ปกติ
              </text>

              {/* Feeder 2: TR-002 */}
              <line x1="320" y1="30" x2="320" y2="60" stroke="currentColor" strokeWidth="2" />
              <rect x="312" y="60" width="16" height="16" rx="2" className="fill-amber-500" />
              <line x1="320" y1="76" x2="320" y2="92" stroke="currentColor" strokeWidth="2" />
              <circle cx="320" cy="100" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="320" cy="112" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="320" y1="122" x2="320" y2="145" stroke="currentColor" strokeWidth="2" />
              <rect x="314" y="145" width="12" height="12" rx="1" className="fill-amber-500" />
              <text x="335" y="106" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="9">
                {transformers[1]?.id || 'TR-002'} ({transformers[1]?.kva || 1000}kVA)
              </text>
              <text x="335" y="120" fill="#d97706" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="600">
                {transformers[1]?.percent || 85}% เฝ้าระวัง
              </text>

              {/* Feeder 3: TR-003 */}
              <line x1="520" y1="30" x2="520" y2="60" stroke="currentColor" strokeWidth="2" />
              <rect x="512" y="60" width="16" height="16" rx="2" className="fill-red-600" />
              <line x1="520" y1="76" x2="520" y2="92" stroke="currentColor" strokeWidth="2" />
              <circle cx="520" cy="100" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="520" cy="112" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="520" y1="122" x2="520" y2="145" stroke="currentColor" strokeWidth="2" />
              <rect x="514" y="145" width="12" height="12" rx="1" className="fill-red-600" />
              <text x="535" y="106" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="9">
                {transformers[2]?.id || 'TR-003'} ({transformers[2]?.kva || 1600}kVA)
              </text>
              <text x="535" y="120" fill="#dc2626" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="600">
                {transformers[2]?.percent || 95}% วิกฤต
              </text>

              {/* Ground line */}
              <line x1="50" y1="165" x2="600" y2="165" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="50" y="176" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="8" opacity="0.75">
                ระบบต่อลงดินชนิดโซลิดกราวด์ • สายนิวทรัลร่วมแรงต่ำ (PEA TN-C-S)
              </text>
            </svg>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>กลุ่มเวกเตอร์: Dyn11</span>
            <span>ความถี่ระบบ: 50.01 Hz ± 0.02</span>
          </div>
        </div>

        {/* Substation Area Overview Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                ภาพรวมกำลังไฟฟ้าเขตพื้นที่
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948]">
                PEA Zone 3
              </span>
            </div>

            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 border border-slate-200">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu55H6XQKlW92ZAgNrCKFvLthZcQgUjsm2V7ic0AbjlVYqKp3s4m6_S6Q2WaClYJTzn7B7oC4zoh6MOZJC5UgHe0pEFFsJ4174USYgtoNlXm5Yd1Q8chZdjKZK9Neb0KFiunt66bkBRvXVw7nw99FHubUYiigWHDVJWRfQpCzrY0e4l3a6LirrB_Ika51UUrdHAfxnavZxmu-Vg4ApYa-Il-B_tmLzcmbuP5tcWDZidVLce31zYnrYTA"
                alt="สถานีไฟฟ้าย่อยนิคมอุตสาหกรรม"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-xs font-semibold leading-tight">
                  สถานีไฟฟ้าย่อยนิคมอุตสาหกรรมนครราชสีมา กฟภ. วงจรรวม #4
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-600 font-medium">กำลังไฟฟ้าจ่ายจริง (Active Power):</span>
                <span className="font-mono font-bold text-sm text-slate-900">{metrics.activeMw} MW</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-600 font-medium">ค่าฮาร์มอนิกส์รวม THD (แรงดัน):</span>
                <span className="font-mono font-bold text-[#006948]">1.8% (เกณฑ์ IEEE 519)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-600 font-medium">ฟิวส์แรงสูงแนะนำ กฟภ.:</span>
                <span className="text-slate-900 font-bold">ชนิด Type K / Type T มาตรฐาน</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('calculator')}
              className="text-xs font-bold text-[#006948] hover:underline flex items-center gap-1"
            >
              <span>เปิดเครื่องมือคำนวณขนาดฟิวส์ →</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <span>ระบบหลังบ้าน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
