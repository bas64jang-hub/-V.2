import React from 'react';
import { InspectionRecord } from '../types';
import {
  analyzeTransformerAgainstStandards,
  getStandardInsulationResistance,
  PEA_OIL_BDV_STANDARD,
  PEA_GROUNDING_STANDARDS,
  PEA_LOAD_STANDARDS,
} from '../lib/peaStandards';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InspectionAnalysisPanelProps {
  formData: InspectionRecord;
  onApplyRecommendation?: (classification: string, summary: string, actions: string) => void;
}

export const InspectionAnalysisPanel: React.FC<InspectionAnalysisPanelProps> = ({
  formData,
  onApplyRecommendation,
}) => {
  const defectCount = formData.visualChecks?.filter((v) => v.status === 'defect').length || 0;
  const warningCount = formData.visualChecks?.filter((v) => v.status === 'warning').length || 0;

  const decision = analyzeTransformerAgainstStandards({
    ratedKva: formData.ratedKva,
    hvVoltageKv: formData.hvVoltageKv,
    tempC: formData.insulationTest?.ambientTempC || 30,
    hvGround1Min: formData.insulationTest?.hvGround1Min,
    hvGround10Min: formData.insulationTest?.hvGround10Min,
    polarizationIndex: formData.insulationTest?.polarizationIndex,
    lvGround1Min: formData.insulationTest?.lvGround1Min,
    hvLv1Min: formData.insulationTest?.hvLv1Min,
    avgBdvKv: formData.oilTest?.averageKv,
    surgeArresterGroundOhm: formData.groundTest?.surgeArresterGroundOhm,
    lvNeutralGroundOhm: formData.groundTest?.lvNeutralGroundOhm,
    loadPercent: formData.loadMeasurement?.loadPercent,
    currentUnbalancePercent: formData.loadMeasurement?.currentUnbalancePercent,
    visualChecksDefectCount: defectCount,
    visualChecksWarningCount: warningCount,
    tankDamaged: formData.tankDamaged,
    ageYears: formData.mfgYear ? new Date().getFullYear() - parseInt(formData.mfgYear) : 5,
  });

  const badgeColor =
    decision.color === 'emerald'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : decision.color === 'amber'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : decision.color === 'rose'
      ? 'bg-rose-100 text-rose-900 border-rose-300'
      : 'bg-red-100 text-red-900 border-red-300';

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Banner & Diagnostic Verdict */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              PEA 2568 STANDARD EVALUATION ENGINE
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              ข้อ 2.1 – 4.5
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            ผลสรุปการวิเคราะห์เปรียบเทียบมาตรฐาน:
            <span className={`px-3 py-1 rounded-xl text-sm font-bold border ${badgeColor}`}>
              {decision.overallClassification}
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            สาเหตุหลัก: <strong className="text-slate-800">{decision.primaryCause}</strong>
          </p>
        </div>

        {onApplyRecommendation && (
          <button
            type="button"
            onClick={() =>
              onApplyRecommendation(
                decision.overallClassification === 'หม้อแปลงดี'
                  ? 'pass'
                  : decision.overallClassification === 'หม้อแปลงชำรุดเล็กน้อย'
                  ? 'warning'
                  : decision.overallClassification === 'หม้อแปลงชำรุดหนัก'
                  ? 'corrective'
                  : 'segregate',
                decision.summaryExecutive,
                decision.actionOptions.map((a) => a.title).join(' • ')
              )
            }
            className="px-3.5 py-2 bg-[#006948] hover:bg-[#005238] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>ปรับข้อสรุปตามการวิเคราะห์</span>
          </button>
        )}
      </div>

      {/* 2. Side-by-Side Comparison Table: Standard vs Field Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
            ตารางเปรียบเทียบ: ค่ามาตรฐาน กฟภ. พ.ศ. 2568 กับ ค่าตรวจวัดหน้างานจริง
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            {decision.diagnostics.length} รายการตรวจวัด
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-4">รายการทดสอบทางไฟฟ้า</th>
                <th className="py-2.5 px-4">ข้อกำหนดมาตรฐาน กฟภ. (2568)</th>
                <th className="py-2.5 px-4">ค่าที่ผู้ปฏิบัติงานกรอก</th>
                <th className="py-2.5 px-4 text-center">สถานะเปรียบเทียบ</th>
                <th className="py-2.5 px-4">ข้อเสนอแนะในการปฏิบัติงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decision.diagnostics.map((diag) => (
                <tr key={diag.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{diag.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      อ้างอิง: {diag.referenceClause}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {diag.standardText}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {diag.fieldValueText}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        diag.status === 'pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : diag.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {diag.status === 'pass' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ผ่านเกณฑ์</span>
                        </>
                      ) : diag.status === 'warning' ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>เฝ้าระวัง</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>ไม่ผ่าน</span>
                        </>
                      )}
                    </span>
                    {diag.deviationText && (
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                        {diag.deviationText}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                    {diag.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Operational Decision & Work Options (ตัวเลือกการทำงาน) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#006948]" />
              แนวทางและตัวเลือกการปฏิบัติงาน (Operational Work Options)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              สรุปขั้นตอนการปฏิบัติงานตามระเบียบ กฟภ. 2568 สำหรับผู้ควบคุมงานและช่างหน้างาน
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decision.actionOptions.map((opt, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                opt.recommended
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">
                      {opt.stepNumber}
                    </span>
                    {opt.title}
                  </span>
                  {opt.recommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      แนวทางแนะนำ
                    </span>
                  )}
                </div>

                <ul className="mt-2.5 flex flex-col gap-1.5 text-xs text-slate-600">
                  {opt.procedure.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-1.5 leading-snug">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {opt.sapCodeOrRef}
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {opt.timeframe}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
