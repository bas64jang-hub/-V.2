import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const FloatingPageRemote: React.FC = () => {
  const {
    displayDevice,
    setDisplayDevice,
    presentationPages,
    currentPageIndex,
    nextPage,
    prevPage,
    goToPageByIndex,
    activeTab,
  } = useTransformers();

  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const currentPage = presentationPages[currentPageIndex] || presentationPages[0];

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-[#006948] hover:bg-[#005238] text-white p-2.5 rounded-full shadow-xl border-2 border-emerald-300 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        title="เปิดรีโมทเปลี่ยนหน้าและสลับอุปกรณ์ (Presentation Remote)"
      >
        <Layers className="w-5 h-5 text-emerald-200" />
        <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
          {currentPage.number}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 transition-all select-none font-sans">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl p-2 flex flex-col gap-2 ring-1 ring-white/10 max-w-[340px]">
        {/* Main Remote Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={prevPage}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-bold transition-all shadow-xs cursor-pointer border border-slate-700"
            title="หน้าก่อนหน้า (ลูกศรซ้าย ◀)"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Page Badge & Title (Click to toggle full page list) */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-1.5 text-left cursor-pointer transition-colors"
            title="คลิกเพื่อดูรายชื่อหน้าทั้งหมด"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                หน้า {currentPage.number}/{presentationPages.length}
              </span>
              <span className="text-xs font-bold text-slate-100 truncate max-w-[130px] sm:max-w-[150px]">
                {currentPage.label}
              </span>
            </div>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={nextPage}
            className="p-1.5 sm:p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-90 text-white font-bold transition-all shadow-xs cursor-pointer border border-emerald-500"
            title="หน้าถัดไป (ลูกศรขวา ▶)"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="ย่อรีโมท"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Device Switcher Quick Icons */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 px-1 text-[11px]">
          <span className="text-slate-400 font-medium">โหมดโชว์:</span>
          <div className="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setDisplayDevice('desktop')}
              className={`p-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                displayDevice === 'desktop'
                  ? 'bg-[#006948] text-white font-bold shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="โชว์ในคอม (Desktop)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[10px]">คอม</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayDevice('ipad')}
              className={`p-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                displayDevice === 'ipad'
                  ? 'bg-[#006948] text-white font-bold shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="โชว์ในไอแพด (iPad)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="text-[10px]">ไอแพด</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayDevice('phone')}
              className={`p-1 rounded flex items-center gap-1 cursor-pointer transition-all ${
                displayDevice === 'phone'
                  ? 'bg-[#006948] text-white font-bold shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="โชว์ในโทรศัพท์ (Phone)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[10px]">มือถือ</span>
            </button>
          </div>
        </div>

        {/* Expanded Page Dropdown / List */}
        {expanded && (
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-0.5">
              เลือกหน้าเทมเพลตนำเสนอ:
            </div>
            {presentationPages.map((page, idx) => {
              const isActive = activeTab === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    goToPageByIndex(idx);
                    setExpanded(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#006948] text-white font-bold shadow-xs'
                      : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-white text-[#006948]' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {page.number}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate">{page.label}</span>
                      <span
                        className={`text-[10px] truncate ${
                          isActive ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {page.subtext}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white shrink-0">
                      แสดงอยู่
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
