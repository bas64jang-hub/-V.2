import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { TransformerIncidentLog } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  User,
  Wrench,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';

export const IncidentHistoryView: React.FC = () => {
  const {
    transformers,
    transformerIncidents,
    deleteTransformerIncident,
    saveTransformerIncident,
    openIncidentModalForTransformer,
    setSelectedId,
    setActiveTab,
    showToast,
  } = useTransformers();

  const [filterTransformerId, setFilterTransformerId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'mismatch' | 'standard'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Count incidents with mismatch
  const mismatchCount = transformerIncidents.filter(
    (inc) => inc.status === 'pending_standard_replacement' || !inc.isFuseMatchOriginal
  ).length;

  // Filtered incidents
  const filteredIncidents = transformerIncidents.filter((inc) => {
    if (filterTransformerId !== 'all' && inc.transformerId !== filterTransformerId) {
      return false;
    }
    if (filterStatus === 'mismatch') {
      if (inc.status !== 'pending_standard_replacement' && inc.isFuseMatchOriginal) {
        return false;
      }
    } else if (filterStatus === 'standard') {
      if (!inc.isFuseMatchOriginal) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTr = inc.transformerId.toLowerCase().includes(q);
      const matchName = inc.transformerName.toLowerCase().includes(q);
      const matchLineman = inc.linemanName.toLowerCase().includes(q);
      const matchTicket = (inc.ticketNumber || '').toLowerCase().includes(q);
      const matchCause = (inc.causeLabel || '').toLowerCase().includes(q);
      if (!matchTr && !matchName && !matchLineman && !matchTicket && !matchCause) {
        return false;
      }
    }
    return true;
  });

  // Action to mark standard fuse restored
  const handleMarkStandardRestored = (incident: TransformerIncidentLog) => {
    const updated: TransformerIncidentLog = {
      ...incident,
      status: 'resolved_standard',
      isFuseMatchOriginal: true,
      newFuseInstalled: incident.standardFuse,
      verificationStatus: 'match',
      verificationMessage: `✅ เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน กฟภ. (${incident.standardFuse}) เรียบร้อยแล้ว`,
      notes: `${incident.notes || ''} [บันทึกการแก้ไข: ช่างเข้าเปลี่ยนฟิวส์กลับเป็นขนาดมาตรฐาน ${incident.standardFuse} เรียบร้อยแล้ว เมื่อ ${new Date().toLocaleDateString('th-TH')}]`,
      updatedAt: Date.now(),
    };
    saveTransformerIncident(updated);
    showToast(
      `บันทึกการเปลี่ยนฟิวส์หม้อแปลง ${incident.transformerId} กลับเป็นขนาดมาตรฐาน (${incident.standardFuse}) สำเร็จ`,
      'STANDARD_RESTORED',
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Banner Notice */}
      <div className="w-full bg-slate-100 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#006948]" />
          <p className="text-xs text-slate-700">
            <strong className="font-semibold text-[#006948]">ระบบประวัติการเข้าทำงานเมื่อเกิดเหตุ (Incident History Log):</strong> บันทึกการเปลี่ยนฟิวส์และตรวจสอบความสอดคล้องกับมาตรฐาน กฟภ. แยกประวัติรายหม้อแปลง
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            LIVE FLEET INCIDENT AUDIT
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-linear-to-r from-emerald-900 via-[#006948] to-teal-900 text-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-md border border-emerald-700/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-200 shrink-0 shadow-xs">
            <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                ประวัติการเข้าทำงานเมื่อเกิดเหตุ (Incident History)
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-300/30">
                แยกตามหม้อแปลง
              </span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              บันทึกเหตุการณ์ฉุกเฉิน การเปลี่ยนฟิวส์ลิงค์ และระบบตรวจสอบอัตโนมัติว่าฟิวส์ที่เปลี่ยนใหม่ตรงกับฟิวส์เดิมหรือไม่ พร้อมแจ้งเตือนทีมซ่อมแซมในอนาคตให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openIncidentModalForTransformer()}
          className="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-[#006948] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>➕ เขียนรายงานเข้าทำงานเมื่อเกิดเหตุ</span>
        </button>
      </div>

      {/* Highlight Mismatch Banner if any */}
      {mismatchCount > 0 && (
        <div className="p-4 sm:p-5 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-400 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  มีหม้อแปลง {mismatchCount} เครื่องที่ฟิวส์ที่เปลี่ยนใหม่ไม่ตรงกับมาตรฐานเดิม
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                  ต้องดำเนินการแก้ไขในอนาคต
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                <strong>คำสั่งการสำหรับงานในอนาคต:</strong> ในอนาคตเมื่อทีมงานมาซ่อมแซมหรือบำรุงรักษาหม้อแปลง ให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐานจากข้อมูลระบบ กฟภ.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterStatus('mismatch')}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 self-stretch sm:self-auto transition-colors cursor-pointer"
          >
            กรองเฉพาะรายการที่ต้องแก้ไข ({mismatchCount})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Transformer Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Zap className="w-4 h-4 text-[#006948] shrink-0" />
            <label htmlFor="filterTrSelect" className="text-xs font-bold text-slate-700 shrink-0">เลือกหม้อแปลง:</label>
            <select
              id="filterTrSelect"
              value={filterTransformerId}
              onChange={(e) => setFilterTransformerId(e.target.value)}
              className="bg-white text-xs font-bold text-slate-900 py-1 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#006948] cursor-pointer flex-1 max-w-[240px] truncate"
            >
              <option value="all">หม้อแปลงทั้งหมด (Fleet Wide)</option>
              {transformers.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.id} ({tr.kva} kVA - {tr.name})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({transformerIncidents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('mismatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'mismatch'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-amber-700 hover:bg-amber-100/50'
              }`}
            >
              <span>⚠️ รอแก้ไขฟิวส์</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                {mismatchCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'standard'
                  ? 'bg-[#006948] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ตรงมาตรฐาน
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาหม้อแปลง, ช่าง, เลขที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006948]"
          />
        </div>
      </div>

      {/* Incident List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบประวัติการเข้าทำงานตามเงื่อนไขที่เลือก</h3>
          <p className="text-xs text-slate-500 max-w-md">
            สามารถกดปุ่ม "เขียนรายงานเข้าทำงานเมื่อเกิดเหตุ" เพื่อบันทึกประวัติเหตุการณ์ใหม่ และให้ระบบตรวจสอบขนาดฟิวส์
          </p>
          <button
            type="button"
            onClick={() => openIncidentModalForTransformer()}
            className="mt-2 px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เขียนรายงานเหตุการณ์แรก</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredIncidents.map((incident) => {
            const isMismatch = incident.status === 'pending_standard_replacement' || !incident.isFuseMatchOriginal;

            return (
              <div
                key={incident.id}
                className={`bg-white rounded-2xl p-4 sm:p-6 border transition-all shadow-xs flex flex-col gap-4 ${
                  isMismatch
                    ? 'border-amber-400 ring-1 ring-amber-400/30 bg-linear-to-b from-amber-50/20 to-white'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isMismatch
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-emerald-100 text-[#006948] border border-emerald-300'
                      }`}
                    >
                      {isMismatch ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-[#006948]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(incident.transformerId);
                            setActiveTab('detail');
                          }}
                          className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#006948] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="font-mono text-[#006948]">{incident.transformerId}</span>
                          <span>•</span>
                          <span>{incident.transformerName}</span>
                        </button>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isMismatch
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-[#006948] border border-emerald-200'
                          }`}
                        >
                          {isMismatch
                            ? '⚠️ ฟิวส์รอเปลี่ยนให้ตรงมาตรฐาน'
                            : '✅ ฟิวส์ตรงมาตรฐาน กฟภ.'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>เสา: <strong className="font-mono text-slate-700">{incident.poleId}</strong></span>
                        <span>•</span>
                        <span>{incident.area}</span>
                        <span>•</span>
                        <span>พิกัด: <strong className="text-[#006948] font-bold">{incident.transformerKva} kVA</strong> ({incident.voltageKv} kV)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-800">{incident.incidentDate}</strong>
                      <span>เวลา {incident.incidentTime} น.</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteTransformerIncident(incident.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบรายการประวัตินี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Symmetrical 3-Column Fuse Specs Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      ขนาดฟิวส์เดิมของหม้อแปลง
                    </span>
                    <div className="font-mono text-xl font-bold text-slate-800 mt-0.5">
                      {incident.originalFuse}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">สเปกก่อนเกิดเหตุ</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      ขนาดฟิวส์มาตรฐาน กฟภ.
                    </span>
                    <div className="font-mono text-xl font-bold text-[#006948] mt-0.5">
                      {incident.standardFuse}
                    </div>
                    <span className="text-[10px] text-[#006948] font-semibold mt-1">
                      ตามตารางเกณฑ์ กฟภ.
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      isMismatch
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-emerald-50/70 border-emerald-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      ขนาดฟิวส์ที่เปลี่ยนใหม่
                    </span>
                    <div
                      className={`font-mono text-2xl font-black mt-0.5 ${
                        isMismatch ? 'text-amber-700' : 'text-[#006948]'
                      }`}
                    >
                      {incident.newFuseInstalled}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1 ${
                        isMismatch ? 'text-amber-800' : 'text-emerald-700'
                      }`}
                    >
                      {isMismatch ? '⚠️ ไม่ตรงกับฟิวส์เดิม/มาตรฐาน' : '✅ ตรงกับฟิวส์เดิม'}
                    </span>
                  </div>
                </div>

                {/* System Directive Callout when Mismatched (MANDATORY REQUIREMENT) */}
                {isMismatch && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-amber-950 flex items-center gap-1.5">
                          <span>คำเตือนจากระบบ &amp; ข้อสั่งการสำหรับงานในอนาคต:</span>
                        </div>
                        <p className="font-bold text-slate-900 mt-0.5 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 inline-block">
                          "{incident.futureActionNotice || `ในอนาคตเมื่อมาซ่อมแซมให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน (${incident.standardFuse}) จากข้อมูลเว็บไซต์ กฟภ.`}"
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMarkStandardRestored(incident)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors flex items-center gap-1"
                      title="กดเมื่อทีมช่างได้ลงพื้นที่เปลี่ยนฟิวส์กลับเป็นขนาดมาตรฐานแล้ว"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>บันทึกเปลี่ยนฟิวส์ตรงมาตรฐานแล้ว ({incident.standardFuse})</span>
                    </button>
                  </div>
                )}

                {/* Incident Cause & Action Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">
                      สาเหตุและอาการที่ตรวจพบ:
                    </span>
                    <p className="text-slate-800 font-semibold">{incident.causeLabel}</p>
                    <p className="text-slate-600 mt-1 leading-relaxed">{incident.symptoms}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">
                      งานแก้ไขที่ดำเนินการ:
                    </span>
                    <p className="text-slate-800 leading-relaxed">{incident.actionTaken}</p>
                    {incident.loadAmpAfter && (
                      <p className="text-[#006948] font-mono mt-1 font-semibold">
                        วัดกระแสโหลดหลังจ่ายไฟ: {incident.loadAmpAfter} A (แรงดัน {incident.voltageAfter || 400} V)
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Lineman info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>ผู้ปฏิบัติงาน: <strong className="text-slate-800">{incident.linemanName}</strong> ({incident.crewDept})</span>
                  </div>
                  {incident.ticketNumber && (
                    <span className="font-mono">
                      ใบสั่งงาน/แจ้งเหตุ: <strong className="text-slate-700">{incident.ticketNumber}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
