import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import {
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  BatteryCharging,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
} from 'lucide-react';

interface DeviceSimulatorFrameProps {
  children: React.ReactNode;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({ children }) => {
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

  // If in desktop mode, or frame is turned off, render directly without frame
  if (displayDevice === 'desktop' || !isDeviceFrameActive) {
    return <>{children}</>;
  }

  const currentPage = presentationPages[currentPageIndex] || presentationPages[0];

  return (
    <div className="w-full min-h-screen bg-slate-900/95 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start transition-all">
      {/* Outer Floating Control Bar above the simulated device */}
      <div className="w-full max-w-4xl mb-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg text-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-200">
            {displayDevice === 'ipad' ? '📟 เทมเพลตไอแพด (iPad Display)' : '📱 เทมเพลตโทรศัพท์ (Phone Display)'}
          </span>
          <span className="text-[11px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {currentPage.number}/{presentationPages.length}: {currentPage.label.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {displayDevice === 'ipad' && (
            <button
              type="button"
              onClick={() =>
                setIpadOrientation(ipadOrientation === 'landscape' ? 'portrait' : 'landscape')
              }
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="หมุนจอไอแพด"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ipadOrientation === 'landscape' ? 'หมุนเป็นแนวตั้ง' : 'หมุนเป็นแนวนอน'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDeviceFrameActive(false)}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ขยายแสดงผลเต็มหน้าจอโดยไม่มีกรอบจำลอง"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>เปิดเต็มจอ</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayDevice('desktop')}
            className="px-2.5 py-1 bg-[#006948] hover:bg-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white transition-colors cursor-pointer"
            title="กลับสู่โหมดจอคอมพิวเตอร์"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โชว์ในคอม</span>
          </button>
        </div>
      </div>

      {/* iPad Frame Simulator */}
      {displayDevice === 'ipad' && (
        <div
          className={`transition-all duration-300 relative bg-white border-[14px] sm:border-[18px] border-slate-800 rounded-[38px] sm:rounded-[48px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ${
            ipadOrientation === 'landscape'
              ? 'w-full max-w-[1120px] min-h-[760px]'
              : 'w-full max-w-[780px] min-h-[980px]'
          }`}
        >
          {/* iPad Top Camera Bezel */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 flex items-center justify-center z-50 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
          </div>

          {/* iPad iOS Status Bar */}
          <div className="w-full bg-slate-900 text-slate-300 px-6 py-1.5 flex items-center justify-between text-[11px] font-medium select-none shrink-0 z-40 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">09:41</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-medium">PEA Smart iPad Edition</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">5G</span>
              <Wifi className="w-3 h-3 text-slate-300" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">100%</span>
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* iPad In-Frame Presentation Remote Banner */}
          <div className="w-full bg-slate-100/95 border-b border-slate-300/80 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-[#006948] text-white text-[10px] font-black">
                หน้า {currentPage.number}/{presentationPages.length}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {currentPage.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={prevPage}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#006948]" />
                <span className="hidden xs:inline">ก่อนหน้า</span>
              </button>

              <div className="flex items-center gap-1">
                {presentationPages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToPageByIndex(idx)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      activeTab === page.id
                        ? 'bg-[#006948] text-white shadow-2xs font-black ring-1 ring-[#006948]'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                    title={page.label}
                  >
                    {page.number}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextPage}
                className="px-2.5 py-1 rounded-lg bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                title="หน้าถัดไป"
              >
                <span className="hidden xs:inline">ถัดไป</span>
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* iPad Inner Screen Scroll Area */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden p-2 sm:p-4">
            {children}
          </div>

          {/* iPad Home Indicator Bar */}
          <div className="w-full bg-slate-900/10 py-1.5 flex justify-center shrink-0 border-t border-slate-200/50">
            <div className="w-36 h-1 bg-slate-500 rounded-full opacity-60 hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}

      {/* Phone Frame Simulator */}
      {displayDevice === 'phone' && (
        <div className="w-full max-w-[420px] min-h-[820px] bg-white border-[12px] sm:border-[14px] border-slate-800 rounded-[44px] sm:rounded-[52px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative transition-all duration-300">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-slate-900 flex items-center justify-between px-2.5 z-50 pointer-events-none shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          {/* iOS Mobile Status Bar */}
          <div className="w-full bg-slate-900 text-slate-300 px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-medium select-none shrink-0 z-40 border-b border-slate-800">
            <span className="font-bold text-white text-xs">09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono">5G</span>
              <Wifi className="w-3 h-3 text-slate-300" />
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Mobile In-Frame Presentation Remote Banner */}
          <div className="w-full bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded-full bg-[#006948] text-white text-[9px] font-black">
                {currentPage.number}/{presentationPages.length}
              </span>
              <span className="text-[11px] font-bold text-slate-800 truncate">
                {currentPage.label.split(' ')[0]}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={prevPage}
                className="p-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-95 cursor-pointer"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#006948]" />
              </button>

              <div className="flex items-center gap-0.5">
                {presentationPages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToPageByIndex(idx)}
                    className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer ${
                      activeTab === page.id
                        ? 'bg-[#006948] text-white font-black'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {page.number}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={nextPage}
                className="p-1 rounded-md bg-[#006948] text-white hover:bg-[#005238] shadow-2xs active:scale-95 cursor-pointer"
                title="หน้าถัดไป"
              >
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Phone Inner Screen Scroll Area */}
          <div className="flex-1 w-full bg-slate-50 overflow-y-auto overflow-x-hidden p-2">
            {children}
          </div>

          {/* Phone Home Indicator Bar */}
          <div className="w-full bg-slate-900/10 py-1 flex justify-center shrink-0 border-t border-slate-200/50">
            <div className="w-28 h-1 bg-slate-500 rounded-full opacity-60"></div>
          </div>
        </div>
      )}
    </div>
  );
};
