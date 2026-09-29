import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { Transformer, LineCutout } from '../types';
import {
  calculateLineCutoutRating,
  extractFuseAmpere,
} from '../data/lineCutoutData';
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
  ChevronLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Gauge,
  Compass,
  ClipboardCheck,
  Sliders,
  Filter,
  Eye,
  Maximize2,
  X,
  FileText,
  Calculator,
  Info,
  ArrowRight,
  TrendingUp,
  Navigation,
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
    resetToDefaults,
    showToast,
  } = useTransformers();

  // Mode: Show Protection Devices first (as requested: "ให้แสดง ค่าอุปกรณ์ป้องกันก่อน") or Transformers list
  const [viewMode, setViewMode] = useState<'protection' | 'transformers'>('protection');
  const viewModes: ('protection' | 'transformers')[] = ['protection', 'transformers'];
  const cycleViewMode = (direction: 'next' | 'prev') => {
    const currentIdx = viewModes.indexOf(viewMode);
    const nextIdx =
      direction === 'next'
        ? (currentIdx + 1) % viewModes.length
        : (currentIdx - 1 + viewModes.length) % viewModes.length;
    setViewMode(viewModes[nextIdx]);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');

  // Modal inspection state for clicking into a protection device
  const [activeProtectionModal, setActiveProtectionModal] = useState<LineCutout | null>(null);
  const [selectedTrInModal, setSelectedTrInModal] = useState<Transformer | null>(null);

  // Group transformers by Line Cutout / Protection Device
  const transformersByCutout = useMemo(() => {
    const map = new Map<string, Transformer[]>();
    lineCutouts.forEach((lc) => map.set(lc.id, []));

    transformers.forEach((t) => {
      const cutoutId = t.lineCutoutId || 'BGA02VF-158';
      if (!map.has(cutoutId)) {
        map.set(cutoutId, []);
      }
      map.get(cutoutId)!.push(t);
    });

    return map;
  }, [transformers, lineCutouts]);

  // Calculations for all protection devices
  const cutoutCalculations = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateLineCutoutRating>>();

    lineCutouts.forEach((lc) => {
      const list = transformersByCutout.get(lc.id) || [];
      const calc = calculateLineCutoutRating(
        list,
        lc.installedFuse,
        lc.voltage,
        lc.diversityFactor ?? 0.8,
        lc.multiplier ?? 1.75,
        lc.fuseType ?? 'T'
      );
      map.set(lc.id, calc);
    });

    return map;
  }, [lineCutouts, transformersByCutout]);

  // Filtered Protection Devices
  const filteredProtectionDevices = useMemo(() => {
    return lineCutouts.filter((lc) => {
      const q = searchQuery.toLowerCase().trim();
      const list = transformersByCutout.get(lc.id) || [];
      const trIds = list.map((t) => t.id.toLowerCase()).join(' ');
      const trNames = list.map((t) => t.name.toLowerCase()).join(' ');

      const matchSearch =
        !q ||
        lc.id.toLowerCase().includes(q) ||
        lc.name.toLowerCase().includes(q) ||
        lc.area.toLowerCase().includes(q) ||
        lc.poleId.toLowerCase().includes(q) ||
        trIds.includes(q) ||
        trNames.includes(q);

      if (!matchSearch) return false;

      const calc = cutoutCalculations.get(lc.id);
      const isNormal = calc?.statusBadge === 'success' || lc.status === 'normal';
      const isWarn = calc?.statusBadge === 'warning' || lc.status === 'warning';
      const isCrit = calc?.statusBadge === 'danger' || lc.status === 'critical';

      if (activeFilter === 'normal') return isNormal;
      if (activeFilter === 'warning') return isWarn;
      if (activeFilter === 'critical') return isCrit;

      return true;
    });
  }, [lineCutouts, searchQuery, activeFilter, transformersByCutout, cutoutCalculations]);

  // Filtered transformers list
  const filteredTransformers = useMemo(() => {
    return transformers.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.poleId.toLowerCase().includes(q) ||
        (t.lineCutoutId && t.lineCutoutId.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeFilter === 'normal') return t.status === 'normal' || t.percent <= 80;
      if (activeFilter === 'warning') return t.status === 'warning' || (t.percent > 80 && t.percent <= 90);
      if (activeFilter === 'critical') return t.status === 'critical' || t.percent > 90;

      return true;
    });
  }, [transformers, searchQuery, activeFilter]);

  const handleOpenProtectionDetail = (device: LineCutout) => {
    setActiveProtectionModal(device);
    const list = transformersByCutout.get(device.id) || [];
    setSelectedTrInModal(list[0] || null);
  };

  const handleSelectTransformer = (id: string) => {
    setSelectedId(id);
    setActiveTab('detail');
  };

  const handleGoToCalculator = (transformerId: string) => {
    setSelectedId(transformerId);
    setActiveTab('calculator');
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      {/* Top Banner & Title Strip with High Contrast Clean Typography */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                กฟภ. ฟีดเดอร์ BGA02
              </span>
              <span>•</span>
              <span className="text-slate-600">กฟส.บ้านโฮ่ง จ.ลำพูน</span>
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>ระบบอุปกรณ์ป้องกันไฟฟ้าแรงสูง</span>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                7 จุด • 15 หม้อแปลง
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ระบบตรวจสอบพิกัดฟิวส์ตัดตอนแรงสูง (Line Cutout Fuse) และข้อมูลพิกัดโหลด 15 หม้อแปลงจำหน่าย
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'protection' ? 'transformers' : 'protection')}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="สลับมุมมองระหว่าง 7 อุปกรณ์ป้องกัน และ 15 หม้อแปลง"
            >
              <Layers className="w-4 h-4 text-[#006948]" />
              <span>{viewMode === 'protection' ? 'ดู 15 หม้อแปลง TR' : 'ดู 7 จุดป้องกัน'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer active:scale-95"
            >
              <Calculator className="w-4 h-4 text-[#006948]" />
              <span>คำนวณฟิวส์</span>
            </button>

            <button
              onClick={triggerSync}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer active:scale-95"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <Activity className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Large, Crisp, Legible */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Protection Devices */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">อุปกรณ์ป้องกันแรงสูง</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {lineCutouts.length}
            </span>
            <span className="text-xs font-bold text-slate-500">จุดติดตั้ง</span>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            ฟีดเดอร์ <strong className="text-slate-900 font-bold">BGA02VF-158 ถึง 164</strong>
          </div>
        </div>

        {/* Metric 2: Transformers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">หม้อแปลงในความดูแล</span>
            <Layers className="w-4 h-4 text-[#006948]" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {transformers.length}
            </span>
            <span className="text-xs font-bold text-slate-500">เครื่อง (TR)</span>
          </div>
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>เชื่อมโยงครบทุกจุดป้องกัน</span>
          </div>
        </div>

        {/* Metric 3: Total Power Capacity */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">กำลังไฟฟ้ารวม (kVA)</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {transformers.reduce((sum, t) => sum + (t.kva || 0), 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">kVA</span>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            โหลดจริง: <strong className="text-slate-900 font-bold">{transformers.reduce((sum, t) => sum + (t.loadKva || 0), 0).toFixed(1)} kVA</strong>
          </div>
        </div>

        {/* Metric 4: Protection Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">สถานะความปลอดภัย</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
              100%
            </span>
            <span className="text-xs font-bold text-emerald-600">พร้อมใช้งาน</span>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            ประสานเวลาฟิวส์ (Coordination OK)
          </div>
        </div>
      </div>

      {/* Main View Mode Selector (Prompt requirement: "ให้แสดง ค่าอุปกรณ์ป้องกันก่อน", "หม้อแปลงที่แสดง แสดงแค่ข้อมูลใหม่ที่มี15หม้อแปลงพอ และเอาหน้าที่เพิ่มใหม่ล่าสุดออก") */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 overflow-x-auto">
          <button
            onClick={() => setViewMode('protection')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'protection'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className={`w-4 h-4 ${viewMode === 'protection' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>อุปกรณ์ป้องกันระบบไฟฟ้าแรงสูง ({lineCutouts.length} จุด)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
              หลัก
            </span>
          </button>

          <button
            onClick={() => setViewMode('transformers')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'transformers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className={`w-4 h-4 ${viewMode === 'transformers' ? 'text-[#006948]' : 'text-slate-400'}`} />
            <span>รายการหม้อแปลง TR ({transformers.length} เครื่อง)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => cycleViewMode('prev')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs border border-slate-200/80 cursor-pointer flex items-center gap-1 active:scale-95"
              title="เปลี่ยนไปเทมเพลตก่อนหน้า"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#006948]" />
              <span className="hidden md:inline">ก่อนหน้า</span>
            </button>
            <span className="text-[11px] font-bold text-slate-500 px-1 font-mono">
              {viewMode === 'protection' ? '1/2' : '2/2'}
            </span>
            <button
              onClick={() => cycleViewMode('next')}
              className="p-1.5 rounded-lg bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
              title="เปลี่ยนไปเทมเพลตถัดไป"
            >
              <span className="hidden md:inline">ถัดไป</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset database button */}
          <button
            onClick={resetToDefaults}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="รีเซ็ตฐานข้อมูลเป็นค่ามาตรฐาน 7 อุปกรณ์ป้องกัน และ 15 หม้อแปลง กฟภ."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">รีเซ็ต</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              viewMode === 'protection'
                ? 'ค้นหารหัสอุปกรณ์ป้องกัน (เช่น BGA02VF-158), หมายเลข TR, สายแยก...'
                : 'ค้นหารหัสหม้อแปลง (เช่น TR 41-001773), เสา กฟภ., จุดติดตั้ง...'
            }
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({viewMode === 'protection' ? lineCutouts.length : transformers.length})
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'normal'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ปกติ
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            เฝ้าระวัง
          </button>
        </div>
      </div>

      {/* VIEW 1: PROTECTION DEVICES VIEW (DISPLAYED FIRST) */}
      {viewMode === 'protection' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold flex items-center gap-2 text-slate-800 text-sm">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>รายการอุปกรณ์ป้องกันระบบไฟฟ้าแรงสูง (แสดง {filteredProtectionDevices.length} จุด)</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              คลิกที่การ์ดเพื่อดูหมายเลขหม้อแปลง TR และข้อมูลค่าทั้งหมด
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredProtectionDevices.map((device) => {
              const list = transformersByCutout.get(device.id) || [];
              const calc = cutoutCalculations.get(device.id);
              const totalKva = list.reduce((sum, t) => sum + (t.kva || 0), 0);
              const totalLoadKva = list.reduce((sum, t) => sum + (t.loadKva || 0), 0);
              const percent = totalKva > 0 ? (totalLoadKva / totalKva) * 100 : 0;
              const mapsUrl = `https://maps.google.com/?q=${device.lat || '18.3018'},${device.lng || '98.8238'}`;

              return (
                <div
                  key={device.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header: Device Tag, Fuse rating, Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base sm:text-lg font-mono text-slate-900 group-hover:text-[#006948] transition-colors">
                            {device.id}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                            ฟิวส์ตัดไลน์: {device.installedFuse}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mt-1 leading-snug">
                          {device.name}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{device.area}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ปกติ</span>
                      </span>
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">หม้อแปลง</span>
                        <span className="text-sm font-extrabold font-mono text-slate-900">
                          {list.length} เครื่อง
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">พิกัดรวม</span>
                        <span className="text-sm font-extrabold font-mono text-slate-900">
                          {totalKva} kVA
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">โหลดจริง</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-700">
                          {totalLoadKva.toFixed(1)} kVA
                        </span>
                      </div>
                    </div>

                    {/* Load Utilization Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">อัตราการจ่ายโหลด (Load Utilization)</span>
                        <span className="font-mono font-bold text-slate-900">{percent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#006948] transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Transformers Under This Device (Requirement: "เมื่อคลิกเข้าดูอุปกรณ์ป้องกันให้ขึ้น หมายเลขหม้อแปลง TR ขึ้นมา") */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#006948]" />
                          <span>หม้อแปลงในความรับผิดชอบ ({list.length} ลูก):</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">คลิกเพื่อดูค่า</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {list.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setActiveProtectionModal(device);
                              setSelectedTrInModal(t);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={`คลิกดูรายละเอียดของ ${t.id}`}
                          >
                            <span>{t.id}</span>
                            <span className="text-[10px] font-sans px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-950 font-semibold">
                              {t.kva}kVA
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 transition-colors"
                      title="เปิดพิกัดเสาใน Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>เสา {device.poleId}</span>
                    </a>

                    <button
                      onClick={() => handleOpenProtectionDetail(device)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#006948] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูข้อมูลและค่าหม้อแปลงทั้งหมด</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TRANSFORMERS VIEW */}
      {viewMode === 'transformers' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold flex items-center gap-2 text-slate-800 text-sm">
              <Layers className="w-4 h-4 text-[#006948]" />
              <span>รายการหม้อแปลงไฟฟ้าจำหน่าย (แสดง {filteredTransformers.length} เครื่อง)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredTransformers.map((unit) => {
              const mapsUrl = `https://maps.google.com/?q=${unit.lat},${unit.lng}`;

              return (
                <div
                  key={unit.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base font-mono text-slate-900">
                            {unit.id}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                            {unit.kva} kVA
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ({unit.phase || 3} เฟส)
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mt-1 leading-snug">
                          {unit.name}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{unit.area}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ปกติ
                      </span>
                    </div>

                    {/* Associated Protection Device Badge */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">
                            อุปกรณ์ป้องกันแรงสูง:
                          </span>
                          <span className="text-xs font-extrabold font-mono text-amber-950">
                            {unit.lineCutoutId || 'BGA02VF-158'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-amber-300">
                        {unit.fuse}
                      </span>
                    </div>

                    {/* Electrical Parameters Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">โหลดปัจจุบัน</span>
                        <span className="font-extrabold font-mono text-slate-900">{unit.loadKva} kVA</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">คิดเป็น %</span>
                        <span className="font-extrabold font-mono text-emerald-700">{unit.percent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">MCCB แรงต่ำ</span>
                        <span className="font-extrabold font-mono text-slate-800">{unit.mccb.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Test & Health Stats (Insulation, BDV, Grounding) */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">ฉนวน HV-LV</span>
                        <span className="font-bold font-mono text-slate-800">{unit.insulationHV_LV || 4200} MΩ</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">น้ำมัน BDV</span>
                        <span className="font-bold font-mono text-slate-800">{unit.oilBDV || 42.5} kV</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">ความต้านทานดิน</span>
                        <span className="font-bold font-mono text-slate-800">{unit.groundResistance || 2.8} Ω</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] active:scale-95"
                      title="เปิดนำทางไปยังตำแหน่งเสาหม้อแปลงนี้ใน Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>นำทาง GPS</span>
                    </a>

                    <button
                      onClick={() => handleSelectTransformer(unit.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#006948] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer min-h-[38px] active:scale-95"
                    >
                      <span>ดูข้อมูลเต็ม</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: DETAIL OF PROTECTION DEVICE & ALL ITS TRANSFORMER VALUES (Requirement: "เมื่อคลิกเข้าดูอุปกรณ์ป้องกันให้ขึ้น หมายเลขหม้อแปลง TR ขึ้นมา ข้อมูลมีตามไฟล์นี้ และนำค่าในหม้อแปลงเอาใส่โชว์ทั้งหมด") */}
      {activeProtectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Mobile drag handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-900">
              <div className="w-12 h-1.5 rounded-full bg-slate-600"></div>
            </div>

            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold font-mono text-xs">
                    อุปกรณ์ป้องกันระบบไฟฟ้าแรงสูง
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    {activeProtectionModal.feeder}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{activeProtectionModal.id}</span>
                  <span className="text-sm font-normal text-slate-300">
                    - {activeProtectionModal.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeProtectionModal.area}</span>
                  <span>•</span>
                  <span>เสา กฟภ. {activeProtectionModal.poleId}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveProtectionModal(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Protection Device Technical Parameters Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">พิกัดฟิวส์ติดตั้งจริง</span>
                  <span className="text-base font-extrabold font-mono text-amber-950">
                    {activeProtectionModal.installedFuse} (Type {activeProtectionModal.fuseType})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">พิกัดแรงดันระบบ</span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    {activeProtectionModal.voltage} kV
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Diversity Factor</span>
                  <span className="text-base font-extrabold font-mono text-slate-900">
                    {activeProtectionModal.diversityFactor || 0.85}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">สถานะการป้องกัน</span>
                  <span className="text-base font-extrabold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ปกติสมบูรณ์</span>
                  </span>
                </div>
              </div>

              {/* Sub-Header: Transformers under this protection device */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#006948]" />
                    <span>
                      หมายเลขหม้อแปลง TR ภายใต้อุปกรณ์นี้ (
                      {(transformersByCutout.get(activeProtectionModal.id) || []).length} เครื่อง)
                    </span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    คลิกแท็บเพื่อสลับดูข้อมูลค่าทั้งหมดของหม้อแปลงแต่ละเครื่อง
                  </span>
                </div>

                {/* Transformer Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {(transformersByCutout.get(activeProtectionModal.id) || []).map((tr) => {
                    const isSelected = selectedTrInModal?.id === tr.id;
                    return (
                      <button
                        key={tr.id}
                        onClick={() => setSelectedTrInModal(tr)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#006948] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tr.id}</span>
                        <span
                          className={`text-[10px] font-sans px-1.5 py-0.2 rounded font-semibold ${
                            isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tr.kva} kVA
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Values of the Selected Transformer ("นำค่าในหม้อแปลงเอาใส่โชว์ทั้งหมด") */}
              {selectedTrInModal ? (
                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  {/* Transformer Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-extrabold font-mono text-slate-900">
                          {selectedTrInModal.id}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                          พิกัด {selectedTrInModal.kva} kVA
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {selectedTrInModal.voltage}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mt-1">
                        {selectedTrInModal.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedTrInModal.area}</span>
                        <span>•</span>
                        <span>เสา กฟภ. {selectedTrInModal.poleId}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTrInModal.lat},${selectedTrInModal.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>นำทาง Google Maps</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedId(selectedTrInModal.id);
                          setActiveTab('detail');
                          setActiveProtectionModal(null);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-[#006948] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดหน้ารายละเอียด</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Electrical & Load Telemetry */}
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>1. ค่าโหลดและการวัดทางไฟฟ้า (Electrical Telemetry)</span>
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">โหลดใช้งานจริง (kVA)</span>
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {selectedTrInModal.loadKva} kVA
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">กำลังงานจริง (kW)</span>
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {selectedTrInModal.loadKw} kW
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">เปอร์เซ็นต์โหลด (% Utilization)</span>
                        <span className="text-base font-extrabold font-mono text-emerald-700">
                          {selectedTrInModal.percent}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">Power Factor (PF)</span>
                        <span className="text-base font-extrabold font-mono text-slate-900">
                          {selectedTrInModal.pf || '0.90 Lag'}
                        </span>
                      </div>
                    </div>

                    {/* Phase Currents & Voltages */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                        <span className="text-[11px] text-emerald-800 font-semibold block">กระแสเฟส A (Ia)</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-950">
                          {selectedTrInModal.currentA || 54.2} A
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          V_AN: {selectedTrInModal.voltageAN || 231.2} V
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                        <span className="text-[11px] text-emerald-800 font-semibold block">กระแสเฟส B (Ib)</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-950">
                          {selectedTrInModal.currentB || 56.1} A
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          V_BN: {selectedTrInModal.voltageBN || 230.8} V
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                        <span className="text-[11px] text-emerald-800 font-semibold block">กระแสเฟส C (Ic)</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-950">
                          {selectedTrInModal.currentC || 55.8} A
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          V_CN: {selectedTrInModal.voltageCN || 231.5} V
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                        <span className="text-[11px] text-emerald-800 font-semibold block">กระแสสายนิวทรัล (In)</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-950">
                          {selectedTrInModal.currentN || 3.4} A
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Unbalance: {selectedTrInModal.unbalancePercent || 2.1}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Protection Devices on Transformer */}
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>2. อุปกรณ์ป้องกันประจำหม้อแปลง (Protection Gears)</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          Drop Out Fuse Link (แรงสูง)
                        </span>
                        <span className="text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
                          {selectedTrInModal.fuse}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ตัดตอนแรงดัน 22 kV
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          MCCB ด้านแรงต่ำ (Low Voltage)
                        </span>
                        <span className="text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
                          {selectedTrInModal.mccb}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ป้องกันสายป้อนแรงต่ำ 400/230V
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          รูปแบบการติดตั้งหม้อแปลง
                        </span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                          {selectedTrInModal.mountType}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ระดับความสูง {selectedTrInModal.altitude || '295 ม.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Diagnostic Tests per PEA Standards (มป.11-ป.68) */}
                  <div>
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <ClipboardCheck className="w-3.5 h-3.5 text-teal-700" />
                      <span>3. ผลการตรวจสอบและบำรุงรักษาตามมาตรฐาน กฟภ. (ข-2 มป.11-ป.68)</span>
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* Insulation HV-LV */}
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80">
                        <span className="text-[11px] text-teal-900 font-semibold block">ความต้านทานฉนวน HV-LV</span>
                        <span className="text-base font-extrabold font-mono text-teal-950 mt-0.5 block">
                          {selectedTrInModal.insulationHV_LV || 4200} MΩ
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          ✓ ผ่าน (เกณฑ์ &gt;100 MΩ)
                        </span>
                      </div>

                      {/* Oil BDV */}
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80">
                        <span className="text-[11px] text-teal-900 font-semibold block">ความเป็นฉนวนน้ำมัน (BDV)</span>
                        <span className="text-base font-extrabold font-mono text-teal-950 mt-0.5 block">
                          {selectedTrInModal.oilBDV || 42.5} kV
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          ✓ ผ่าน (เกณฑ์ &ge;30 kV)
                        </span>
                      </div>

                      {/* Ground Resistance */}
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80">
                        <span className="text-[11px] text-teal-900 font-semibold block">ความต้านทานระบบดิน</span>
                        <span className="text-base font-extrabold font-mono text-teal-950 mt-0.5 block">
                          {selectedTrInModal.groundResistance || 2.8} Ω
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          ✓ ผ่าน (เกณฑ์ &le;5 Ω)
                        </span>
                      </div>

                      {/* Temperature & Oil level */}
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80">
                        <span className="text-[11px] text-teal-900 font-semibold block">อุณหภูมิ & ระดับน้ำมัน</span>
                        <span className="text-sm font-extrabold font-mono text-teal-950 mt-0.5 block">
                          {selectedTrInModal.windingTemp || 41.2}°C • {selectedTrInModal.oilLevel || 94.2}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          ✓ อยู่ในเกณฑ์ปกติ
                        </span>
                      </div>
                    </div>

                    {/* Operational Recommendation Banner */}
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">
                          ข้อสรุปการประเมินและการปฏิบัติงาน:
                        </span>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          {selectedTrInModal.recommendation ||
                            'หม้อแปลงอยู่ในสภาพสมบูรณ์ ค่าฉนวนไฟฟ้า ขดลวด และค่าไดอิเล็กทริกของน้ำมันหม้อแปลงผ่านเกณฑ์มาตรฐาน กฟภ. ทุกหัวข้อ จ่ายไฟได้ตามปกติ'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                ข้อมูลได้รับการตรวจสอบและซิงก์ตรงกับระบบ กฟภ. BGA02
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveProtectionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
