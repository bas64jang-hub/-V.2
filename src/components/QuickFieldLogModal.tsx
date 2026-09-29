import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { QuickFieldLog, LineCutoutRecord, OperationalStatus } from '../types';
import { STANDARD_FUSE_SIZES } from '../data/defaultData';
import {
  X,
  Zap,
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  User,
  Activity,
  Thermometer,
  Droplet,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface QuickFieldLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetType?: 'transformer' | 'linecutout';
  initialTargetId?: string;
}

export const QuickFieldLogModal: React.FC<QuickFieldLogModalProps> = ({
  isOpen,
  onClose,
  initialTargetType = 'transformer',
  initialTargetId,
}) => {
  const {
    transformers,
    lineCutouts,
    saveQuickFieldLog,
    saveLineCutoutRecord,
    currentUser,
    showToast,
  } = useTransformers();

  const [activeTab, setActiveTab] = useState<'transformer' | 'linecutout' | 'quick_issue'>(
    initialTargetType === 'linecutout' ? 'linecutout' : 'transformer'
  );

  // Engineer name default
  const defaultEngineer = currentUser?.name || 'นายสุรชัย มั่นจิตต์ (ช่างเทคนิค 5)';
  const [engineerName, setEngineerName] = useState(defaultEngineer);

  // --- TAB 1: TRANSFORMER STATE ---
  const [selectedTrId, setSelectedTrId] = useState<string>(() => {
    if (initialTargetType === 'transformer' && initialTargetId) {
      return initialTargetId;
    }
    return transformers[0]?.id || 'TR23-011134';
  });

  const selectedTransformer = useMemo(() => {
    return transformers.find((t) => t.id === selectedTrId) || transformers[0];
  }, [selectedTrId, transformers]);

  // Electrical measurement inputs
  const [currentA, setCurrentA] = useState<string>('210');
  const [currentB, setCurrentB] = useState<string>('215');
  const [currentC, setCurrentC] = useState<string>('205');
  const [currentN, setCurrentN] = useState<string>('18');
  const [voltageAvg, setVoltageAvg] = useState<string>('400');
  const [tempC, setTempC] = useState<string>('52');
  const [oilPercent, setOilPercent] = useState<string>('95');
  const [installedFuse, setInstalledFuse] = useState<string>(selectedTransformer?.fuse || '15T Type K');
  const [trStatus, setTrStatus] = useState<OperationalStatus>('normal');
  const [trNotes, setTrNotes] = useState<string>('ตรวจสอบวัดค่ากระแสประจำรอบ โหลดสมดุลปกติ อุณหภูมิอยู่ในเกณฑ์ปลอดภัย');

  // Sync default fuse when transformer changes
  React.useEffect(() => {
    if (selectedTransformer) {
      setInstalledFuse(selectedTransformer.fuse || '15T Type K');
      if (selectedTransformer.windingTemp) setTempC(selectedTransformer.windingTemp.toString());
      if (selectedTransformer.oilLevel) setOilPercent(selectedTransformer.oilLevel.toString());
    }
  }, [selectedTransformer?.id]);

  // Derived calculations for transformer
  const calcMetrics = useMemo(() => {
    const ia = parseFloat(currentA) || 0;
    const ib = parseFloat(currentB) || 0;
    const ic = parseFloat(currentC) || 0;
    const v = parseFloat(voltageAvg) || 400;
    const iAvg = (ia + ib + ic) / 3;

    // kVA = sqrt(3) * V * I_avg / 1000
    const calcKva = Math.round(((Math.sqrt(3) * v * iAvg) / 1000) * 10) / 10;
    const ratedKva = selectedTransformer?.kva || 250;
    const percent = ratedKva > 0 ? Math.round((calcKva / ratedKva) * 100 * 10) / 10 : 0;

    // Max deviation for unbalance %
    const maxDev = Math.max(Math.abs(ia - iAvg), Math.abs(ib - iAvg), Math.abs(ic - iAvg));
    const unbalancePercent = iAvg > 0 ? Math.round((maxDev / iAvg) * 100 * 10) / 10 : 0;

    return {
      calcKva,
      percent,
      unbalancePercent,
      iAvg: Math.round(iAvg * 10) / 10,
    };
  }, [currentA, currentB, currentC, voltageAvg, selectedTransformer]);

  // --- TAB 2: LINE CUTOUT STATE ---
  const [selectedLcId, setSelectedLcId] = useState<string>(() => {
    if (initialTargetType === 'linecutout' && initialTargetId) {
      return initialTargetId;
    }
    return lineCutouts[0]?.id || 'LC-01';
  });

  const selectedCutout = useMemo(() => {
    return lineCutouts.find((lc) => lc.id === selectedLcId) || lineCutouts[0];
  }, [selectedLcId, lineCutouts]);

  const [lcActionType, setLcActionType] = useState<
    'calculation_audit' | 'fuse_replacement' | 'routine_survey' | 'emergency_repair'
  >('fuse_replacement');
  const [lcInstalledBefore, setLcInstalledBefore] = useState<string>(selectedCutout?.installedFuse || '25T');
  const [lcInstalledAfter, setLcInstalledAfter] = useState<string>(selectedCutout?.installedFuse || '40T');
  const [lcDiversity, setLcDiversity] = useState<number>(0.8);
  const [lcMultiplier, setLcMultiplier] = useState<number>(1.75);
  const [lcMeasuredCurrent, setLcMeasuredCurrent] = useState<string>('16.8');
  const [lcNotes, setLcNotes] = useState<string>(
    'บันทึกค่าผลการตรวจสอบฟิวส์ตัดไลน์สายสาขา ปรับขนาด Fuse Link ให้สอดคล้องกับโหลดจริง'
  );

  React.useEffect(() => {
    if (selectedCutout) {
      setLcInstalledBefore(selectedCutout.installedFuse);
      setLcInstalledAfter(selectedCutout.installedFuse);
      setLcDiversity(selectedCutout.diversityFactor || 0.8);
      setLcMultiplier(selectedCutout.multiplier || 1.75);
    }
  }, [selectedCutout?.id]);

  // --- TAB 3: QUICK ISSUE STATE ---
  const [issueType, setIssueType] = useState<string>('เสียงอาร์ก / โคโรนาผิดปกติ');
  const [issueTargetId, setIssueTargetId] = useState<string>(selectedTrId);
  const [issueSeverity, setIssueSeverity] = useState<OperationalStatus>('warning');
  const [issueNotes, setIssueNotes] = useState<string>('พบเสียงอาร์กบริเวณดรอปเอาท์ฟิวส์และขั้วต่อแรงสูงช่วงมีความชื้น');

  if (!isOpen) return null;

  // Handle saving transformer log
  const handleSaveTransformerLog = () => {
    if (!selectedTransformer) return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const logId = `QFL-${Date.now().toString().slice(-6)}`;

    const newLog: QuickFieldLog = {
      id: logId,
      targetType: 'transformer',
      targetId: selectedTransformer.id,
      targetName: selectedTransformer.name,
      poleId: selectedTransformer.poleId,
      timestamp: Date.now(),
      dateText: today,
      timeText: nowTime,
      engineerName: engineerName.trim() || 'ช่างเทคนิค กฟภ.',
      currentA: parseFloat(currentA) || 0,
      currentB: parseFloat(currentB) || 0,
      currentC: parseFloat(currentC) || 0,
      currentN: parseFloat(currentN) || 0,
      voltageAvg: parseFloat(voltageAvg) || 400,
      loadKva: calcMetrics.calcKva,
      loadPercent: calcMetrics.percent,
      tempC: parseFloat(tempC) || 50,
      oilPercent: parseFloat(oilPercent) || 95,
      installedFuse,
      status: trStatus,
      notes: trNotes.trim(),
    };

    saveQuickFieldLog(newLog);
    onClose();
  };

  // Handle saving line cutout record
  const handleSaveLineCutoutRecord = () => {
    if (!selectedCutout) return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const recordId = `LCR-${Date.now().toString().slice(-6)}`;

    // Transformers belonging to this cutout
    const connectedTransformers = transformers.filter((t) => t.lineCutoutId === selectedCutout.id);
    const totalConnectedKva = connectedTransformers.reduce((sum, t) => sum + t.kva, 0);
    const totalLoadKva = connectedTransformers.reduce((sum, t) => sum + t.loadKva, 0);

    const newRecord: LineCutoutRecord = {
      id: recordId,
      cutoutId: selectedCutout.id,
      cutoutName: selectedCutout.name,
      poleId: selectedCutout.poleId,
      feeder: selectedCutout.feeder,
      voltage: selectedCutout.voltage,
      recordedAt: Date.now(),
      recordedDate: today,
      recordedTime: nowTime,
      engineerName: engineerName.trim() || 'วิศวกรไฟฟ้า กฟภ.',
      installedFuseBefore: lcInstalledBefore,
      recommendedFuse: lcInstalledAfter,
      installedFuseAfter: lcInstalledAfter,
      statusVsInstalled: lcInstalledAfter !== lcInstalledBefore ? 'undersized' : 'optimal',
      totalTransformersCount: connectedTransformers.length,
      totalConnectedKva: totalConnectedKva || 750,
      totalLoadKva: totalLoadKva || 450,
      actualLoadCurrent: parseFloat(lcMeasuredCurrent) || 15.5,
      sizingCurrent: (parseFloat(lcMeasuredCurrent) || 15.5) * lcMultiplier,
      diversityFactor: lcDiversity,
      multiplier: lcMultiplier,
      fuseType: lcInstalledAfter.includes('K') ? 'K' : 'T',
      actionType: lcActionType,
      notes: lcNotes.trim(),
    };

    saveLineCutoutRecord(newRecord);
    onClose();
  };

  // Handle saving quick issue
  const handleSaveIssue = () => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const logId = `ISSUE-${Date.now().toString().slice(-6)}`;

    const targetTr = transformers.find((t) => t.id === issueTargetId) || transformers[0];

    const newLog: QuickFieldLog = {
      id: logId,
      targetType: 'transformer',
      targetId: targetTr.id,
      targetName: targetTr.name,
      poleId: targetTr.poleId,
      timestamp: Date.now(),
      dateText: today,
      timeText: nowTime,
      engineerName: engineerName.trim() || 'ช่างเทคนิค กฟภ.',
      status: issueSeverity,
      notes: `[แจ้งเหตุ: ${issueType}] ${issueNotes.trim()}`,
    };

    saveQuickFieldLog(newLog);
    showToast(`บันทึกรายงานปัญหา ${issueType} ลงประวัติเรียบร้อย`, 'ISSUE_LOGGED', 'warning');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <ClipboardCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  FIELD LOGGER v4.2
                </span>
                <span className="text-xs text-emerald-200">• ซิงก์ฐานข้อมูลกลาง &amp; Firestore ทันที</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                บันทึกค่าพารามิเตอร์หน้างาน (Quick Value Logger)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-1.5 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('transformer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'transformer'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'transformer' ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span>1. โหลด &amp; กระแสหม้อแปลง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('linecutout')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'linecutout'
                ? 'bg-white text-amber-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'linecutout' ? 'text-amber-700' : 'text-slate-400'}`} />
            <span>2. ฟิวส์ตัดไลน์สายสาขา</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_issue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'quick_issue'
                ? 'bg-white text-rose-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'quick_issue' ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>3. แจ้งปัญหา/ความผิดปกติ</span>
          </button>
        </div>

        {/* Global Inspector field */}
        <div className="px-4 sm:px-6 py-2.5 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold">ผู้บันทึกข้อมูลหน้างาน:</span>
          </div>
          <input
            type="text"
            value={engineerName}
            onChange={(e) => setEngineerName(e.target.value)}
            placeholder="ชื่อ-สกุล ช่างผู้ตรวจสอบ / ตำแหน่ง"
            className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-full sm:w-72"
          />
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* ================= TAB 1: TRANSFORMER MEASUREMENT ================= */}
          {activeTab === 'transformer' && (
            <div className="space-y-4">
              {/* Select Transformer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  เลือกหม้อแปลงที่เข้าตรวจวัดค่า (Select Transformer):
                </label>
                <select
                  value={selectedTrId}
                  onChange={(e) => setSelectedTrId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {transformers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.name} (เสา {t.poleId} | {t.kva} kVA | {t.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Transformer Snapshot Card */}
              {selectedTransformer && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">พิกัดหม้อแปลง</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{selectedTransformer.kva} kVA</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">รหัสเสาไฟ</span>
                    <span className="font-mono text-slate-800">{selectedTransformer.poleId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">แรงดันระบบ</span>
                    <span className="text-slate-800">{selectedTransformer.voltage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">ฟิวส์ติดตั้งเดิม</span>
                    <span className="font-mono font-bold text-emerald-800">{selectedTransformer.fuse}</span>
                  </div>
                </div>
              )}

              {/* 3-Phase Current Measurements */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    ค่ากระแสโหลดที่วัดได้จริง (Phase Currents - Amperes):
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Clamp Meter Test</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phase A (A):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentA}
                      onChange={(e) => setCurrentA(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phase B (A):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentB}
                      onChange={(e) => setCurrentB(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phase C (A):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentC}
                      onChange={(e) => setCurrentC(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Neutral (A):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentN}
                      onChange={(e) => setCurrentN(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Auto-calculated Load KPI preview */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">กระแสเฉลี่ย 3 เฟส:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{calcMetrics.iAvg} A</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">โหลดคำนวณ (kVA):</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">{calcMetrics.calcKva} kVA</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">สัดส่วนโหลด (%):</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        calcMetrics.percent > 90
                          ? 'text-rose-700'
                          : calcMetrics.percent > 75
                          ? 'text-amber-700'
                          : 'text-emerald-800'
                      }`}
                    >
                      {calcMetrics.percent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">ความไม่สมดุล (%):</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        calcMetrics.unbalancePercent > 15 ? 'text-rose-700' : 'text-slate-800'
                      }`}
                    >
                      {calcMetrics.unbalancePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical & Electrical Secondary Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Winding Temp */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                    อุณหภูมิขดลวด (°C):
                  </label>
                  <input
                    type="number"
                    value={tempC}
                    onChange={(e) => setTempC(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">เกณฑ์ปกติ &lt; 65°C</span>
                </div>

                {/* Oil Level */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    ระดับน้ำมันหม้อแปลง (%):
                  </label>
                  <input
                    type="number"
                    value={oilPercent}
                    onChange={(e) => setOilPercent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">เกณฑ์ปกติ &ge; 90%</span>
                </div>

                {/* Fuse installed */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    ฟิวส์ที่ติดตั้ง ณ เสา:
                  </label>
                  <input
                    type="text"
                    value={installedFuse}
                    onChange={(e) => setInstalledFuse(e.target.value)}
                    placeholder="เช่น 25T Type K"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">ระบุพิกัด Fuse Link</span>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ประเมินสถานะการจ่ายไฟ:</label>
                  <select
                    value={trStatus}
                    onChange={(e) => setTrStatus(e.target.value as OperationalStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="normal">🟢 สถานะปกติ (Normal)</option>
                    <option value="warning">🟡 เฝ้าระวังโหลดสูง (Warning)</option>
                    <option value="critical">🔴 โหลดวิกฤต/เกินพิกัด (Critical)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">หมายเหตุการตรวจเช็คหน้างาน:</label>
                  <input
                    type="text"
                    value={trNotes}
                    onChange={(e) => setTrNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: LINE CUTOUT RECORD ================= */}
          {activeTab === 'linecutout' && (
            <div className="space-y-4">
              {/* Select Line Cutout */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  เลือกจุดติดตั้งฟิวส์ตัดไลน์สายสาขา (Select Line Cutout):
                </label>
                <select
                  value={selectedLcId}
                  onChange={(e) => setSelectedLcId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {lineCutouts.map((lc) => (
                    <option key={lc.id} value={lc.id}>
                      {lc.id}: {lc.name} (เสา {lc.poleId} | {lc.feeder} | ฟิวส์ {lc.installedFuse})
                    </option>
                  ))}
                </select>
              </div>

              {/* Snapshot of selected Line Cutout */}
              {selectedCutout && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-amber-800 font-semibold block">รหัสฟิวส์ตัดไลน์</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{selectedCutout.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 font-semibold block">เสาที่ติดตั้ง</span>
                    <span className="font-mono text-slate-800">{selectedCutout.poleId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 font-semibold block">ฟีดเดอร์</span>
                    <span className="text-slate-800">{selectedCutout.feeder}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 font-semibold block">ฟิวส์ติดตั้งเดิม</span>
                    <span className="font-mono font-bold text-amber-900">{selectedCutout.installedFuse}</span>
                  </div>
                </div>
              )}

              {/* Action type & Fuse changes */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-800 block">ลักษณะการปฏิบัติงานหน้างาน:</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ประเภทงาน (Action Type):
                    </label>
                    <select
                      value={lcActionType}
                      onChange={(e) =>
                        setLcActionType(
                          e.target.value as 'calculation_audit' | 'fuse_replacement' | 'routine_survey' | 'emergency_repair'
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="fuse_replacement">⚡ เปลี่ยนขนาดฟิวส์ตัดไลน์ใหม่</option>
                      <option value="routine_survey">📋 ตรวจสอบและประเมินโหลดตามวาระ</option>
                      <option value="calculation_audit">📐 คำนวณประสานพิกัดฟิวส์ (Audit)</option>
                      <option value="emergency_repair">🚨 ซ่อมแซมฉุกเฉินหลังฟิวส์ขาด</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      กระแสโหลดจริงที่วัดได้ (A):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={lcMeasuredCurrent}
                      onChange={(e) => setLcMeasuredCurrent(e.target.value)}
                      placeholder="เช่น 16.8"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Fuse link replacement selection */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ฟิวส์ติดตั้งเดิม (Before):
                    </label>
                    <input
                      type="text"
                      value={lcInstalledBefore}
                      onChange={(e) => setLcInstalledBefore(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-800 block mb-1">
                      ฟิวส์ใหม่ที่เปลี่ยนหรือแนะนำ (After):
                    </label>
                    <input
                      type="text"
                      value={lcInstalledAfter}
                      onChange={(e) => setLcInstalledAfter(e.target.value)}
                      placeholder="เช่น 40T หรือ 50T"
                      className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl font-mono font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sizing Parameters */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Diversity Factor ({lcDiversity}):
                  </label>
                  <input
                    type="range"
                    min="0.6"
                    max="1.0"
                    step="0.05"
                    value={lcDiversity}
                    onChange={(e) => setLcDiversity(parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.60</span>
                    <span>0.80 (กฟภ.)</span>
                    <span>1.00</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-1">
                    ตัวคูณ Inrush &amp; เผื่อขยาย:
                  </label>
                  <select
                    value={lcMultiplier}
                    onChange={(e) => setLcMultiplier(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="1.5">1.50x</option>
                    <option value="1.75">1.75x (มาตรฐาน กฟภ.)</option>
                    <option value="2.0">2.00x</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  บันทึกรายละเอียดและสภาพแวดล้อมหน้างาน:
                </label>
                <textarea
                  rows={2}
                  value={lcNotes}
                  onChange={(e) => setLcNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* ================= TAB 3: QUICK ISSUE LOGGING ================= */}
          {activeTab === 'quick_issue' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  เลือกหม้อแปลงหรืออุปกรณ์ที่มีปัญหา:
                </label>
                <select
                  value={issueTargetId}
                  onChange={(e) => setIssueTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                >
                  {transformers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} - {t.name} (เสา {t.poleId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ประเภทความผิดปกติ:</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="เสียงอาร์ก / โคโรนาผิดปกติ">เสียงอาร์ก / โคโรนาผิดปกติ</option>
                    <option value="น้ำมันหม้อแปลงรั่วซึม">น้ำมันหม้อแปลงรั่วซึม</option>
                    <option value="ฟิวส์ตัดไลน์หรือดรอปเอาท์ขาดบ่อย">ฟิวส์ตัดไลน์หรือดรอปเอาท์ขาดบ่อย</option>
                    <option value="สายล่อฟ้า / กับดักฟ้าผ่าชำรุด">สายล่อฟ้า / กับดักฟ้าผ่าชำรุด</option>
                    <option value="อุณหภูมิหม้อแปลงสูงเกินพิกัด">อุณหภูมิหม้อแปลงสูงเกินพิกัด</option>
                    <option value="สายนิวทรัลหรือสายดินหลวม">สายนิวทรัลหรือสายดินหลวม</option>
                    <option value="กิ่งไม้พาดสายจำหน่ายใกล้หม้อแปลง">กิ่งไม้พาดสายจำหน่ายใกล้หม้อแปลง</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ระดับความเร่งด่วน:</label>
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value as OperationalStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="warning">🟡 เฝ้าระวัง (จัดแผนเข้าซ่อม)</option>
                    <option value="critical">🔴 วิกฤต (ต้องตัดไฟแก้ไขด่วน)</option>
                    <option value="normal">🟢 ตรวจสอบแล้วแก้ไขเบื้องต้นแล้ว</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  รายละเอียดและแนวทางแก้ไข (Notes):
                </label>
                <textarea
                  rows={3}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            ข้อมูลจะถูกบันทึกและซิงก์สู่ระบบกลาง SCADA ทันที
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>

            {activeTab === 'transformer' && (
              <button
                type="button"
                onClick={handleSaveTransformerLog}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#006948] hover:bg-[#00573c] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกค่าลงระบบ (Save)</span>
              </button>
            )}

            {activeTab === 'linecutout' && (
              <button
                type="button"
                onClick={handleSaveLineCutoutRecord}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกค่าฟิวส์ตัดไลน์ (Save)</span>
              </button>
            )}

            {activeTab === 'quick_issue' && (
              <button
                type="button"
                onClick={handleSaveIssue}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกแจ้งเหตุ (Save)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
