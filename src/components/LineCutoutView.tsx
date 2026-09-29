import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { LineCutout, Transformer, LineCutoutRecord } from '../types';
import { QuickFieldLogModal } from './QuickFieldLogModal';
import {
  calculateLineCutoutRating,
  STANDARD_LINE_FUSE_SIZES,
  extractFuseAmpere,
} from '../data/lineCutoutData';
import {
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Calculator,
  Search,
  Sliders,
  Layers,
  MapPin,
  Activity,
  ChevronRight,
  Download,
  Gauge,
  ExternalLink,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Save,
  History,
  Edit3,
  Trash2,
  Plus,
  Clock,
  FileCheck,
} from 'lucide-react';

export const LineCutoutView: React.FC = () => {
  const {
    transformers,
    lineCutouts,
    selectedLineCutoutId,
    setSelectedLineCutoutId,
    updateLineCutout,
    saveLineCutout,
    reassignTransformerLineCutout,
    lineCutoutRecords,
    saveLineCutoutRecord,
    deleteLineCutoutRecord,
    setSelectedId,
    setActiveTab,
    showToast,
    currentUser,
  } = useTransformers();

  // Main Tab State: 'cutouts' (map/cards) vs 'history' (saved calculation & survey records)
  const [activeMainTab, setActiveMainTab] = useState<'cutouts' | 'history'>('cutouts');

  // Search & Filter state for Cutouts
  const [searchTerm, setSearchTerm] = useState('');
  const [feederFilter, setFeederFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search & Filter state for History
  const [historySearch, setHistorySearch] = useState('');
  const [historyCutoutFilter, setHistoryCutoutFilter] = useState('ALL');

  // Modal / Drawer state for drill-down into a specific line cutout
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  // New Modals: Save Calculation Record & Edit Cutout Specs & Quick Log
  const [isSaveRecordModalOpen, setIsSaveRecordModalOpen] = useState(false);
  const [isEditCutoutModalOpen, setIsEditCutoutModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // Form state for saving record
  const [recordActionType, setRecordActionType] = useState<
    'calculation_audit' | 'fuse_replacement' | 'routine_survey' | 'emergency_repair'
  >('fuse_replacement');
  const [recordEngineerName, setRecordEngineerName] = useState(
    currentUser?.name || 'นายสุรชัย มั่นจิตต์ (ช่างเทคนิค 5)'
  );
  const [recordInstalledAfter, setRecordInstalledAfter] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  // Form state for editing Line Cutout
  const [editName, setEditName] = useState('');
  const [editPoleId, setEditPoleId] = useState('');
  const [editFeeder, setEditFeeder] = useState('');
  const [editVoltage, setEditVoltage] = useState(22);
  const [editInstalledFuse, setEditInstalledFuse] = useState('');
  const [editDiversity, setEditDiversity] = useState(0.8);
  const [editMultiplier, setEditMultiplier] = useState(1.75);
  const [editNotes, setEditNotes] = useState('');

  // Simulation tuning parameters for drill-down view
  const [customDiversity, setCustomDiversity] = useState<number | null>(null);
  const [customMultiplier, setCustomMultiplier] = useState<number | null>(null);
  const [customFuseType, setCustomFuseType] = useState<'T' | 'K' | null>(null);
  const [transformerSearch, setTransformerSearch] = useState('');

  // Reassign modal state
  const [reassignTarget, setReassignTarget] = useState<{ transformerId: string; currentCutoutId: string } | null>(null);

  // Quick simulation edit load state
  const [simulatedLoadOverrides, setSimulatedLoadOverrides] = useState<{ [transformerId: string]: number }>({});

  // Group transformers by Line Cutout
  const transformersByCutout = useMemo(() => {
    const map = new Map<string, Transformer[]>();
    lineCutouts.forEach((lc) => map.set(lc.id, []));

    transformers.forEach((t) => {
      const cutoutId = t.lineCutoutId || 'LC-01';
      if (!map.has(cutoutId)) {
        map.set(cutoutId, []);
      }
      map.get(cutoutId)!.push(t);
    });

    return map;
  }, [transformers, lineCutouts]);

  // Calculations for all Line Cutouts
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

  // Overall Fleet KPI summary
  const summaryStats = useMemo(() => {
    let totalCutouts = lineCutouts.length;
    let totalTransformersAssigned = 0;
    let totalKvaSum = 0;
    let totalLoadKvaSum = 0;
    let undersizedCount = 0;
    let optimalCount = 0;

    lineCutouts.forEach((lc) => {
      const calc = cutoutCalculations.get(lc.id);
      if (calc) {
        totalTransformersAssigned += calc.totalTransformersCount;
        totalKvaSum += calc.totalConnectedKva;
        totalLoadKvaSum += calc.totalLoadKva;
        if (calc.statusVsInstalled === 'undersized') {
          undersizedCount++;
        } else {
          optimalCount++;
        }
      }
    });

    return {
      totalCutouts,
      totalTransformersAssigned,
      totalKvaSum,
      totalLoadKvaSum,
      undersizedCount,
      optimalCount,
    };
  }, [lineCutouts, cutoutCalculations]);

  // Filtered Line Cutouts
  const filteredCutouts = useMemo(() => {
    return lineCutouts.filter((lc) => {
      const calc = cutoutCalculations.get(lc.id);
      const searchMatch =
        searchTerm === '' ||
        lc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lc.poleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lc.feeder.toLowerCase().includes(searchTerm.toLowerCase());

      const feederMatch = feederFilter === 'ALL' || lc.feeder.includes(feederFilter);

      let statusMatch = true;
      if (statusFilter === 'UNDERSIZED') {
        statusMatch = calc?.statusVsInstalled === 'undersized';
      } else if (statusFilter === 'OPTIMAL') {
        statusMatch = calc?.statusVsInstalled === 'optimal';
      }

      return searchMatch && feederMatch && statusMatch;
    });
  }, [lineCutouts, cutoutCalculations, searchTerm, feederFilter, statusFilter]);

  // Active Line Cutout for Drill-Down Modal
  const activeCutout = useMemo(() => {
    const targetId = activeModalId || selectedLineCutoutId || 'LC-01';
    return lineCutouts.find((lc) => lc.id === targetId) || lineCutouts[0];
  }, [activeModalId, selectedLineCutoutId, lineCutouts]);

  // Transformers belonging to the active drill-down Line Cutout
  const activeTransformers = useMemo(() => {
    if (!activeCutout) return [];
    const list = transformersByCutout.get(activeCutout.id) || [];
    // Apply any simulation overrides
    return list.map((t) => {
      if (simulatedLoadOverrides[t.id] !== undefined) {
        const simLoad = simulatedLoadOverrides[t.id];
        const percent = t.kva > 0 ? (simLoad / t.kva) * 100 : 0;
        return {
          ...t,
          loadKva: simLoad,
          loadKw: +(simLoad * 0.9).toFixed(1),
          percent: +percent.toFixed(1),
        };
      }
      return t;
    });
  }, [activeCutout, transformersByCutout, simulatedLoadOverrides]);

  // Filtered transformers inside the drill-down view
  const filteredActiveTransformers = useMemo(() => {
    if (!transformerSearch) return activeTransformers;
    const term = transformerSearch.toLowerCase();
    return activeTransformers.filter(
      (t) =>
        t.id.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term) ||
        t.poleId.toLowerCase().includes(term) ||
        t.kva.toString().includes(term)
    );
  }, [activeTransformers, transformerSearch]);

  // Dynamic calculation for the active drill-down Line Cutout (incorporating any sliders/simulation)
  const activeCalculation = useMemo(() => {
    if (!activeCutout) return null;
    const diversity = customDiversity ?? activeCutout.diversityFactor ?? 0.8;
    const mult = customMultiplier ?? activeCutout.multiplier ?? 1.75;
    const fType = customFuseType ?? activeCutout.fuseType ?? 'T';

    return calculateLineCutoutRating(
      activeTransformers,
      activeCutout.installedFuse,
      activeCutout.voltage,
      diversity,
      mult,
      fType
    );
  }, [activeCutout, activeTransformers, customDiversity, customMultiplier, customFuseType]);

  // Handle saving newly calculated Line Cutout rating to the active cutout
  const handleApplyRecommendedFuse = () => {
    if (!activeCutout || !activeCalculation) return;
    updateLineCutout(activeCutout.id, {
      installedFuse: activeCalculation.recommendedFuseTag,
      fuseType: activeCalculation.recommendedFuseTag.includes('K') ? 'K' : 'T',
    });
    showToast(
      `อัปเดตขนาดฟิวส์ตัดไลน์ ${activeCutout.id} เป็น ${activeCalculation.recommendedFuseTag} สำเร็จ`,
      'FUSE_UPDATED',
      'success'
    );
  };

  // Open Transformer Detail View
  const handleViewTransformerDetail = (tId: string) => {
    setSelectedId(tId);
    setActiveTab('detail');
  };

  // Export CSV of transformers in active Line Cutout
  const handleExportCsv = () => {
    if (!activeCutout || activeTransformers.length === 0) return;
    const headers = [
      'รหัสหม้อแปลง',
      'ชื่อหม้อแปลง',
      'รหัสเสา',
      'ขนาดพิกัด (kVA)',
      'โหลดใช้งานจริง (kVA)',
      'โหลด (kW)',
      'สัดส่วนโหลด (%)',
      'ฟิวส์หม้อแปลง',
      'ฟิวส์ตัดไลน์คุม',
      'สถานะ',
    ];
    const rows = activeTransformers.map((t) => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.poleId,
      t.kva,
      t.loadKva,
      t.loadKw,
      t.percent,
      t.fuse,
      activeCutout.name,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `หม้อแปลง_ฟิวส์ตัดไลน์_${activeCutout.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์ข้อมูลหม้อแปลงสำเร็จ', 'EXPORT_OK', 'success');
  };

  // Open Save Calculation Record modal
  const handleOpenSaveRecordModal = () => {
    if (!activeCutout || !activeCalculation) return;
    setRecordInstalledAfter(activeCalculation.recommendedFuseTag || activeCutout.installedFuse);
    setRecordNotes(
      activeCalculation.analysisNote ||
        `บันทึกผลการคำนวณและประสานขนาดฟิวส์ตัดไลน์จุด ${activeCutout.id} ตามมาตรฐาน กฟภ.`
    );
    setIsSaveRecordModalOpen(true);
  };

  // Confirm save Line Cutout Record
  const handleConfirmSaveRecord = () => {
    if (!activeCutout || !activeCalculation) return;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const newId = `LCR-68-${Date.now().toString().slice(-5)}`;

    const newRecord: LineCutoutRecord = {
      id: newId,
      cutoutId: activeCutout.id,
      cutoutName: activeCutout.name,
      poleId: activeCutout.poleId,
      feeder: activeCutout.feeder,
      voltage: activeCutout.voltage,
      recordedAt: Date.now(),
      recordedDate: today,
      recordedTime: nowTime,
      engineerName: recordEngineerName.trim() || 'ช่างเทคนิค กฟภ.',
      installedFuseBefore: activeCutout.installedFuse,
      recommendedFuse: activeCalculation.recommendedFuseTag,
      installedFuseAfter: recordInstalledAfter || activeCalculation.recommendedFuseTag,
      statusVsInstalled: activeCalculation.statusVsInstalled,
      totalTransformersCount: activeCalculation.totalTransformersCount,
      totalConnectedKva: activeCalculation.totalConnectedKva,
      totalLoadKva: activeCalculation.totalLoadKva,
      actualLoadCurrent: activeCalculation.actualLoadCurrent,
      sizingCurrent: activeCalculation.sizingCurrent,
      diversityFactor: customDiversity ?? activeCutout.diversityFactor ?? 0.8,
      multiplier: customMultiplier ?? activeCutout.multiplier ?? 1.75,
      fuseType: (recordInstalledAfter || activeCalculation.recommendedFuseTag).includes('K') ? 'K' : 'T',
      actionType: recordActionType,
      notes: recordNotes.trim(),
    };

    saveLineCutoutRecord(newRecord);
    setIsSaveRecordModalOpen(false);
  };

  // Open Edit Cutout modal
  const handleOpenEditCutoutModal = () => {
    if (!activeCutout) return;
    setEditName(activeCutout.name);
    setEditPoleId(activeCutout.poleId);
    setEditFeeder(activeCutout.feeder);
    setEditVoltage(activeCutout.voltage || 22);
    setEditInstalledFuse(activeCutout.installedFuse);
    setEditDiversity(activeCutout.diversityFactor ?? 0.8);
    setEditMultiplier(activeCutout.multiplier ?? 1.75);
    setEditNotes(activeCutout.notes || '');
    setIsEditCutoutModalOpen(true);
  };

  // Confirm Edit Cutout
  const handleConfirmEditCutout = () => {
    if (!activeCutout) return;
    const updatedCutout: LineCutout = {
      ...activeCutout,
      name: editName.trim() || activeCutout.name,
      poleId: editPoleId.trim() || activeCutout.poleId,
      feeder: editFeeder.trim() || activeCutout.feeder,
      voltage: editVoltage,
      installedFuse: editInstalledFuse.trim() || activeCutout.installedFuse,
      fuseType: editInstalledFuse.includes('K') ? 'K' : 'T',
      diversityFactor: editDiversity,
      multiplier: editMultiplier,
      notes: editNotes.trim(),
    };
    saveLineCutout(updatedCutout);
    setIsEditCutoutModalOpen(false);
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return (lineCutoutRecords || []).filter((r) => {
      const matchCutout = historyCutoutFilter === 'ALL' || r.cutoutId === historyCutoutFilter;
      const term = historySearch.toLowerCase();
      const matchSearch =
        !term ||
        r.id.toLowerCase().includes(term) ||
        r.cutoutId.toLowerCase().includes(term) ||
        r.cutoutName.toLowerCase().includes(term) ||
        r.engineerName.toLowerCase().includes(term) ||
        (r.notes && r.notes.toLowerCase().includes(term));
      return matchCutout && matchSearch;
    });
  }, [lineCutoutRecords, historyCutoutFilter, historySearch]);

  // Export History CSV
  const handleExportHistoryCsv = () => {
    if (filteredHistory.length === 0) return;
    const headers = [
      'รหัสบันทึก',
      'วันที่',
      'เวลา',
      'รหัสฟิวส์ตัดไลน์',
      'ชื่อสายแยก',
      'เสา',
      'ฟีดเดอร์',
      'ฟิวส์เดิม',
      'ฟิวส์แนะนำ',
      'ฟิวส์ใหม่ที่เปลี่ยน',
      'จำนวนหม้อแปลง',
      'kVA รวม',
      'โหลดรวม (kVA)',
      'กระแสโหลดจริง (A)',
      'ประเภทงาน',
      'ผู้บันทึก',
      'หมายเหตุ',
    ];
    const rows = filteredHistory.map((r) => [
      r.id,
      r.recordedDate,
      r.recordedTime,
      r.cutoutId,
      `"${r.cutoutName.replace(/"/g, '""')}"`,
      r.poleId,
      r.feeder,
      r.installedFuseBefore,
      r.recommendedFuse,
      r.installedFuseAfter || '-',
      r.totalTransformersCount,
      r.totalConnectedKva,
      r.totalLoadKva,
      r.actualLoadCurrent,
      r.actionType,
      `"${r.engineerName.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ประวัติการบันทึกค่าฟิวส์ตัดไลน์_กฟสบ้านโฮ่ง.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ส่งออกประวัติการบันทึกค่าฟิวส์ตัดไลน์เรียบร้อย', 'EXPORT_OK', 'success');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 text-slate-800">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 tracking-wide mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <Layers className="w-3.5 h-3.5 mr-1" />
                PEA Distribution Lateral Line Protection
              </span>
              <span>•</span>
              <span className="text-slate-500">ระบบจำหน่ายไฟฟ้าแรงสูง 22 kV / 33 kV</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              ระบบตรวจสอบและคำนวณฟิวส์ตัดไลน์ (Drop-out Line Cutout)
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              จัดกลุ่มหม้อแปลงตามฟิวส์ตัดไลน์สายสาขา รวมโหลดจริงของหม้อแปลงทั้งหมดในสาย
              คำนวณหาพิกัดฟิวส์ตัดไลน์ใหม่ตามมาตรฐาน กฟภ. พร้อมตรวจสอบการประสานการทำงาน (Selective Coordination)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setSimulatedLoadOverrides({});
                setCustomDiversity(null);
                setCustomMultiplier(null);
                showToast('รีเซ็ตการจำลองพารามิเตอร์กลับสู่ค่าจริง', 'RESET_SIM', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
            >
              <Activity className="w-4 h-4 text-slate-600" />
              รีเซ็ตค่าจำลอง
            </button>
            <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              รวม {summaryStats.totalCutouts} สายสาขา ({summaryStats.totalTransformersAssigned} หม้อแปลง)
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>ฟิวส์ตัดไลน์ทั้งหมด</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{summaryStats.totalCutouts} จุด</div>
            <div className="text-xs text-slate-500 mt-1">ครอบคลุมทุกฟีดเดอร์หลัก</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>หม้อแปลงในสายสาขา</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{summaryStats.totalTransformersAssigned} ลูก</div>
            <div className="text-xs text-blue-700 mt-1 font-medium">100% สังกัดสายสาขาชัดเจน</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>โหลดจริงรวมทุกสาย</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {(summaryStats.totalLoadKvaSum / 1000).toFixed(2)} MVA
            </div>
            <div className="text-xs text-slate-500 mt-1">
              พิกัดรวม {(summaryStats.totalKvaSum / 1000).toFixed(2)} MVA
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              summaryStats.undersizedCount > 0
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span>จุดที่ต้องปรับขนาดฟิวส์ใหม่</span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  summaryStats.undersizedCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              />
            </div>
            <div className="text-2xl font-bold">
              {summaryStats.undersizedCount > 0 ? `${summaryStats.undersizedCount} จุด` : 'ผ่านเกณฑ์ทุกจุด'}
            </div>
            <div className="text-xs mt-1">
              {summaryStats.undersizedCount > 0
                ? 'เสี่ยงฟิวส์ตัดไลน์ขาดผิดจังหวะ'
                : 'พิกัดฟิวส์เหมาะสมทุกสาย'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation: Cutout Cards vs Saved Calculation History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMainTab('cutouts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'cutouts'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ผังรายการฟิวส์ตัดไลน์ ({lineCutouts.length} จุด)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'history'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติการบันทึกค่า &amp; ผลคำนวณ ({lineCutoutRecords.length} รายการ)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsQuickLogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกค่าหน้างานทันที</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Cutout Cards Grid */}
      {activeMainTab === 'cutouts' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาฟิวส์ตัดไลน์ (รหัส, ชื่อสายแยก, รหัสเสา, ฟีดเดอร์)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Feeder Filter */}
              <select
                value={feederFilter}
                onChange={(e) => setFeederFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="ALL">ทุกลายฟีดเดอร์ (Feeder)</option>
                <option value="BGA01">ฟีดเดอร์ BGA01 (ชนบท)</option>
                <option value="BGA02">ฟีดเดอร์ BGA02 (ชนบท)</option>
                <option value="BGA04">ฟีดเดอร์ BGA04 (เทศบาล)</option>
                <option value="CEA04">ฟีดเดอร์ CEA04 (เทศบาล)</option>
                <option value="CEA05">ฟีดเดอร์ CEA05 (เทศบาล)</option>
                <option value="CEA07">ฟีดเดอร์ CEA07 (เทศบาล)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="UNDERSIZED">⚠️ แนะนำขยายพิกัดฟิวส์</option>
                <option value="OPTIMAL">✓ พิกัดฟิวส์เหมาะสม</option>
              </select>
            </div>
          </div>

          {/* Grid of Line Cutouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCutouts.map((lc) => {
              const calc = cutoutCalculations.get(lc.id);
              const isUndersized = calc?.statusVsInstalled === 'undersized';
              const isSelected = selectedLineCutoutId === lc.id;

              return (
                <div
                  key={lc.id}
                  onClick={() => {
                    setSelectedLineCutoutId(lc.id);
                    setActiveModalId(lc.id);
                  }}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer group hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                    isUndersized
                      ? 'border-rose-300 hover:border-rose-400'
                      : isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Top Row: ID, Feeder, Pole */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {lc.id}
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {lc.feeder}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isUndersized ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            แนะนำปรับฟิวส์
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ขนาดเหมาะสม
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Line Cutout Name */}
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                      {lc.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        เสา: {lc.poleId}
                      </span>
                      <span>•</span>
                      <span>แรงดัน {lc.voltage} kV</span>
                    </div>

                    {/* Metrics Box */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          จำนวนหม้อแปลงในสาย:
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {calc?.totalTransformersCount || 0} ลูก
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>พิกัด kVA รวม:</span>
                        <span className="font-semibold text-slate-900">
                          {calc?.totalConnectedKva.toLocaleString()} kVA
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>โหลดใช้งานจริงรวม:</span>
                        <span className="font-bold text-slate-900">
                          {calc?.totalLoadKva.toFixed(1)} kVA ({calc?.avgPercentLoad.toFixed(1)}%)
                        </span>
                      </div>

                      {/* Load progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (calc?.avgPercentLoad || 0) > 75
                              ? 'bg-rose-500'
                              : (calc?.avgPercentLoad || 0) > 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(calc?.avgPercentLoad || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fuse comparison strip */}
                    <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl border border-slate-200/90 bg-white">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          ฟิวส์ติดตั้งเดิม
                        </div>
                        <div className="font-mono font-bold text-slate-800 text-sm">
                          {lc.installedFuse}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400" />

                      <div className="text-right">
                        <div className="text-[10px] text-amber-700 uppercase tracking-wider font-semibold">
                          ฟิวส์คำนวณใหม่
                        </div>
                        <div
                          className={`font-mono font-bold text-sm ${
                            isUndersized ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {calc?.recommendedFuseTag}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                    <span className="flex items-center gap-1">
                      คลิกเพื่อดูหม้อแปลง {calc?.totalTransformersCount} ลูกในฟิวส์นี้
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCutouts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800">ไม่พบฟิวส์ตัดไลน์ตามเงื่อนไขที่ค้นหา</h3>
              <p className="text-sm text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองฟีดเดอร์ใหม่</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFeederFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: Saved Calculation & Survey Records History */}
      {activeMainTab === 'history' && (
        <div className="space-y-4">
          {/* History Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="ค้นหาประวัติการบันทึก (รหัส, ชื่อสายแยก, ช่างผู้บันทึก, หมายเหตุ)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={historyCutoutFilter}
                onChange={(e) => setHistoryCutoutFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="ALL">ทุกจุดฟิวส์ตัดไลน์</option>
                {lineCutouts.map((lc) => (
                  <option key={lc.id} value={lc.id}>
                    {lc.id}: {lc.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportHistoryCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">รหัสบันทึก / วันที่</th>
                    <th className="py-3 px-3.5">จุดฟิวส์ตัดไลน์ (Line Cutout)</th>
                    <th className="py-3 px-3.5">ลักษณะงาน</th>
                    <th className="py-3 px-3.5 text-center">ฟิวส์เดิม → ฟิวส์ใหม่</th>
                    <th className="py-3 px-3.5 text-right">โหลดจริง (kVA)</th>
                    <th className="py-3 px-3.5 text-right">กระแส (A)</th>
                    <th className="py-3 px-3.5">ผู้บันทึกข้อมูล</th>
                    <th className="py-3 px-3.5">หมายเหตุหน้างาน</th>
                    <th className="py-3 px-3.5 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{r.id}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{r.recordedDate} {r.recordedTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-amber-800">{r.cutoutId}</div>
                        <div className="text-slate-700 font-medium truncate max-w-[200px]">{r.cutoutName}</div>
                        <div className="text-[10px] text-slate-400">เสา: {r.poleId} | {r.feeder}</div>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.actionType === 'fuse_replacement'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : r.actionType === 'routine_survey'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.actionType === 'emergency_repair'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {r.actionType === 'fuse_replacement'
                            ? '⚡ เปลี่ยนขนาดฟิวส์'
                            : r.actionType === 'routine_survey'
                            ? '📋 ตรวจสอบประจำรอบ'
                            : r.actionType === 'emergency_repair'
                            ? '🚨 ซ่อมแซมฉุกเฉิน'
                            : '📐 คำนวณประสานพิกัด'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 line-through">
                            {r.installedFuseBefore}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                            {r.installedFuseAfter || r.recommendedFuse}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                        <div className="font-bold text-slate-900">{r.totalLoadKva?.toFixed(1) || '-'} kVA</div>
                        <div className="text-[10px] text-slate-400">({r.totalConnectedKva} kVA รวม)</div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {r.actualLoadCurrent?.toFixed(1) || '-'} A
                      </td>
                      <td className="py-3 px-3.5 text-xs text-slate-700 whitespace-nowrap">
                        {r.engineerName}
                      </td>
                      <td className="py-3 px-3.5 text-xs text-slate-600 max-w-[220px]">
                        <span className="line-clamp-2">{r.notes || '-'}</span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => deleteLineCutoutRecord(r.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-12 p-6">
                <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">ไม่พบประวัติการบันทึกค่าที่ตรงกับการค้นหา</h4>
                <p className="text-xs text-slate-400 mt-1">สามารถกด "บันทึกค่าหน้างานทันที" เพื่อเพิ่มรายการใหม่</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRILL-DOWN MODAL: Inspect specific Line Cutout and its list of Transformers */}
      {activeModalId && activeCutout && activeCalculation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500 text-slate-950 rounded-md">
                    {activeCutout.id}
                  </span>
                  <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-md">
                    {activeCutout.feeder}
                  </span>
                  <span className="text-xs text-slate-300">เสา: {activeCutout.poleId}</span>
                  <span className="text-xs text-amber-400">• แรงดัน {activeCutout.voltage} kV 3-Phase</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                  {activeCutout.name}
                </h2>
                <p className="text-xs text-slate-300 mt-1">{activeCutout.notes}</p>
              </div>

              <button
                onClick={() => setActiveModalId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* SECTION 1: Aggregate Calculation & Re-sizing Tool */}
              <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/80">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-600" />
                      เครื่องมือคำนวณและประเมินขนาดฟิวส์ตัดไลน์ใหม่ (PEA Line Sizing Engine)
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      รวมโหลดของหม้อแปลงทั้งหมดในฟิวส์ตัดไลน์ตัวนี้ ({activeCalculation.totalTransformersCount} ลูก)
                      เพื่อคำนวณหาขนาดฟิวส์ตัดไลน์ใหม่
                    </p>
                  </div>

                  {activeCalculation.statusVsInstalled === 'undersized' ? (
                    <button
                      onClick={handleApplyRecommendedFuse}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      อัปเดตเป็นขนาดใหม่ ({activeCalculation.recommendedFuseTag})
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      พิกัดติดตั้งเดิม ({activeCutout.installedFuse}) เหมาะสมแล้ว
                    </div>
                  )}
                </div>

                {/* Calculation Metrics 4-Column Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-4">
                  <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                    <span className="text-slate-500 font-medium">พิกัดหม้อแปลงรวม:</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeCalculation.totalConnectedKva.toLocaleString()} kVA
                    </div>
                    <span className="text-[11px] text-slate-500">
                      FLA รวม: {activeCalculation.flaConnectedTotal.toFixed(1)} A
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                    <span className="text-slate-500 font-medium">โหลดจริงรวม (Actual Load):</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeCalculation.totalLoadKva.toFixed(1)} kVA
                    </div>
                    <span className="text-[11px] text-slate-500">
                      ({activeCalculation.totalLoadKw.toFixed(1)} kW | {activeCalculation.avgPercentLoad.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                    <span className="text-slate-500 font-medium">กระแสโหลดจริง (22 kV):</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeCalculation.actualLoadCurrent.toFixed(2)} A
                    </div>
                    <span className="text-[11px] text-slate-500">
                      กระแสประเมิน Inrush: {activeCalculation.sizingCurrent.toFixed(2)} A
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200/80">
                    <span className="text-slate-500 font-medium">หม้อแปลงลูกใหญ่สุด:</span>
                    <div className="text-lg font-bold text-amber-700 mt-0.5">
                      {activeCalculation.maxIndividualKva} kVA
                    </div>
                    <span className="text-[11px] text-slate-600 font-semibold">
                      ฟิวส์ย่อย: {activeCalculation.maxDownstreamFuseTag}
                    </span>
                  </div>
                </div>

                {/* Sizing Parameters Tuning (Diversity factor, Multiplier, Fuse Type) */}
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 mb-4">
                  <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    ปรับพารามิเตอร์การคำนวณจำลอง (Engineering Simulation Parameters)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Diversity Factor */}
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>ตัวประกอบความต้องการพร้อมกัน (Diversity):</span>
                        <span className="font-bold text-amber-700">
                          {customDiversity ?? activeCutout.diversityFactor ?? 0.8}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.60"
                        max="1.00"
                        step="0.05"
                        value={customDiversity ?? activeCutout.diversityFactor ?? 0.8}
                        onChange={(e) => setCustomDiversity(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>0.60 (โหลดสลับเวลา)</span>
                        <span>0.80 (เกณฑ์ กฟภ.)</span>
                        <span>1.00 (พีคพร้อมกัน)</span>
                      </div>
                    </div>

                    {/* Multiplier */}
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>ตัวคูณกระแสกระชาก & เผื่อขยาย:</span>
                        <span className="font-bold text-amber-700">
                          {customMultiplier ?? activeCutout.multiplier ?? 1.75}x
                        </span>
                      </div>
                      <select
                        value={customMultiplier ?? activeCutout.multiplier ?? 1.75}
                        onChange={(e) => setCustomMultiplier(parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="1.50">1.50x (สายสาขาทั่วไป)</option>
                        <option value="1.75">1.75x (มาตรฐาน กฟภ. แนะนำ)</option>
                        <option value="2.00">2.00x (มีมอเตอร์/ปั๊มน้ำมาก)</option>
                        <option value="2.50">2.50x (เผื่อโหลดอนาคตสูง)</option>
                      </select>
                    </div>

                    {/* Fuse Type */}
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>ประเภทฟิวส์ตัดไลน์ (Fuse Speed):</span>
                        <span className="font-bold text-amber-700">
                          Type {customFuseType ?? activeCutout.fuseType ?? 'T'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCustomFuseType('T')}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            (customFuseType ?? activeCutout.fuseType ?? 'T') === 'T'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Type T (ช้า/หน่วงเวลา)
                        </button>
                        <button
                          onClick={() => setCustomFuseType('K')}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            (customFuseType ?? activeCutout.fuseType ?? 'T') === 'K'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Type K (เร็ว)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Comparison Result Banner */}
                <div className="p-4 rounded-xl bg-white border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">ผลการคำนวณและประสานฟิวส์:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          activeCalculation.statusVsInstalled === 'undersized'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activeCalculation.statusText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {activeCalculation.analysisNote}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">ฟิวส์เดิมที่เสา</div>
                      <div className="text-base font-mono font-bold text-slate-700">
                        {activeCutout.installedFuse}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <div className="text-center">
                      <div className="text-[10px] text-amber-700 uppercase font-semibold">ฟิวส์ตัดไลน์ใหม่</div>
                      <div className="text-xl font-mono font-extrabold text-amber-800">
                        {activeCalculation.recommendedFuseTag}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: List of Transformers in this Line Cutout */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      รายการหม้อแปลงที่อยู่ในฟิวส์ตัดไลน์นี้ ({activeTransformers.length} ลูก)
                    </h3>
                    <p className="text-xs text-slate-500">
                      แสดงขนาดพิกัด (kVA), โหลดใช้งานจริง, สัดส่วนโหลด และฟิวส์ประจำหม้อแปลงแต่ละลูก
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={transformerSearch}
                        onChange={(e) => setTransformerSearch(e.target.value)}
                        placeholder="ค้นหาหม้อแปลงในสายนี้..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="ส่งออกไฟล์ CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ส่งออก CSV
                    </button>
                  </div>
                </div>

                {/* Table of Transformers */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[380px]">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/80 text-slate-700 font-semibold sticky top-0 z-10 backdrop-blur-xs border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">รหัสหม้อแปลง</th>
                          <th className="py-2.5 px-3">ชื่อหม้อแปลง / สถานที่</th>
                          <th className="py-2.5 px-3">รหัสเสา</th>
                          <th className="py-2.5 px-3 text-right">ขนาด (kVA)</th>
                          <th className="py-2.5 px-3 text-right">โหลดจริง (kVA)</th>
                          <th className="py-2.5 px-3 text-right">โหลด (%)</th>
                          <th className="py-2.5 px-3">ฟิวส์หม้อแปลง</th>
                          <th className="py-2.5 px-3">สถานะ</th>
                          <th className="py-2.5 px-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredActiveTransformers.map((t) => {
                          const isSimulated = simulatedLoadOverrides[t.id] !== undefined;

                          return (
                            <tr key={t.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {t.id}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-medium text-slate-800 truncate max-w-[220px]">
                                  {t.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                                  {t.area}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{t.poleId}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {t.kva} kVA
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="font-bold text-slate-900">
                                  {t.loadKva} kVA
                                  {isSimulated && (
                                    <span className="ml-1 text-[10px] text-amber-600 font-medium">(จำลอง)</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">{t.loadKw} kW</div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded-md font-bold text-[11px] ${
                                    t.percent >= 80
                                      ? 'bg-rose-100 text-rose-800'
                                      : t.percent >= 50
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {t.percent}%
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-amber-800 font-semibold">
                                {t.fuse}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    t.status === 'normal'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : t.status === 'warning'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {t.status === 'normal'
                                    ? 'ปกติ'
                                    : t.status === 'warning'
                                    ? 'เตือน'
                                    : 'วิกฤต'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleViewTransformerDetail(t.id)}
                                    className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                                    title="ดูรายละเอียดหม้อแปลงและแผนที่"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setReassignTarget({
                                        transformerId: t.id,
                                        currentCutoutId: activeCutout.id,
                                      })
                                    }
                                    className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                    title="ย้ายไปยังฟิวส์ตัดไลน์อื่น"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                มาตรฐาน กฟภ. กำหนดให้ฟิวส์ตัดไลน์ต้องมีขนาดใหญ่กว่าฟิวส์ย่อยอย่างน้อย 1-2 ระดับพิกัด
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenEditCutoutModal}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>แก้ไขข้อมูลอุปกรณ์</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyRecommendedFuse}
                  className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>นำฟิวส์ {activeCalculation?.recommendedFuseTag} ไปใช้</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenSaveRecordModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกผลคำนวณ &amp; ประเมิน</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE CALCULATION & SURVEY RECORD MODAL */}
      {isSaveRecordModalOpen && activeCutout && activeCalculation && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    บันทึกผลการคำนวณและประเมินฟิวส์ตัดไลน์
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {activeCutout.id}: {activeCutout.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-700">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                <div>
                  <span className="text-[11px] text-slate-500">ฟิวส์เดิมที่เสา:</span>
                  <div className="font-bold text-slate-800">{activeCutout.installedFuse}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">ฟิวส์แนะนำตาม กฟภ.:</span>
                  <div className="font-bold text-amber-700">{activeCalculation.recommendedFuseTag}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">โหลดรวม:</span>
                  <div className="font-bold text-slate-800">{activeCalculation.totalLoadKva.toFixed(1)} kVA ({activeCalculation.totalTransformersCount} ลูก)</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">กระแสโหลดจริง (22 kV):</span>
                  <div className="font-bold text-slate-800">{activeCalculation.actualLoadCurrent.toFixed(2)} A</div>
                </div>
              </div>

              {/* Action Type */}
              <div>
                <label className="block font-semibold mb-1">ประเภทงานบันทึก:</label>
                <select
                  value={recordActionType}
                  onChange={(e) => setRecordActionType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="fuse_replacement">เปลี่ยนขนาดฟิวส์ตัดไลน์ใหม่ (Fuse Replacement)</option>
                  <option value="calculation_audit">ตรวจคำนวณและประเมินความปลอดภัย (Calculation Audit)</option>
                  <option value="routine_survey">สำรวจโหลดและตรวจสอบตามรอบ (Routine Survey)</option>
                  <option value="emergency_repair">แก้ไขเหตุขัดข้องฉุกเฉิน (Emergency Repair)</option>
                </select>
              </div>

              {/* Installed Fuse After */}
              <div>
                <label className="block font-semibold mb-1">
                  ขนาดฟิวส์ที่ติดตั้งหลังงาน (Installed Fuse After):
                </label>
                <input
                  type="text"
                  value={recordInstalledAfter}
                  onChange={(e) => setRecordInstalledAfter(e.target.value)}
                  placeholder="เช่น 25T, 40T, 50K..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              {/* Inspector Name */}
              <div>
                <label className="block font-semibold mb-1">ชื่อผู้บันทึก / ช่างผู้รับผิดชอบ:</label>
                <input
                  type="text"
                  value={recordEngineerName}
                  onChange={(e) => setRecordEngineerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold mb-1">หมายเหตุ / รายละเอียดหน้างาน:</label>
                <textarea
                  rows={3}
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSaveRecordModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveRecord}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                ยืนยันการบันทึกค่าลงระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUTOUT SPECS MODAL */}
      {isEditCutoutModalOpen && activeCutout && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                แก้ไขข้อมูลฟิวส์ตัดไลน์ {activeCutout.id}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditCutoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-semibold mb-1">ชื่ออุปกรณ์ / สายแยก:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">รหัสเสา:</label>
                  <input
                    type="text"
                    value={editPoleId}
                    onChange={(e) => setEditPoleId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ฟีดเดอร์:</label>
                  <input
                    type="text"
                    value={editFeeder}
                    onChange={(e) => setEditFeeder(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ฟิวส์ติดตั้งปัจจุบัน:</label>
                  <input
                    type="text"
                    value={editInstalledFuse}
                    onChange={(e) => setEditInstalledFuse(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">แรงดัน (kV):</label>
                  <select
                    value={editVoltage}
                    onChange={(e) => setEditVoltage(parseInt(e.target.value) || 22)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={22}>22 kV</option>
                    <option value={33}>33 kV</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">หมายเหตุ:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditCutoutModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmEditCutout}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FIELD LOG MODAL */}
      <QuickFieldLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        initialTargetType="linecutout"
        initialTargetId={activeCutout?.id}
      />

      {/* REASSIGN TRANSFORMER MODAL */}
      {reassignTarget && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ย้ายหม้อแปลงไปยังฟิวส์ตัดไลน์ใหม่
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              หม้อแปลงรหัส <span className="font-mono font-bold text-amber-700">{reassignTarget.transformerId}</span>{' '}
              จะถูกย้ายออกจาก {reassignTarget.currentCutoutId} และนำโหลดไปรวมกับฟิวส์ตัดไลน์ปลายทางใหม่
            </p>

            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลือกฟิวส์ตัดไลน์ปลายทาง:
            </label>
            <select
              id="reassignSelect"
              defaultValue=""
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-4"
            >
              <option value="" disabled>
                -- เลือกฟิวส์ตัดไลน์ --
              </option>
              {lineCutouts.map((lc) => (
                <option key={lc.id} value={lc.id}>
                  {lc.id}: {lc.name} ({lc.feeder})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReassignTarget(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const select = document.getElementById('reassignSelect') as HTMLSelectElement;
                  if (select && select.value) {
                    reassignTransformerLineCutout(reassignTarget.transformerId, select.value);
                    setReassignTarget(null);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700"
              >
                ยืนยันการย้าย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
