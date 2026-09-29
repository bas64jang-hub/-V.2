import React, { useState, useEffect } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { TransformerIncidentLog, IncidentCause, IncidentResolutionStatus } from '../types';
import {
  PEA_STANDARD_FUSE_OPTIONS,
  INCIDENT_CAUSE_OPTIONS,
  getStandardPeaFuseForTransformer,
  validateReplacedFuse,
} from '../lib/peaFuseValidation';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
  ShieldAlert,
  Clock,
  User,
  Wrench,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const TransformerIncidentModal: React.FC = () => {
  const {
    isIncidentModalOpen,
    setIsIncidentModalOpen,
    incidentTargetTransformerId,
    transformers,
    saveTransformerIncident,
    editingIncident,
    currentUser,
  } = useTransformers();

  // Find the selected transformer
  const selectedTr =
    transformers.find((t) => t.id === incidentTargetTransformerId) ||
    transformers[0];

  // Derived values for the transformer
  const kva = selectedTr?.kva || 100;
  const voltKv = selectedTr?.voltage?.includes('33') ? 33 : 22;
  const phase = selectedTr?.phase || 3;
  const originalFuse = selectedTr?.fuse || '6T';
  const standardFuse = getStandardPeaFuseForTransformer(kva, voltKv, phase);

  // Form State
  const [selectedTransformerId, setSelectedTransformerId] = useState<string>(
    selectedTr?.id || ''
  );
  const [incidentDate, setIncidentDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [incidentTime, setIncidentTime] = useState<string>(() =>
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  );
  const [linemanName, setLinemanName] = useState<string>(
    currentUser?.name || 'นายประสิทธิ์ วงศ์วรรณ'
  );
  const [linemanEmpId, setLinemanEmpId] = useState<string>(
    currentUser?.empid || 'PEA-512044'
  );
  const [crewDept, setCrewDept] = useState<string>(
    currentUser?.dept || 'แผนกปฏิบัติการและบำรุงรักษา กฟส.บ้านโฮ่ง'
  );
  const [ticketNumber, setTicketNumber] = useState<string>(() =>
    `1129-68-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [cause, setCause] = useState<IncidentCause>('fuse_blown_lightning');
  const [causeDetail, setCauseDetail] = useState<string>(
    'พายุฝนฟ้าคะนองรุนแรง ฟ้าผ่าใกล้เคียงทำให้ฟิวส์แรงสูงขาด'
  );
  const [symptoms, setSymptoms] = useState<string>(
    'กระบอกฟิวส์ดรอปเอาท์อ้าลงมา ไฟฟ้าดับในพื้นที่บริเวณโดยรอบ'
  );
  const [actionTaken, setActionTaken] = useState<string>(
    'เข้าตัดแยกวงจร ตรวจสอบบุชชิ่งและกับดักฟ้าผ่า เปลี่ยนฟิวส์ลิงค์ใหม่ และสับจ่ายไฟคืนระบบ'
  );
  const [newFuseInstalled, setNewFuseInstalled] = useState<string>(originalFuse);
  const [loadAmpAfter, setLoadAmpAfter] = useState<string>('45.0');
  const [voltageAfter, setVoltageAfter] = useState<string>('400');
  const [notes, setNotes] = useState<string>('');

  // Sync state when editing or changing target transformer
  useEffect(() => {
    if (editingIncident) {
      setSelectedTransformerId(editingIncident.transformerId);
      setIncidentDate(editingIncident.incidentDate);
      setIncidentTime(editingIncident.incidentTime);
      setLinemanName(editingIncident.linemanName);
      setLinemanEmpId(editingIncident.linemanEmpId || '');
      setCrewDept(editingIncident.crewDept);
      setTicketNumber(editingIncident.ticketNumber || '');
      setCause(editingIncident.cause);
      setCauseDetail(editingIncident.causeDetail);
      setSymptoms(editingIncident.symptoms);
      setActionTaken(editingIncident.actionTaken);
      setNewFuseInstalled(editingIncident.newFuseInstalled);
      setLoadAmpAfter(editingIncident.loadAmpAfter ? editingIncident.loadAmpAfter.toString() : '');
      setVoltageAfter(editingIncident.voltageAfter ? editingIncident.voltageAfter.toString() : '');
      setNotes(editingIncident.notes || '');
    } else if (selectedTr) {
      setSelectedTransformerId(selectedTr.id);
      setNewFuseInstalled(selectedTr.fuse || '6T');
    }
  }, [editingIncident, selectedTr, isIncidentModalOpen]);

  if (!isIncidentModalOpen) return null;

  // Real-time verification calculation as technician chooses new fuse
  const currentTr = transformers.find((t) => t.id === selectedTransformerId) || selectedTr;
  const currentOrigFuse = currentTr?.fuse || originalFuse;
  const currentStdFuse = getStandardPeaFuseForTransformer(
    currentTr?.kva || kva,
    currentTr?.voltage?.includes('33') ? 33 : 22,
    currentTr?.phase || 3
  );

  const validationResult = validateReplacedFuse({
    originalFuse: currentOrigFuse,
    newFuseInstalled,
    standardFuse: currentStdFuse,
    transformerKva: currentTr?.kva,
    transformerName: currentTr?.name,
  });

  const selectedCauseObj = INCIDENT_CAUSE_OPTIONS.find((c) => c.id === cause) || INCIDENT_CAUSE_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incidentId = editingIncident?.id || `INC-68-${Date.now().toString().slice(-5)}`;
    const status: IncidentResolutionStatus = validationResult.isMatchOriginal
      ? 'resolved_standard'
      : 'pending_standard_replacement';

    const newIncident: TransformerIncidentLog = {
      id: incidentId,
      transformerId: currentTr?.id || selectedTransformerId,
      transformerName: currentTr?.name || `หม้อแปลง ${selectedTransformerId}`,
      poleId: currentTr?.poleId || '1000001602',
      area: currentTr?.area || 'กฟส.บ้านโฮ่ง จ.ลำพูน',
      feeder: currentTr?.lineCutoutName || 'ฟีดเดอร์ BGA02',
      transformerKva: currentTr?.kva || 100,
      voltageKv: currentTr?.voltage?.includes('33') ? 33 : 22,
      incidentDate,
      incidentTime,
      linemanName,
      linemanEmpId,
      crewDept,
      ticketNumber,
      cause,
      causeLabel: selectedCauseObj.label,
      causeDetail,
      symptoms,
      actionTaken,
      originalFuse: currentOrigFuse,
      standardFuse: currentStdFuse,
      newFuseInstalled,
      fuseType: 'T',
      isFuseMatchOriginal: validationResult.isMatchOriginal,
      isFuseMatchStandard: validationResult.isMatchStandard,
      verificationStatus: validationResult.verificationStatus,
      verificationMessage: validationResult.verificationMessage,
      futureActionNotice: validationResult.futureActionNotice,
      loadAmpAfter: loadAmpAfter ? parseFloat(loadAmpAfter) : undefined,
      voltageAfter: voltageAfter ? parseFloat(voltageAfter) : undefined,
      status,
      notes,
      createdAt: editingIncident?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    saveTransformerIncident(newIncident);
    setIsIncidentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-emerald-800 via-[#006948] to-teal-800 px-5 sm:px-7 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200 border border-white/15 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {editingIncident ? 'แก้ไขรายงานการเข้าทำงานเมื่อเกิดเหตุ' : 'บันทึกรายงานการเข้าทำงานเมื่อเกิดเหตุ'}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-100 border border-emerald-300/30 font-bold">
                  PEA INCIDENT LOG
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                บันทึกการแก้เหตุฉุกเฉินและตรวจสอบขนาดฟิวส์ที่เปลี่ยนใหม่ตามเกณฑ์มาตรฐาน กฟภ. (แยกประวัติรายหม้อแปลง)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsIncidentModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Section 1: Transformer & Incident Reference */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#006948]" />
                ข้อมูลหม้อแปลงและสถานที่เกิดเหตุ (Target Transformer)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                แยกประวัติเฉพาะหม้อแปลงเครื่องนี้
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  เลือกหม้อแปลงที่เกิดเหตุ:
                </label>
                <select
                  value={selectedTransformerId}
                  onChange={(e) => setSelectedTransformerId(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-[#006948] focus:border-transparent outline-none cursor-pointer"
                >
                  {transformers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.id} ({tr.kva} kVA - {tr.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  รหัสเสา / พื้นที่ติดตั้ง:
                </label>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 truncate">
                  เสา: <strong className="font-mono">{currentTr?.poleId}</strong> • {currentTr?.area}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  พิกัดไฟฟ้าหม้อแปลง:
                </label>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800">
                  <strong className="text-[#006948]">{currentTr?.kva} kVA</strong> ({currentTr?.voltage || '22 kV'})
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Time & Lineman Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                วันที่เข้าทำงาน:
              </label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                เวลาเกิดเหตุ / เข้างาน:
              </label>
              <input
                type="text"
                required
                placeholder="21:45"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ช่างผู้ปฏิบัติงาน:
              </label>
              <input
                type="text"
                required
                value={linemanName}
                onChange={(e) => setLinemanName(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                เลขที่ใบสั่งงาน / แจ้งเหตุ 1129:
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>
          </div>

          {/* Section 3: Incident Cause & Symptoms */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                สาเหตุของเหตุการณ์ (Incident Cause):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {INCIDENT_CAUSE_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCause(item.id);
                      setCauseDetail(item.description);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      cause === item.id
                        ? 'border-[#006948] bg-emerald-50 text-slate-900 ring-2 ring-[#006948]/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  อาการ / สิ่งที่ตรวจพบหน้างาน:
                </label>
                <textarea
                  rows={2}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="เช่น กระบอกฟิวส์ดรอปเอาท์อ้าลงมา 2 เฟส ไฟฟ้าดับทั้งซอย..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  งานแก้ไขที่ดำเนินการ (Action Taken):
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="เช่น ตรวจสอบความปลอดภัย เปลี่ยนฟิวส์ลิงค์แรงสูง สับจ่ายไฟคืนระบบ..."
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: HERO SECTION - Fuse Replacement & Real-Time System Verification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 border-2 border-emerald-500/30 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#006948]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  การเปลี่ยนฟิวส์และการตรวจสอบมาตรฐานอัตโนมัติ (Fuse Validation)
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006948] border border-emerald-200 self-start sm:self-auto">
                ระบบตรวจสอบความตรงกันของฟิวส์
              </span>
            </div>

            {/* Symmetrical 3-Column Fuse Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Box 1: Original Fuse */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    ขนาดฟิวส์เดิมของหม้อแปลง
                  </span>
                  <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                    {currentOrigFuse}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <span>ตามฐานข้อมูลระบบเดิม</span>
                </div>
              </div>

              {/* Box 2: PEA Standard Fuse */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    ขนาดฟิวส์มาตรฐาน กฟภ. แนะนำ
                  </span>
                  <div className="font-mono text-2xl font-black text-[#006948] mt-1">
                    {currentStdFuse}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-[#006948] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>เกณฑ์ กฟภ. ({currentTr?.kva} kVA {currentTr?.voltage || '22kV'})</span>
                </div>
              </div>

              {/* Box 3: New Fuse Input (CRITICAL USER REQUIREMENT) */}
              <div className="p-3.5 bg-white rounded-xl border-2 border-[#006948] shadow-xs flex flex-col justify-between">
                <div>
                  <label htmlFor="newFuseInput" className="block text-[10px] uppercase font-extrabold text-[#006948] flex items-center gap-1">
                    <span>ขนาดฟิวส์ที่เปลี่ยนใหม่</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="newFuseInput"
                      type="text"
                      required
                      placeholder="เช่น 6T, 15T, 25T"
                      value={newFuseInstalled}
                      onChange={(e) => setNewFuseInstalled(e.target.value)}
                      className="w-full font-mono text-2xl font-black text-slate-900 bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-300 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Selection Pills */}
                <div className="mt-2.5">
                  <span className="text-[9px] text-slate-400 block mb-1">เลือกขนาดพิกัดด่วน:</span>
                  <div className="flex flex-wrap gap-1">
                    {['2T', '3T', '5T', '6T', '8T', '10T', '15T', '20T', '25T', '40T', '50T'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setNewFuseInstalled(size)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          newFuseInstalled === size
                            ? 'bg-[#006948] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE SYSTEM AUTOMATED VERIFICATION BANNER (USER REQUIREMENT) */}
            <div
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col gap-2 ${
                validationResult.isMatchOriginal
                  ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                  : 'bg-amber-50 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-400/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    validationResult.isMatchOriginal
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white animate-bounce'
                  }`}
                >
                  {validationResult.isMatchOriginal ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold">
                      {validationResult.isMatchOriginal
                        ? 'ผลการตรวจสอบ: ฟิวส์ที่เปลี่ยนใหม่ตรงกับฟิวส์เดิมและมาตรฐาน กฟภ.'
                        : 'ผลการตรวจสอบ: ฟิวส์ที่เปลี่ยนใหม่ไม่ตรงกับฟิวส์เดิม / มาตรฐาน กฟภ.'}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        validationResult.isMatchOriginal
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-amber-200 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {validationResult.isMatchOriginal ? 'FUSE MATCHED' : 'FUSE MISMATCH DETECTED'}
                    </span>
                  </div>

                  <p className="text-xs mt-1 leading-relaxed">
                    {validationResult.verificationMessage}
                  </p>

                  {/* MANDATORY PROMPT REQUIREMENT: If not matching, show directive for future repairs */}
                  {!validationResult.isMatchOriginal && (
                    <div className="mt-2.5 p-3 rounded-lg bg-white/90 border border-amber-300 text-xs text-amber-900 flex flex-col gap-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>ข้อสั่งการและคำเตือนสำหรับงานในอนาคต (Future Maintenance Directive):</span>
                      </div>
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm pl-5 bg-amber-100/60 py-1 px-2 rounded border border-amber-200">
                        "{validationResult.futureActionNotice}"
                      </p>
                      <p className="text-[11px] text-slate-600 pl-5 mt-0.5">
                        ระบบจะทำการบันทึกและแสดงแบนเนอร์แจ้งเตือนหม้อแปลงเครื่องนี้ เพื่อให้ทีมงานที่มาซ่อมแซมหรือบำรุงรักษาในครั้งต่อไปเปลี่ยนฟิวส์กลับเป็นขนาด <strong>{currentStdFuse}</strong> ตามมาตรฐาน กฟภ. ทันที
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Post-Energization Readings & Optional Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                กระแสโหลดวัดซ้ำหลังสับจ่ายไฟ (A):
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="48.5"
                value={loadAmpAfter}
                onChange={(e) => setLoadAmpAfter(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                แรงดันไฟฟ้าทดสอบ (V):
              </label>
              <input
                type="number"
                step="1"
                placeholder="400"
                value={voltageAfter}
                onChange={(e) => setVoltageAfter(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                หมายเหตุเพิ่มเติม:
              </label>
              <input
                type="text"
                placeholder="เช่น ใส่ฟิวส์ชั่วคราวเพราะฝนตกหนัก..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#006948] outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#006948]" />
              <span>
                ประวัติการเข้าทำงานจะถูกผูกกับหม้อแปลง <strong className="text-slate-800 font-mono">{currentTr?.id}</strong> และซิงก์เรียลไทม์
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsIncidentModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกรายงานการเข้าทำงาน</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
