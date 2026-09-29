/**
 * หลักเกณฑ์และวิธีปฏิบัติเกี่ยวกับหม้อแปลงระบบจำหน่ายของการไฟฟ้าส่วนภูมิภาค พ.ศ. 2568
 * PEA Distribution Transformer Standards and Evaluation Logic (2568 / 2025)
 */

// 1. ตารางพิกัดค่าความต้านทานของฉนวนเมื่อเทียบกับอุณหภูมิ (เมกะโอห์ม - MΩ)
// อ้างอิง: ข้อ 2.1.2 หน้า 19
export interface InsulationStandardRow {
  voltageRange: string;
  minVoltsKv: number;
  maxVoltsKv: number;
  testCircuits: string;
  tempValues: { [tempC: number]: number };
}

export const PEA_INSULATION_STANDARDS: InsulationStandardRow[] = [
  {
    voltageRange: '22 – 33 kV',
    minVoltsKv: 22,
    maxVoltsKv: 33,
    testCircuits: 'HV – LV, HV – G',
    tempValues: {
      20: 1000,
      30: 500,
      40: 250,
      50: 125,
      60: 65,
    },
  },
  {
    voltageRange: '6.6 – 19 kV',
    minVoltsKv: 6.6,
    maxVoltsKv: 19,
    testCircuits: 'HV – LV, HV – G',
    tempValues: {
      20: 800,
      30: 400,
      40: 200,
      50: 100,
      60: 50,
    },
  },
  {
    voltageRange: 'ต่ำกว่า 6.6 kV',
    minVoltsKv: 0,
    maxVoltsKv: 6.59,
    testCircuits: 'LV – G',
    tempValues: {
      20: 400,
      30: 200,
      40: 100,
      50: 50,
      60: 25,
    },
  },
];

/**
 * คำนวณหาค่ามาตรฐานความต้านทานฉนวนขั้นต่ำที่อุณหภูมิใดๆ
 * อ้างอิงตารางข้อ 2.1.2 หน้า 19
 */
export function getStandardInsulationResistance(
  voltageKv: number,
  circuitType: 'HV-LV' | 'HV-G' | 'LV-G',
  tempC: number = 30
): number {
  const roundedTemp = [20, 30, 40, 50, 60].reduce((prev, curr) =>
    Math.abs(curr - tempC) < Math.abs(prev - tempC) ? curr : prev
  );

  if (circuitType === 'LV-G') {
    const lvRow = PEA_INSULATION_STANDARDS[2];
    return lvRow.tempValues[roundedTemp] || 200;
  }

  if (voltageKv >= 22) {
    const hvRow = PEA_INSULATION_STANDARDS[0];
    return hvRow.tempValues[roundedTemp] || 500;
  } else if (voltageKv >= 6.6) {
    const midRow = PEA_INSULATION_STANDARDS[1];
    return midRow.tempValues[roundedTemp] || 400;
  } else {
    const lvRow = PEA_INSULATION_STANDARDS[2];
    return lvRow.tempValues[roundedTemp] || 200;
  }
}

// 2. ค่าความคงทนทางไฟฟ้าของฉนวนน้ำมัน (Oil Dielectric Breakdown Voltage)
// อ้างอิง: ข้อ 2.1.3 หน้า 20 และหน้า 90
export const PEA_OIL_BDV_STANDARD = {
  minBreakdownKv: 30.0, // ไม่ต่ำกว่า 30 kV / 2.5 มม. ตามมาตรฐาน IEC 60156
  gapMm: 2.5,
  reference: 'ข้อ 2.1.3 หน้า 20 และ ภาคผนวก ข-2 หน้า 90',
};

// 3. ตารางค่าอัตราส่วนแรงดันหม้อแปลง (Voltage Ratio Table) คลาดเคลื่อนไม่เกิน ±0.5%
// อ้างอิง: ข้อ 6.2.2 หน้า 45 และตารางหน้า 91 (ภาคผนวก ข-2)
export interface VoltageRatioTapStandard {
  tap: number;
  tapPercent: string;
  minRatio: number;
  calRatio: number;
  maxRatio: number;
}

export const PEA_RATIO_STANDARDS_3PH_22KV_400V: VoltageRatioTapStandard[] = [
  { tap: 1, tapPercent: '+5%', minRatio: 99.53, calRatio: 100.03, maxRatio: 100.53 },
  { tap: 2, tapPercent: '+2.5%', minRatio: 97.16, calRatio: 97.64, maxRatio: 98.13 },
  { tap: 3, tapPercent: '0%', minRatio: 94.79, calRatio: 95.26, maxRatio: 95.74 },
  { tap: 4, tapPercent: '-2.5%', minRatio: 92.42, calRatio: 92.88, maxRatio: 93.35 },
  { tap: 5, tapPercent: '-5%', minRatio: 90.05, calRatio: 90.5, maxRatio: 90.95 },
];

export const PEA_RATIO_STANDARDS_3PH_33KV_400V: VoltageRatioTapStandard[] = [
  { tap: 1, tapPercent: '+5%', minRatio: 149.29, calRatio: 150.04, maxRatio: 150.79 },
  { tap: 2, tapPercent: '+2.5%', minRatio: 145.73, calRatio: 146.47, maxRatio: 147.2 },
  { tap: 3, tapPercent: '0%', minRatio: 142.18, calRatio: 142.89, maxRatio: 143.61 },
  { tap: 4, tapPercent: '-2.5%', minRatio: 138.63, calRatio: 139.32, maxRatio: 140.02 },
  { tap: 5, tapPercent: '-5%', minRatio: 135.07, calRatio: 135.75, maxRatio: 136.43 },
];

export const PEA_RATIO_STANDARDS_1PH_22KV_460V: VoltageRatioTapStandard[] = [
  { tap: 1, tapPercent: '+5%', minRatio: 99.93, calRatio: 100.43, maxRatio: 100.94 },
  { tap: 2, tapPercent: '+2.5%', minRatio: 97.55, calRatio: 98.04, maxRatio: 98.55 },
  { tap: 3, tapPercent: '0%', minRatio: 95.17, calRatio: 95.65, maxRatio: 96.13 },
  { tap: 4, tapPercent: '-2.5%', minRatio: 92.79, calRatio: 93.26, maxRatio: 93.73 },
  { tap: 5, tapPercent: '-5%', minRatio: 90.42, calRatio: 90.87, maxRatio: 91.32 },
];

// 4. การต่อลงดินและค่าความต้านทานดิน (Ground Resistance)
// อ้างอิง: ข้อ 2.4.3 หน้า 23 และ ภาคผนวก ก-4, ก-5
export const PEA_GROUNDING_STANDARDS = {
  singlePointMaxOhm: 5.0, // ค่าความต้านทานดินแต่ละจุดไม่เกิน 5 โอห์ม
  difficultAreaMaxOhm: 25.0, // พื้นที่ยากแก่การต่อลงดิน ยอมให้ไม่เกิน 25 โอห์ม
  neutralTotalMaxOhm: 2.0, // ความต้านทานดินรวมสายนิวทรัลแรงต่ำต้องไม่เกิน 2 โอห์ม
  reference: 'ข้อ 2.4.3 หน้า 23 และ ภาคผนวก ก-4, ก-5',
};

// 5. การตรวจสอบสภาพโหลดและกระแสไม่สมดุล (Load & Balance)
// อ้างอิง: ข้อ 4.5.6 และ ข้อ 4.5.7 หน้า 34-35
export const PEA_LOAD_STANDARDS = {
  maxLoadPercent: 80.0, // หากเกิน 80% ให้พิจารณาเพิ่มขนาดหรือเสริมหม้อแปลง
  minLoadPercent: 30.0, // หากต่ำกว่า 30% ให้พิจารณาสับเปลี่ยนลดขนาดหม้อแปลง
  maxCurrentUnbalancePercent: 20.0, // ความไม่สมดุลของกระแสเฟสต้องไม่เกิน 20%
  minSecondaryVoltageV: 200.0, // แรงดันปลายสายแรงต่ำช่วงโหลดสูงสุดไม่ต่ำกว่า 200 โวลต์
  reference: 'ข้อ 4.5.6 และ ข้อ 4.5.7 หน้า 34-35',
};

// 6. ความไม่สมดุลของกระแสลัดวงจรและเปิดวงจร (Short-circuit & Open-circuit Tests)
// อ้างอิง: ภาคผนวก ข-2 หน้า 90-91
export const PEA_CIRCUIT_TEST_STANDARDS = {
  maxCurrentDifferencePercent: 20.0, // ผลต่างของกระแสระหว่างเฟสต้องไม่เกิน 20%
  reference: 'ภาคผนวก ข-2 ข้อ 4 และ ข้อ 5 หน้า 90-91',
};

// 7. พิกัดฟิวส์แรงสูง 3 เฟส 22 kV และ 33 kV
// อ้างอิง: ภาคผนวก ก-2 หน้า 56
export interface PeaHighVoltageFuseRow {
  kva: number;
  fullLoad22Kv: number;
  fuse22Kv: string;
  fullLoad33Kv: number;
  fuse33Kv: string;
}

export const PEA_FUSE_RATINGS_TABLE: PeaHighVoltageFuseRow[] = [
  { kva: 30, fullLoad22Kv: 0.79, fuse22Kv: '2A', fullLoad33Kv: 0.52, fuse33Kv: '1A' },
  { kva: 50, fullLoad22Kv: 1.31, fuse22Kv: '3A', fullLoad33Kv: 0.87, fuse33Kv: '2A' },
  { kva: 100, fullLoad22Kv: 2.62, fuse22Kv: '5-6A', fullLoad33Kv: 1.75, fuse33Kv: '3A' },
  { kva: 160, fullLoad22Kv: 4.2, fuse22Kv: '8A', fullLoad33Kv: 2.8, fuse33Kv: '5-6A' },
  { kva: 250, fullLoad22Kv: 6.56, fuse22Kv: '15A', fullLoad33Kv: 4.37, fuse33Kv: '10A' },
  { kva: 315, fullLoad22Kv: 8.27, fuse22Kv: '15A', fullLoad33Kv: 5.51, fuse33Kv: '10A' },
  { kva: 500, fullLoad22Kv: 13.12, fuse22Kv: '20A', fullLoad33Kv: 8.75, fuse33Kv: '15A' },
  { kva: 1000, fullLoad22Kv: 26.24, fuse22Kv: '40A', fullLoad33Kv: 17.5, fuse33Kv: '25A' },
  { kva: 2000, fullLoad22Kv: 52.49, fuse22Kv: '65A', fullLoad33Kv: 34.99, fuse33Kv: '50A' },
];

/**
 * ผลการวิเคราะห์และตัวเลือกการปฏิบัติงาน
 */
export interface DiagnosticItem {
  id: string;
  name: string;
  category: 'insulation' | 'oil' | 'ground' | 'load' | 'physical' | 'ratio';
  standardText: string;
  fieldValueText: string;
  status: 'pass' | 'warning' | 'fail';
  deviationText?: string;
  referenceClause: string;
  findingSummary: string;
  recommendation: string;
}

export interface OperationalDecision {
  overallClassification: 'หม้อแปลงดี' | 'หม้อแปลงชำรุดเล็กน้อย' | 'หม้อแปลงชำรุดหนัก' | 'หม้อแปลงชำรุดหนักเห็นควรจำหน่าย';
  color: 'emerald' | 'amber' | 'rose' | 'red';
  confidenceScore: number;
  primaryCause: string;
  summaryExecutive: string;
  actionOptions: {
    title: string;
    stepNumber: number;
    recommended: boolean;
    procedure: string[];
    sapCodeOrRef: string;
    responsibleRole: string;
    timeframe: string;
  }[];
  diagnostics: DiagnosticItem[];
}

/**
 * ฟังก์ชันหลักในการนำค่าที่ผู้ปฏิบัติงานกรอก มาวิเคราะห์เปรียบเทียบกับมาตรฐาน กฟภ. 2568
 */
export function analyzeTransformerAgainstStandards(data: {
  ratedKva: number;
  hvVoltageKv: number;
  tempC: number;
  hvGround1Min?: number;
  hvGround10Min?: number;
  polarizationIndex?: number;
  lvGround1Min?: number;
  hvLv1Min?: number;
  avgBdvKv?: number;
  surgeArresterGroundOhm?: number;
  lvNeutralGroundOhm?: number;
  loadKva?: number;
  loadPercent?: number;
  iA?: number;
  iB?: number;
  iC?: number;
  currentUnbalancePercent?: number;
  secondaryVoltageV?: number;
  visualChecksDefectCount?: number;
  visualChecksWarningCount?: number;
  tankDamaged?: boolean;
  ageYears?: number;
}): OperationalDecision {
  const diagnostics: DiagnosticItem[] = [];

  const temp = data.tempC || 30;
  const hvKv = data.hvVoltageKv || 22;

  // 0. Visual Checks
  if ((data.visualChecksDefectCount || 0) > 0 || (data.visualChecksWarningCount || 0) > 0 || data.tankDamaged) {
    const dCount = data.visualChecksDefectCount || 0;
    const wCount = data.visualChecksWarningCount || 0;
    const isTank = Boolean(data.tankDamaged);
    diagnostics.push({
      id: 'diag-visual',
      name: 'การตรวจสภาพภายนอกและโครงสร้างกายภาพ (15 ข้อ)',
      category: 'visual',
      standardText: 'สมบูรณ์ครบ 15 ข้อ ปราศจากจุดชำรุด',
      fieldValueText: isTank ? 'ตัวถังชำรุด/บวม' : dCount > 0 ? `พบจุดชำรุด ${dCount} ข้อ` : `เฝ้าระวัง ${wCount} ข้อ`,
      status: isTank || dCount > 0 ? 'fail' : 'warning',
      deviationText: isTank ? 'ตัวถังชำรุดร้ายแรง' : dCount > 0 ? `ชำรุด ${dCount} รายการ` : `เฝ้าระวัง ${wCount} รายการ`,
      referenceClause: 'แบบฟอร์ม มป.11 ข้อ 1-15',
      findingSummary: isTank ? 'ตัวถังหม้อแปลงมีความเสียหายทางกายภาพร้ายแรง' : dCount > 0 ? `พบจุดชำรุดภายนอก ${dCount} จุด` : `มีจุดที่ต้องเฝ้าระวัง ${wCount} จุด`,
      recommendation: isTank ? 'ปลดสับเปลี่ยนหม้อแปลงทันที' : dCount > 0 ? 'เปิดใบสั่งงาน ZPM4 เปลี่ยนอะไหล่และปะเก็น' : 'เปลี่ยนซิลิก้าเจลและกวดขันขอบปะเก็นตามวาระ',
    });
  }

  // 1. Insulation Resistance HV - G
  const stdHvG = getStandardInsulationResistance(hvKv, 'HV-G', temp);
  const valHvG = data.hvGround1Min || 0;
  if (valHvG > 0) {
    const isPass = valHvG >= stdHvG;
    const isWarn = !isPass && valHvG >= stdHvG * 0.5;
    diagnostics.push({
      id: 'diag-hv-g',
      name: 'ความต้านทานฉนวน HV - Ground (1 นาที)',
      category: 'insulation',
      standardText: `≥ ${stdHvG} MΩ (ที่ ${temp}°C)`,
      fieldValueText: `${valHvG} MΩ`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? `ผ่าน (+${valHvG - stdHvG} MΩ)` : `ต่ำกว่าเกณฑ์ (${valHvG - stdHvG} MΩ)`,
      referenceClause: 'ข้อ 2.1.2 หน้า 19',
      findingSummary: isPass
        ? `ค่าความเป็นฉนวนระหว่างขดลวดแรงสูงกับดินอยู่ในเกณฑ์ปกติ สมบูรณ์ตามอุณหภูมิ ${temp}°C`
        : `ค่าความเป็นฉนวน HV-G ต่ำกว่าเกณฑ์มาตรฐาน ณ อุณหภูมิ ${temp}°C อาจมีความชื้นหรือคราบสกปรกสะสม`,
      recommendation: isPass
        ? 'ไม่ต้องดำเนินการแก้ไข'
        : 'ตรวจสอบทำความสะอาดผิวบุชชิ่งแรงสูง และเตรียมนำเข้าเตาอบไล่ความชื้นหากค่ายังต่ำ',
    });
  }

  // 1.1 Insulation Resistance LV - G
  const stdLvG = getStandardInsulationResistance(hvKv, 'LV-G', temp);
  const valLvG = data.lvGround1Min || 0;
  if (valLvG > 0) {
    const isPass = valLvG >= stdLvG;
    const isWarn = !isPass && valLvG >= stdLvG * 0.5;
    diagnostics.push({
      id: 'diag-lv-g',
      name: 'ความต้านทานฉนวน LV - Ground (1 นาที)',
      category: 'insulation',
      standardText: `≥ ${stdLvG} MΩ (ที่ ${temp}°C)`,
      fieldValueText: `${valLvG} MΩ`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? `ผ่าน (+${valLvG - stdLvG} MΩ)` : `ต่ำกว่าเกณฑ์ (${valLvG - stdLvG} MΩ)`,
      referenceClause: 'ข้อ 2.1.2 หน้า 19',
      findingSummary: isPass
        ? `ค่าความเป็นฉนวนขดลวดแรงต่ำเทียบดินปกติ ณ อุณหภูมิ ${temp}°C`
        : `ค่าความเป็นฉนวน LV-G ต่ำกว่าเกณฑ์มาตรฐาน ณ อุณหภูมิ ${temp}°C`,
      recommendation: isPass
        ? 'ไม่ต้องดำเนินการแก้ไข'
        : 'ตรวจสอบทำความสะอาดผิวบุชชิ่งแรงต่ำและตรวจการรั่วซึมของซีล',
    });
  }

  // 1.2 Insulation Resistance HV - LV
  const stdHvLv = getStandardInsulationResistance(hvKv, 'HV-LV', temp);
  const valHvLv = data.hvLv1Min || 0;
  if (valHvLv > 0) {
    const isPass = valHvLv >= stdHvLv;
    const isWarn = !isPass && valHvLv >= stdHvLv * 0.5;
    diagnostics.push({
      id: 'diag-hv-lv',
      name: 'ความต้านทานฉนวน HV - LV (1 นาที)',
      category: 'insulation',
      standardText: `≥ ${stdHvLv} MΩ (ที่ ${temp}°C)`,
      fieldValueText: `${valHvLv} MΩ`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? `ผ่าน (+${valHvLv - stdHvLv} MΩ)` : `ต่ำกว่าเกณฑ์ (${valHvLv - stdHvLv} MΩ)`,
      referenceClause: 'ข้อ 2.1.2 หน้า 19',
      findingSummary: isPass
        ? `ค่าความเป็นฉนวนระหว่างขดลวดแรงสูงและแรงต่ำปกติ ปราศจากการลัดวงจรระหว่างขดลวด`
        : `ค่าความเป็นฉนวน HV-LV ต่ำกว่าเกณฑ์มาตรฐาน เสี่ยงต่อการลัดวงจรระหว่างขดลวด`,
      recommendation: isPass
        ? 'ไม่ต้องดำเนินการแก้ไข'
        : 'นำหม้อแปลงเข้าตรวจสอบในห้องปฏิบัติการเพื่ออบไล่ความชื้นและตรวจสอบฉนวนคั่นขดลวด',
    });
  }

  // 2. Polarization Index (P.I.)
  const pi = data.polarizationIndex || (data.hvGround10Min && data.hvGround1Min ? data.hvGround10Min / data.hvGround1Min : 0);
  if (pi > 0) {
    const isPass = pi >= 1.5;
    const isWarn = !isPass && pi >= 1.0;
    diagnostics.push({
      id: 'diag-pi',
      name: 'ดัชนีโพลาไรเซชัน (Polarization Index - P.I.)',
      category: 'insulation',
      standardText: '≥ 1.50 (เกณฑ์แนะนำ ≥ 2.0)',
      fieldValueText: pi.toFixed(2),
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: pi >= 2.0 ? 'ดีมาก (≥ 2.0)' : pi >= 1.5 ? 'ผ่าน (1.5 - 2.0)' : pi >= 1.0 ? 'พอใช้/เริ่มชื้น' : 'อันตราย (< 1.0)',
      referenceClause: 'คู่มือบำรุงรักษา กฟภ. และ IEC 60076',
      findingSummary:
        pi >= 2.0
          ? 'ฉนวนภายในแห้งสนิท สภาพสมบูรณ์มาก'
          : pi >= 1.5
          ? 'ฉนวนผ่านเกณฑ์ มีสภาพดี พร้อมใช้งาน'
          : 'ค่า P.I. ต่ำ บ่งชี้ว่ามีความชื้นซึมลึกในฉนวนกระดาษหุ้มขดลวด',
      recommendation:
        pi >= 1.5
          ? 'ใช้งานได้ตามปกติ'
          : 'จำเป็นต้องเปลี่ยนสารดูดความชื้นซิลิก้าเจล และวางแผนกรองน้ำมัน/อบไล่ความชื้น',
    });
  }

  // 3. Oil BDV
  const bdv = data.avgBdvKv || 0;
  if (bdv > 0) {
    const isPass = bdv >= PEA_OIL_BDV_STANDARD.minBreakdownKv;
    const isWarn = !isPass && bdv >= 25.0;
    diagnostics.push({
      id: 'diag-bdv',
      name: 'ค่าแรงดันพังทลายของฉนวนน้ำมัน (Average BDV)',
      category: 'oil',
      standardText: '≥ 30.0 kV / 2.5 มม.',
      fieldValueText: `${bdv.toFixed(1)} kV`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? `ผ่านเกณฑ์ (≥ 30 kV)` : `ต่ำกว่าเกณฑ์ (${(bdv - 30.0).toFixed(1)} kV)`,
      referenceClause: 'ข้อ 2.1.3 หน้า 20 และหน้า 90',
      findingSummary: isPass
        ? 'น้ำมันหม้อแปลงมีความเป็นฉนวนไฟฟ้าสูง ปราศจากความชื้นและสิ่งปนเปื้อน'
        : bdv >= 25
        ? 'น้ำมันเริ่มเสื่อมสภาพ ค่าความเป็นฉนวนลดลงใกล้ขีดจำกัดขั้นต่ำ'
        : 'น้ำมันเสื่อมสภาพรุนแรง ไม่สามารถทำหน้าที่ฉนวนไฟฟ้าได้อย่างปลอดภัย',
      recommendation: isPass
        ? 'ใช้งานจ่ายไฟได้ตามปกติ'
        : bdv >= 25
        ? 'กำหนดคิวตรวจซ้ำภายใน 3 เดือน และจัดเตรียมเครื่องกรองน้ำมันหม้อแปลง'
        : 'ต้องดำเนินการถ่ายเปลี่ยนหรือกรองน้ำมันหม้อแปลงทันที เปิดใบสั่งงาน ZPM4 กิจกรรม ZD3 (ข้อ 3.5.3(1.3))',
    });
  }

  // 4. Ground Resistance (Arrester & Neutral)
  const arresterG = data.surgeArresterGroundOhm || 0;
  if (arresterG > 0) {
    const isPass = arresterG <= PEA_GROUNDING_STANDARDS.singlePointMaxOhm;
    const isWarn = !isPass && arresterG <= PEA_GROUNDING_STANDARDS.difficultAreaMaxOhm;
    diagnostics.push({
      id: 'diag-ground-arr',
      name: 'ความต้านทานดินเสิร์จอาร์เรสเตอร์',
      category: 'ground',
      standardText: '≤ 5.0 Ω (พื้นที่ยาก ≤ 25.0 Ω)',
      fieldValueText: `${arresterG.toFixed(1)} Ω`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? 'ผ่านเกณฑ์ปกติ' : isWarn ? 'ยอมรับได้ (พื้นที่ยาก)' : 'เกินเกณฑ์มาตรฐาน',
      referenceClause: 'ข้อ 2.4.3 หน้า 23 และ ภาคผนวก ก-4',
      findingSummary: isPass
        ? 'ระบบต่อลงดินของอุปกรณ์ล่อฟ้าแรงสูงมีความต้านทานต่ำ ป้องกันฟ้าผ่าได้อย่างมีประสิทธิภาพ'
        : isWarn
        ? 'ค่าความต้านทานดินเกิน 5 โอห์ม แต่อยู่ในเกณฑ์ผ่อนปรนสำหรับพื้นที่ดินหิน/ดินแห้ง'
        : 'ค่าความต้านทานดินสูงเกิน 25 โอห์ม เสี่ยงต่อความเสียหายเมื่อเกิดเสิร์จฟ้าผ่า',
      recommendation: isPass
        ? 'บำรุงรักษาขันกวดแคลมป์ตามวาระ'
        : isWarn
        ? 'พิจารณาเพิ่มความยาวแท่งกราวด์ หรือตอกกราวด์ร็อดขนานเพิ่ม'
        : 'ต้องปรับปรุงระบบกราวด์ทันที ตอกแท่ง Ground Rod เพิ่มเติมตามแบบ SA1-015/56007 ภาคผนวก ก-5',
    });
  }

  const neutralG = data.lvNeutralGroundOhm || 0;
  if (neutralG > 0) {
    const isPass = neutralG <= PEA_GROUNDING_STANDARDS.neutralTotalMaxOhm;
    const isWarn = !isPass && neutralG <= 5.0;
    diagnostics.push({
      id: 'diag-ground-neu',
      name: 'ความต้านทานดินรวมสายนิวทรัลแรงต่ำ',
      category: 'ground',
      standardText: '≤ 2.0 Ω',
      fieldValueText: `${neutralG.toFixed(1)} Ω`,
      status: isPass ? 'pass' : isWarn ? 'warning' : 'fail',
      deviationText: isPass ? 'ผ่านเกณฑ์ (≤ 2 Ω)' : 'เกินเกณฑ์กำหนด',
      referenceClause: 'ข้อ 2.4.3 หน้า 23',
      findingSummary: isPass
        ? 'ระบบดินสายนิวทรัลแรงต่ำมีความสมบูรณ์ตามเกณฑ์ ปลอดภัยต่อผู้ใช้ไฟฟ้า'
        : 'ความต้านทานดินรวมของสายนิวทรัลเกิน 2 โอห์ม อาจทำให้เกิดแรงดันตกค้างหรือ Neutral Floating',
      recommendation: isPass
        ? 'ปกติ'
        : 'ตามข้อ 2.4.3 ให้เพิ่มจุดต่อลงดินสายนิวทรัลตามแนวสายจำหน่ายแรงต่ำตามความเหมาะสม (ภาคผนวก ก-5)',
    });
  }

  // 5. Transformer Load Percentage
  const loadPct = data.loadPercent || 0;
  if (loadPct > 0) {
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    let finding = '';
    let reco = '';

    if (loadPct > 80.0) {
      status = 'warning';
      finding = `หม้อแปลงรับโหลดอยู่ที่ ${loadPct.toFixed(1)}% ซึ่งเกินกว่า 80% ของพิกัด`;
      reco = 'ตามข้อ 4.5.7(1) หน้า 35 ให้พิจารณาเพิ่มขนาดหม้อแปลง หรือติดตั้งหม้อแปลงเสริม โดยตัดจ่ายใหม่ ไม่ติดตั้งขนาน';
    } else if (loadPct < 30.0) {
      status = 'warning';
      finding = `หม้อแปลงรับโหลดเพียง ${loadPct.toFixed(1)}% ต่ำกว่า 30% ของพิกัด ทำให้เกิด No-load loss โดยไม่จำเป็น`;
      reco = 'ตามข้อ 4.5.7(3) หน้า 35 ให้พิจารณาสับเปลี่ยนลดขนาดหม้อแปลงให้เหมาะสมกับโหลดจริง';
    } else {
      status = 'pass';
      finding = `หม้อแปลงจ่ายโหลดอยู่ในช่วงเหมาะสม (${loadPct.toFixed(1)}% ของพิกัด 30% - 80%)`;
      reco = 'ระดับโหลดเหมาะสม ไม่ต้องปรับเปลี่ยนขนาด';
    }

    diagnostics.push({
      id: 'diag-load-pct',
      name: 'สัดส่วนการจ่ายโหลดเทียบพิกัด (% Load)',
      category: 'load',
      standardText: '30% – 80% ของพิกัด',
      fieldValueText: `${loadPct.toFixed(1)}%`,
      status,
      deviationText: loadPct > 80 ? 'โหลดสูงเกินเกณฑ์ (>80%)' : loadPct < 30 ? 'โหลดต่ำกว่าเกณฑ์ (<30%)' : 'ช่วงโหลดเหมาะสม',
      referenceClause: 'ข้อ 4.5.7 หน้า 35',
      findingSummary: finding,
      recommendation: reco,
    });
  }

  // 6. Current Unbalance Percentage
  const unbalance = data.currentUnbalancePercent || 0;
  if (unbalance > 0) {
    const isPass = unbalance <= PEA_LOAD_STANDARDS.maxCurrentUnbalancePercent;
    diagnostics.push({
      id: 'diag-curr-unbalance',
      name: 'ความไม่สมดุลของกระแสเฟส (% Current Unbalance)',
      category: 'load',
      standardText: '≤ 20.0%',
      fieldValueText: `${unbalance.toFixed(1)}%`,
      status: isPass ? 'pass' : 'warning',
      deviationText: isPass ? 'สมดุลผ่านเกณฑ์ (≤ 20%)' : `เฟสไม่สมดุล (${unbalance.toFixed(1)}% > 20%)`,
      referenceClause: 'ข้อ 4.5.6 และ ข้อ 4.5.7(4) หน้า 34-35',
      findingSummary: isPass
        ? 'การกระจายโหลดแต่ละเฟสมีความสมดุลดี ไม่ทำให้เกิดความร้อนสะสมที่ขดลวดเฟสใดเฟสหนึ่ง'
        : `กระแสโหลดระหว่างเฟสแตกต่างกันเกิน 20% ทำให้เกิดความสูญเสียในสายนิวทรัลและหม้อแปลงร้อนผิดปกติ`,
      recommendation: isPass
        ? 'ปกติ'
        : 'ตามข้อ 4.5.7(4) ให้ดำเนินการจัดสมดุลเฟส (Phase Balancing) หน้างาน พร้อมทั้งเปิดใบสั่งงานในระบบ SAP-PM',
    });
  }

  // Determine overall classification according to PEA Form มป.11-ป.68 (หน้า 91)
  const hasFail = diagnostics.some((d) => d.status === 'fail');
  const hasWarn = diagnostics.some((d) => d.status === 'warning');
  const defectCount = data.visualChecksDefectCount || 0;
  const isTankBroken = data.tankDamaged || false;
  const isTooOld = (data.ageYears || 0) >= 30;

  let overallClassification: OperationalDecision['overallClassification'] = 'หม้อแปลงดี';
  let color: OperationalDecision['color'] = 'emerald';
  let primaryCause = 'ผ่านเกณฑ์มาตรฐาน กฟภ. ทุกหัวข้อ';
  let summaryExecutive = 'หม้อแปลงอยู่ในสภาพสมบูรณ์ พร้อมจ่ายไฟฟ้าในระบบจำหน่ายอย่างปลอดภัย';

  if (isTankBroken || (isTooOld && hasFail)) {
    overallClassification = 'หม้อแปลงชำรุดหนักเห็นควรจำหน่าย';
    color = 'red';
    primaryCause = isTankBroken ? 'ตัวถังหม้อแปลงปริแตก บวม หรือครีบหักรุนแรง' : 'หม้อแปลงอายุการใช้งานเกิน 30 ปีและชำรุดไม่คุ้มซ่อม';
    summaryExecutive = 'เข้าเงื่อนไขตามข้อ 3.6.1 หน้า 20 และหน้า 91 เห็นควรดำเนินการจำหน่ายพัสดุและตัดบัญชี';
  } else if (hasFail && (defectCount > 3 || (valHvG > 0 && valHvG < 100))) {
    overallClassification = 'หม้อแปลงชำรุดหนัก';
    color = 'rose';
    primaryCause = 'ค่าความต้านทานฉนวนต่ำกว่า 100 MΩ หรือมีความผิดปกติร้ายแรงในขดลวด/แกนเหล็ก';
    summaryExecutive = 'ไม่สามารถจ่ายไฟได้ ต้องแต่งตั้งคณะกรรมการสอบหาข้อเท็จจริงตามแบบ มป.2-ป.68 ภายใน 30 วัน';
  } else if (hasWarn || hasFail || defectCount > 0) {
    overallClassification = 'หม้อแปลงชำรุดเล็กน้อย';
    color = 'amber';
    primaryCause = 'พบจุดบกพร่องภายนอก อุปกรณ์ประกอบ หรือค่าน้ำมัน/ฉนวนที่ต้องปรับปรุงแก้ไข';
    summaryExecutive = 'จ่ายไฟได้ หรือสามารถซ่อมบำรุงเปลี่ยนอุปกรณ์ได้โดยไม่ต้องเปิดฝาถัง ดำเนินการให้แล้วเสร็จภายใน 90 วัน';
  }

  // Generate actionable options
  const actionOptions: OperationalDecision['actionOptions'] = [];

  if (overallClassification === 'หม้อแปลงดี') {
    actionOptions.push({
      stepNumber: 1,
      title: 'จ่ายไฟและบันทึกข้อมูลเข้าสู่ระบบ',
      recommended: true,
      procedure: [
        'ดำเนินการสับสวิตช์จ่ายไฟเข้าหม้อแปลงได้ทันที',
        'บันทึกผลการตรวจสอบ มป.11-ป.68 ลงในระบบ SAP-ADS / DTMS',
        'กำหนดรอบการตรวจสอบบำรุงรักษาเชิงป้องกัน (PM) ครั้งต่อไปในอีก 1 ปี',
      ],
      sapCodeOrRef: 'SAP-ADS: สถานะ ESTO-01 (พร้อมใช้งาน)',
      responsibleRole: 'ผู้ควบคุมงาน / แผนกปฏิบัติการและบำรุงรักษา (ผปบ.)',
      timeframe: 'ดำเนินการได้ทันที',
    });
  } else if (overallClassification === 'หม้อแปลงชำรุดเล็กน้อย') {
    actionOptions.push({
      stepNumber: 1,
      title: 'เปิดใบสั่งงานซ่อมบำรุงหม้อแปลงชำรุดเล็กน้อย (ไม่ต้องสอบหาข้อเท็จจริง)',
      recommended: true,
      procedure: [
        'เปิดใบสั่งงานในระบบ SAP-PM ประเภทใบสั่งงาน ZPM4 กิจกรรม ZD3 "บำรุงฯ หม้อแปลงจำหน่าย-คงคลัง"',
        'เบิกอะไหล่เปลี่ยน เช่น สารดูดความชื้นซิลิก้าเจล, ปะเก็นบุชชิ่ง, ถ่ายกรองน้ำมันหม้อแปลง',
        'ดำเนินการซ่อมแซมให้แล้วเสร็จภายใน 90 วัน นับถัดจากวันที่ตรวจพบ (ตามข้อ 3.5.3(1) หน้า 18)',
        'หลังซ่อมเสร็จ ทดสอบซ้ำตามแบบฟอร์ม มป.11-ป.68 แล้วปรับสถานะเป็น REPD (ผ่านการซ่อมใช้งาน)',
      ],
      sapCodeOrRef: 'T-Code: MIGO MvT 322 / SAP-ADS: WTRB (ซ่อมเล็กน้อย)',
      responsibleRole: 'แผนกมิเตอร์และหม้อแปลง (ผมต.) / โรงซ่อม',
      timeframe: 'ภายใน 90 วัน',
    });

    if (loadPct > 80.0) {
      actionOptions.push({
        stepNumber: 2,
        title: 'จัดทำแผนปรับปรุงขนาดหม้อแปลง (Overload Management)',
        recommended: false,
        procedure: [
          'แจ้งแผนกวิศวกรรมและวางแผน (กวว.) สำรวจโหลดรายชั่วโมงช่วง Peak',
          'จัดทำแผนงานขออนุมัติเพิ่มขนาดหม้อแปลง หรือตัดถ่ายโหลดเสริมวงจรใหม่ (ข้อ 4.5.7(1))',
        ],
        sapCodeOrRef: 'SAP-PM: แผนงานวัดโหลดประจำปี / P-SIM',
        responsibleRole: 'กองวิศวกรรมและวางแผน (กวว.)',
        timeframe: 'ภายใน 30 วัน',
      });
    }

    if (unbalance > 20.0) {
      actionOptions.push({
        stepNumber: 3,
        title: 'ดำเนินการสับถ่ายเกลี่ยเฟส (Phase Balancing)',
        recommended: true,
        procedure: [
          'ส่งชุดปฏิบัติงานเข้าวัดกระแสแต่ละสายแยกปลายทาง',
          'ย้ายมิเตอร์ผู้ใช้ไฟจากเฟสโหลดหนักไปยังเฟสโหลดเบา ให้ผลต่างกระแสไม่เกิน 20%',
        ],
        sapCodeOrRef: 'SAP-PM: ใบสั่งงานแก้กระแสไฟฟ้าขัดข้อง',
        responsibleRole: 'แผนกปฏิบัติการและบำรุงรักษา (ผปบ.)',
        timeframe: 'ภายใน 7 วัน',
      });
    }
  } else if (overallClassification === 'หม้อแปลงชำรุดหนัก') {
    actionOptions.push({
      stepNumber: 1,
      title: 'ปลดหม้อแปลงและแต่งตั้งคณะกรรมการสอบหาข้อเท็จจริง',
      recommended: true,
      procedure: [
        'ปลดหม้อแปลงลงจากเสา และนำหม้อแปลงสำรองมาติดตั้งจ่ายไฟแทน (ใบสั่งงาน ZPM2 กิจกรรม ZDB)',
        'เสนอหัวหน้าหน่วยงานแต่งตั้งคณะกรรมการสอบหาข้อเท็จจริงหม้อแปลงชำรุด (ข้อ 3.5.3(2) หน้า 19)',
        'สรุปรายงานตามแบบฟอร์ม มป.2-ป.68 ส่งให้ กบษ. เสนอ อฝ.ปบ. ภายใน 30 วันนับถัดจากวันที่รื้อถอน',
        'หากอนุมัติซ่อม ให้เปิดใบสั่งงาน ZPM2 กิจกรรม ZDC "ซ่อมหม้อแปลงจำหน่าย-คงคลัง"',
      ],
      sapCodeOrRef: 'แบบฟอร์ม มป.2-ป.68 / SAP-ADS: WTRC (ซ่อมขดลวด)',
      responsibleRole: 'ผู้ควบคุมหม้อแปลง / คณะกรรมการสอบหาข้อเท็จจริง',
      timeframe: 'รายงานภายใน 30 วัน',
    });
  } else {
    actionOptions.push({
      stepNumber: 1,
      title: 'เสนอขออนุมัติตัดจำหน่ายพัสดุและขายซาก',
      recommended: true,
      procedure: [
        'จัดทำรายงานสรุปผลการสอบหาข้อเท็จจริง มป.2-ป.68 ระบุเหตุผลตามข้อ 3.6.1 (ตัวถังแตกชำรุดมากไม่คุ้มค่าซ่อม หรืออายุเกิน 30 ปี)',
        'โอนเปลี่ยนสถานะเป็นรอจำหน่าย T-Code: MIGO MvT 344 (สถานะ ESTO-07)',
        'ถอด Nameplate หม้อแปลงเก็บรักษาไว้เป็นหลักฐาน',
        'ดำเนินการขออนุมัติขายซากตามระเบียบพัสดุ กฟภ. และตัดจำหน่ายออกจากบัญชีทรัพย์สิน SAP-AA',
      ],
      sapCodeOrRef: 'SAP-MM: MIGO MvT 911 / SAP-ADS: WROF (ตัดจำหน่าย)',
      responsibleRole: 'คณะกรรมการจำหน่ายพัสดุ / แผนกบัญชีทรัพย์สิน',
      timeframe: 'ตามรอบการจำหน่ายพัสดุ',
    });
  }

  return {
    overallClassification,
    color,
    confidenceScore: 98,
    primaryCause,
    summaryExecutive,
    actionOptions,
    diagnostics,
  };
}
