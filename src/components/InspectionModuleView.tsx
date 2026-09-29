import React, { useState, useMemo } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { InspectionRecord, VisualCheckItem, VisualCheckStatus, InspectionStatus } from '../types';
import { DEFAULT_VISUAL_CHECKS } from '../data/defaultInspections';
import { InspectionAnalysisPanel } from './InspectionAnalysisPanel';
import { analyzeTransformerAgainstStandards } from '../lib/peaStandards';
import {
  ClipboardCheck,
  FileText,
  Printer,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Zap,
  Shield,
  Activity,
  Droplet,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Download,
  Info,
} from 'lucide-react';

export const InspectionModuleView: React.FC = () => {
  const {
    transformers,
    inspections,
    selectedInspectionId,
    setSelectedInspectionId,
    saveInspection,
    deleteInspection,
    resetInspections,
    currentUser,
    userRole,
    showToast,
  } = useTransformers();

  // Active view: 'form' | 'analysis' | 'official_print' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'analysis' | 'official_print' | 'history'>('form');

  // Search filter for history
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterResult, setHistoryFilterResult] = useState<string>('all');

  // Form active section tab
  const [activeSection, setActiveSection] = useState<number>(1);

  // Current record being edited
  const currentRecord = useMemo(() => {
    if (selectedInspectionId) {
      const found = inspections.find((r) => r.id === selectedInspectionId);
      if (found) return found;
    }
    return inspections[0] || null;
  }, [selectedInspectionId, inspections]);

  // Local form state
  const [formData, setFormData] = useState<InspectionRecord>(() => {
    if (currentRecord) return JSON.parse(JSON.stringify(currentRecord));
    return createEmptyRecord();
  });

  // Keep form in sync when currentRecord changes
  React.useEffect(() => {
    if (currentRecord) {
      setFormData(JSON.parse(JSON.stringify(currentRecord)));
    }
  }, [currentRecord?.id]);

  function createEmptyRecord(): InspectionRecord {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const firstTr = transformers[0];
    return {
      id: `INS-68-${Date.now().toString().slice(-5)}`,
      docNumber: 'ข-2 มป.11-ป.68',
      transformerId: firstTr?.id || 'TR23-011134',
      transformerName: firstTr?.name || 'หม้อแปลงไฟฟ้า กฟภ.',
      poleId: firstTr?.poleId || '1000001370',
      feeder: 'BGA01',
      substationArea: firstTr?.area || 'กฟส.บ้านโฮ่ง จ.ลำพูน',
      brand: 'Ekarat',
      serialNo: 'SN-0001',
      ratedKva: firstTr?.kva || 250,
      hvVoltageKv: firstTr?.voltage?.includes('33') ? 33 : 22,
      lvVoltageV: 400,
      phase: '3 Phase 4 Wires',
      vectorGroup: 'Dyn11',
      impedanceZPercent: 4.0,
      tapPosition: '3 (0%)',
      mfgYear: '2022',
      inspectionDate: today,
      inspectionTime: nowTime,
      purpose: 'routine_pm',
      purposeDetail: 'บำรุงรักษาเชิงป้องกันตามวาระประจำปี 2568',
      visualChecks: JSON.parse(JSON.stringify(DEFAULT_VISUAL_CHECKS)),
      insulationTest: {
        testVoltage: '2500V',
        hvGround1Min: 3500,
        hvGround10Min: 7350,
        polarizationIndex: 2.1,
        lvGround1Min: 1800,
        hvLv1Min: 4200,
        ambientTempC: 32,
        humidityPercent: 65,
      },
      oilTest: {
        shot1: 48,
        shot2: 50,
        shot3: 49,
        shot4: 51,
        shot5: 52,
        shot6: 50,
        averageKv: 50,
        oilColor: '0.5 สีเหลืองอ่อนใส',
        appearance: 'ใสบริสุทธิ์ ไม่มีตะกอน',
        moisturePpm: 15,
      },
      groundTest: {
        surgeArresterGroundOhm: 3.5,
        lvNeutralGroundOhm: 2.8,
        tankGroundOhm: 3.0,
        groundRodCondition: 'good',
      },
      windingResistance: {
        h1h2: 12.5,
        h2h3: 12.4,
        h3h1: 12.6,
        x1x2: 18.0,
        x2x3: 17.9,
        x3x1: 18.1,
        unbalanceHvPercent: 0.8,
        unbalanceLvPercent: 1.1,
      },
      loadMeasurement: {
        vAb: 400,
        vBc: 400,
        vCa: 401,
        vAn: 231,
        vBn: 230,
        vCn: 231,
        iA: 180,
        iB: 175,
        iC: 185,
        iNeutral: 15,
        currentUnbalancePercent: 2.8,
        calculatedLoadKva: 124.7,
        loadPercent: 49.9,
      },
      overallResult: 'pass',
      summaryNotes: 'หม้อแปลงอยู่ในสภาพปกติ สมบูรณ์ตามเกณฑ์มาตรฐาน กฟภ. พร้อมจ่ายไฟ',
      actionItems: 'บันทึกประวัติเข้าระบบ BISME และนัดหมายตรวจสอบครั้งต่อไปตามรอบ 1 ปี',
      workOrderNo: 'WO-PM68-001',
      inspectorName: currentUser?.name || 'นายสุรชัย มั่นจิตต์',
      inspectorPosition: currentUser?.position || 'ช่างเทคนิคสายอากาศ 5',
      inspectorDept: currentUser?.dept || 'แผนกปฏิบัติการและบำรุงรักษา (ผบห.) กฟส.บ้านโฮ่ง',
      approverName: 'นายสมศักดิ์ วงศ์สวรรค์',
      approverPosition: 'วิศวกรไฟฟ้า 7 (หัวหน้าแผนกบำรุงรักษา)',
      approvedDate: today,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Handle selecting an existing transformer to auto-fill
  const handleSelectTransformer = (transformerId: string) => {
    const tr = transformers.find((t) => t.id === transformerId);
    if (!tr) return;

    setFormData((prev) => ({
      ...prev,
      transformerId: tr.id,
      transformerName: tr.name,
      poleId: tr.poleId || prev.poleId,
      substationArea: tr.area || prev.substationArea,
      ratedKva: tr.kva || prev.ratedKva,
      hvVoltageKv: tr.voltage.includes('33') ? 33 : 22,
      loadMeasurement: {
        ...prev.loadMeasurement,
        calculatedLoadKva: tr.loadKva || prev.loadMeasurement.calculatedLoadKva,
        loadPercent: tr.percent || prev.loadMeasurement.loadPercent,
      },
    }));

    showToast(`ดึงข้อมูลหม้อแปลง ${tr.id} เข้าสู่แบบฟอร์มเรียบร้อย`, 'AUTOFILL_OK', 'info');
  };

  // Auto-calculated fields
  const bdvAverage = useMemo(() => {
    const shots = [
      formData.oilTest.shot1,
      formData.oilTest.shot2,
      formData.oilTest.shot3,
      formData.oilTest.shot4,
      formData.oilTest.shot5,
      formData.oilTest.shot6,
    ].filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);

    if (shots.length === 0) return 0;
    const sum = shots.reduce((a, b) => a + b, 0);
    return Math.round((sum / shots.length) * 10) / 10;
  }, [formData.oilTest]);

  const calculatedPI = useMemo(() => {
    const r1 = formData.insulationTest.hvGround1Min;
    const r10 = formData.insulationTest.hvGround10Min;
    if (r1 && r10 && r1 > 0) {
      return Math.round((r10 / r1) * 100) / 100;
    }
    return 0;
  }, [formData.insulationTest.hvGround1Min, formData.insulationTest.hvGround10Min]);

  const windingUnbalanceHv = useMemo(() => {
    const { h1h2, h2h3, h3h1 } = formData.windingResistance;
    if (h1h2 && h2h3 && h3h1) {
      const avg = (h1h2 + h2h3 + h3h1) / 3;
      if (avg <= 0) return 0;
      const maxDiff = Math.max(Math.abs(h1h2 - avg), Math.abs(h2h3 - avg), Math.abs(h3h1 - avg));
      return Math.round((maxDiff / avg) * 10000) / 100;
    }
    return 0;
  }, [formData.windingResistance]);

  const windingUnbalanceLv = useMemo(() => {
    const { x1x2, x2x3, x3x1 } = formData.windingResistance;
    if (x1x2 && x2x3 && x3x1) {
      const avg = (x1x2 + x2x3 + x3x1) / 3;
      if (avg <= 0) return 0;
      const maxDiff = Math.max(Math.abs(x1x2 - avg), Math.abs(x2x3 - avg), Math.abs(x3x1 - avg));
      return Math.round((maxDiff / avg) * 10000) / 100;
    }
    return 0;
  }, [formData.windingResistance]);

  // Load calculation
  const calculatedLoadMetrics = useMemo(() => {
    const { iA, iB, iC, vAb } = formData.loadMeasurement;
    const iaVal = iA || 0;
    const ibVal = iB || 0;
    const icVal = iC || 0;
    const vVal = vAb || 400;

    const avgI = (iaVal + ibVal + icVal) / 3;
    const loadKva = Math.round((Math.sqrt(3) * vVal * avgI) / 100) / 10;
    const ratedKva = formData.ratedKva || 250;
    const loadPct = ratedKva > 0 ? Math.round((loadKva / ratedKva) * 1000) / 10 : 0;

    let unbalanceCurrent = 0;
    if (avgI > 0) {
      const maxDiff = Math.max(Math.abs(iaVal - avgI), Math.abs(ibVal - avgI), Math.abs(icVal - avgI));
      unbalanceCurrent = Math.round((maxDiff / avgI) * 1000) / 10;
    }

    return {
      loadKva,
      loadPct,
      unbalanceCurrent,
      avgI: Math.round(avgI * 10) / 10,
    };
  }, [formData.loadMeasurement, formData.ratedKva]);

  // Update visual check item status
  const handleVisualCheckChange = (id: string, status: VisualCheckStatus, remark?: string) => {
    setFormData((prev) => ({
      ...prev,
      visualChecks: prev.visualChecks.map((item) =>
        item.id === id ? { ...item, status, ...(remark !== undefined ? { remark } : {}) } : item
      ),
    }));
  };

  // Quick preset loader
  const applyPresetTemplate = (type: 'normal' | 'warning' | 'fault') => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    if (type === 'normal') {
      setFormData((prev) => ({
        ...prev,
        inspectionDate: today,
        inspectionTime: nowTime,
        purpose: 'routine_pm',
        visualChecks: DEFAULT_VISUAL_CHECKS.map((c) => ({ ...c, status: 'good' })),
        insulationTest: {
          testVoltage: '2500V',
          hvGround1Min: 4500,
          hvGround10Min: 9900,
          polarizationIndex: 2.2,
          lvGround1Min: 2100,
          hvLv1Min: 5200,
          ambientTempC: 31,
          humidityPercent: 62,
        },
        oilTest: {
          shot1: 49,
          shot2: 52,
          shot3: 50,
          shot4: 48,
          shot5: 53,
          shot6: 51,
          averageKv: 50.5,
          oilColor: '0.5 สีเหลืองอ่อนใส',
          appearance: 'ใสบริสุทธิ์ ไม่มีตะกอน',
          moisturePpm: 12,
        },
        groundTest: {
          surgeArresterGroundOhm: 3.2,
          lvNeutralGroundOhm: 2.5,
          tankGroundOhm: 2.9,
          groundRodCondition: 'good',
        },
        overallResult: 'pass',
        summaryNotes: 'หม้อแปลงสภาพสมบูรณ์ ค่าทดสอบฉนวน น้ำมัน และกราวด์ดินผ่านเกณฑ์ กฟภ. ทุกประการ',
        actionItems: 'บันทึกประวัติเข้าระบบ BISME ไม่ต้องแก้ไขเพิ่มเติม',
      }));
      showToast('โหลดแม่แบบข้อมูล: หม้อแปลงปกติ ผ่านเกณฑ์มาตรฐาน', 'PRESET_NORMAL', 'success');
    } else if (type === 'warning') {
      setFormData((prev) => ({
        ...prev,
        inspectionDate: today,
        inspectionTime: nowTime,
        purpose: 'routine_pm',
        visualChecks: DEFAULT_VISUAL_CHECKS.map((c) => {
          if (c.id === 'vc-09') {
            return {
              ...c,
              status: 'warning',
              remark: 'ซิลิก้าเจลเปลี่ยนเป็นสีชมพู 50% เริ่มเสื่อมสภาพ',
            };
          }
          if (c.id === 'vc-06') {
            return {
              ...c,
              status: 'warning',
              remark: 'พบคราบซึมน้ำมันบางๆ บริเวณปะเก็นวาล์วถ่ายด้านล่าง',
            };
          }
          return c;
        }),
        insulationTest: {
          testVoltage: '2500V',
          hvGround1Min: 2200,
          hvGround10Min: 3740,
          polarizationIndex: 1.7,
          lvGround1Min: 1200,
          hvLv1Min: 2600,
          ambientTempC: 33,
          humidityPercent: 68,
        },
        oilTest: {
          shot1: 32,
          shot2: 34,
          shot3: 31,
          shot4: 33,
          shot5: 35,
          shot6: 33,
          averageKv: 33,
          oilColor: '1.5 สีเหลืองทอง',
          appearance: 'ใสปานกลาง',
          moisturePpm: 24,
        },
        groundTest: {
          surgeArresterGroundOhm: 4.8,
          lvNeutralGroundOhm: 4.5,
          tankGroundOhm: 4.7,
          groundRodCondition: 'loose',
        },
        overallResult: 'warning',
        summaryNotes: 'หม้อแปลงยังจ่ายไฟได้ แต่ซิลิก้าเจลชื้น ค่า BDV น้ำมันเริ่มลดลง และแคลมป์กราวด์หลวมเล็กน้อย',
        actionItems: 'เปลี่ยนซิลิก้าเจล ขันกวดแคลมป์สายดิน และจัดคิวตรวจวัดซ้ำใน 3-6 เดือน',
      }));
      showToast('โหลดแม่แบบข้อมูล: หม้อแปลงกลุ่มเฝ้าระวัง (Watchlist)', 'PRESET_WARNING', 'warning');
    } else if (type === 'fault') {
      setFormData((prev) => ({
        ...prev,
        inspectionDate: today,
        inspectionTime: nowTime,
        purpose: 'post_fault',
        visualChecks: DEFAULT_VISUAL_CHECKS.map((c) => {
          if (c.id === 'vc-02') {
            return {
              ...c,
              status: 'defect',
              remark: 'บุชชิ่งแรงสูงเฟส A พบรอยแตกร้าวและคราบแฟลชโอเวอร์รุนแรง',
            };
          }
          if (c.id === 'vc-06') {
            return {
              ...c,
              status: 'defect',
              remark: 'น้ำมันรั่วไหลหยดลงโคนเสา ระดับน้ำมันที่ช่องมองแห้งต่ำกว่าขีด MIN',
            };
          }
          return c;
        }),
        insulationTest: {
          testVoltage: '1000V',
          hvGround1Min: 45,
          hvGround10Min: 49,
          polarizationIndex: 1.08,
          lvGround1Min: 60,
          hvLv1Min: 80,
          ambientTempC: 34,
          humidityPercent: 75,
        },
        oilTest: {
          shot1: 18,
          shot2: 20,
          shot3: 17,
          shot4: 19,
          shot5: 18,
          shot6: 18,
          averageKv: 18.3,
          oilColor: '3.5 สีน้ำตาลเข้ม',
          appearance: 'มีตะกอนสีดำและกลิ่นไหม้ชัดเจน',
          moisturePpm: 55,
        },
        groundTest: {
          surgeArresterGroundOhm: 12.5,
          lvNeutralGroundOhm: 9.8,
          tankGroundOhm: 11.2,
          groundRodCondition: 'corroded',
        },
        overallResult: 'segregate',
        summaryNotes: 'ฉนวนขดลวดต่ำกว่า 100 MΩ, น้ำมันเสื่อมสภาพรุนแรง BDV < 20 kV และบุชชิ่งชำรุด ไม่สามารถจ่ายไฟต่อได้',
        actionItems: 'ปลดหม้อแปลงออกจากระบบทันที ส่งกองโรงงาน/แผนกหม้อแปลง กฟภ. เพื่อดำเนินการคัดแยก (มป.11) และซ่อมใหญ่',
      }));
      showToast('โหลดแม่แบบข้อมูล: หม้อแปลงชำรุดส่งซ่อมคัดแยก (Segregate)', 'PRESET_FAULT', 'error');
    }
  };

  // Save the form
  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalized: InspectionRecord = {
      ...formData,
      oilTest: {
        ...formData.oilTest,
        averageKv: bdvAverage,
      },
      insulationTest: {
        ...formData.insulationTest,
        polarizationIndex: calculatedPI,
      },
      windingResistance: {
        ...formData.windingResistance,
        unbalanceHvPercent: windingUnbalanceHv,
        unbalanceLvPercent: windingUnbalanceLv,
      },
      loadMeasurement: {
        ...formData.loadMeasurement,
        calculatedLoadKva: calculatedLoadMetrics.loadKva,
        loadPercent: calculatedLoadMetrics.loadPct,
        currentUnbalancePercent: calculatedLoadMetrics.unbalanceCurrent,
      },
      updatedAt: Date.now(),
    };

    saveInspection(finalized);
  };

  // Export current record as JSON / CSV
  const handleExportCsv = () => {
    const headers = [
      'DocNumber',
      'InspectionID',
      'TransformerID',
      'PoleID',
      'Feeder',
      'RatedKVA',
      'VoltageKV',
      'InspectionDate',
      'OverallResult',
      'AvgBDV_kV',
      'PolarizationIndex',
      'GroundResistanceOhm',
      'LoadPercent',
      'Inspector',
      'Approver',
    ];

    const row = [
      `"${formData.docNumber}"`,
      `"${formData.id}"`,
      `"${formData.transformerId}"`,
      `"${formData.poleId}"`,
      `"${formData.feeder}"`,
      formData.ratedKva,
      formData.hvVoltageKv,
      `"${formData.inspectionDate}"`,
      `"${formData.overallResult}"`,
      bdvAverage,
      calculatedPI,
      formData.groundTest.surgeArresterGroundOhm || 0,
      calculatedLoadMetrics.loadPct,
      `"${formData.inspectorName}"`,
      `"${formData.approverName}"`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `มป11_${formData.transformerId}_${formData.inspectionDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ส่งออกข้อมูลผลการตรวจเช็คเป็นไฟล์ CSV สำเร็จ', 'EXPORT_OK', 'success');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return inspections.filter((ins) => {
      const matchSearch =
        ins.transformerId.toLowerCase().includes(historySearch.toLowerCase()) ||
        ins.transformerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        ins.poleId.toLowerCase().includes(historySearch.toLowerCase()) ||
        ins.id.toLowerCase().includes(historySearch.toLowerCase());

      const matchStatus =
        historyFilterResult === 'all' || ins.overallResult === historyFilterResult;

      return matchSearch && matchStatus;
    });
  }, [inspections, historySearch, historyFilterResult]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#006948] to-teal-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                แบบบันทึกการตรวจสอบและทดสอบหม้อแปลงระบบจำหน่าย
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                มป.11-ป.68 Rev.4-68
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              แบบฟอร์มทางการ ข-2 การไฟฟ้าส่วนภูมิภาค (PEA Distribution Transformer Inspection &amp; Testing)
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('form')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'form'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>กรอกและแก้ไขฟอร์ม</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('analysis')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'analysis'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>วิเคราะห์มาตรฐาน &amp; ตัวเลือกงาน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('official_print')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'official_print'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์แบบฟอร์มทางการ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-[#006948] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>ประวัติผลตรวจ ({inspections.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: FORM INPUT & EDITING                                */}
      {/* ============================================================== */}
      {activeSubTab === 'form' && (
        <div className="flex flex-col gap-6">
          {/* Quick Toolbar: Fast Select, Preset Templates & Save Button */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Transformer Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                เลือกหม้อแปลงในระบบ:
              </label>
              <select
                value={formData.transformerId}
                onChange={(e) => handleSelectTransformer(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-mono font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
              >
                {transformers.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.id} • {tr.kva} kVA • เสา {tr.poleId || '-'} • {tr.name.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>

            {/* Presets & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 hidden sm:inline">แม่แบบตัวอย่าง:</span>
              <button
                type="button"
                onClick={() => applyPresetTemplate('normal')}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="ใส่ค่าทดสอบตัวอย่างหม้อแปลงปกติ ผ่านเกณฑ์มาตรฐาน กฟภ."
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ปกติ (Pass)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('warning')}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="ใส่ค่าทดสอบตัวอย่างหม้อแปลงเฝ้าระวัง"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>เฝ้าระวัง (Watchlist)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate('fault')}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="ใส่ค่าทดสอบตัวอย่างหม้อแปลงชำรุด ส่งคัดแยก มป.11"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>ชำรุดส่งคัดแยก</span>
              </button>

              <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block"></div>

              <button
                type="button"
                onClick={() => setActiveSubTab('analysis')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006948] border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="เปิดตารางเปรียบเทียบมาตรฐาน กฟภ. 2568 และแนวทางปฏิบัติการ"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>วิเคราะห์เทียบมาตรฐาน</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveForm()}
                className="px-4 py-1.5 bg-[#006948] hover:bg-[#005238] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกผล มป.11</span>
              </button>
            </div>
          </div>

          {/* Form Step Navigation Bar */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 border-b border-slate-200">
            {[
              { id: 1, label: '1. ข้อมูลทั่วไป' },
              { id: 2, label: '2. ตรวจสภาพภายนอก (15 ข้อ)' },
              { id: 3, label: '3. ระบบต่อลงดิน' },
              { id: 4, label: '4. ค่าฉนวนไฟฟ้า & PI' },
              { id: 5, label: '5. ทดสอบน้ำมัน (BDV)' },
              { id: 6, label: '6. ความต้านทานขดลวด' },
              { id: 7, label: '7. โหลดและแรงดัน' },
              { id: 8, label: '8. สรุปผลและรับรอง' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSection === s.id
                    ? 'bg-[#006948] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Section 1: General Info */}
          {activeSection === 1 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                  ส่วนที่ 1: ข้อมูลทั่วไปของหม้อแปลงและสถานที่ติดตั้ง
                </h3>
                <span className="text-xs text-slate-400 font-mono">PEA-FORM B-2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">รหัสหม้อแปลง (PEA No.) *</label>
                  <input
                    type="text"
                    value={formData.transformerId}
                    onChange={(e) => setFormData({ ...formData, transformerId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">หมายเลขเสา (Pole No.)</label>
                  <input
                    type="text"
                    value={formData.poleId}
                    onChange={(e) => setFormData({ ...formData, poleId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ฟีดเดอร์ / สายป้อน (Feeder)</label>
                  <input
                    type="text"
                    value={formData.feeder}
                    onChange={(e) => setFormData({ ...formData, feeder: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">สังกัด กฟภ. (Substation/Area)</label>
                  <input
                    type="text"
                    value={formData.substationArea}
                    onChange={(e) => setFormData({ ...formData, substationArea: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">พิกัดกำลัง (Rated kVA) *</label>
                  <input
                    type="number"
                    value={formData.ratedKva}
                    onChange={(e) => setFormData({ ...formData, ratedKva: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">แรงดันด้านแรงสูง (HV kV)</label>
                  <select
                    value={formData.hvVoltageKv}
                    onChange={(e) => setFormData({ ...formData, hvVoltageKv: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={22}>22 kV (มาตรฐาน กฟภ. ทั่วไป)</option>
                    <option value={33}>33 kV (พื้นที่ระบบ 33 kV)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">แรงดันด้านแรงต่ำ (LV V)</label>
                  <select
                    value={formData.lvVoltageV}
                    onChange={(e) => setFormData({ ...formData, lvVoltageV: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value={400}>400/230 V (3 Phase 4 Wires)</option>
                    <option value={460}>460/230 V (1 Phase 3 Wires)</option>
                    <option value={230}>230 V (1 Phase 2 Wires)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ผู้ผลิต / ยี่ห้อ (Brand)</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="เช่น Ekarat, Tirathai, Charoenchai"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">หมายเลขเครื่อง (Serial No.)</label>
                  <input
                    type="text"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">เวกเตอร์กรุ๊ป (Vector Group)</label>
                  <select
                    value={formData.vectorGroup}
                    onChange={(e) => setFormData({ ...formData, vectorGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Dyn11">Dyn11</option>
                    <option value="Ynd11">Ynd11</option>
                    <option value="I0">I0 (1 Phase)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ตำแหน่ง Tap ปัจจุบัน</label>
                  <select
                    value={formData.tapPosition}
                    onChange={(e) => setFormData({ ...formData, tapPosition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="1 (+5%)">Tap 1 (+5%)</option>
                    <option value="2 (+2.5%)">Tap 2 (+2.5%)</option>
                    <option value="3 (0%)">Tap 3 (0% - พิกัดมาตรฐาน)</option>
                    <option value="4 (-2.5%)">Tap 4 (-2.5%)</option>
                    <option value="5 (-5%)">Tap 5 (-5%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">วันที่ทำการตรวจ (Inspection Date) *</label>
                  <input
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">วัตถุประสงค์การตรวจสอบ *</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purpose: e.target.value as InspectionRecord['purpose'],
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="routine_pm">บำรุงรักษาเชิงป้องกันตามวาระ (Routine PM)</option>
                    <option value="pre_commission">ตรวจรับก่อนจ่ายไฟ (Pre-commissioning)</option>
                    <option value="post_fault">ตรวจสอบหลังเกิดเหตุขัดข้อง/ทริป (Post-fault)</option>
                    <option value="segregation_repair">ตรวจคัดแยกส่งซ่อม/ปลดจำหน่าย (มป.11)</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2 md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">รายละเอียดและสถานที่ติดตั้ง</label>
                  <input
                    type="text"
                    value={formData.transformerName}
                    onChange={(e) => setFormData({ ...formData, transformerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Visual & Physical Checks */}
          {activeSection === 2 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 2: การตรวจสอบสภาพภายนอกและอุปกรณ์ประกอบ (15 รายการมาตรฐาน กฟภ.)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ประเมินสภาพกายภาพภายนอก สภาพฉนวน ปะเก็น และอุปกรณ์ป้องกัน
                  </p>
                </div>

                {/* Quick select all good button */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      visualChecks: formData.visualChecks.map((item) => ({
                        ...item,
                        status: 'good',
                      })),
                    })
                  }
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold self-start sm:self-auto cursor-pointer"
                >
                  ตั้งเป็น "ปกติ" ทั้งหมด
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {formData.visualChecks.map((item) => (
                  <div key={item.id} className="py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={item.remark || ''}
                        onChange={(e) => handleVisualCheckChange(item.id, item.status, e.target.value)}
                        placeholder="ระบุข้อสังเกต หรือสภาพความผิดปกติ (ถ้ามี)..."
                        className="w-full text-xs text-slate-600 bg-transparent border-b border-dashed border-slate-200 focus:border-emerald-500 focus:outline-hidden mt-1 py-0.5"
                      />
                    </div>

                    {/* Radio Status Options */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => handleVisualCheckChange(item.id, 'good')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          item.status === 'good'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ปกติ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisualCheckChange(item.id, 'warning')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          item.status === 'warning'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>เฝ้าระวัง</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisualCheckChange(item.id, 'defect')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          item.status === 'defect'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ชำรุด</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisualCheckChange(item.id, 'na')}
                        className={`px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200 cursor-pointer ${
                          item.status === 'na' ? 'bg-slate-300 text-slate-800 font-bold' : 'bg-slate-50'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Grounding System */}
          {activeSection === 3 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 3: การวัดค่าความต้านทานดิน (Grounding Resistance Test)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เกณฑ์มาตรฐาน กฟภ. ค่าความต้านทานดินเสิร์จอาร์เรสเตอร์ และสายนิวทรัลต้องไม่เกิน 5 โอห์ม (Ω)
                  </p>
                </div>
                <Shield className="w-5 h-5 text-emerald-600 hidden sm:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <label className="font-bold text-slate-700">ความต้านทานดินเสิร์จอาร์เรสเตอร์ (Ω)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.groundTest.surgeArresterGroundOhm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groundTest: {
                          ...formData.groundTest,
                          surgeArresterGroundOhm: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-base font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {(formData.groundTest.surgeArresterGroundOhm || 0) <= 5 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์มาตรฐาน (&le; 5 Ω)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> สูงเกินเกณฑ์มาตรฐาน
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <label className="font-bold text-slate-700">ความต้านทานดินนิวทรัลแรงต่ำ (Ω)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.groundTest.lvNeutralGroundOhm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groundTest: {
                          ...formData.groundTest,
                          lvNeutralGroundOhm: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-base font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {(formData.groundTest.lvNeutralGroundOhm || 0) <= 5 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์มาตรฐาน (&le; 5 Ω)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> สูงเกินเกณฑ์มาตรฐาน
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <label className="font-bold text-slate-700">ความต้านทานดินตัวถังหม้อแปลง (Ω)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.groundTest.tankGroundOhm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groundTest: {
                          ...formData.groundTest,
                          tankGroundOhm: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-base font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-slate-500 text-[11px]">จุดต่อโครงสร้างตัวถังและโครงเสา</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                  <label className="font-bold text-slate-700">สภาพสายดินและแท่งกราวด์ร็อด</label>
                  <select
                    value={formData.groundTest.groundRodCondition || 'good'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groundTest: {
                          ...formData.groundTest,
                          groundRodCondition: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
                  >
                    <option value="good">สภาพดี แน่นหนา ไม่เป็นสนิม</option>
                    <option value="loose">แคลมป์หลวมคลอน ต้องขันแน่น</option>
                    <option value="corroded">ผุกร่อน เป็นสนิมลึก</option>
                    <option value="missing">สายดินขาด / สูญหาย</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Insulation Resistance & PI */}
          {activeSection === 4 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 4: การทดสอบความต้านทานฉนวนและค่า P.I. (Insulation Resistance &amp; Polarization Index)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ทดสอบด้วยเครื่อง Megger Tester ระดับแรงดัน 1,000V / 2,500V DC (เกณฑ์ กฟภ. ฉนวนต้อง &ge; 1,000 MΩ, P.I. &ge; 1.5)
                  </p>
                </div>
                <Zap className="w-5 h-5 text-amber-500 hidden sm:block" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">แรงดันทดสอบ (Test Voltage)</label>
                  <select
                    value={formData.insulationTest.testVoltage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: { ...formData.insulationTest, testVoltage: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="1000V">1,000 V DC</option>
                    <option value="2500V">2,500 V DC (มาตรฐาน กฟภ.)</option>
                    <option value="5000V">5,000 V DC</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">HV - Ground ที่ 1 นาที (MΩ)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.hvGround1Min || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          hvGround1Min: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">HV - Ground ที่ 10 นาที (MΩ)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.hvGround10Min || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          hvGround10Min: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Calculated Polarization Index Card */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs">ค่า P.I. (R10min / R1min)</span>
                    <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">
                      AUTO
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#006948] my-1">
                    {calculatedPI > 0 ? calculatedPI.toFixed(2) : '-'}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800">
                    {calculatedPI >= 2.0
                      ? '⭐ ฉนวนดีมาก (Excellent &ge; 2.0)'
                      : calculatedPI >= 1.5
                      ? '✅ ฉนวนดี (Good &ge; 1.5)'
                      : calculatedPI >= 1.0
                      ? '⚠️ ฉนวนพอใช้ (Fair 1.0 - 1.5)'
                      : '❌ อันตราย มีความชื้นสะสม (< 1.0)'}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">LV - Ground ที่ 1 นาที (MΩ)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.lvGround1Min || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          lvGround1Min: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">HV - LV ที่ 1 นาที (MΩ)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.hvLv1Min || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          hvLv1Min: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">อุณหภูมิขณะวัด (°C)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.ambientTempC || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          ambientTempC: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ความชื้นสัมพัทธ์ (%RH)</label>
                  <input
                    type="number"
                    value={formData.insulationTest.humidityPercent || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insulationTest: {
                          ...formData.insulationTest,
                          humidityPercent: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Oil Dielectric BDV Test */}
          {activeSection === 5 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 5: การทดสอบคุณสมบัติน้ำมันหม้อแปลง (Dielectric Breakdown Voltage - BDV)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ทดสอบค่าแรงดันพังทลายของน้ำมัน 6 ครั้งตามมาตรฐาน IEC 60156 (เกณฑ์ กฟภ. ใช้งานแล้ว &ge; 30 kV)
                  </p>
                </div>
                <Droplet className="w-5 h-5 text-teal-600 hidden sm:block" />
              </div>

              {/* 6 Shots BDV Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {[1, 2, 3, 4, 5, 6].map((shotNum) => {
                  const key = `shot${shotNum}` as keyof typeof formData.oilTest;
                  return (
                    <div key={shotNum} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600 text-[11px]">ครั้งที่ {shotNum} (kV)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.oilTest[key] as number || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            oilTest: {
                              ...formData.oilTest,
                              [key]: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-center text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Average BDV Badge Result Card */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold font-mono text-lg shrink-0 shadow-xs">
                    {bdvAverage > 0 ? bdvAverage : '-'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-950">
                      ค่าเฉลี่ยแรงดันพังทลายของน้ำมันหม้อแปลง (Average BDV)
                    </div>
                    <div className="text-xs text-teal-700 mt-0.5 font-medium">
                      {bdvAverage >= 30 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 inline" /> ผ่านเกณฑ์มาตรฐาน กฟภ. (&ge; 30 kV) มีความเป็นฉนวนสูง
                        </span>
                      ) : bdvAverage >= 25 ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 inline" /> เฝ้าระวัง (25 - 29.9 kV) ควรเตรียมกรองน้ำมัน
                        </span>
                      ) : (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4 inline" /> ต่ำกว่าเกณฑ์ (&lt; 25 kV) ต้องเปลี่ยนถ่ายหรือกรองน้ำมันทันที
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600">
                  <span className="block font-mono text-[11px] text-slate-500">มาตรฐานอ้างอิง</span>
                  <span className="font-bold text-slate-800">IEC 60156 / PEA Standard</span>
                </div>
              </div>

              {/* Oil Physical Appearance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สีของน้ำมัน (Oil Color Scale)</label>
                  <select
                    value={formData.oilTest.oilColor || '0.5 สีเหลืองอ่อนใส'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        oilTest: { ...formData.oilTest, oilColor: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="0.5 สีเหลืองอ่อนใสมาก">0.5 สีเหลืองอ่อนใสมาก (น้ำมันใหม่/สภาพดีเยี่ยม)</option>
                    <option value="1.0 สีเหลืองอ่อน">1.0 สีเหลืองอ่อน (สภาพปกติ)</option>
                    <option value="1.5 สีเหลืองทอง">1.5 สีเหลืองทอง (เริ่มมีอายุการใช้งาน)</option>
                    <option value="2.0 สีส้มอำพัน">2.0 สีส้มอำพัน (เฝ้าระวัง)</option>
                    <option value="3.0 สีน้ำตาล">3.0 สีน้ำตาล (เสื่อมสภาพ)</option>
                    <option value="4.0+ สีน้ำตาลเข้ม/ดำ">4.0+ สีน้ำตาลเข้ม/ดำ (ไหม้/ปนเปื้อนรุนแรง)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ลักษณะทางกายภาพและกลิ่น</label>
                  <input
                    type="text"
                    value={formData.oilTest.appearance || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        oilTest: { ...formData.oilTest, appearance: e.target.value },
                      })
                    }
                    placeholder="เช่น ใสบริสุทธิ์ ไม่มีตะกอนหรือกลิ่นไหม้"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ปริมาณความชื้นในน้ำมัน (PPM - ถ้ามี)</label>
                  <input
                    type="number"
                    value={formData.oilTest.moisturePpm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        oilTest: {
                          ...formData.oilTest,
                          moisturePpm: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="มาตรฐาน &le; 25 PPM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Winding Resistance & Phase Balance */}
          {activeSection === 6 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 6: การวัดความต้านทานขดลวดและความไม่สมดุล (Winding Resistance &amp; % Unbalance)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ตรวจสอบความต่อเนื่องและสมดุลของขดลวด (เกณฑ์ กฟภ. % Unbalance ต้องไม่เกิน 2.0% - 5.0%)
                  </p>
                </div>
                <Activity className="w-5 h-5 text-indigo-600 hidden sm:block" />
              </div>

              {/* High Voltage Windings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">ขดลวดด้านแรงสูง (HV Winding - Ω)</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    % ความไม่สมดุล HV: {windingUnbalanceHv}%
                    {windingUnbalanceHv <= 2 ? (
                      <span className="text-emerald-700 ml-1.5">(&le; 2% ปกติ)</span>
                    ) : (
                      <span className="text-amber-700 ml-1.5">(สูงกว่าเกณฑ์)</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">H1 - H2 (Ω)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.windingResistance.h1h2 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            h1h2: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">H2 - H3 (Ω)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.windingResistance.h2h3 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            h2h3: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">H3 - H1 (Ω)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.windingResistance.h3h1 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            h3h1: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Low Voltage Windings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">ขดลวดด้านแรงต่ำ (LV Winding - mΩ)</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    % ความไม่สมดุล LV: {windingUnbalanceLv}%
                    {windingUnbalanceLv <= 2 ? (
                      <span className="text-emerald-700 ml-1.5">(&le; 2% ปกติ)</span>
                    ) : (
                      <span className="text-amber-700 ml-1.5">(สูงกว่าเกณฑ์)</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">X1 - X2 (mΩ)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.windingResistance.x1x2 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            x1x2: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">X2 - X3 (mΩ)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.windingResistance.x2x3 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            x2x3: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">X3 - X1 (mΩ)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.windingResistance.x3x1 || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          windingResistance: {
                            ...formData.windingResistance,
                            x3x1: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Operating Load & Voltage */}
          {activeSection === 7 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 7: การตรวจวัดแรงดันและกระแสโหลดจริง (Operating Load &amp; Voltage Measurement)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    วัดขณะจ่ายไฟเพื่อวิเคราะห์ % การใช้งานพิกัดหม้อแปลง และความสมดุลเฟส
                  </p>
                </div>
                <Zap className="w-5 h-5 text-emerald-600 hidden sm:block" />
              </div>

              {/* Calculated Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">โหลดรวมคำนวณได้</span>
                  <span className="text-xl font-bold font-mono text-[#006948]">
                    {calculatedLoadMetrics.loadKva} kVA
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">% โหลดเทียบพิกัด</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {calculatedLoadMetrics.loadPct}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">กระแสเฉลี่ย</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {calculatedLoadMetrics.avgI} A
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">% ความไม่สมดุลกระแส</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {calculatedLoadMetrics.unbalanceCurrent}%
                  </span>
                </div>
              </div>

              {/* Voltage & Current Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Secondary Voltages */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <span className="font-bold text-slate-800">แรงดันไฟฟ้าด้านแรงต่ำ (Secondary Voltages - V)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_AB (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vAb || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vAb: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_BC (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vBc || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vBc: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_CA (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vCa || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vCa: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_AN (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vAn || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vAn: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_BN (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vBn || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vBn: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">V_CN (V)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.vCn || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              vCn: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Currents */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <span className="font-bold text-slate-800">กระแสโหลดแต่ละเฟส (Load Currents - A)</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">เฟส A (A)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.iA || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              iA: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">เฟส B (A)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.iB || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              iB: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">เฟส C (A)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.iC || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              iC: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">นิวทรัล IN (A)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.loadMeasurement.iNeutral || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            loadMeasurement: {
                              ...formData.loadMeasurement,
                              iNeutral: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 8: Evaluation & Signatures */}
          {activeSection === 8 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                    ส่วนที่ 8: การสรุปผลการประเมินและการรับรองผล (Evaluation &amp; Signatures)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    สรุปผลการตรวจสอบทางวิศวกรรมไฟฟ้า และลงนามช่างผู้ตรวจสอบ/ผู้ควบคุมงาน
                  </p>
                </div>
                <ClipboardCheck className="w-5 h-5 text-emerald-600 hidden sm:block" />
              </div>

              {/* PEA Standard Evaluation Banner & Auto-Recommendation */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50/90 to-teal-50/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#006948] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-950 uppercase font-mono tracking-wider">
                        PEA 2568 STANDARD EVALUATION ENGINE
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold font-sans">
                        วิเคราะห์เปรียบเทียบค่าหน้างานอัตโนมัติ
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      ระบบประมวลผลเปรียบเทียบค่าที่กรอกหน้างาน (ค่าความต้านทานดิน, ค่าฉนวน R1/R10/PI, ค่า BDV น้ำมัน, ความไม่สมดุลขดลวด, % โหลด) เทียบกับเกณฑ์มาตรฐาน กฟภ. ปี 2568 ทันที
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('analysis')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>ดูตารางเปรียบเทียบ &amp; ตัวเลือกงาน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defectCount = formData.visualChecks?.filter((v) => v.status === 'defect').length || 0;
                      const warningCount = formData.visualChecks?.filter((v) => v.status === 'warning').length || 0;
                      const decision = analyzeTransformerAgainstStandards({
                        ratedKva: formData.ratedKva,
                        hvVoltageKv: formData.hvVoltageKv,
                        tempC: formData.insulationTest?.ambientTempC || 30,
                        hvGround1Min: formData.insulationTest?.hvGround1Min,
                        hvGround10Min: formData.insulationTest?.hvGround10Min,
                        polarizationIndex: calculatedPI,
                        lvGround1Min: formData.insulationTest?.lvGround1Min,
                        hvLv1Min: formData.insulationTest?.hvLv1Min,
                        avgBdvKv: bdvAverage,
                        surgeArresterGroundOhm: formData.groundTest?.surgeArresterGroundOhm,
                        lvNeutralGroundOhm: formData.groundTest?.lvNeutralGroundOhm,
                        loadPercent: calculatedLoadMetrics.loadPct,
                        currentUnbalancePercent: calculatedLoadMetrics.unbalanceCurrent,
                        visualChecksDefectCount: defectCount,
                        visualChecksWarningCount: warningCount,
                        tankDamaged: formData.tankDamaged,
                        ageYears: formData.mfgYear ? new Date().getFullYear() - parseInt(formData.mfgYear) : 5,
                      });

                      const newResult: InspectionStatus =
                        decision.overallClassification === 'หม้อแปลงดี'
                          ? 'pass'
                          : decision.overallClassification === 'หม้อแปลงชำรุดเล็กน้อย'
                          ? 'warning'
                          : decision.overallClassification === 'หม้อแปลงชำรุดหนัก'
                          ? 'corrective'
                          : 'segregate';

                      setFormData((prev) => ({
                        ...prev,
                        overallResult: newResult,
                        summaryNotes: decision.summaryExecutive,
                        actionItems: decision.actionOptions.map((a) => `${a.stepNumber}. ${a.title}: ${a.procedure[0] || ''}`).join(' | '),
                      }));

                      showToast(`ปรับผลการประเมินเป็น "${decision.overallClassification}" และเติมข้อเสนอแนะตามมาตรฐาน กฟภ. เรียบร้อย`, 'AUTO_EVAL_OK', 'success');
                    }}
                    className="px-3.5 py-1.5 bg-[#006948] hover:bg-[#005238] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>สรุปผลตามมาตรฐานอัตโนมัติ</span>
                  </button>
                </div>
              </div>

              {/* Status Radio Picker */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-800 text-xs">
                  ผลการประเมินสภาพหม้อแปลงโดยรวม (Overall Assessment Result) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      id: 'pass',
                      label: 'ผ่านเกณฑ์ปกติ (Normal)',
                      desc: 'หม้อแปลงสมบูรณ์ พร้อมจ่ายไฟ ปลอดภัยตามมาตรฐาน',
                      color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900',
                      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                    },
                    {
                      id: 'warning',
                      label: 'เฝ้าระวัง (Watchlist)',
                      desc: 'จ่ายไฟได้ แต่มีจุดต้องติดตาม (เช่น ซิลิก้าเจล, BDV เริ่มลด)',
                      color: 'border-amber-500 bg-amber-50/60 text-amber-900',
                      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
                    },
                    {
                      id: 'corrective',
                      label: 'ต้องซ่อมแซมเร่งด่วน',
                      desc: 'ต้องถ่าย/กรองน้ำมัน เปลี่ยนปะเก็น หรือแก้ไขกราวด์ดิน',
                      color: 'border-orange-500 bg-orange-50/60 text-orange-900',
                      icon: <AlertOctagon className="w-4 h-4 text-orange-600" />,
                    },
                    {
                      id: 'segregate',
                      label: 'ปลดคัดแยกส่งซ่อม (มป.11)',
                      desc: 'ขดลวดหรือฉนวนชำรุดร้ายแรง ปลดออกจากระบบเพื่อส่งซ่อมใหญ่',
                      color: 'border-rose-500 bg-rose-50/60 text-rose-900',
                      icon: <XCircle className="w-4 h-4 text-rose-600" />,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, overallResult: opt.id as InspectionStatus })}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        formData.overallResult === opt.id
                          ? `${opt.color} shadow-xs ring-2 ring-emerald-500/20`
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">สรุปผลการตรวจสอบ / ข้อคิดเห็น</label>
                  <textarea
                    rows={3}
                    value={formData.summaryNotes}
                    onChange={(e) => setFormData({ ...formData, summaryNotes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ข้อเสนอแนะและงานแก้ไข (Action Items)</label>
                  <textarea
                    rows={3}
                    value={formData.actionItems}
                    onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Signatures & Approvals */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ชื่อผู้ตรวจสอบ / ผู้ทดสอบ</label>
                  <input
                    type="text"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.inspectorPosition}
                    onChange={(e) => setFormData({ ...formData, inspectorPosition: e.target.value })}
                    placeholder="ตำแหน่ง"
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-600 mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ชื่อผู้รับรอง / ผู้ควบคุมงาน</label>
                  <input
                    type="text"
                    value={formData.approverName}
                    onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.approverPosition}
                    onChange={(e) => setFormData({ ...formData, approverPosition: e.target.value })}
                    placeholder="ตำแหน่ง เช่น หัวหน้าแผนกบำรุงรักษา"
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-slate-600 mt-1"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">เลขที่ใบสั่งงาน / SAP Work Order</label>
                  <input
                    type="text"
                    value={formData.workOrderNo || ''}
                    onChange={(e) => setFormData({ ...formData, workOrderNo: e.target.value })}
                    placeholder="เช่น WO-PM68-001"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('official_print')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>ดูแบบฟอร์มทางการ (Print Preview)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ส่งออก CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveForm()}
                    className="px-5 py-2 bg-[#006948] hover:bg-[#005238] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกผล มป.11-ป.68</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: PEA STANDARD COMPARISON & OPERATIONAL OPTIONS         */}
      {/* ============================================================== */}
      {activeSubTab === 'analysis' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                วิเคราะห์หม้อแปลง: <span className="font-mono text-[#006948] font-bold">{formData.transformerId}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">• {formData.ratedKva} kVA • เสา {formData.poleId || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('form')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>กลับไปแก้ไขฟอร์ม</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('official_print')}
                className="px-3.5 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์แบบฟอร์ม มป.11</span>
              </button>
            </div>
          </div>

          <InspectionAnalysisPanel
            formData={formData}
            onApplyRecommendation={(classification, summary, actions) => {
              const mappedStatus: InspectionStatus =
                classification === 'หม้อแปลงดี'
                  ? 'pass'
                  : classification === 'หม้อแปลงชำรุดเล็กน้อย'
                  ? 'warning'
                  : classification === 'หม้อแปลงชำรุดหนัก'
                  ? 'corrective'
                  : 'segregate';

              setFormData((prev) => ({
                ...prev,
                overallResult: mappedStatus,
                summaryNotes: summary,
                actionItems: actions,
              }));

              showToast(
                `นำผลวิเคราะห์ (${classification}) และแนวทางแก้ไขไปปรับสรุปผลเรียบร้อย`,
                'APPLY_RECOMMENDATION_OK',
                'success'
              );

              setActiveSubTab('form');
              setActiveSection(8);
            }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: OFFICIAL PEA FORM PRINT / EXPORT VIEW               */}
      {/* ============================================================== */}
      {activeSubTab === 'official_print' && (
        <div className="flex flex-col gap-4">
          {/* Action bar for printing */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-700">แบบฟอร์ม มป.11-ป.68 พร้อมพิมพ์</span>
              <span className="text-xs text-slate-400 font-mono">• A4 Layout Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์เอกสาร / บันทึก PDF (A4)</span>
              </button>
            </div>
          </div>

          {/* Official Document Layout Box */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-md max-w-[900px] mx-auto w-full font-serif text-slate-900 leading-normal print:shadow-none print:border-none print:p-0">
            {/* PEA Official Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg border border-slate-300 flex items-center justify-center p-1">
                  <img
                    src="/rmutl-logo.png"
                    alt="PEA / RMUTL"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900">
                    การไฟฟ้าส่วนภูมิภาค (PROVINCIAL ELECTRICITY AUTHORITY)
                  </h2>
                  <h3 className="text-sm font-bold text-slate-800">
                    แบบบันทึกการตรวจสอบและทดสอบหม้อแปลงระบบจำหน่าย (ข-2 มป.11-ป.68)
                  </h3>
                  <p className="text-[11px] font-sans text-slate-600">
                    สังกัด: {formData.substationArea} • ฟีดเดอร์: {formData.feeder}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-sans shrink-0">
                <div className="font-mono font-bold text-slate-900 border border-slate-300 px-2 py-0.5 rounded bg-slate-50">
                  {formData.docNumber}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">เลขที่: {formData.id}</div>
                <div className="text-[10px] text-slate-500">วันที่: {formData.inspectionDate}</div>
              </div>
            </div>

            {/* General Info Grid Table */}
            <div className="mt-4 border border-slate-400 rounded text-xs font-sans">
              <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300">
                1. ข้อมูลทั่วไปของหม้อแปลงไฟฟ้า
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-1.5 p-3 text-[11px]">
                <div><span className="font-semibold">รหัสหม้อแปลง:</span> {formData.transformerId}</div>
                <div><span className="font-semibold">หมายเลขเสา:</span> {formData.poleId}</div>
                <div><span className="font-semibold">พิกัดกำลัง:</span> {formData.ratedKva} kVA</div>
                <div><span className="font-semibold">แรงดัน:</span> {formData.hvVoltageKv} kV / {formData.lvVoltageV} V</div>
                <div><span className="font-semibold">ยี่ห้อ/ผู้ผลิต:</span> {formData.brand}</div>
                <div><span className="font-semibold">หมายเลขเครื่อง:</span> {formData.serialNo}</div>
                <div><span className="font-semibold">เวกเตอร์:</span> {formData.vectorGroup}</div>
                <div><span className="font-semibold">ตำแหน่ง Tap:</span> {formData.tapPosition}</div>
                <div className="col-span-2"><span className="font-semibold">สถานที่ติดตั้ง:</span> {formData.transformerName}</div>
                <div className="col-span-2">
                  <span className="font-semibold">วัตถุประสงค์การตรวจ:</span>{' '}
                  {formData.purpose === 'routine_pm' ? 'บำรุงรักษาเชิงป้องกันตามวาระ' : formData.purpose === 'pre_commission' ? 'ตรวจรับก่อนจ่ายไฟ' : formData.purpose === 'post_fault' ? 'ตรวจสอบหลังเกิดเหตุขัดข้อง' : 'ตรวจคัดแยกส่งซ่อม/ปลดจำหน่าย (มป.11)'}
                </div>
              </div>
            </div>

            {/* Visual Check Table */}
            <div className="mt-4 border border-slate-400 rounded text-xs font-sans overflow-x-auto">
              <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300">
                2. ผลการตรวจสอบสภาพภายนอกและอุปกรณ์ประกอบ (15 รายการ)
              </div>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 text-slate-700">
                    <th className="py-1.5 px-3 w-12 text-center">ลำดับ</th>
                    <th className="py-1.5 px-3">รายการตรวจสอบ</th>
                    <th className="py-1.5 px-3 w-28 text-center">ผลการตรวจ</th>
                    <th className="py-1.5 px-3">หมายเหตุ / ข้อสังเกต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.visualChecks.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-1 px-3 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-1 px-3 font-medium text-slate-800">{item.name}</td>
                      <td className="py-1 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'good'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'defect'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status === 'good'
                            ? 'ปกติ'
                            : item.status === 'warning'
                            ? 'เฝ้าระวัง'
                            : item.status === 'defect'
                            ? 'ชำรุด'
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-slate-600">{item.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Test Results Dual Tables */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
              {/* Ground & Oil Tests */}
              <div className="border border-slate-400 rounded">
                <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300">
                  3. ผลการทดสอบน้ำมันหม้อแปลง (BDV) &amp; กราวด์
                </div>
                <div className="p-3 text-[11px] flex flex-col gap-2">
                  <div>
                    <span className="font-semibold">ค่า BDV 6 ครั้ง (kV):</span>{' '}
                    <span className="font-mono">
                      {[formData.oilTest.shot1, formData.oilTest.shot2, formData.oilTest.shot3, formData.oilTest.shot4, formData.oilTest.shot5, formData.oilTest.shot6].join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">ค่าเฉลี่ย BDV:</span>{' '}
                    <strong className="font-mono text-emerald-800 text-xs font-bold">{bdvAverage} kV</strong>{' '}
                    {bdvAverage >= 30 ? '(ผ่านเกณฑ์ &ge; 30 kV)' : '(ต่ำกว่าเกณฑ์มาตรฐาน)'}
                  </div>
                  <div><span className="font-semibold">สีและสภาพน้ำมัน:</span> {formData.oilTest.oilColor || '-'} • {formData.oilTest.appearance || '-'}</div>
                  <div className="border-t border-slate-200 pt-1.5 mt-1">
                    <span className="font-semibold">ความต้านทานดินเสิร์จอาร์เรสเตอร์:</span>{' '}
                    <strong className="font-mono">{formData.groundTest.surgeArresterGroundOhm || '-'} Ω</strong> (&le; 5 Ω)
                  </div>
                  <div>
                    <span className="font-semibold">ความต้านทานดินสายนิวทรัล:</span>{' '}
                    <strong className="font-mono">{formData.groundTest.lvNeutralGroundOhm || '-'} Ω</strong>
                  </div>
                </div>
              </div>

              {/* Insulation & PI */}
              <div className="border border-slate-400 rounded">
                <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300">
                  4. ค่าความต้านทานฉนวน &amp; P.I.
                </div>
                <div className="p-3 text-[11px] flex flex-col gap-2">
                  <div><span className="font-semibold">แรงดันทดสอบ:</span> {formData.insulationTest.testVoltage}</div>
                  <div>
                    <span className="font-semibold">HV - Ground (1 นาที):</span>{' '}
                    <span className="font-mono">{formData.insulationTest.hvGround1Min || '-'} MΩ</span>
                  </div>
                  <div>
                    <span className="font-semibold">HV - Ground (10 นาที):</span>{' '}
                    <span className="font-mono">{formData.insulationTest.hvGround10Min || '-'} MΩ</span>
                  </div>
                  <div>
                    <span className="font-semibold">ค่าดัชนีโพลาไรเซชัน (P.I.):</span>{' '}
                    <strong className="font-mono text-emerald-800 font-bold">{calculatedPI > 0 ? calculatedPI : '-'}</strong>{' '}
                    {calculatedPI >= 1.5 ? '(ผ่านเกณฑ์)' : '(เฝ้าระวัง)'}
                  </div>
                  <div>
                    <span className="font-semibold">LV - Ground / HV - LV:</span>{' '}
                    <span className="font-mono">{formData.insulationTest.lvGround1Min || '-'} / {formData.insulationTest.hvLv1Min || '-'} MΩ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Load & Assessment */}
            <div className="mt-4 border border-slate-400 rounded text-xs font-sans">
              <div className="bg-slate-100 px-3 py-1.5 font-bold border-b border-slate-300">
                5. สรุปผลการประเมินสภาพหม้อแปลงและข้อเสนอแนะ
              </div>
              <div className="p-3 text-[11px] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">ผลการประเมินโดยรวม:</span>
                  <span
                    className={`px-3 py-1 rounded font-bold uppercase ${
                      formData.overallResult === 'pass'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : formData.overallResult === 'warning'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {formData.overallResult === 'pass'
                      ? 'ผ่านเกณฑ์มาตรฐาน กฟภ. (NORMAL / PASS)'
                      : formData.overallResult === 'warning'
                      ? 'เฝ้าระวัง (WATCHLIST)'
                      : formData.overallResult === 'corrective'
                      ? 'ต้องซ่อมแซมแก้ไข (CORRECTIVE ACTION)'
                      : 'ปลดคัดแยกส่งซ่อม (SEGREGATION / มป.11)'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">ข้อสรุปผล:</span> {formData.summaryNotes || '-'}
                </div>
                <div>
                  <span className="font-semibold">การดำเนินการที่แนะนำ:</span> {formData.actionItems || '-'}
                </div>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs font-sans">
              <div className="flex flex-col items-center">
                <div className="h-10"></div>
                <div className="border-b border-slate-400 w-48 mb-1"></div>
                <span className="font-bold">({formData.inspectorName || '..............................................'})</span>
                <span className="text-[10px] text-slate-600">{formData.inspectorPosition || 'ช่างเทคนิคผู้ตรวจสอบ'}</span>
                <span className="text-[10px] text-slate-500">วันที่ {formData.inspectionDate}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-10"></div>
                <div className="border-b border-slate-400 w-48 mb-1"></div>
                <span className="font-bold">({formData.approverName || '..............................................'})</span>
                <span className="text-[10px] text-slate-600">{formData.approverPosition || 'วิศวกรผู้ควบคุมงาน/ผู้รับรอง'}</span>
                <span className="text-[10px] text-slate-500">วันที่ {formData.approvedDate || formData.inspectionDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: INSPECTION HISTORY LIST                             */}
      {/* ============================================================== */}
      {activeSubTab === 'history' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006948]"></span>
                ประวัติการตรวจสอบและทดสอบหม้อแปลงทั้งหมด ({filteredHistory.length} ฉบับ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดเก็บผลการตรวจเช็คตามแบบฟอร์ม ข-2 มป.11-ป.68 ในระบบคลาวด์และเซิร์ฟเวอร์กลาง
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetInspections}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                title="รีเซ็ตใบบันทึกผลตรวจกลับเป็นค่าเริ่มต้น กฟส.บ้านโฮ่ง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตประวัติ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(createEmptyRecord());
                  setActiveSubTab('form');
                }}
                className="px-3.5 py-1.5 bg-[#006948] hover:bg-[#005238] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>สร้างบันทึกใหม่</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="ค้นหารหัสหม้อแปลง, ชื่อสถานที่, เสา หรือเลขที่บันทึก..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'pass', 'warning', 'segregate'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setHistoryFilterResult(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition-colors ${
                    historyFilterResult === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'ทั้งหมด'
                    : st === 'pass'
                    ? 'ผ่านเกณฑ์'
                    : st === 'warning'
                    ? 'เฝ้าระวัง'
                    : 'ส่งซ่อม/คัดแยก'}
                </button>
              ))}
            </div>
          </div>

          {/* History Records Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">เลขที่เอกสาร</th>
                  <th className="py-2.5 px-3">รหัสหม้อแปลง</th>
                  <th className="py-2.5 px-3">พิกัด / เสา</th>
                  <th className="py-2.5 px-3">วันที่ตรวจ</th>
                  <th className="py-2.5 px-3 text-center">ผลการตรวจ</th>
                  <th className="py-2.5 px-3 text-center">ค่า BDV</th>
                  <th className="py-2.5 px-3 text-center">ค่า P.I.</th>
                  <th className="py-2.5 px-3">ผู้ตรวจสอบ</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลผลการตรวจเช็คที่ตรงกับคำค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rec.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {rec.transformerId}
                        <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[150px]">
                          {rec.transformerName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {rec.ratedKva} kVA
                        <span className="block text-[10px] text-slate-500 font-mono">เสา {rec.poleId}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{rec.inspectionDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.overallResult === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.overallResult === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.overallResult === 'pass'
                            ? 'ผ่านเกณฑ์'
                            : rec.overallResult === 'warning'
                            ? 'เฝ้าระวัง'
                            : 'ส่งซ่อม/คัดแยก'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        {rec.oilTest?.averageKv || '-'} kV
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        {rec.insulationTest?.polarizationIndex || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{rec.inspectorName}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInspectionId(rec.id);
                              setFormData(JSON.parse(JSON.stringify(rec)));
                              setActiveSubTab('official_print');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                            title="เปิดดูและพิมพ์แบบฟอร์มทางการ"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInspectionId(rec.id);
                              setFormData(JSON.parse(JSON.stringify(rec)));
                              setActiveSubTab('form');
                            }}
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="แก้ไขข้อมูลฟอร์ม"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`ต้องการลบใบบันทึกผลตรวจ ${rec.id} หรือไม่?`)) {
                                deleteInspection(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
