import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { getSortedNearbyTransformers, getTravelEstimate } from '../lib/geoUtils';
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  X,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
  Radio,
  Share2,
} from 'lucide-react';

export const NearbyTransformersModal: React.FC = () => {
  const {
    isNearbyModalOpen,
    setIsNearbyModalOpen,
    userLocation,
    isLocating,
    locateUser,
    transformers,
    setSelectedId,
    setActiveTab,
    showToast,
  } = useTransformers();

  const [filterRadius, setFilterRadius] = useState<'top5' | 'top10' | '1km' | '3km' | 'all'>('top5');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate sorted list whenever userLocation or transformers change
  const allNearby = useMemo(() => {
    if (!userLocation) return [];
    return getSortedNearbyTransformers(userLocation.lat, userLocation.lng, transformers);
  }, [userLocation, transformers]);

  // Apply filters
  const filteredList = useMemo(() => {
    let list = allNearby;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.poleId.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          (t.lineCutoutName && t.lineCutoutName.toLowerCase().includes(q))
      );
    }

    if (filterRadius === 'top5') {
      return list.slice(0, 5);
    }
    if (filterRadius === 'top10') {
      return list.slice(0, 10);
    }
    if (filterRadius === '1km') {
      return list.filter((t) => t.distanceKm <= 1.0);
    }
    if (filterRadius === '3km') {
      return list.filter((t) => t.distanceKm <= 3.0);
    }

    return list;
  }, [allNearby, filterRadius, searchTerm]);

  if (!isNearbyModalOpen) return null;

  const closest = allNearby[0];

  const handleSelectTransformer = (id: string) => {
    setSelectedId(id);
    setActiveTab('detail');
    setIsNearbyModalOpen(false);
    showToast(`เลือกหม้อแปลง ${id} เรียบร้อย`, 'TR_SELECTED', 'info');
  };

  const getDirectionsUrl = (destLat: string, destLng: string) => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(destLat)},${encodeURIComponent(destLng)}&travelmode=driving`;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(destLat)},${encodeURIComponent(destLng)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-linear-to-r from-emerald-800 via-[#006948] to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  ตำแหน่งของฉัน &amp; หม้อแปลงใกล้เคียง
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 border border-emerald-300/30">
                  GPS GIS RADAR
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                ตรวจหาตำแหน่งพิกัดของคุณ และคำนวณหาระยะทางไปยังหม้อแปลงไฟฟ้าที่ใกล้ที่สุด
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNearbyModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Status Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>พิกัดของคุณ:</span>
            </span>

            {isLocating ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                กำลังค้นหาพิกัดดาวเทียม GPS...
              </span>
            ) : userLocation ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    userLocation.isSimulated
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-[#006948] border border-emerald-200'
                  }`}
                >
                  {userLocation.isSimulated
                    ? 'จุดทดสอบ กฟส.บ้านโฮ่ง (หน้างาน)'
                    : `GPS สด (ความแม่นยำ ±${userLocation.accuracy || 10} ม.)`}
                </span>
              </div>
            ) : (
              <span className="text-slate-500">ยังไม่ได้ระบุพิกัด</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => locateUser({ simulated: false })}
              disabled={isLocating}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="ดึงพิกัด GPS จากอุปกรณ์อีกครั้ง"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>ดึงพิกัด GPS จริง</span>
            </button>
            <button
              onClick={() => locateUser({ simulated: true })}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="ใช้พิกัดทดสอบในพื้นที่ กฟส.บ้านโฮ่ง จ.ลำพูน"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>จำลองพิกัดหน้างาน</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Spotlight Card: #1 Closest Transformer */}
          {closest && !searchTerm && (
            <div className="bg-linear-to-br from-emerald-50 via-teal-50/50 to-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/40 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      หม้อแปลงที่อยู่ใกล้ตัวคุณที่สุด (#1)
                    </span>
                    <span className="font-mono text-xs text-emerald-800 font-bold">
                      {getTravelEstimate(closest.distanceKm)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 tracking-tight">
                    {closest.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{closest.area}</span>
                  </p>
                </div>

                <div className="text-right shrink-0 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ระยะห่าง</span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-[#006948] tracking-tight">
                    {closest.distanceFormatted}
                  </span>
                </div>
              </div>

              {/* Specs Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-emerald-200/70 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">รหัสหม้อแปลง</span>
                  <span className="font-mono font-bold text-slate-800">{closest.id}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">รหัสเสา กฟภ.</span>
                  <span className="font-mono font-bold text-slate-800">{closest.poleId}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">พิกัด / ภาระโหลด</span>
                  <span className="font-bold text-slate-800">
                    {closest.kva} kVA ({closest.percent}%)
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block">ฟิวส์ตัดไลน์สายสาขา</span>
                  <span className="font-semibold text-amber-800 truncate block">
                    {closest.lineCutoutId || 'LC-01'}
                  </span>
                </div>
              </div>

              {/* Spotlight Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleSelectTransformer(closest.id)}
                  className="px-4 py-2 bg-[#006948] hover:bg-[#005137] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>เลือกและเปิดดูสเปกเต็มทันที</span>
                </button>

                <a
                  href={getDirectionsUrl(closest.lat, closest.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>เปิด Google Maps นำทาง</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ, รหัสหม้อแปลง, เสา, สายแยก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006948] focus:bg-white"
              />
            </div>

            {/* Distance Radius Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterRadius('top5')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterRadius === 'top5'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 ตัวใกล้สุด
              </button>
              <button
                type="button"
                onClick={() => setFilterRadius('top10')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterRadius === 'top10'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10 ตัวใกล้สุด
              </button>
              <button
                type="button"
                onClick={() => setFilterRadius('1km')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterRadius === '1km'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 1 กม.
              </button>
              <button
                type="button"
                onClick={() => setFilterRadius('3km')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterRadius === '3km'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 3 กม.
              </button>
              <button
                type="button"
                onClick={() => setFilterRadius('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterRadius === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
            </div>
          </div>

          {/* List of Closest Transformers */}
          <div className="space-y-2">
            {filteredList.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">ไม่พบหม้อแปลงตามเงื่อนไขที่ค้นหา</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  ลองขยายรัศมีการค้นหา หรือเปลี่ยนคำค้นหา
                </p>
              </div>
            ) : (
              filteredList.map((item, idx) => {
                const isCrit = item.percent > 90 || item.status === 'critical';
                const isWarn = !isCrit && (item.percent > 80 || item.status === 'warning');

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 bg-white hover:bg-slate-50/90 rounded-xl border border-slate-200 hover:border-[#006948]/50 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    {/* Left Rank & Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 border ${
                          idx === 0
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : idx < 3
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#006948] transition-colors truncate">
                            {item.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                              isCrit
                                ? 'bg-red-100 text-red-700'
                                : isWarn
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-[#006948]'
                            }`}
                          >
                            {item.percent}% โหลด
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono font-semibold text-slate-700">{item.id}</span>
                          <span>•</span>
                          <span>เสา <strong className="text-slate-700 font-mono">{item.poleId}</strong></span>
                          <span>•</span>
                          <span>{item.kva} kVA</span>
                          <span>•</span>
                          <span className="text-amber-800 font-semibold truncate max-w-[140px] sm:max-w-xs">
                            {item.lineCutoutName || item.lineCutoutId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Distance & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="font-mono text-sm sm:text-base font-black text-[#006948] block leading-none">
                          {item.distanceFormatted}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                          {getTravelEstimate(item.distanceKm)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectTransformer(item.id)}
                          className="px-3 py-1.5 bg-[#006948] hover:bg-[#005137] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                          ดูสเปก
                        </button>
                        <a
                          href={getDirectionsUrl(item.lat, item.lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="นำทางด้วย Google Maps"
                        >
                          <Navigation className="w-4 h-4 text-blue-600" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              พบหม้อแปลงในระบบทั้งหมด <strong className="text-slate-900 font-bold">{transformers.length}</strong> เครื่อง (แสดง {filteredList.length} รายการ)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsNearbyModalOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
