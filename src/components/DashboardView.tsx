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
    lineCutouts,
    setSelectedLineCutoutId,
    openNearbyModal,
    isLocating,
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
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-500 mb-0.5">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span className="text-[#006948] truncate">แดชบอร์ดภาพรวมการจ่ายโหลด (SCADA Grid)</span>
          </div>
          <h1 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>ระบบติดตามและโหลดหม้อแปลง กฟภ.</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#006948] border border-emerald-200 shrink-0">
              SCADA LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 break-words">
            โครงข่ายจำหน่าย 22 kV / 33 kV พร้อมระบบป้องกันฟิวส์และเฝ้าระวังอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openNearbyModal}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer min-h-[36px]"
            title="กดเพื่อตรวจหาพิกัดตำแหน่งของฉัน & แสดงหม้อแปลงใกล้เคียง"
          >
            <Compass className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>หม้อแปลงใกล้ฉัน (GPS)</span>
          </button>
          <button
            onClick={triggerSync}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs cursor-pointer min-h-[36px]"
            title="คลิกเพื่อทดสอบส่งสัญญาณซิงก์ข้อมูล"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#006948]" />
            <span>ซิงก์ข้อมูล</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[36px]"
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

      {/* Line Cutout Overview Callout Card */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50/40 p-3.5 sm:p-4 rounded-xl border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                ระบบฟิวส์ตัดไลน์ (Line Cutout) สายสาขา
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                {lineCutouts?.length || 20} จุดควบคุม
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              ดูการจัดกลุ่มหม้อแปลงในสายสาขา รวมโหลดจริง คำนวณหาขนาดฟิวส์ตัดไลน์ใหม่ตามสูตร กฟภ.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('linecutout')}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <span>ตรวจสอบฟิวส์ตัดไลน์ทั้งหมด</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
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
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-sm sm:text-base font-mono text-slate-900">{unit.id}</span>
                          {unit.isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#006948] text-white uppercase shrink-0">
                              NEW
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">({unit.voltage.split(' ')[0]})</span>
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-800 leading-snug mt-0.5 truncate" title={unit.name}>
                          {unit.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 min-w-0">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{unit.area}</span>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold shrink-0 font-mono ${badgeBg}`}>
                        {statusLabel}
                      </div>
                    </div>

                    {/* Capacity & Load Matrix Box */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-semibold text-slate-400 block truncate">
                          พิกัด (Rating)
                        </span>
                        <div className="font-mono text-base sm:text-lg font-bold text-slate-900 truncate">
                          {unit.kva.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kVA</span>
                        </div>
                      </div>

                      <div className="text-right min-w-0">
                        <span className="text-[9px] uppercase font-semibold text-slate-400 block truncate">
                          โหลดใช้งานจริง
                        </span>
                        <div className="font-mono text-base sm:text-lg font-bold text-[#006948] truncate">
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
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200/60 min-w-0">
                        <span className="text-[9px] text-slate-400 block truncate">เสาไฟฟ้า กฟภ.</span>
                        <span className="font-bold text-slate-800 truncate block">{unit.poleId}</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-200/60 min-w-0">
                        <span className="text-[9px] text-slate-400 block truncate">ฟิวส์แรงสูง กฟภ.</span>
                        <span className="font-bold text-slate-800 truncate block">{unit.fuse}</span>
                      </div>
                    </div>

                    {/* Assigned Line Cutout Badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (unit.lineCutoutId) {
                          setSelectedLineCutoutId(unit.lineCutoutId);
                          setActiveTab('linecutout');
                        }
                      }}
                      className="w-full p-1.5 bg-amber-50/80 hover:bg-amber-100/90 rounded border border-amber-200/90 text-left transition-colors flex items-center justify-between group/lc cursor-pointer"
                    >
                      <div className="min-w-0 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <div className="truncate text-[11px]">
                          <span className="font-mono font-bold text-amber-900 mr-1">
                            {unit.lineCutoutId || 'LC-01'}:
                          </span>
                          <span className="text-slate-700 truncate font-medium">
                            {unit.lineCutoutName || 'ฟิวส์ตัดไลน์สายสาขา'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight shrink-0 flex items-center gap-0.5 group-hover/lc:translate-x-0.5 transition-transform">
                        ดูสายนี้
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => handleSelectTransformer(unit.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer min-h-[36px]"
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">ข้อมูล &amp; แผนที่</span>
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 w-9 h-9 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                      title="เปิดนำทาง Google Maps"
                    >
                      <Compass className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleEditInAdmin(unit.id)}
                      className="py-1.5 px-2.5 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center"
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

      {/* Bottom Architectural Insights: Single Line Diagram (SLD) */}
      <div className="pt-2">
        {/* SLD Mimic Card */}
        <div className="w-full bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948] animate-pulse shrink-0"></span>
                <h3 className="font-bold text-xs sm:text-base text-slate-900 leading-snug">
                  ผังวงจรจำหน่ายไฟฟ้าและสถานะระบบย่อย (Single Line Diagram - SLD)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948] border border-emerald-200 shrink-0">
                Dyn11 22kV 50Hz
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 sm:mb-4 break-words">
              แผนภาพเส้นเดี่ยวแสดงการเชื่อมโยงระบบสายส่งแรงสูงเข้าสู่หม้อแปลงจำหน่าย พร้อมระบบป้องกันและเบรกเกอร์ตัดวงจร
            </p>
          </div>

          {/* SVG SLD Circuit Diagram with responsive horizontal scroll */}
          <div className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 overflow-x-auto flex items-center justify-start sm:justify-center">
            <svg
              className="w-full min-w-[620px] max-w-[720px] h-44 text-slate-800 select-none"
              fill="none"
              viewBox="0 0 650 180"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 22kV Main Busbar */}
              <line x1="30" y1="30" x2="620" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <text x="35" y="22" fill="currentColor" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="600">
                บัสหลัก 1 • 22kV 3 เฟส 50Hz (สถานีไฟฟ้าบ้านโฮ่ง จ.ลำพูน)
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

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-4 font-mono">
              <span>กลุ่มเวกเตอร์: Dyn11</span>
              <span>ความถี่ระบบ: 50.01 Hz ± 0.02</span>
            </div>
            <div className="flex items-center gap-3">
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
                <span>ระบบจัดการหม้อแปลง</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
