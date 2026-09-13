import React, { useState } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { PEA_FUSE_MATRIX, STANDARD_FUSE_SIZES } from '../data/defaultData';
import {
  Calculator,
  Zap,
  CheckCircle2,
  Printer,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const FuseCalculatorView: React.FC = () => {
  const { transformers, saveTransformer, showToast } = useTransformers();

  const [kva, setKva] = useState<number>(500);
  const [customKva, setCustomKva] = useState<string>('');
  const [voltage, setVoltage] = useState<number>(22);
  const [customVoltage, setCustomVoltage] = useState<string>('');
  const [secVoltage, setSecVoltage] = useState<400 | 380>(400);
  const [pf, setPf] = useState<number>(0.85);
  const [multiplier, setMultiplier] = useState<number>(2.0);
  const [fuseType, setFuseType] = useState<'T' | 'K'>('T');

  const presetKvas = [50, 100, 160, 250, 315, 400, 500, 1000, 1250, 1600, 2000, 2500];

  const primaryVoltagePresets = [
    { value: 22, label: '22 kV', desc: 'กฟภ. ทั่วไป (มาตรฐานหลัก)' },
    { value: 33, label: '33 kV', desc: 'กฟภ. ภาคใต้ / นิคมฯ' },
    { value: 11, label: '11 kV', desc: 'กฟน. นครหลวง / โรงงาน' },
    { value: 24, label: '24 kV', desc: 'พิกัด Class 24kV' },
    { value: 12, label: '12 kV', desc: 'ระบบจำหน่าย IEC' },
    { value: 13.8, label: '13.8 kV', desc: 'ระบบโรงงานอุตสาหกรรม' },
    { value: 14.4, label: '14.4 kV', desc: 'ระบบ Single Phase Line' },
    { value: 20, label: '20 kV', desc: 'มาตรฐานยุโรป / โรงไฟฟ้า' },
    { value: 34.5, label: '34.5 kV', desc: 'โซลาร์ฟาร์ม / พลังงานลม' },
    { value: 36, label: '36 kV', desc: 'พิกัด Class 36kV' },
    { value: 6.6, label: '6.6 kV', desc: 'โรงงานอุตสาหกรรม/เหมือง' },
    { value: 3.3, label: '3.3 kV', desc: 'เครื่องจักรอุตสาหกรรมหนัก' },
    { value: 69, label: '69 kV', desc: 'สถานีไฟฟ้าย่อย Substation' },
    { value: 115, label: '115 kV', desc: 'สายส่งกึ่งสถานีย่อย กฟภ.' },
  ];

  // Calculations
  const validVoltage = voltage > 0 ? voltage : 22;
  const validSecVoltage = secVoltage;

  const fla = kva / (Math.sqrt(3) * validVoltage);
  const targetCurrent = fla * multiplier;

  // Closest standard fuse rating
  let recommendedSize = STANDARD_FUSE_SIZES[STANDARD_FUSE_SIZES.length - 1];
  for (const size of STANDARD_FUSE_SIZES) {
    if (size >= targetCurrent) {
      recommendedSize = size;
      break;
    }
  }

  const fuseTag = `${recommendedSize}${fuseType}`;

  // Secondary FLA at secVoltage
  const secFla = (kva * 1000) / (Math.sqrt(3) * validSecVoltage);
  const mccbSize = Math.ceil(secFla / 50) * 50;

  const inrushLow = (fla * 2.0).toFixed(2);
  const inrushHigh = (fla * 2.5).toFixed(2);

  const getArresterSpec = (v: number) => {
    if (v <= 3.3) return '4.5 kV, 5 kA';
    if (v <= 6.6) return '9 kV, 10 kA (Station/Distrib)';
    if (v <= 12) return '12 kV, 10 kA (Metal Oxide)';
    if (v <= 24) return '21 kV, 10 kA (กฟภ. มาตรฐาน)';
    if (v <= 36) return '30 kV, 10 kA (Heavy Duty)';
    if (v <= 69) return '60 kV, 10 kA (Substation)';
    return `${Math.round(v * 0.9)} kV, 10 kA`;
  };

  const getCutoutSpec = (v: number) => {
    if (v <= 15) return '15 kV Class, 100A/200A (BIL 110 kV)';
    if (v <= 27) return '24 kV Class, 100A/200A (BIL 125 kV - กฟภ.)';
    if (v <= 38) return '36 kV Class, 100A/200A (BIL 170 kV - กฟภ. ใต้)';
    return `High-Voltage MV Switchgear (${v} kV Class)`;
  };

  const handleSelectPresetKva = (val: number) => {
    setKva(val);
    setCustomKva('');
  };

  const handleCustomKvaChange = (val: string) => {
    setCustomKva(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setKva(parsed);
    }
  };

  const handleSelectVoltage = (val: number) => {
    setVoltage(val);
    setCustomVoltage('');
  };

  const handleCustomVoltageChange = (val: string) => {
    setCustomVoltage(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setVoltage(parsed);
    }
  };

  const handleResetDefaults = () => {
    setKva(500);
    setCustomKva('');
    setVoltage(22);
    setCustomVoltage('');
    setSecVoltage(400);
    setPf(0.85);
    setMultiplier(2.0);
    setFuseType('T');
    showToast('รีเซ็ตค่าเครื่องมือคำนวณเป็นค่ามาตรฐาน กฟภ. (22 kV, 500 kVA, 400/230V) แล้ว', 'RESET_OK', 'info');
  };

  const handleSaveToTransformer = () => {
    // Find matching transformer or update first matching
    const match = transformers.find((t) => t.kva === kva) || transformers[0];
    if (match) {
      saveTransformer({
        id: match.id,
        kva: kva,
        fuse: `${fuseTag} Type ${fuseType}`,
        mccb: `${mccbSize}A 3P MCCB`,
      });
      showToast(`บันทึกขนาดฟิวส์ ${fuseTag} ลงในหม้อแปลง ${match.id} (${match.name}) สำเร็จแล้ว!`, 'FUSE_APPLIED', 'success');
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span className="text-[#006948]">โปรแกรมคำนวณขนาดฟิวส์ป้องกันหม้อแปลง (กฟภ.)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>โปรแกรมคำนวณขนาดฟิวส์ป้องกันหม้อแปลงไฟฟ้า (กฟภ.)</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006948] border border-emerald-200">
              PEA &amp; IEEE C37.42
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            PEA Transformer Fuse Link Sizing Calculator สำหรับพิกัด 22 kV และ 33 kV พร้อมตารางเทียบมาตรฐานทางการ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐาน</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#006948]" />
              <h2 className="text-base font-bold text-slate-900">
                ข้อมูลพารามิเตอร์หม้อแปลงไฟฟ้า
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">กรอกเพื่อคำนวณอัตโนมัติ</span>
          </div>

          {/* Parameter 1: kVA Presets & Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800">พิกัดหม้อแปลงไฟฟ้า (kVA)</label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948] border border-emerald-200">
                {kva.toLocaleString()} kVA
              </span>
            </div>

            {/* Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {presetKvas.map((val) => {
                const isSelected = !customKva && kva === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectPresetKva(val)}
                    className={`py-1.5 px-2 text-xs font-mono font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative mt-1">
              <input
                type="number"
                min="10"
                max="10000"
                value={customKva}
                onChange={(e) => handleCustomKvaChange(e.target.value)}
                placeholder="หรือระบุขนาดพิกัด kVA เองตามต้องการ..."
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#006948] focus:border-[#006948] pl-3 pr-14 py-2 bg-slate-50 text-slate-800 font-mono"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">kVA</span>
            </div>
          </div>

          {/* Parameter 2: Primary High Voltage Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>แรงดันไฟฟ้าฝั่งแรงสูง (Primary Voltage)</span>
              </label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948] border border-emerald-200">
                {voltage} kV
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {primaryVoltagePresets.map((p) => {
                const isSelected = !customVoltage && voltage === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSelectVoltage(p.value)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                    title={p.desc}
                  >
                    <span className="font-mono font-bold text-xs">{p.label}</span>
                    <span className={`text-[9px] truncate max-w-full font-normal ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {p.desc.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Primary Voltage Input */}
            <div className="relative mt-1">
              <input
                type="number"
                step="0.1"
                min="0.4"
                max="500"
                value={customVoltage}
                onChange={(e) => handleCustomVoltageChange(e.target.value)}
                placeholder="หรือระบุค่าแรงดันแรงสูง (kV) อื่นๆ เช่น 6.9, 13.8, 14.4, 20, 34.5, 115..."
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#006948] focus:border-[#006948] pl-3 pr-14 py-2 bg-slate-50 text-slate-800 font-mono"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">kV</span>
            </div>
          </div>

          {/* Parameter 3: Secondary Low Voltage Selection (Only 2 choices: 400/230 V & 380/220 V) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800">แรงดันไฟฟ้าฝั่งแรงต่ำ (Secondary Voltage)</label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#006948] border border-emerald-200 text-xs">
                {secVoltage === 400 ? '400 / 230 V' : '380 / 220 V'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSecVoltage(400)}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  secVoltage === 400
                    ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${secVoltage === 400 ? 'bg-white' : 'bg-[#006948]'}`}></span>
                <span className="font-mono font-bold text-xs sm:text-sm">400 / 230 V</span>
                <span className={`text-[10px] hidden sm:inline ${secVoltage === 400 ? 'text-emerald-100' : 'text-slate-400'}`}>
                  (มาตรฐาน กฟภ.)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSecVoltage(380)}
                className={`py-2.5 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  secVoltage === 380
                    ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${secVoltage === 380 ? 'bg-white' : 'bg-[#006948]'}`}></span>
                <span className="font-mono font-bold text-xs sm:text-sm">380 / 220 V</span>
                <span className={`text-[10px] hidden sm:inline ${secVoltage === 380 ? 'text-emerald-100' : 'text-slate-400'}`}>
                  (ระบบดั้งเดิม)
                </span>
              </button>
            </div>
          </div>

          {/* Parameter 4: Power Factor Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800">ค่าเพาเวอร์แฟกเตอร์ (Power Factor - PF)</label>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {pf.toFixed(2)} Lagging
              </span>
            </div>
            <input
              type="range"
              min="0.70"
              max="1.00"
              step="0.01"
              value={pf}
              onChange={(e) => setPf(parseFloat(e.target.value))}
              className="w-full accent-[#006948] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.70</span>
              <span className="text-[#006948] font-bold">0.85 (ค่ามาตรฐาน กฟภ.)</span>
              <span>1.00</span>
            </div>
          </div>

          {/* Parameter 5 & 6: Inrush Multiplier & Fuse Link Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">ตัวคูณกระแสกระชาก (Safety Factor)</label>
              <div className="grid grid-cols-3 gap-2">
                {[1.5, 2.0, 2.5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMultiplier(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      multiplier === m
                        ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m === 2.0 ? '2.0x (กฟภ.)' : `${m}x`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">เกณฑ์ กฟภ. แนะนำ 2.0x - 2.5x ป้องกัน Inrush ทริป</p>
            </div>

            {/* Fuse Link Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">ชนิดฟิวส์ลิงค์ (Fuse Link Type)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFuseType('K')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    fuseType === 'K'
                      ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Type K (ขาดเร็ว - Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setFuseType('T')}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    fuseType === 'T'
                      ? 'bg-[#006948] text-white border-[#006948] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Type T (ขาดช้า - Slow)
                </button>
              </div>
              <p className="text-[10px] text-slate-500">กฟภ. นิยมใช้ Type T ทนกระแสกระชากได้เสถียรกว่า</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Summary Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Recommended Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#006948]">
                  ขนาดฟิวส์แรงสูงที่แนะนำ (Recommended Fuse)
                </span>
                <h3 className="text-sm font-semibold text-slate-700 mt-0.5">
                  High Voltage Cutout Fuse Link
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#006948] border border-emerald-200 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ตรงตามเกณฑ์ กฟภ.
              </span>
            </div>

            {/* Big Fuse Size Indicator */}
            <div className="my-2 flex items-baseline gap-3">
              <span className="text-5xl font-mono font-extrabold text-[#006948] tracking-tight">
                {fuseTag}
              </span>
              <div className="text-xs text-slate-500 leading-tight">
                <span className="block font-bold text-slate-800 text-sm">แอมแปร์ (Ampere Link)</span>
                <span>Type {fuseType} ({fuseType === 'T' ? 'ขาดช้า - Slow Acting' : 'ขาดเร็ว - Fast Acting'})</span>
              </div>
            </div>

            {/* Telemetry Matrix */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                <span className="text-slate-500">กระแสโหลดเต็มพิกัด (FLA {voltage} kV):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{fla.toFixed(2)} A</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                <span className="text-slate-500">กระแสประเมินช่วง Inrush (2.0-2.5x):</span>
                <span className="font-mono font-bold text-slate-800">{inrushLow} A - {inrushHigh} A</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
                <span className="text-slate-500">เมนสวิตช์ / MCCB แรงต่ำ ({secVoltage} V):</span>
                <span className="font-mono font-bold text-[#006948]">{mccbSize} A (MCCB)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">ขนาดกับดักฟ้าผ่า (Surge Arrester):</span>
                <span className="font-mono font-bold text-slate-800">
                  {getArresterSpec(validVoltage)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveToTransformer}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006948] text-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกลงข้อมูลหม้อแปลง</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์รายงานสเปก (PDF)</span>
              </button>
            </div>
          </div>

          {/* Cutout Hardware Spec Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">สเปกอุปกรณ์ Drop-out Cutout / สวิตช์เกียร์</span>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                {getCutoutSpec(validVoltage)} พิกัดกระแสตัดวงจรไม่น้อยกว่า 12.5 kA ตามมาตรฐาน กฟภ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PEA Sizing Selection Matrix Table (Full-width) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#006948]" />
              <span>ตารางมาตรฐานขนาดฟิวส์ กฟภ. ฉบับทางการ (PEA Fuse Selection Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ตารางเทียบพิกัดหม้อแปลง 3 เฟส กับขนาดฟิวส์ลิงค์มาตรฐาน กฟภ. (แถบสีเขียวคือพิกัด {kva} kVA ที่กำลังคำนวณ)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#006948]">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-400 inline-block"></span>
            <span>พิกัดปัจจุบัน: {kva} kVA</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">ขนาดพิกัด (kVA)</th>
                <th className="py-3 px-4 text-right">กระแส FLA 22kV</th>
                <th className="py-3 px-4 text-right">ฟิวส์ 22kV (กฟภ.)</th>
                <th className="py-3 px-4 text-right">กระแส FLA 33kV</th>
                <th className="py-3 px-4 text-right">ฟิวส์ 33kV (กฟภ.)</th>
                <th className="py-3 px-4 text-right">กระแสแรงต่ำ 400V</th>
                <th className="py-3 px-4 text-center">เมน MCCB แรงต่ำ</th>
                <th className="py-3 px-4">หมายเหตุ กฟภ.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {PEA_FUSE_MATRIX.map((row) => {
                const isMatch = row.kva === kva;
                return (
                  <tr
                    key={row.kva}
                    onClick={() => handleSelectPresetKva(row.kva)}
                    className={`cursor-pointer transition-colors ${
                      isMatch
                        ? 'bg-emerald-50/80 font-bold text-emerald-950 border-l-4 border-l-[#006948]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans font-bold flex items-center gap-1.5">
                      {isMatch && <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>}
                      <span>{row.kva.toLocaleString()} kVA</span>
                    </td>
                    <td className="py-2.5 px-4 text-right">{row.fla22.toFixed(2)} A</td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#006948]">{row.fuse22}</td>
                    <td className="py-2.5 px-4 text-right">{row.fla33.toFixed(2)} A</td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#006948]">{row.fuse33}</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{row.sec400.toFixed(1)} A</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">{row.mccb}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 text-[11px]">{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Guidelines Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#006948]" />
          <span>คำแนะนำทางเทคนิควิศวกรรมตามเกณฑ์การไฟฟ้าส่วนภูมิภาค (PEA Standards)</span>
        </h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed font-sans">
          <li>
            <strong>กระแสกระชากขณะสับไฟเข้าหม้อแปลง (Transformer Inrush Current):</strong> ตามเกณฑ์ กฟภ. และ IEEE C37.42 กำหนดให้คิดกระแสกระชากที่ระดับประมาณ 10 - 12 เท่าของ FLA เป็นระยะเวลา 0.1 วินาที เพื่อไม่ให้ฟิวส์ขาดผิดจังหวะ
          </li>
          <li>
            <strong>การเลือกชนิด Fuse Link:</strong> Type T (Slow) เป็นที่นิยมสูงสุดในระบบจำหน่าย กฟภ. เนื่องจากทนกระแสกระชากได้ดีโดยไม่ขาดบ่อย ส่วน Type K (Fast) เหมาะกับการป้องกันขดลวดแบบเร่งด่วนในพื้นที่ที่เกิดปัญหาบ่อย
          </li>
          <li>
            <strong>การประสานการทำงาน (Coordination):</strong> ขนาดฟิวส์แรงสูงต้องไม่ตัดวงจรก่อนเมนเบรกเกอร์ฝั่งแรงต่ำ (MCCB) ทำงานเมื่อเกิด Fault ฝั่งแรงต่ำ เพื่อป้องกันไฟฟ้าดับบริเวณกว้าง
          </li>
        </ul>
      </div>
    </div>
  );
};
