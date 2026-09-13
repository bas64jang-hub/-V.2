import React, { useState, useEffect } from 'react';
import { TransformerProvider, useTransformers } from './context/TransformerContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNavBar } from './components/MobileNavBar';
import { Toast } from './components/Toast';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { DetailView } from './components/DetailView';
import { FuseCalculatorView } from './components/FuseCalculatorView';
import { AdminView } from './components/AdminView';

const MainContent: React.FC = () => {
  const { activeTab } = useTransformers();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically scroll to top whenever the active view/tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // If in landing portal mode, show full-screen landing view matching the prompt's design
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#f4f7f5] text-slate-900 font-sans">
        <Toast />
        <LandingView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Toast />
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1 max-w-7xl w-full mx-auto pt-20 sm:pt-24 pb-28 md:pb-16 px-3 sm:px-5 md:px-6 flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Navigation Sidebar */}
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Dynamic View Display */}
        <div className="flex-1 min-w-0 w-full flex flex-col">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'detail' && <DetailView />}
          {activeTab === 'calculator' && <FuseCalculatorView />}
          {activeTab === 'admin' && <AdminView />}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNavBar />

      {/* Global Footer (Hidden on small mobile to avoid clashing with bottom bar) */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 sm:py-4 px-4 sm:px-6 text-xs text-slate-500 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
            <span>
              ระบบติดตามหม้อแปลงอัจฉริยะและคำนวณการป้องกัน กฟภ. (Smart Transformer SCADA System)
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>PEA-GRID v4.2.0</span>
            <span>•</span>
            <span>SCADA REALTIME ENFORCED</span>
            <span>•</span>
            <span>© 2024 การไฟฟ้าส่วนภูมิภาค</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransformerProvider>
      <MainContent />
    </TransformerProvider>
  );
}

