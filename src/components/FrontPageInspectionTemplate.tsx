import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { InspectionRecord, VisualCheckItem, VisualCheckStatus, Transformer } from '../types';
import { DEFAULT_VISUAL_CHECKS } from '../data/defaultInspections';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Save,
  Printer,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Droplet,
  ExternalLink,
  ChevronRight,
  MapPin,
  Calendar,
  User,
  Check,
  X,
  FileText,
  Activity,
  Info,
} from 'lucide-react';

interface FrontPageInspectionTemplateProps {
  initialTransformerId?: string;
  onOpenFullModule?: () => void;
}

export const FrontPageInspectionTemplate: React.FC<FrontPageInspectionTemplateProps> = ({
  initialTransformerId,
  onOpenFullModule,
}) => {
  const {
    transformers,
    inspections,
    selectedId,
    setSelectedId,
    saveInspection,
    showToast,
    currentUser,
    setActiveTab,
  } = useTransformers();

  // Active transformer ID for the inspection template
  const [activeTrId, setActiveTrId] = useState<string>(() => {
    return initialTransformerId || selectedId || (transformers[0] ? transformers[0].id : 'TR41-001773');
  });

  // Current transformer object
  const currentTransformer = useMemo(() => {
    return transformers.find((t) => t.id === activeTrId) || transformers[0] || null;
  }, [transformers, activeTrId]);

  // Find existing inspection for this transformer, or generate a structured template record
  const existingRecord = useMemo(() => {
    return inspections.find((r) => r.transformerId === activeTrId) || null;
  }, [inspections, activeTrId]);

  // Form state
  const [record, setRecord] = useState<InspectionRecord>(() => {
    if (existingRecord) {
      return JSON.parse(JSON.stringify(existingRecord));
    }
    return buildDefaultRecord(currentTransformer, currentUser?.name);
  });

  // Update record state when transformer selection changes
  React.useEffect(() => {
    if (existingRecord) {
      setRecord(JSON.parse(JSON.stringify(existingRecord)));
    } else {
      setRecord(buildDefaultRecord(currentTransformer, currentUser?.name));
    }
  }, [activeTrId, existingRecord?.id, currentTransformer?.id]);

  function buildDefaultRecord(tr: Transformer | null, userName?: string): InspectionRecord {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const trId = tr?.id || 'TR41-001773';
    const kva = tr?.kva || 50;
    const priVolt = tr?.voltage?.includes('33') ? 33 : 22;

    return {
      id: `INS-68-${trId.replace(/[^a-zA-Z0-9]/g, '')}`,
      docNumber: 'ข-2 มป.11-ป.68',
      transformerId: trId,
      transformerName: tr?.name || 'หม้อแปลงไฟฟ้า กฟภ.',
      poleId: tr?.poleId || '1000001430',
      feeder: 'BGA02',
      substationArea: tr?.area || 'กฟส.บ้านโฮ่ง จ.ลำพูน (ฟีดเดอร์ BGA02)',
      brand: 'Ekarat',
      serialNo: `SN-${trId}`,
      ratedKva: kva,
      hvVoltageKv: priVolt,
      lvVoltageV: 400,
      phase: tr?.phase ? `${tr.phase} Phase` : '3 Phase 4 Wires',
      vectorGroup: 'Dyn11',
      impedanceZPercent: 4.0,
      tapPosition: '3 (0%)',
      mfgYear: '2022',
      inspectionDate: today,
      inspectionTime: nowTime,
      purpose: 'routine_pm',
      purposeDetail: 'การตรวจสอบและทดสอบบำรุงรักษาตามวาระประจำปี 2568 ตามเกณฑ์มาตรฐาน กฟภ. มป.11',
      visualChecks: DEFAULT_VISUAL_CHECKS.map((c) => ({ ...c, status: 'good' })),
      insulationTest: {
        testVoltage: '2500V',
        hvGround1Min: tr?.insulationHV_G || 3850,
        hvGround10Min: (tr?.insulationHV_G || 3850) * 2.05,
        polarizationIndex: 2.05,
        lvGround1Min: tr?.insulationLV_G || 2100,
        hvLv1Min: tr?.insulationHV_LV || 4200,
        ambientTempC: 32,
        humidityPercent: 62,
      },
      oilTest: {
        shot1: (tr?.oilBDV || 42.5) - 0.5,
        shot2: (tr?.oilBDV || 42.5) + 1.2,
        shot3: (tr?.oilBDV || 42.5) - 0.2,
        shot4: (tr?.oilBDV || 42.5) + 0.8,
        shot5: (tr?.oilBDV || 42.5) - 1.0,
        shot6: tr?.oilBDV || 42.5,
        averageKv: tr?.oilBDV || 42.5,
        oilColor: '0.5 สีเหลืองอ่อนใส',
        appearance: 'ใสบริสุทธิ์ ไม่มีตะกอนหรือกลิ่นไหม้',
        moisturePpm: 15,
      },
      groundTest: {
        surgeArresterGroundOhm: tr?.groundResistance || 2.8,
        lvNeutralGroundOhm: (tr?.groundResistance || 2.8) + 0.3,
        tankGroundOhm: (tr?.groundResistance || 2.8) + 0.1,
        groundRodCondition: 'good',
      },
      windingResistance: {
        h1h2: 14.5,
        h2h3: 14.4,
        h3h1: 14.6,
        x1x2: 21.0,
        x2x3: 20.9,
        x3x1: 21.1,
        unbalanceHvPercent: 0.69,
        unbalanceLvPercent: 0.95,
      },
      loadMeasurement: {
        vAb: tr?.voltageAB || 400,
        vBc: tr?.voltageBC || 401,
        vCa: tr?.voltageCA || 399,
        vAn: tr?.voltageAN || 231,
        vBn: tr?.voltageBN || 232,
        vCn: tr?.voltageCN || 230,
        iA: tr?.currentA || 54.2,
        iB: tr?.currentB || 56.1,
        iC: tr?.currentC || 55.8,
        iNeutral: tr?.currentN || 3.4,
        currentUnbalancePercent: tr?.unbalancePercent || 2.1,
        calculatedLoadKva: tr?.loadKva || 37.5,
        loadPercent: tr?.percent || 75.0,
      },
      overallResult: 'pass',
      summaryNotes: 'หม้อแปลงอยู่ในสภาพปกติสมบูรณ์ ผ่านเกณฑ์มาตรฐาน กฟภ. (Rev.4-68) ทุกข้อ ฉนวนไฟฟ้าและน้ำมันคุณภาพดี',
      actionItems: 'บันทึกข้อมูลเข้าระบบ BISME กฟภ. และนัดหมายตรวจสอบครั้งต่อไปตามรอบ 12 เดือน',
      workOrderNo: `WO-PM68-${trId.replace(/[^0-9]/g, '').slice(-3) || '001'}`,
      inspectorName: userName || 'นายสุรชัย มั่นจิตต์ (ช่างเทคนิค กฟส.บ้านโฮ่ง)',
      inspectorPosition: 'ช่างเทคนิคสายอากาศ 5',
      inspectorDept: 'แผนกปฏิบัติการและบำรุงรักษา (ผบห.) กฟส.บ้านโฮ่ง',
      approverName: 'นายสมศักดิ์ วงศ์สวรรค์ (วิศวกรไฟฟ้า 7)',
      approverPosition: 'หัวหน้าแผนกบำรุงรักษา กฟส.บ้านโฮ่ง',
      approvedDate: today,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Handle switching active transformer
  const handleSelectTransformer = (trId: string) => {
    setActiveTrId(trId);
    setSelectedId(trId);
  };

  // Toggle visual check item status
  const handleToggleVisualStatus = (index: number, newStatus: VisualCheckStatus) => {
    setRecord((prev) => {
      const updated = [...prev.visualChecks];
      if (updated[index]) {
        updated[index] = { ...updated[index], status: newStatus };
      }
      return { ...prev, visualChecks: updated };
    });
  };

  // Update electrical test numbers
  const handleUpdateInsulation = (field: 'hvLv1Min' | 'hvGround1Min' | 'lvGround1Min', value: number) => {
    setRecord((prev) => ({
      ...prev,
      insulationTest: {
        ...prev.insulationTest,
        [field]: value,
      },
    }));
  };

  const handleUpdateGround = (field: 'surgeArresterGroundOhm' | 'tankGroundOhm' | 'lvNeutralGroundOhm', value: number) => {
    setRecord((prev) => ({
      ...prev,
      groundTest: {
        ...prev.groundTest,
        [field]: value,
      },
    }));
  };

  const handleUpdateOilBDV = (value: number) => {
    setRecord((prev) => ({
      ...prev,
      oilTest: {
        ...prev.oilTest,
        averageKv: value,
        shot1: value,
        shot2: value,
        shot3: value,
        shot4: value,
        shot5: value,
        shot6: value,
      },
    }));
  };

  // Save changes
  const handleSave = () => {
    const updated = {
      ...record,
      updatedAt: Date.now(),
    };
    saveInspection(updated);
    showToast(`บันทึกแบบฟอร์มตรวจสอบ มป.11 สำหรับหม้อแปลง ${record.transformerId} สำเร็จ`, 'SAVE_OK', 'success');
  };

  // Quick print handler
  const handlePrint = () => {
    window.print();
  };

  // Reset to default
  const handleReset = () => {
    setRecord(buildDefaultRecord(currentTransformer, currentUser?.name));
    showToast(`รีเซ็ตค่าแบบบันทึก มป.11 ของ ${activeTrId} เป็นค่ามาตรฐาน กฟภ. เรียบร้อย`, 'RESET_OK', 'info');
  };

  return (
    <div className="flex flex-col gap-5 w-full font-sans">
      {/* 1. Header Banner of the Inspection Template */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100/80 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 shadow-2xs">
            <ClipboardCheck className="w-7 h-7 text-[#006948]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300">
                แบบฟอร์ม กฟภ. ข-2 มป.11-ป.68
              </span>
              <span className="text-xs font-semibold text-slate-500">
                การไฟฟ้าส่วนภูมิภาค (PEA)
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-slate-700">
                กฟส.บ้านโฮ่ง จ.ลำพูน (ฟีดเดอร์ BGA02)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              แบบบันทึกการตรวจสอบและทดสอบหม้อแปลงระบบจำหน่าย
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              เทมเพลตบันทึกข้อมูลหน้างาน ตรวจสอบสภาพทางกายภาพ ค่าความต้านทานฉนวน (Megger) น้ำมันหม้อแปลง (BDV) และความต้านทานดินตามเกณฑ์มาตรฐาน กฟภ. Rev.4-68
            </p>
          </div>
        </div>

        {/* Action Buttons on top */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="บันทึกผลการตรวจสอบลงฐานข้อมูล"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกผล มป.11</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
            title="พิมพ์แบบบันทึกการตรวจสอบ"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>พิมพ์</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            title="รีเซ็ตค่าเป็นค่ามาตรฐาน กฟภ."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>

          {onOpenFullModule && (
            <button
              onClick={onOpenFullModule}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-teal-200 transition-colors cursor-pointer"
              title="เปิดโมดูล มป.11 เต็มรูปแบบ"
            >
              <span>โมดูลเต็ม</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Transformer Quick Selection Bar (15 TR units) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
            <Layers className="w-4 h-4 text-[#006948]" />
            <span>เลือกหม้อแปลงที่ต้องการบันทึกการตรวจสอบ ({transformers.length} เครื่อง ในฟีดเดอร์ BGA02):</span>
          </span>
          <span className="text-slate-500 font-medium">คลิกเพื่อสลับหม้อแปลง</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {transformers.map((tr) => {
            const isSelected = tr.id === activeTrId;
            return (
              <button
                key={tr.id}
                onClick={() => handleSelectTransformer(tr.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-[#006948] text-white border-[#006948] shadow-xs scale-102'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{tr.id}</span>
                <span
                  className={`text-[10px] font-sans px-1.5 py-0.2 rounded font-semibold ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tr.kva} kVA
                </span>
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? 'bg-amber-300 text-slate-950 font-bold' : 'text-amber-800 bg-amber-50'
                  }`}
                >
                  {tr.lineCutoutId || 'BGA02VF-158'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Section: General Information (ข้อมูลทั่วไปของหม้อแปลง) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006948]" />
            <h3 className="font-extrabold text-base text-slate-900">
              1. ข้อมูลทั่วไปของหม้อแปลงไฟฟ้า (General Information)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            รหัสเอกสาร: {record.docNumber}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-semibold block text-[11px]">หมายเลขหม้อแปลง (TR)</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 block">
              {record.transformerId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-semibold block text-[11px]">พิกัดกำลัง (kVA)</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 block">
              {record.ratedKva} kVA
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-semibold block text-[11px]">แรงดันระบบ (HV / LV)</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 block">
              {record.hvVoltageKv} kV / {record.lvVoltageV} V
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-semibold block text-[11px]">จำนวนเฟส / วงจร</span>
            <span className="font-semibold text-sm text-slate-900 mt-0.5 block truncate">
              {record.phase}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-semibold block text-[11px]">ตำแหน่งเสา กฟภ.</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 mt-0.5 block">
              {record.poleId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-amber-800 font-semibold block text-[11px]">อุปกรณ์ป้องกันแรงสูง</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-amber-950 mt-0.5 block">
              {currentTransformer?.lineCutoutId || 'BGA02VF-158'}
            </span>
          </div>
        </div>

        {/* Location & DCC details */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-slate-500 font-medium">สถานที่ติดตั้ง / ชื่อสถานีหม้อแปลง:</span>{' '}
              <strong className="text-slate-900 font-bold">{record.transformerName}</strong>
              <span className="text-slate-400 mx-2">|</span>
              <span className="text-slate-600">{record.substationArea}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-600 shrink-0">
            <div>
              <span className="text-slate-500">วันที่ตรวจ:</span>{' '}
              <strong className="text-slate-900 font-mono">{record.inspectionDate}</strong>
            </div>
            <div>
              <span className="text-slate-500">เวลา:</span>{' '}
              <strong className="text-slate-900 font-mono">{record.inspectionTime}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section: Visual Inspection Checklist (การตรวจสอบสภาพภายนอก) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              2. ผลการตรวจสอบสภาพทางกายภาพภายนอก (Visual Inspection Checklist)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            คลิกปุ่มสถานะเพื่อเปลี่ยนผลการตรวจหน้างาน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {record.visualChecks.map((item, idx) => {
            const isGood = item.status === 'good';
            const isWarning = item.status === 'warning';
            const isDefect = item.status === 'defect';

            return (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 pl-7 leading-relaxed">
                      เกณฑ์: {item.criteria}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleToggleVisualStatus(idx, 'good')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isGood
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ปกติ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVisualStatus(idx, 'warning')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isWarning
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>เฝ้าระวัง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleVisualStatus(idx, 'defect')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isDefect
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ผิดปกติ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Section: Electrical & Diagnostic Measurements (ผลการทดสอบทางไฟฟ้าและน้ำมัน) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              3. ผลการทดสอบทางไฟฟ้าและสภาพน้ำมัน (Electrical &amp; Oil Diagnostics)
            </h3>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">
            เกณฑ์มาตรฐาน กฟภ. Rev.4-68
          </span>
        </div>

        {/* 5.1 Insulation Resistance (Megger Test) */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>3.1 ค่าความต้านทานของฉนวน (Insulation Resistance - Megger Test @ 2500V)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* HV to LV */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-teal-900 block">
                  ขดลวดแรงสูง - ขดลวดแรงต่ำ (HV - LV)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  มาตรฐาน กฟภ.: &gt; 100 MΩ
                </span>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-teal-950">
                    {record.insulationTest.hvLv1Min}
                  </span>
                  <span className="text-xs font-bold text-slate-600">MΩ</span>
                </div>
              </div>
              <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ปกติ</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px]">1 นาที</span>
              </div>
            </div>

            {/* HV to Ground */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-teal-900 block">
                  ขดลวดแรงสูง - ตัวถัง/ดิน (HV - G)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  มาตรฐาน กฟภ.: &gt; 100 MΩ
                </span>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-teal-950">
                    {record.insulationTest.hvGround1Min}
                  </span>
                  <span className="text-xs font-bold text-slate-600">MΩ</span>
                </div>
              </div>
              <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ปกติ</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px]">PI: {record.insulationTest.polarizationIndex || 2.05}</span>
              </div>
            </div>

            {/* LV to Ground */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-teal-900 block">
                  ขดลวดแรงต่ำ - ตัวถัง/ดิน (LV - G)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  มาตรฐาน กฟภ.: &gt; 50 MΩ
                </span>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-teal-950">
                    {record.insulationTest.lvGround1Min}
                  </span>
                  <span className="text-xs font-bold text-slate-600">MΩ</span>
                </div>
              </div>
              <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ปกติ</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px]">1 นาที</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5.2 Oil Breakdown Voltage (BDV) & Ground Resistance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Oil BDV */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>ความเป็นฉนวนของน้ำมัน (Breakdown Voltage - BDV)</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  เกณฑ์ &ge; 30 kV
                </span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {record.oilTest.averageKv.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-600">kV (ค่าเฉลี่ย 6 ครั้ง)</span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#1</span>
                  <span className="font-mono font-bold">{record.oilTest.shot1}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#2</span>
                  <span className="font-mono font-bold">{record.oilTest.shot2}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#3</span>
                  <span className="font-mono font-bold">{record.oilTest.shot3}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#4</span>
                  <span className="font-mono font-bold">{record.oilTest.shot4}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#5</span>
                  <span className="font-mono font-bold">{record.oilTest.shot5}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">#6</span>
                  <span className="font-mono font-bold">{record.oilTest.shot6}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>ลักษณะน้ำมัน: {record.oilTest.appearance}</span>
              <span className="font-bold text-emerald-700">✓ คุณภาพดีมาก</span>
            </div>
          </div>

          {/* Ground Resistance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>ความต้านทานระบบสายต่อลงดิน (Ground Resistance)</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  เกณฑ์ &le; 5.0 Ω
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 my-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">กราวด์ล่อฟ้า</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                    {record.groundTest.surgeArresterGroundOhm} Ω
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ ผ่าน (&le;5Ω)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">กราวด์ตัวถัง</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                    {record.groundTest.tankGroundOhm} Ω
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ ผ่าน (&le;5Ω)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">สายนิวทรัล</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 mt-0.5 block">
                    {record.groundTest.lvNeutralGroundOhm} Ω
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">✓ ผ่าน (&le;5Ω)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>สภาพหลักดิน (Ground Rod): สมบูรณ์แน่นหนา</span>
              <span className="font-bold text-emerald-700">✓ ปลอดภัยตามมาตรฐาน</span>
            </div>
          </div>
        </div>

        {/* 5.3 Operational Load & Temperature Telemetry */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>การจ่ายโหลดจริงและอุณหภูมิ (Operational Telemetry)</span>
            </span>
            <span className="text-xs font-mono text-slate-600">
              พิกัด {currentTransformer?.kva} kVA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="text-[11px] text-slate-500 block">โหลดใช้งานจริง</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {record.loadMeasurement.calculatedLoadKva} kVA
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="text-[11px] text-slate-500 block">คิดเป็น % โหลด</span>
              <span className="text-base font-extrabold font-mono text-emerald-700">
                {record.loadMeasurement.loadPercent}%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="text-[11px] text-slate-500 block">กระแสเฟส A / B / C</span>
              <span className="text-sm font-extrabold font-mono text-slate-900">
                {record.loadMeasurement.iA} / {record.loadMeasurement.iB} / {record.loadMeasurement.iC} A
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="text-[11px] text-slate-500 block">กระแสสายนิวทรัล (In)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {record.loadMeasurement.iNeutral} A
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
              <span className="text-[11px] text-slate-500 block">อุณหภูมิขดลวด</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {currentTransformer?.windingTemp || 41.5} °C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Section: Overall Assessment & Engineering Recommendation */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              4. สรุปผลการประเมินและการรับรอง (Overall Assessment &amp; Certification)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>ผ่านเกณฑ์มาตรฐาน กฟภ. สมบูรณ์</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
            <span className="font-bold text-slate-900 block text-sm">
              ข้อสรุปผลการประเมินวิศวกรรม:
            </span>
            <p className="text-slate-700 leading-relaxed">
              {record.summaryNotes}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
            <span className="font-bold text-slate-900 block text-sm">
              การดำเนินการต่อไป (Action Items):
            </span>
            <p className="text-slate-700 leading-relaxed">
              {record.actionItems}
            </p>
          </div>
        </div>

        {/* Sign-off Strip */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
            <User className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">ผู้ตรวจสอบ (Inspector):</span>
              <strong className="text-slate-900 font-bold">{record.inspectorName}</strong>
              <span className="text-slate-600 block text-[11px]">{record.inspectorPosition}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[11px]">ผู้อนุมัติผล (Approver):</span>
              <strong className="text-slate-900 font-bold">{record.approverName}</strong>
              <span className="text-slate-600 block text-[11px]">{record.approverPosition}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            เอกสารแบบฟอร์ม ข-2 มป.11-ป.68 ได้รับการรองรับโดยมาตรฐาน กฟภ. ระบบจำหน่ายไฟฟ้า
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกผลการตรวจสอบ มป.11</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>พิมพ์แบบฟอร์ม</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
