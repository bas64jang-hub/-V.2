import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import {
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  HelpCircle,
  ShieldCheck,
  ClipboardCheck,
  MapPin,
  Calculator,
  SlidersHorizontal,
} from 'lucide-react';

export const PresentationBar: React.FC = () => {
  const {
    displayDevice,
    setDisplayDevice,
    ipadOrientation,
    setIpadOrientation,
    isDeviceFrameActive,
    setIsDeviceFrameActive,
    presentationPages,
    currentPageIndex,
    nextPage,
    prevPage,
    goToPageByIndex,
    activeTab,
  } = useTransformers();

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border-b border-slate-700/80 sticky top-14 sm:top-16 z-30 transition-all">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Left: Device Presentation Modes (โชว์ในคอม / ไอแพด / โทรศัพท์) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold tracking-wide">
              <span className="hidden xs:inline text-amber-400 font-bold uppercase text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                โหมดแสดงผล
              </span>
              <span className="text-[11px] text-slate-300 font-medium">อุปกรณ์:</span>
            </div>

            {/* Device Switcher Segmented Control */}
            <div className="inline-flex p-1 bg-slate-950/70 rounded-xl border border-slate-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => setDisplayDevice('desktop')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayDevice === 'desktop'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="แสดงผลเต็มจอคอมพิวเตอร์ (Desktop Display)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>โชว์ในคอม</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayDevice('ipad')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayDevice === 'ipad'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="จำลองหน้าจอไอแพด / แท็บเล็ต (iPad Display)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>โชว์ในไอแพด</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayDevice('phone')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  displayDevice === 'phone'
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="จำลองหน้าจอมือถือ (Smartphone Display)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>โชว์ในโทรศัพท์</span>
              </button>
            </div>

            {/* iPad-specific quick controls (Rotate orientation & Frame toggle) */}
            {displayDevice === 'ipad' && (
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() =>
                    setIpadOrientation(ipadOrientation === 'landscape' ? 'portrait' : 'landscape')
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="หมุนจอไอแพด (แนวนอน / แนวตั้ง)"
                >
                  <RotateCw className="w-3 h-3 text-emerald-400" />
                  <span>{ipadOrientation === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeviceFrameActive(!isDeviceFrameActive)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title={isDeviceFrameActive ? 'ขยายเต็มหน้าจอ (ไม่ใช้กรอบ)' : 'แสดงกรอบจำลองไอแพด'}
                >
                  {isDeviceFrameActive ? (
                    <>
                      <Maximize2 className="w-3 h-3 text-amber-400" />
                      <span className="hidden lg:inline">เต็มจอ</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3 h-3 text-emerald-400" />
                      <span className="hidden lg:inline">แสดงกรอบ</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Phone-specific frame toggle */}
            {displayDevice === 'phone' && (
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setIsDeviceFrameActive(!isDeviceFrameActive)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title={isDeviceFrameActive ? 'ขยายความกว้างเต็มที่' : 'แสดงกรอบจำลองมือถือ'}
                >
                  {isDeviceFrameActive ? (
                    <>
                      <Maximize2 className="w-3 h-3 text-amber-400" />
                      <span className="hidden lg:inline">เต็มจอ</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3 h-3 text-emerald-400" />
                      <span className="hidden lg:inline">แสดงกรอบ</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Quick Page Switcher (เปลี่ยนหน้าได้ง่าย) */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={prevPage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
              title="เปลี่ยนไปหน้าก่อนหน้า (หรือกดปุ่มลูกศรซ้าย ◀ บนคีย์บอร์ด)"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span className="hidden xs:inline">ก่อนหน้า</span>
            </button>

            {/* Direct Page Jump Buttons (1 to 5) */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-slate-700/60">
              {presentationPages.map((page, idx) => {
                const isActive = activeTab === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToPageByIndex(idx)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#006948] text-white shadow-xs ring-1 ring-emerald-400/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                    title={`หน้า ${page.number}: ${page.label} (${page.subtext})`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive ? 'bg-white text-[#006948]' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {page.number}
                    </span>
                    <span className="hidden sm:inline">{page.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={nextPage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
              title="เปลี่ยนไปหน้าถัดไป (หรือกดปุ่มลูกศรขวา ▶ บนคีย์บอร์ด)"
            >
              <span className="hidden xs:inline">ถัดไป</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>

            {/* Page Indicator Counter Badge */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300 shrink-0">
              <span className="text-emerald-400 font-bold">{currentPageIndex + 1}</span>
              <span className="text-slate-500">/</span>
              <span>{presentationPages.length}</span>
            </div>

            {/* Keyboard shortcut hint button */}
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="คีย์ลัดเปลี่ยนหน้า: กดปุ่ม ◀ และ ▶ บนคีย์บอร์ดเพื่อเปลี่ยนหน้าได้ทันที"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Shortcuts Help Banner */}
        {showHelp && (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> เคล็ดลับการเปลี่ยนหน้าและพรีเซนต์:
              </span>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-mono text-[11px]">
                  ◀ ลูกศรซ้าย
                </kbd>
                <span>หรือ</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-mono text-[11px]">
                  ▶ ลูกศรขวา
                </kbd>
                <span className="text-slate-400">เพื่อเปลี่ยนหน้าถัดไป/ก่อนหน้าได้ทันที</span>
              </div>
              <div className="text-slate-400">
                • เลือกระหว่าง <strong className="text-white">โชว์ในคอม</strong> (จอเต็ม) |{' '}
                <strong className="text-white">โชว์ในไอแพด</strong> (แท็บเล็ต) |{' '}
                <strong className="text-white">โชว์ในโทรศัพท์</strong> (มือถือ)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
