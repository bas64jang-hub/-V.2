import React from 'react';
import { useTransformers } from '../context/TransformerContext';
import { NavTab } from '../types';
import {
  Home,
  Shield,
  MapPin,
  Calculator,
  UserCheck,
  Layers,
  ClipboardCheck,
} from 'lucide-react';

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useTransformers();

  const items: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'หน้าแรก', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'จุดป้องกัน', icon: <Shield className="w-4 h-4" /> },
    { id: 'linecutout', label: 'ฟิวส์ตัดไลน์', icon: <Layers className="w-4 h-4" /> },
    { id: 'incidents', label: 'เหตุการณ์', icon: <Shield className="w-4 h-4 text-amber-600" /> },
    { id: 'inspection', label: 'มป.11', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'detail', label: 'หม้อแปลง', icon: <MapPin className="w-4 h-4" /> },
    { id: 'calculator', label: 'สูตร กฟภ.', icon: <Calculator className="w-4 h-4" /> },
    { id: 'admin', label: 'แอดมิน', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-1 flex justify-around items-center shadow-[0_-3px_12px_rgba(0,0,0,0.06)] select-none safe-area-bottom overflow-x-auto no-scrollbar"
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-[48px] active:scale-95 cursor-pointer relative shrink-0 ${
              isActive
                ? 'text-[#006948] font-black'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all relative ${
                isActive
                  ? 'bg-emerald-100 text-[#006948] shadow-xs scale-105'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-[52px]">
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#006948] mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

