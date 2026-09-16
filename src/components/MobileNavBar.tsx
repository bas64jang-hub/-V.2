import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { NavTab } from '../types';
import {
  Home,
  LayoutDashboard,
  MapPin,
  Layers,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useTransformers();

  const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'landing', label: 'หน้าเริ่ม', icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'dashboard', label: 'ภาพรวม', icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'detail', label: 'พิกัด/แผนที่', icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'linecutout', label: 'ฟิวส์ไลน์', icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'calculator', label: 'คำนวณ', icon: <Calculator className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'admin', label: 'จัดการ', icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1 px-2 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.06)] select-none safe-area-bottom"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] ${
              isActive
                ? 'text-[#006948] font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'bg-emerald-100/70 scale-105 text-[#006948]' : ''
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-sans">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
