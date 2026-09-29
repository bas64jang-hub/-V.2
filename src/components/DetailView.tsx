import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { calculateDistanceKm, formatDistance, getTravelEstimate } from '../lib/geoUtils';
import {
  MapPin,
  Compass,
  Navigation,
  Zap,
  Shield,
  ShieldCheck,
  Thermometer,
  Droplet,
  Copy,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Layers,
  Sparkles,
  Radio,
  ClipboardCheck,
  ShieldAlert,
  Wrench,
  Plus,
  History,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { TransformerIncidentLog } from '../types';

export const DetailView: React.FC = () => {
  const {
    transformers,
    selectedId,
    setSelectedId,
    selectedTransformer,
    showToast,
    triggerSync,
    lineCutouts,
    setSelectedLineCutoutId,
    setActiveTab,
    userLocation,
    isLocating,
    locateUser,
    openNearbyModal,
    createInspectionForTransformer,
    getIncidentsForTransformer,
    getActiveMismatchNotice,
    openIncidentModalForTransformer,
    saveTransformerIncident,
  } = useTransformers();

  const [mobileTab, setMobileTab] = useState<'all' | 'telemetry' | 'protection' | 'incidents' | 'location'>('all');
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' for normal roadmap, 'k' for satellite

  const tr = selectedTransformer || transformers[0];
  const trIncidents = tr ? getIncidentsForTransformer(tr.id) : [];
  const activeMismatch = tr ? getActiveMismatchNotice(tr.id) : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`คัดลอก ${label} (${text}) เรียบร้อยแล้ว`, 'COPIED', 'success');
  };

  // Calculations for current transformer
  const kva = tr?.kva || 500;
  const loadKva = tr?.loadKva || 325;
  const percent = tr?.percent || 65;
  const priVoltKv = tr?.voltage.includes('33') ? 33 : 22;
  const priFla = (kva / (Math.sqrt(3) * priVoltKv)).toFixed(2);
  const secFla = ((kva * 1000) / (Math.sqrt(3) * 400)).toFixed(2);
  const rawPf = parseFloat(tr?.pf) || 0.92;
  const pf = Math.max(0.1, Math.min(rawPf, 1.0));
  const activeKw = (loadKva * pf).toFixed(1);
  const reactiveKvar = (loadKva * Math.sin(Math.acos(pf))).toFixed(1);

  const isCrit = percent > 90 || tr?.status === 'critical';
  const isWarn = !isCrit && (percent > 80 || tr?.status === 'warning');

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(tr?.lat || '18.3312')},${encodeURIComponent(tr?.lng || '98.7708')}`;
  const embedMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(tr?.lat || '18.3312')},${encodeURIComponent(tr?.lng || '98.7708')}&hl=th&z=16&t=${mapType}&output=embed`;

  // Calculate user distance to this transformer
  const userDistanceKm =
    userLocation && tr?.lat && tr?.lng
      ? calculateDistanceKm(userLocation.lat, userLocation.lng, parseFloat(tr.lat), parseFloat(tr.lng))
      : null;
  const userDistanceFormatted = userDistanceKm !== null ? formatDistance(userDistanceKm) : null;
  const userTravelEst = userDistanceKm !== null ? getTravelEstimate(userDistanceKm) : null;

  const directionsUrl =
    userLocation && tr?.lat && tr?.lng
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(tr.lat)},${encodeURIComponent(tr.lng)}&travelmode=driving`
      : mapsUrl;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner Notice */}
      <div className="w-full bg-slate-100 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#006948]" />
          <p className="text-xs text-slate-700">
            <strong className="font-semibold text-[#006948]">โหมดอ่านและตรวจสอบสถานะ (Field Telemetry Mode):</strong> ข้อมูลตรวจวัดจากระบบมิเตอร์ไฟฟ้าเรียลไทม์ อัปเดตทุก 5 วินาที
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            GPS RTK ONLINE
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* GPS Location & Nearby Transformers Action Card */}
      <div className="w-full bg-linear-to-r from-emerald-50 via-teal-50/70 to-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#006948] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className={`w-6 h-6 ${isLocating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                ระบบระบุตำแหน่งของฉัน &amp; ตรวจหาหม้อแปลงใกล้เคียง (GPS Radar)
              </h2>
              {userLocation && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] border border-emerald-200">
                  {userLocation.isSimulated ? 'พิกัดจำลอง กฟส.บ้านโฮ่ง' : 'ตรวจพบ GPS แล้ว'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {userLocation ? (
                <span>
                  ตำแหน่งของคุณ: <strong className="font-mono text-slate-800">{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</strong>
                  {userDistanceFormatted && (
                    <> • ห่างจากหม้อแปลงนี้ (<strong className="font-mono text-[#006948]">{tr?.id}</strong>) ประมาณ <strong className="text-[#006948] font-bold">{userDistanceFormatted}</strong> ({userTravelEst})</>
                  )}
                </span>
              ) : (
                'กดปุ่มเพื่อให้ระบบตรวจหาตำแหน่งปัจจุบันของคุณ และเด้งแสดงหม้อแปลงไฟฟ้าที่อยู่ใกล้จุดของคุณที่สุดทันที'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {userLocation && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="เปิด Google Maps นำทางจากจุดของคุณมายังหม้อแปลงนี้"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>นำทางมาที่นี่</span>
            </a>
          )}

          <button
            type="button"
            onClick={openNearbyModal}
            disabled={isLocating}
            className="px-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'กำลังค้นหาตำแหน่ง...' : 'กดเพื่อทราบตำแหน่งของฉัน & ดูหม้อแปลงใกล้เคียง'}</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          </button>
        </div>
      </div>

      {/* Persistent Maintenance Alert Banner when Fuse is Mismatched */}
      {activeMismatch && (
        <div className="w-full bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-amber-300 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-white/30">
              <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  คำเตือนสำหรับทีมงานซ่อมแซม (Maintenance Alert)
                </span>
                <span className="text-xs font-mono text-amber-100">
                  {tr?.id} • บันทึกเมื่อ {activeMismatch.incidentDate}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-1 leading-snug">
                หม้อแปลงเครื่องนี้มีการเปลี่ยนฟิวส์ชั่วคราวที่ไม่ตรงสเปกเดิม ({activeMismatch.newFuseInstalled} แทน {activeMismatch.originalFuse})
              </p>
              <div className="mt-2 bg-black/20 backdrop-blur-xs p-2.5 rounded-xl border border-white/20 text-xs text-amber-100 flex items-center gap-2 flex-wrap">
                <strong className="text-white">📌 คำสั่งการในอนาคต:</strong>
                <span>"{activeMismatch.futureActionNotice}"</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => openIncidentModalForTransformer(tr?.id)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>เขียนรายงานใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const restored: TransformerIncidentLog = {
                  ...activeMismatch,
                  status: 'resolved_standard',
                  isFuseMatchOriginal: true,
                  newFuseInstalled: activeMismatch.standardFuse,
                  verificationStatus: 'match',
                  verificationMessage: `✅ เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน กฟภ. (${activeMismatch.standardFuse}) เรียบร้อยแล้ว`,
                  notes: `${activeMismatch.notes || ''} [ช่างเข้าเปลี่ยนฟิวส์กลับเป็นมาตรฐาน ${activeMismatch.standardFuse} แล้ว]`,
                  updatedAt: Date.now(),
                };
                saveTransformerIncident(restored);
                showToast(`บันทึกการเปลี่ยนฟิวส์ ${tr?.id} กลับเป็นมาตรฐาน (${activeMismatch.standardFuse}) สำเร็จ`, 'STANDARD_RESTORED', 'success');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>เปลี่ยนฟิวส์ตรงมาตรฐานแล้ว</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Quick Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 font-medium">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span className="hidden xs:inline">ข้อมูลหม้อแปลงและแผนที่</span>
            <span className="hidden xs:inline">/</span>
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded truncate max-w-[240px]">
              {tr?.id} ({tr?.kva} kVA {tr?.name})
            </span>
          </nav>

          {/* Quick Dropdown Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto justify-between sm:justify-start">
            <label htmlFor="trSelect" className="text-xs text-slate-600 pl-2 font-medium flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-[#006948]" />
              <span className="hidden xs:inline">เลือกหม้อแปลง:</span>
              <span className="xs:hidden">เลือก:</span>
            </label>
            <select
              id="trSelect"
              value={tr?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#006948] cursor-pointer flex-1 sm:flex-initial max-w-[180px] sm:max-w-[220px] truncate"
            >
              {transformers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} ({item.kva} kVA)
                </option>
              ))}
            </select>
            <button
              onClick={() => triggerSync()}
              className="p-1.5 text-slate-500 hover:text-[#006948] hover:bg-white rounded-lg transition-colors shrink-0"
              title="รีเฟรชและซิงก์ข้อมูลกับเซิร์ฟเวอร์"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Banner */}
        <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#006948]/10 border border-[#006948]/20 flex items-center justify-center text-[#006948] shrink-0 shadow-xs">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight break-words">
                  {tr?.name}
                </h1>
                <span
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 font-mono shrink-0 ${
                    isCrit
                      ? 'bg-red-100 text-red-700'
                      : isWarn
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-[#006948]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCrit ? 'bg-red-600 animate-ping' : isWarn ? 'bg-amber-600' : 'bg-[#006948]'
                    }`}
                  ></span>
                  {isCrit ? 'วิกฤต: เกินพิกัด' : isWarn ? 'เฝ้าระวัง (>80%)' : 'ปกติ (In-Service)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mt-0.5 text-[11px] text-slate-500">
                <span>รหัส: <strong className="text-slate-800 font-mono">{tr?.id}</strong></span>
                <span>•</span>
                <span>เสา: <strong className="text-slate-800 font-mono">{tr?.poleId}</strong></span>
                <span>•</span>
                <span className="truncate max-w-[180px] sm:max-w-xs">{tr?.area}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-semibold text-slate-400">
                อัตราส่วนโหลด
              </span>
              <span
                className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                  isCrit ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-[#006948]'
                }`}
              >
                {percent}%
              </span>
            </div>

            {/* Direct Google Maps launch on mobile */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-[#006948] hover:bg-[#005137] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>เปิด Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Mobile Segmented Switcher */}
        <div className="flex lg:hidden items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMobileTab('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              mobileTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setMobileTab('telemetry')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              mobileTab === 'telemetry' ? 'bg-white text-[#006948] shadow-xs' : 'text-slate-600'
            }`}
          >
            ⚡ ค่าไฟฟ้า (Telemetry)
          </button>
          <button
            onClick={() => setMobileTab('protection')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              mobileTab === 'protection' ? 'bg-white text-[#006948] shadow-xs' : 'text-slate-600'
            }`}
          >
            🛡️ ระบบป้องกัน
          </button>
          <button
            onClick={() => setMobileTab('incidents')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              mobileTab === 'incidents' ? 'bg-[#006948] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ⚠️ ประวัติเหตุการณ์ ({trIncidents.length})
          </button>
          <button
            onClick={() => setMobileTab('location')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              mobileTab === 'location' ? 'bg-[#006948] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            🗺️ พิกัด & แผนที่
          </button>
        </div>
      </div>

      {/* Main Content 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* LEFT COLUMN: Electrical Telemetry & Protection (7 cols) */}
        <div className={`lg:col-span-7 flex-col gap-4 sm:gap-6 ${mobileTab === 'location' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Card 1: Electrical Specs & Live Telemetry */}
          {(mobileTab === 'all' || mobileTab === 'telemetry') && (
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#006948]" />
                <h2 className="text-base font-bold text-slate-900">
                  ข้อมูลค่าทางไฟฟ้าแบบเรียลไทม์ (Live Fleet Telemetry)
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                TELEMETRY SYNC
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">ความจุและภาระการจ่ายโหลด:</span>
                <div className="font-mono">
                  <strong className="text-slate-900 text-sm">{loadKva}</strong>
                  <span className="text-slate-400"> / {kva} kVA</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCrit ? 'bg-red-600' : isWarn ? 'bg-amber-500' : 'bg-[#006948]'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% - 80% ปลอดภัย</span>
                <span className="text-amber-600">80% - 90% เฝ้าระวัง</span>
                <span className="text-red-600">เกิน 90% เสี่ยงตัดวงจร</span>
              </div>
            </div>

            {/* Parameter Grid 4x */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">ขนาดพิกัด kVA</span>
                <div className="font-mono text-xl font-bold text-slate-900 mt-1">
                  {kva.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kVA</span>
                </div>
                <span className="text-[10px] text-[#006948] font-bold mt-1">มาตรฐาน กฟภ.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">แรงดันฝั่งแรงสูง</span>
                <div className="font-mono text-xl font-bold text-slate-900 mt-1">
                  {priVoltKv} <span className="text-xs text-slate-400 font-normal">kV</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">ต่อแบบ Delta</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">แรงดันฝั่งแรงต่ำ</span>
                <div className="font-mono text-xl font-bold text-slate-900 mt-1">
                  400/230 <span className="text-xs text-slate-400 font-normal">V</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Wye 3P 4W</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">เพาเวอร์แฟกเตอร์ (PF)</span>
                <div className="font-mono text-xl font-bold text-slate-900 mt-1">
                  {pf} <span className="text-xs text-[#006948] font-bold">Lag</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">เกณฑ์ ≥ 0.85</span>
              </div>
            </div>

            {/* Current & Power Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  กระแสไฟฟ้าเต็มพิกัด (Full Load Ampacity)
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                  <span className="text-slate-500 font-sans">กระแสฝั่งแรงสูง (FLA {priVoltKv}kV):</span>
                  <span className="font-bold text-slate-900">{priFla} A</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                  <span className="text-slate-500 font-sans">กระแสฝั่งแรงต่ำ (FLA 400V):</span>
                  <span className="font-bold text-[#006948]">{secFla} A</span>
                </div>
                <div className="flex justify-between py-1 font-mono">
                  <span className="text-slate-500 font-sans">กระแสนิวทรัล (Neutral Amp):</span>
                  <span className="text-slate-700">14.8 A</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  กำลังไฟฟ้าและโหลดเรียลไทม์
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                  <span className="text-slate-500 font-sans">กำลังไฟฟ้าจริง (Active Power):</span>
                  <span className="font-bold text-slate-900">{activeKw} kW</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
                  <span className="text-slate-500 font-sans">กำลังไฟฟ้ารีแอกทีฟ (Reactive):</span>
                  <span className="font-bold text-slate-700">{reactiveKvar} kVAR</span>
                </div>
                <div className="flex justify-between py-1 font-mono">
                  <span className="text-slate-500 font-sans">กำลังไฟฟ้าปรากฏ (Apparent):</span>
                  <span className="font-bold text-[#006948]">{loadKva} kVA</span>
                </div>
              </div>
            </div>

            {/* Thermal & Oil Level Sensors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">อุณหภูมิขดลวด (Winding Temp)</span>
                    <div className="font-mono text-base font-bold text-slate-900">
                      {tr?.windingTemp || 54.2} °C
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#006948]">
                  ปกติ (&lt;85°C)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-[#006948] shrink-0">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">ระดับน้ำมันหม้อแปลง (Oil Level)</span>
                    <div className="font-mono text-base font-bold text-slate-900">
                      {tr?.oilLevel || 94.0} %
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#006948]">
                  ปกติ
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Card 2: Protection System & Switchgear Table */}
          {(mobileTab === 'all' || mobileTab === 'protection') && (
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#006948]" />
                <h2 className="text-base font-bold text-slate-900">
                  ระบบป้องกันและขนาดฟิวส์ที่ติดตั้ง (รับรองตามเกณฑ์ กฟภ.)
                </h2>
              </div>
              <span className="text-xs text-[#006948] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                PEA Standard Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ชนิดฟิวส์แรงสูง</span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  Drop-out Cutout {priVoltKv === 33 ? '36 kV' : '24 kV'}
                </div>
                <span className="text-[10px] text-slate-500 mt-2">Outdoor Polymer Housing</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ขนาดฟิวส์ลิงค์แนะนำ</span>
                <div className="font-mono text-2xl font-bold text-[#006948] mt-1">
                  {tr?.fuse || '25T Type K'}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-2">พิกัดโหลดเผื่อ Inrush</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">เมนสวิตช์แรงต่ำ</span>
                <div className="font-mono text-sm font-bold text-slate-900 mt-1">
                  {tr?.mccb || '800A 3P 36kA ICS'}
                </div>
                <span className="text-[10px] text-slate-500 mt-2">MCCB/ACB Main Breaker</span>
              </div>
            </div>

            {/* Upstream Lateral High-Voltage Protection Device Card */}
            <div className="p-4 sm:p-5 bg-linear-to-r from-amber-50 to-orange-50/50 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-amber-200 text-amber-950 border border-amber-300">
                      {tr?.lineCutoutId || 'BGA02VF-158'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      อุปกรณ์ป้องกันระบบไฟฟ้าแรงสูง (High-Voltage Cutout)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    หม้อแปลงลูกนี้ (<strong className="font-mono text-slate-800">{tr?.id}</strong>) ได้รับการป้องกันโดย{' '}
                    <strong className="text-slate-900 font-semibold">{tr?.lineCutoutName || 'อุปกรณ์ป้องกันแรงสูง BGA02VF-158'}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (tr?.lineCutoutId) {
                    setSelectedLineCutoutId(tr.lineCutoutId);
                  }
                  setActiveTab('dashboard');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <span>ดูจุดป้องกันแรงสูงที่หน้าหลัก</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Protection Devices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2 px-2.5">อุปกรณ์ป้องกัน</th>
                    <th className="py-2 px-2.5">สเปกทางวิศวกรรม</th>
                    <th className="py-2 px-2.5">จุดตัดวงจร / พิกัด</th>
                    <th className="py-2 px-2.5 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                      กับดักฟ้าผ่า (Surge Arrester)
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">Metal-Oxide (ZnO) 21 kV, 10 kA</td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">ตัดยอดคลื่น 65 kV Crest</td>
                    <td className="py-2 px-2.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#006948]">
                        พร้อมทำงาน
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                      เมนเบรกเกอร์แรงต่ำ (MCCB)
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">Molded Case MCCB 3P ({tr?.mccb})</td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">Ir = 0.85, Isd = 4x In</td>
                    <td className="py-2 px-2.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#006948]">
                        สับจ่ายไฟปกติ
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                      บุชชิ่งแรงสูงพร้อม Arcing Horn
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">Porcelain BIL 125 kV, 24 kV Class</td>
                    <td className="py-2 px-2.5 text-slate-600 font-mono">Gap ระยะประกายไฟ 110 มม.</td>
                    <td className="py-2 px-2.5 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#006948]">
                        ปกติ
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Card 3: Emergency Incident & Fuse Replacement History (Separated per Transformer) */}
          {(mobileTab === 'all' || mobileTab === 'incidents') && (
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>ประวัติการเข้าทำงานเมื่อเกิดเหตุ</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {tr?.id} ({trIncidents.length} รายการ)
                    </span>
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openIncidentModalForTransformer(tr?.id)}
                className="px-3 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เขียนรายงานเข้าทำงาน</span>
              </button>
            </div>

            {/* Mismatch Alert Box inside the transformer card if applicable */}
            {activeMismatch && (
              <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-xs text-amber-950 flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="font-bold text-amber-950">คำเตือนสำหรับงานซ่อมแซมในอนาคต:</strong>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300 font-bold">
                        FUSE MISMATCH
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mt-1 bg-white/80 p-2 rounded-lg border border-amber-300">
                      "{activeMismatch.futureActionNotice}"
                    </p>
                    <p className="text-[11px] text-amber-900 mt-1">
                      ฟิวส์ที่เปลี่ยนใหม่ล่าสุดคือ <strong>{activeMismatch.newFuseInstalled}</strong> (เดิมคือ <strong>{activeMismatch.originalFuse}</strong> / มาตรฐานแนะนำ <strong>{activeMismatch.standardFuse}</strong>)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const restored: TransformerIncidentLog = {
                        ...activeMismatch,
                        status: 'resolved_standard',
                        isFuseMatchOriginal: true,
                        newFuseInstalled: activeMismatch.standardFuse,
                        verificationStatus: 'match',
                        verificationMessage: `✅ เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน กฟภ. (${activeMismatch.standardFuse}) เรียบร้อยแล้ว`,
                        notes: `${activeMismatch.notes || ''} [ช่างเข้าเปลี่ยนฟิวส์กลับเป็นมาตรฐาน ${activeMismatch.standardFuse} แล้ว]`,
                        updatedAt: Date.now(),
                      };
                      saveTransformerIncident(restored);
                      showToast(`บันทึกการเปลี่ยนฟิวส์ ${tr?.id} กลับเป็นมาตรฐาน (${activeMismatch.standardFuse}) สำเร็จ`, 'STANDARD_RESTORED', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>บันทึกว่าเปลี่ยนฟิวส์ตรงมาตรฐานแล้ว ({activeMismatch.standardFuse})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Incidents List for this Transformer */}
            {trIncidents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                <FileText className="w-6 h-6 text-slate-400" />
                <p className="text-xs font-bold text-slate-700">ยังไม่มีประวัติการเข้าทำงานเมื่อเกิดเหตุสำหรับหม้อแปลงนี้</p>
                <p className="text-[11px] text-slate-500">
                  เมื่อเกิดเหตุฉุกเฉินหรือฟิวส์ขาด ผู้ปฏิบัติงานสามารถกดปุ่ม "เขียนรายงานเข้าทำงาน" ด้านบน เพื่อกรอกขนาดฟิวส์ที่เปลี่ยนใหม่
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {trIncidents.map((incident) => {
                  const isMis = incident.status === 'pending_standard_replacement' || !incident.isFuseMatchOriginal;

                  return (
                    <div
                      key={incident.id}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2.5 transition-all ${
                        isMis
                          ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      {/* Incident Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {incident.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isMis
                                ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-[#006948] border border-emerald-200'
                            }`}
                          >
                            {isMis ? '⚠️ ฟิวส์รอเปลี่ยนให้ตรงมาตรฐาน' : '✅ ฟิวส์ตรงมาตรฐาน'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {incident.causeLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{incident.incidentDate} {incident.incidentTime} น.</span>
                        </div>
                      </div>

                      {/* 3-Column Fuse Comparison */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-slate-400">ฟิวส์เดิม</span>
                          <span className="font-mono text-sm font-bold text-slate-800">{incident.originalFuse}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                          <span className="text-[9px] uppercase font-bold text-slate-400">มาตรฐาน กฟภ.</span>
                          <span className="font-mono text-sm font-bold text-[#006948]">{incident.standardFuse}</span>
                        </div>
                        <div
                          className={`p-2 rounded-lg border flex flex-col ${
                            isMis
                              ? 'bg-amber-100/70 border-amber-400 text-amber-950 font-bold'
                              : 'bg-emerald-50 border-emerald-300 text-[#006948] font-bold'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold text-slate-500">ฟิวส์ที่เปลี่ยนใหม่</span>
                          <span className="font-mono text-sm font-extrabold">{incident.newFuseInstalled}</span>
                        </div>
                      </div>

                      {/* Mismatch Directive Callout */}
                      {isMis && (
                        <div className="bg-white p-2.5 rounded-lg border border-amber-300 text-[11px] text-amber-950 flex flex-col gap-1">
                          <div className="flex items-center gap-1 font-bold text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>ข้อสั่งการในอนาคต:</span>
                          </div>
                          <p className="font-semibold text-slate-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            "{incident.futureActionNotice}"
                          </p>
                        </div>
                      )}

                      {/* Symptoms & Action */}
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p><strong>อาการ:</strong> {incident.symptoms}</p>
                        <p><strong>การแก้ไข:</strong> {incident.actionTaken}</p>
                        {incident.loadAmpAfter && (
                          <p className="text-[#006948] font-mono">
                            <strong>วัดกระแสโหลดหลังจ่ายไฟ:</strong> {incident.loadAmpAfter} A (แรงดัน {incident.voltageAfter || 400} V)
                          </p>
                        )}
                      </div>

                      {/* Lineman info */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>ผู้ปฏิบัติงาน: <strong className="text-slate-700">{incident.linemanName}</strong></span>
                        </div>
                        {incident.ticketNumber && (
                          <span className="font-mono text-slate-500">
                            ใบสั่งงาน: {incident.ticketNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>

        {/* RIGHT COLUMN: Location, Field Navigation, SLD & QR Code (5 cols) */}
        <div className={`lg:col-span-5 flex-col gap-4 sm:gap-6 ${mobileTab === 'telemetry' || mobileTab === 'protection' || mobileTab === 'incidents' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Location & Navigation Card */}
          <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col gap-3.5 sm:gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#006948]" />
                <h2 className="text-base font-bold text-slate-900">
                  พิกัดและข้อมูลตำแหน่งหน้างาน (GIS)
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                GPS ACCURATE
              </span>
            </div>

            {/* Address Banner */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">สถานที่ติดตั้ง / โซนให้บริการ</span>
              <p className="font-bold text-slate-800 leading-relaxed">{tr?.area}</p>
              <span className="text-slate-500 text-[11px]">การไฟฟ้าส่วนภูมิภาค สาขาอำเภอบ้านโฮ่ง จ.ลำพูน (กฟส.บ้านโฮ่ง)</span>
            </div>

            {/* Coordinates Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] text-slate-400">ละติจูด (Lat)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-slate-900">{tr?.lat}° N</span>
                  <button
                    onClick={() => copyToClipboard(tr?.lat || '14.9738', 'ละติจูด')}
                    className="p-1 hover:text-[#006948] transition-colors text-slate-400"
                    title="คัดลอกพิกัด"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] text-slate-400">ลองจิจูด (Lng)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-slate-900">{tr?.lng}° E</span>
                  <button
                    onClick={() => copyToClipboard(tr?.lng || '102.0837', 'ลองจิจูด')}
                    className="p-1 hover:text-[#006948] transition-colors text-slate-400"
                    title="คัดลอกพิกัด"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] text-slate-400">รหัสเสา กฟภ.</span>
                <span className="font-mono font-bold text-slate-900 mt-1">{tr?.poleId}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col">
                <span className="text-[10px] text-slate-400">รูปแบบติดตั้ง</span>
                <span className="font-bold text-slate-900 mt-1 truncate">{tr?.mountType}</span>
              </div>
            </div>

            {/* Proximity Callout if user location is detected */}
            {userDistanceFormatted && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Navigation className="w-4 h-4 text-[#006948] shrink-0" />
                  <div className="min-w-0 text-xs">
                    <span className="text-slate-500 block text-[10px]">ระยะห่างจากตำแหน่งของคุณ</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {userDistanceFormatted} <span className="font-normal text-slate-500">({userTravelEst})</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] shrink-0">
                  ใกล้จุดของคุณ
                </span>
              </div>
            )}

            {/* Google Maps Actions Group */}
            <div className="flex flex-col gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#006948] hover:bg-[#005137] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all text-center cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>{userLocation ? 'เปิด Google Maps นำทางจากจุดที่คุณอยู่' : 'เปิดนำทางด้วย Google Maps'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={openNearbyModal}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all text-center cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>กดเพื่อค้นหาหม้อแปลงใกล้จุดที่เราอยู่ (GPS Radar)</span>
              </button>
            </div>

            {/* Visual Live Google Maps Canvas Updating Automatically by Lat/Lng */}
            <div className="w-full rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100 flex flex-col">
              {/* Map View Mode Controls */}
              <div className="p-2 sm:p-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate">แผนที่ Google Maps สด</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#006948] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold hidden xs:inline-block truncate">
                    {tr?.lat}, {tr?.lng}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMapType('m')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      mapType === 'm'
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    แผนที่ปกติ
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapType('k')}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      mapType === 'k'
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ดาวเทียม
                  </button>
                </div>
              </div>

              {/* Live Embedded Map centered on Lat/Lng */}
              <div className="relative w-full h-60 sm:h-72 bg-slate-200">
                <iframe
                  title={`Google Maps ${tr?.id}`}
                  src={embedMapUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />

                {/* Floating GPS Info Overlay */}
                <div className="absolute top-2 left-2 max-w-[calc(100%-16px)] bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-800 border border-slate-200 shadow-sm pointer-events-none flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-red-600 fill-current shrink-0" />
                  <span className="truncate">{tr?.id} ({kva} kVA) • {tr?.lat}, {tr?.lng}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-200">
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  พิกัดปัจจุบัน: <strong className="text-slate-900">{tr?.name}</strong>
                </span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#006948] hover:underline font-semibold flex items-center gap-1 text-[11px] shrink-0"
                >
                  <span>เปิดเต็มจอ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* QR Code Routing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-7 h-7 text-slate-800" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">สแกน QR Code นำทางบนมือถือ</span>
                  <span className="text-[11px] text-slate-500">เปิด Google Maps หรือ Apple Maps ได้ทันที</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(mapsUrl, 'ลิงก์นำทาง GPS')}
                className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg font-semibold border border-slate-200 text-xs flex items-center gap-1 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-[#006948]" />
                <span>แชร์</span>
              </button>
            </div>
          </div>

          {/* Substation SLD Diagram */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                ผังวงจรไฟฟ้าเส้นเดี่ยวประจำสถานี (SLD)
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                ANSI C37.2
              </span>
            </div>

            <div className="w-full bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-200">
              <svg className="w-full max-w-xs h-auto text-slate-800 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 320 180">
                {/* 22kV Line */}
                <line x1="160" y1="10" x2="160" y2="35" />
                <text x="170" y="24" className="fill-current font-mono text-[9px] stroke-none">บัสแรงสูง {priVoltKv} kV</text>
                
                {/* Surge Arrester */}
                <line x1="160" y1="35" x2="210" y2="35" />
                <line x1="210" y1="35" x2="210" y2="50" />
                <polygon points="206,50 214,50 210,57" className="fill-current" />
                <text x="218" y="55" className="fill-current text-[8px] stroke-none font-mono">LA 21kV 10kA</text>
                
                {/* Fuse Cutout */}
                <rect x="154" y="40" width="12" height="22" rx="2" className="fill-white stroke-current" />
                <line x1="160" y1="40" x2="160" y2="62" strokeDasharray="2 2" />
                <text x="75" y="54" className="fill-current font-mono text-[9px] stroke-none">{tr?.fuse}</text>
                <line x1="160" y1="62" x2="160" y2="80" />
                
                {/* Dual Transformer Circles */}
                <circle cx="160" cy="90" r="13" className="stroke-current" />
                <circle cx="160" cy="110" r="13" className="stroke-current" />
                <text x="180" y="94" className="fill-current text-[9px] stroke-none">Δ {priVoltKv} kV</text>
                <text x="180" y="114" className="fill-current text-[9px] stroke-none">Y 400/230 V</text>
                
                {/* Low-Voltage MCCB */}
                <line x1="160" y1="123" x2="160" y2="138" />
                <rect x="154" y="138" width="12" height="12" className="fill-[#006948] stroke-none" />
                <text x="80" y="148" className="fill-current font-mono text-[9px] stroke-none">MCCB {tr?.mccb?.slice(0, 5) || '800A'}</text>
                <line x1="160" y1="150" x2="160" y2="165" />
                
                {/* LV Busbar */}
                <line x1="100" y1="165" x2="220" y2="165" strokeWidth="3" />
                <text x="225" y="168" className="fill-current text-[9px] stroke-none">บัสแรงต่ำ 400V</text>
              </svg>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              ระบบป้องกันด้านแรงสูงเชื่อมต่อแบบ Expulsion Link สอดคล้องกับรีโคลสเซอร์ต้นทาง
            </p>
          </div>

          {/* Hotline Callout */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="w-4 h-4 text-[#006948]" />
              <span>สายด่วนศูนย์ควบคุม กฟภ. <strong className="text-slate-900">1129</strong></span>
            </div>
            <span className="text-[#006948] font-bold">24 ชม.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
