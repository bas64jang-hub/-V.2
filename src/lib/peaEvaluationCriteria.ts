import { EvaluationCriterion, InspectionRecord, InspectionStatus, TransformerClassification } from '../types';
import {
  getStandardInsulationResistance,
  PEA_OIL_BDV_STANDARD,
  PEA_GROUNDING_STANDARDS,
  PEA_LOAD_STANDARDS,
} from './peaStandards';

/**
 * สร้างเกณฑ์การประเมินมาตรฐาน กฟภ. 6 ด้านอย่างละเอียด
 * อ้างอิงระเบียบการไฟฟ้าส่วนภูมิภาคว่าด้วยการตรวจสอบและบำรุงรักษาหม้อแปลงระบบจำหน่าย พ.ศ. 2568
 * และแบบฟอร์ม ข-2 มป.11-ป.68
 */
export function generateStandardCriteriaEvaluations(data: Partial<InspectionRecord>): EvaluationCriterion[] {
  const evaluatedAt = new Date().toISOString();

  // 1. เกณฑ์ที่ 1: การตรวจสภาพภายนอกและโครงสร้างกายภาพ (Visual & Mechanical)
  const visualChecks = data.visualChecks || [];
  const defectItems = visualChecks.filter((v) => v.status === 'defect');
  const warningItems = visualChecks.filter((v) => v.status === 'warning');
  const goodCount = visualChecks.filter((v) => v.status === 'good').length;
  const isTankDamaged = Boolean(data.tankDamaged);

  let visualStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let visualMeasured = `ตรวจครบ 15 ข้อ: ปกติ ${goodCount} ข้อ, เฝ้าระวัง ${warningItems.length} ข้อ, ชำรุด ${defectItems.length} ข้อ`;
  let visualSummary = '';
  let visualRecommendation = '';

  if (isTankDamaged) {
    visualStatus = 'fail';
    visualMeasured += ' | ตัวถังชำรุดเสียหาย/บวม';
    visualSummary = 'ตัวถังหม้อแปลงมีความเสียหายทางกายภาพร้ายแรง (ปริ บวม หรือแตกร้าว) มีความเสี่ยงต่อการเกิดอาร์กและการระเบิด';
    visualRecommendation = 'ตามข้อ 3.6.1 หน้า 20 และแบบ มป.11 หน้า 91 เห็นควรปลดสับเปลี่ยนหม้อแปลงทันที และดำเนินการจำหน่ายพัสดุชำรุดหนัก';
  } else if (defectItems.length > 0) {
    visualStatus = 'fail';
    const names = defectItems.map((d) => d.name.split('.')[1] || d.name).slice(0, 2).join(', ');
    visualSummary = `พบจุดชำรุดผิดปกติ ${defectItems.length} รายการ (${names}) ไม่ผ่านเกณฑ์สภาพภายนอกขั้นพื้นฐาน`;
    visualRecommendation = 'เปิดใบสั่งงาน ZPM4 กิจกรรมแก้ไขเร่งด่วน ดำเนินการเปลี่ยนอะไหล่ที่ชำรุดและซีลปะเก็นก่อนจ่ายไฟฟ้า';
  } else if (warningItems.length > 0) {
    visualStatus = 'warning';
    const names = warningItems.map((w) => w.name.split('.')[1] || w.name).slice(0, 2).join(', ');
    visualSummary = `โครงสร้างภายนอกจ่ายไฟได้ แต่พบจุดเฝ้าระวัง ${warningItems.length} รายการ (${names})`;
    visualRecommendation = 'ตามข้อ 3.5.3(1) กำหนดรอบเปลี่ยนสารดูดความชื้นซิลิก้าเจลและกวดขันขอบปะเก็นภายใน 90 วัน';
  } else {
    visualStatus = 'pass';
    visualSummary = 'สภาพภายนอก โครงสร้างตัวถัง บุชชิ่งแรงสูง-แรงต่ำ ปะเก็น และระบบดูดความชื้นสมบูรณ์ 100% ตามเกณฑ์มาตรฐาน มป.11';
    visualRecommendation = 'ใช้งานจ่ายไฟได้ตามปกติ ดำเนินการตรวจสภาพภายนอกตามรอบวาระ PM ประจำปี (มป.1)';
  }

  const criterion1: EvaluationCriterion = {
    id: 'visual',
    name: 'เกณฑ์ที่ 1: การตรวจสภาพภายนอกและโครงสร้างกายภาพ (Visual & Mechanical)',
    category: 'โครงสร้างและตัวถัง',
    standardBenchmark: 'แบบฟอร์ม มป.11 ข้อ 1-15: โครงสร้างตัวถัง ครีบระบายความร้อน บุชชิ่ง HV/LV ซีลยาง และระบบดูดความชื้นสมบูรณ์ปราศจากการรั่วซึม',
    measuredSummary: visualMeasured,
    status: visualStatus,
    aiSummary: visualSummary,
    aiRecommendation: visualRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  // 2. เกณฑ์ที่ 2: ระบบต่อลงดินและอุปกรณ์ป้องกันฟ้าผ่า (Grounding & Lightning Protection)
  const arresterG = data.groundTest?.surgeArresterGroundOhm || 0;
  const neutralG = data.groundTest?.lvNeutralGroundOhm || 0;
  const rodCondition = data.groundTest?.groundRodCondition || 'good';

  let groundStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let groundMeasured = `ความต้านทานดินล่อฟ้า (Arrester): ${arresterG ? arresterG.toFixed(1) + ' Ω' : 'ยังไม่ได้วัด'}, ดินนิวทรัล (LV Neutral): ${neutralG ? neutralG.toFixed(1) + ' Ω' : 'ยังไม่ได้วัด'}`;
  let groundSummary = '';
  let groundRecommendation = '';

  const arresterPass = arresterG > 0 && arresterG <= PEA_GROUNDING_STANDARDS.singlePointMaxOhm;
  const arresterDifficultPass = arresterG > 0 && arresterG <= PEA_GROUNDING_STANDARDS.difficultAreaMaxOhm;
  const neutralPass = neutralG > 0 && neutralG <= PEA_GROUNDING_STANDARDS.neutralTotalMaxOhm;

  if (arresterG === 0 && neutralG === 0) {
    groundStatus = 'warning';
    groundSummary = 'ยังไม่มีข้อมูลผลการวัดค่าความต้านทานดินของเสิร์จอาร์เรสเตอร์หรือสายนิวทรัลในระบบ';
    groundRecommendation = 'ดำเนินการใช้ Earth Resistance Tester วัดค่าความต้านทานดินทั้ง 2 จุดเพื่อรับรองความปลอดภัยตามข้อ 2.4.3';
  } else if ((arresterG > 0 && !arresterDifficultPass) || (neutralG > 0 && neutralG > 5.0)) {
    groundStatus = 'fail';
    groundSummary = `ค่าความต้านทานดินสูงเกินเกณฑ์ความปลอดภัยมาตรฐานอย่างมีนัยสำคัญ (ล่อฟ้า: ${arresterG.toFixed(1)} Ω, นิวทรัล: ${neutralG.toFixed(1)} Ω) เสี่ยงต่อความเสียหายเมื่อเกิดเสิร์จฟ้าผ่า`;
    groundRecommendation = 'ปรับปรุงระบบต่อลงดินทันที โดยตอกแท่ง Ground Rod เพิ่มเติมขนานตามแบบมาตรฐาน กฟภ. SA1-015/56007 ภาคผนวก ก-5 เพื่อลดค่าให้อยู่ในเกณฑ์';
  } else if (!arresterPass || !neutralPass || rodCondition === 'corroded' || rodCondition === 'loose') {
    groundStatus = 'warning';
    groundSummary = `ระบบต่อลงดินอยู่ในระดับยอมรับได้สำหรับพื้นที่ยาก แต่อาจมีจุดบกพร่อง (ล่อฟ้า: ${arresterG.toFixed(1)} Ω เกณฑ์ ≤5Ω, นิวทรัล: ${neutralG.toFixed(1)} Ω เกณฑ์ ≤2Ω)`;
    groundRecommendation = 'ขันกวดแคลมป์ทองเหลือง ทำความสะอาดจุดเชื่อมต่อ และพิจารณาปักแท่งกราวด์ร็อดเสริมเพิ่มอีก 1 จุดตามแนวสายแรงต่ำ';
  } else {
    groundStatus = 'pass';
    groundSummary = 'ค่าความต้านทานดินของเสิร์จอาร์เรสเตอร์และสายนิวทรัลต่ำกว่าเกณฑ์มาตรฐาน กฟภ. มีความสมบูรณ์ในการป้องกันฟ้าผ่าและเสิร์จ';
    groundRecommendation = 'ระบบกราวด์สมบูรณ์ดีมาก ขันกวดตรวจเช็คความแน่นหนาของข้อต่อทองเหลืองตามรอบวาระ';
  }

  const criterion2: EvaluationCriterion = {
    id: 'grounding',
    name: 'เกณฑ์ที่ 2: ระบบต่อลงดินและอุปกรณ์ป้องกันฟ้าผ่า (Grounding & Surge Protection)',
    category: 'ระบบดินและป้องกันฟ้าผ่า',
    standardBenchmark: 'ระเบียบ กฟภ. ข้อ 2.4.3 หน้า 23: ความต้านทานดินเสิร์จอาร์เรสเตอร์ ≤ 5.0 Ω (พื้นที่ยาก ≤ 25.0 Ω), ดินรวมสายนิวทรัลแรงต่ำ ≤ 2.0 Ω',
    measuredSummary: groundMeasured,
    status: groundStatus,
    aiSummary: groundSummary,
    aiRecommendation: groundRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  // 3. เกณฑ์ที่ 3: ความเป็นฉนวนไฟฟ้าและดัชนีโพลาไรเซชัน (Insulation Resistance & PI)
  const hvKv = data.hvVoltageKv || 22;
  const tempC = data.insulationTest?.ambientTempC || 30;
  const hvG1 = data.insulationTest?.hvGround1Min || 0;
  const hvG10 = data.insulationTest?.hvGround10Min || 0;
  const pi = data.insulationTest?.polarizationIndex || (hvG10 > 0 && hvG1 > 0 ? Number((hvG10 / hvG1).toFixed(2)) : 0);
  const stdInsulation = getStandardInsulationResistance(hvKv, 'HV-G', tempC);

  let insStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let insMeasured = `HV-G (1 min): ${hvG1 ? hvG1 + ' MΩ' : 'ยังไม่ระบุ'}, P.I.: ${pi ? pi.toFixed(2) : 'ยังไม่ระบุ'} (วัดที่อุณหภูมิ ${tempC}°C, เกณฑ์ขั้นต่ำ ${stdInsulation} MΩ)`;
  let insSummary = '';
  let insRecommendation = '';

  if (hvG1 === 0) {
    insStatus = 'warning';
    insSummary = 'ยังไม่มีข้อมูลการทดสอบค่าความต้านทานฉนวนขดลวดแรงสูงเทียบดิน (HV-Ground)';
    insRecommendation = 'ใช้เครื่อง Megohmmeter ระดับแรงดันทดสอบ 2500V/5000V ทดสอบตามคู่มือการบำรุงรักษา กฟภ.';
  } else if (hvG1 < 100 || (pi > 0 && pi < 1.0)) {
    insStatus = 'fail';
    insSummary = `ค่าความต้านทานฉนวนไฟฟ้าต่ำมาก (${hvG1} MΩ) หรือค่า P.I. (${pi}) บ่งชี้ว่าฉนวนกระดาษและขดลวดมีความชื้นซึมลึกรุนแรง เสี่ยงต่อการ Breakdown`;
    insRecommendation = 'ปลดแยกหม้อแปลงเพื่อนำเข้าโรงซ่อม อบไล่ความชื้นในขดลวด (Oven Drying) และตรวจเช็คสภาพขดลวดตามแบบ มป.11 หน้า 91';
  } else if (hvG1 < stdInsulation || (pi > 0 && pi < 1.5)) {
    insStatus = 'warning';
    insSummary = `ค่าฉนวนไฟฟ้าต่ำกว่าเกณฑ์มาตรฐาน ณ อุณหภูมิ ${tempC}°C (วัดได้ ${hvG1} MΩ เกณฑ์ ${stdInsulation} MΩ) ฉนวนเริ่มมีความชื้นสะสม`;
    insRecommendation = 'เปลี่ยนซิลิก้าเจลชุดใหม่ กวดขันบุชชิ่งแรงสูง และวางแผนกรองน้ำมันหม้อแปลงเพื่อไล่ความชื้นสะสมในระบบ';
  } else {
    insStatus = 'pass';
    insSummary = `ค่าความต้านทานฉนวน HV-G สูงกว่าเกณฑ์มาตรฐาน (${hvG1} MΩ ≥ ${stdInsulation} MΩ) และค่า P.I. (${pi ? pi.toFixed(2) : 'ผ่าน'}) แสดงถึงฉนวนแห้งและสมบูรณ์`;
    insRecommendation = 'ฉนวนไฟฟ้ามีสภาพสมบูรณ์ พร้อมใช้งานจ่ายไฟได้ตามปกติ';
  }

  const criterion3: EvaluationCriterion = {
    id: 'insulation',
    name: 'เกณฑ์ที่ 3: ความเป็นฉนวนไฟฟ้าและดัชนีโพลาไรเซชัน (Insulation & Polarization Index)',
    category: 'ฉนวนไฟฟ้า',
    standardBenchmark: `ระเบียบ กฟภ. ข้อ 2.1.2 หน้า 19: ค่าความต้านทานฉนวน HV-G เทียบอุณหภูมิ ${tempC}°C ต้องไม่ต่ำกว่า ${stdInsulation} MΩ, ค่า P.I. (R10/R1) ≥ 1.50`,
    measuredSummary: insMeasured,
    status: insStatus,
    aiSummary: insSummary,
    aiRecommendation: insRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  // 4. เกณฑ์ที่ 4: ความคงทนทางไฟฟ้าของฉนวนน้ำมัน (Oil Dielectric Breakdown Voltage - BDV)
  const avgBdv = data.oilTest?.averageKv || 0;
  const oilColor = data.oilTest?.oilColor || 'ไม่ระบุ';
  const oilApp = data.oilTest?.appearance || 'ไม่ระบุ';

  let oilStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let oilMeasured = `ค่าเฉลี่ย BDV: ${avgBdv ? avgBdv.toFixed(1) + ' kV / 2.5 mm' : 'ยังไม่ระบุ'}, สีน้ำมัน: ${oilColor}, ลักษณะ: ${oilApp}`;
  let oilSummary = '';
  let oilRecommendation = '';

  if (avgBdv === 0) {
    oilStatus = 'warning';
    oilSummary = 'ยังไม่มีผลการทดสอบแรงดันพังทลายของฉนวนน้ำมัน (Dielectric Breakdown Voltage)';
    oilRecommendation = 'ดำเนินการเก็บตัวอย่างน้ำมันหม้อแปลงส่งทดสอบเครื่องทดสอบน้ำมันอัตโนมัติ (6 ช็อต) ตามมาตรฐาน IEC 60156';
  } else if (avgBdv < 25.0) {
    oilStatus = 'fail';
    oilSummary = `ค่าน้ำมัน BDV เฉลี่ยได้ ${avgBdv.toFixed(1)} kV ต่ำกว่าเกณฑ์มาตรฐาน 30 kV อย่างรุนแรง น้ำมันสูญเสียคุณสมบัติการเป็นฉนวนไฟฟ้า`;
    oilRecommendation = 'ตามข้อ 3.5.3(1.3) ต้องดำเนินการกรองน้ำมันหม้อแปลงแบบสูญญากาศ หรือถ่ายเปลี่ยนน้ำมันใหม่ทันที เปิดใบสั่งงาน ZPM4 กิจกรรม ZD3';
  } else if (avgBdv < PEA_OIL_BDV_STANDARD.minBreakdownKv) {
    oilStatus = 'warning';
    oilSummary = `ค่าน้ำมัน BDV เฉลี่ยได้ ${avgBdv.toFixed(1)} kV เริ่มลดลงต่ำกว่าเกณฑ์มาตรฐาน 30.0 kV เล็กน้อย มีความชื้นหรือเขม่าแขวนลอย`;
    oilRecommendation = 'กำหนดคิวตรวจซ้ำภายใน 3 เดือน และจัดเตรียมรถกรองน้ำมันเคลื่อนที่เข้าบำรุงรักษาหน้างาน';
  } else {
    oilStatus = 'pass';
    oilSummary = `ค่าน้ำมัน BDV เฉลี่ย ${avgBdv.toFixed(1)} kV สูงกว่าเกณฑ์มาตรฐานขั้นต่ำ (≥ 30.0 kV) น้ำมันมีความเป็นฉนวนไฟฟ้าสูง สะอาด ปราศจากความชื้น`;
    oilRecommendation = 'คุณภาพน้ำมันผ่านเกณฑ์มาตรฐาน กฟภ. พร้อมใช้งานตามปกติ';
  }

  const criterion4: EvaluationCriterion = {
    id: 'oil',
    name: 'เกณฑ์ที่ 4: ความคงทนทางไฟฟ้าของฉนวนน้ำมัน (Oil Breakdown Voltage - BDV)',
    category: 'น้ำมันหม้อแปลง',
    standardBenchmark: 'ระเบียบ กฟภ. ข้อ 2.1.3 หน้า 20 และ IEC 60156: ค่าแรงดันพังทลายของฉนวนน้ำมัน (Average BDV) ต้องไม่ต่ำกว่า 30.0 kV / ระยะห่าง 2.5 มม.',
    measuredSummary: oilMeasured,
    status: oilStatus,
    aiSummary: oilSummary,
    aiRecommendation: oilRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  // 5. เกณฑ์ที่ 5: ความต้านทานขดลวดไฟฟ้าและความสมดุล (Winding Resistance & Balance)
  const unbHv = data.windingResistance?.unbalanceHvPercent || 0;
  const unbLv = data.windingResistance?.unbalanceLvPercent || 0;

  let windingStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let windingMeasured = `ความไม่สมดุลขดลวดแรงสูง (HV): ${unbHv ? unbHv.toFixed(2) + '%' : 'สมดุล'}, แรงต่ำ (LV): ${unbLv ? unbLv.toFixed(2) + '%' : 'สมดุล'}`;
  let windingSummary = '';
  let windingRecommendation = '';

  if (unbHv > 3.0 || unbLv > 3.0) {
    windingStatus = 'fail';
    windingSummary = `ค่าความไม่สมดุลของความต้านทานขดลวดเกินเกณฑ์ 3.0% (HV: ${unbHv.toFixed(2)}%, LV: ${unbLv.toFixed(2)}%) มีความผิดปกติในขดลวดหรือจุดสัมผัสแท็ป`;
    windingRecommendation = 'ตรวจสอบสวิตช์ปรับแท็ปแรงดัน (Tap Changer Switch) ขันกวดขั้วต่อ และทดสอบอัตราส่วนแรงดัน (Turns Ratio) เพื่อเช็คการลัดวงจรขดลวด';
  } else if (unbHv > 2.0 || unbLv > 2.0) {
    windingStatus = 'warning';
    windingSummary = `ความไม่สมดุลของขดลวดอยู่ในช่วงเฝ้าระวัง (${Math.max(unbHv, unbLv).toFixed(2)}% เกณฑ์ ≤ 2.0%) ขดลวดอาจเริ่มมีความร้อนสะสมจุดต่อ`;
    windingRecommendation = 'สลับสับเปลี่ยนตำแหน่งแท็ปเพื่อทำความสะอาดหน้าสัมผัส (Contact Wipe) และวัดซ้ำ';
  } else {
    windingStatus = 'pass';
    windingSummary = 'ความต้านทานขดลวดทั้งด้านแรงสูงและแรงต่ำมีความสมดุลดีเยี่ยม ค่า % Unbalance อยู่ในเกณฑ์มาตรฐาน ไม่มีการลัดวงจรระหว่างรอบ';
    windingRecommendation = 'ขดลวดไฟฟ้าสมบูรณ์ตามมาตรฐาน กฟภ. พร้อมใช้งาน';
  }

  const criterion5: EvaluationCriterion = {
    id: 'winding',
    name: 'เกณฑ์ที่ 5: ความต้านทานขดลวดไฟฟ้าและความสมดุล (Winding Resistance & Balance)',
    category: 'ขดลวดไฟฟ้า',
    standardBenchmark: 'ภาคผนวก ข-2 ข้อ 6 หน้า 90-91: ค่าความไม่สมดุลของความต้านทานขดลวดระหว่างเฟส (% Resistance Unbalance) ต้องไม่เกิน 2.0% - 3.0%',
    measuredSummary: windingMeasured,
    status: windingStatus,
    aiSummary: windingSummary,
    aiRecommendation: windingRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  // 6. เกณฑ์ที่ 6: ภาระโหลดและการจ่ายพลังงานไฟฟ้า (Load Profile & Current Balance)
  const loadPct = data.loadMeasurement?.loadPercent || 0;
  const currUnb = data.loadMeasurement?.currentUnbalancePercent || 0;
  const iA = data.loadMeasurement?.iA || 0;
  const iB = data.loadMeasurement?.iB || 0;
  const iC = data.loadMeasurement?.iC || 0;

  let loadStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let loadMeasured = `ภาระโหลด: ${loadPct ? loadPct.toFixed(1) + '%' : 'ยังไม่ระบุ'}, ความไม่สมดุลกระแส: ${currUnb ? currUnb.toFixed(1) + '%' : 'ยังไม่ระบุ'} (Ia=${iA}A, Ib=${iB}A, Ic=${iC}A)`;
  let loadSummary = '';
  let loadRecommendation = '';

  if (loadPct === 0) {
    loadStatus = 'pass';
    loadMeasured = 'ยังไม่มีข้อมูลการจ่ายโหลดขณะวัด (สภาวะ No-load)';
    loadSummary = 'หม้อแปลงอยู่ในสภาวะปลดโหลด พร้อมรองรับการจ่ายพลังงานไฟฟ้า';
    loadRecommendation = 'เมื่อจ่ายโหลดเข้าสู่ระบบ ให้ดำเนินการวัดกระแสโหลดสูงสุดและแรงดันปลายสายตามข้อ 4.5.6';
  } else if (loadPct > 100.0) {
    loadStatus = 'fail';
    loadSummary = `หม้อแปลงจ่ายโหลดเกินพิกัดรุนแรง (${loadPct.toFixed(1)}% > 100%) อุณหภูมิน้ำมันและขดลวดจะสูงเกินขีดจำกัด ทำให้อายุการใช้งานลดลงอย่างรวดเร็ว`;
    loadRecommendation = 'ตามข้อ 4.5.7(1) หน้า 35 ให้รีบดำเนินการตัดจ่ายโอนย้ายโหลดออก หรือเสริมหม้อแปลงตัวใหม่ทันที';
  } else if (loadPct > PEA_LOAD_STANDARDS.maxLoadPercent) {
    loadStatus = 'warning';
    loadSummary = `หม้อแปลงรับโหลดอยู่ที่ ${loadPct.toFixed(1)}% ซึ่งเกินเกณฑ์แนะนำ 80% ของพิกัด`;
    loadRecommendation = 'ตามข้อ 4.5.7(1) ให้พิจารณาเพิ่มขนาดหม้อแปลง หรือติดตั้งหม้อแปลงเสริม โดยตัดจ่ายใหม่ ไม่ติดตั้งขนาน';
  } else if (loadPct < PEA_LOAD_STANDARDS.minLoadPercent) {
    loadStatus = 'warning';
    loadSummary = `หม้อแปลงจ่ายโหลดเพียง ${loadPct.toFixed(1)}% ต่ำกว่าเกณฑ์ 30% ของพิกัด เกิด No-load loss สะสมโดยไม่จำเป็น`;
    loadRecommendation = 'ตามข้อ 4.5.7(3) หน้า 35 ให้พิจารณาสับเปลี่ยนลดขนาดหม้อแปลงให้เหมาะสมกับโหลดจริง';
  } else if (currUnb > PEA_LOAD_STANDARDS.maxCurrentUnbalancePercent) {
    loadStatus = 'warning';
    loadSummary = `กระแสโหลดระหว่างเฟสไม่สมดุล (${currUnb.toFixed(1)}% > 20%) ส่งผลให้เกิดกระแสไหลในสายนิวทรัลและเกิดความร้อนสะสม`;
    loadRecommendation = 'ตามข้อ 4.5.7(4) ดำเนินการจัดสมดุลเฟส (Phase Balancing) ที่ตู้ควบคุมหรือแนวสายจำหน่ายแรงต่ำ';
  } else {
    loadStatus = 'pass';
    loadSummary = `หม้อแปลงจ่ายโหลดอยู่ในช่วงเหมาะสม (${loadPct.toFixed(1)}% อยู่ในเกณฑ์ 30% - 80%) และกระแสโหลดแต่ละเฟสมีความสมดุลดี (${currUnb.toFixed(1)}% ≤ 20%)`;
    loadRecommendation = 'ภาระโหลดและสมดุลกระแสผ่านเกณฑ์มาตรฐาน ไม่ต้องดำเนินการแก้ไข';
  }

  const criterion6: EvaluationCriterion = {
    id: 'load',
    name: 'เกณฑ์ที่ 6: ภาระโหลดและการจ่ายพลังงานไฟฟ้า (Load Profile & Current Balance)',
    category: 'ภาระโหลดและสมดุลเฟส',
    standardBenchmark: 'ระเบียบ กฟภ. ข้อ 4.5.6 - 4.5.7 หน้า 34-35: สัดส่วนโหลดเหมาะสมระหว่าง 30% - 80% ของพิกัด, ความไม่สมดุลกระแสเฟสต้องไม่เกิน 20.0%',
    measuredSummary: loadMeasured,
    status: loadStatus,
    aiSummary: loadSummary,
    aiRecommendation: loadRecommendation,
    evaluatedAt,
    isAiLocked: true,
  };

  return [criterion1, criterion2, criterion3, criterion4, criterion5, criterion6];
}

/**
 * ประเมินผลตามเกณฑ์มาตรฐาน กฟภ. 2568 ด้วย Rule Engine ภายในระบบ (รวดเร็ว 100% เสถียร ไม่พึ่งพาเครือข่ายภายนอก)
 */
export function evaluateCriteriaWithStandardRules(
  data: Partial<InspectionRecord>
): {
  criteria: EvaluationCriterion[];
  overallClassification: TransformerClassification;
  overallResult: InspectionStatus;
  overallSummary: string;
  overallActionItems: string;
  mode: 'standard-rule-engine';
  notice: string;
} {
  const criteria = generateStandardCriteriaEvaluations(data);
  const hasFail = criteria.some((c) => c.status === 'fail');
  const hasWarning = criteria.some((c) => c.status === 'warning');
  const isTankDamaged = Boolean(data.tankDamaged);

  let overallClassification: TransformerClassification = 'หม้อแปลงดี';
  let overallResult: InspectionStatus = 'pass';
  let overallSummary = '';
  let overallActionItems = '';

  if (isTankDamaged) {
    overallClassification = 'หม้อแปลงชำรุดหนักเห็นควรจำหน่าย';
    overallResult = 'segregate';
    overallSummary = 'ตัวถังหม้อแปลงชำรุดเสียหายร้ายแรงตามเกณฑ์ที่ 1 เข้าข่ายชำรุดหนักไม่คุ้มซ่อมแซม';
    overallActionItems = 'ปลดสับเปลี่ยนหม้อแปลงทันที และแต่งตั้งคณะกรรมการจำหน่ายพัสดุตามข้อ 3.6.1';
  } else if (hasFail) {
    overallClassification = 'หม้อแปลงชำรุดหนัก';
    overallResult = 'corrective';
    const failedCriteria = criteria.filter((c) => c.status === 'fail').map((c) => c.category).join(', ');
    overallSummary = `ไม่ผ่านเกณฑ์มาตรฐานในด้าน: ${failedCriteria} ต้องได้รับการแก้ไขทางวิศวกรรมก่อนจ่ายไฟ`;
    overallActionItems = criteria.filter((c) => c.status === 'fail').map((c) => c.aiRecommendation).join(' | ');
  } else if (hasWarning) {
    overallClassification = 'หม้อแปลงชำรุดเล็กน้อย';
    overallResult = 'warning';
    const warningCriteria = criteria.filter((c) => c.status === 'warning').map((c) => c.category).join(', ');
    overallSummary = `หม้อแปลงจ่ายไฟได้ปกติ แต่พบข้อเฝ้าระวังในด้าน: ${warningCriteria} ตามมาตรฐาน กฟภ.`;
    overallActionItems = criteria.filter((c) => c.status === 'warning').map((c) => c.aiRecommendation).join(' | ');
  } else {
    overallClassification = 'หม้อแปลงดี';
    overallResult = 'pass';
    overallSummary = 'หม้อแปลงผ่านเกณฑ์มาตรฐาน กฟภ. พ.ศ. 2568 ครบทั้ง 6 ด้าน พร้อมจ่ายไฟฟ้าอย่างปลอดภัย';
    overallActionItems = 'ดำเนินการบำรุงรักษาตามวาระรอบปกติ (PM ประจำปี)';
  }

  return {
    criteria,
    overallClassification,
    overallResult,
    overallSummary,
    overallActionItems,
    mode: 'standard-rule-engine',
    notice: 'ประเมินผลตามระเบียบมาตรฐาน กฟภ. พ.ศ. 2568 ครบ 6 เกณฑ์เรียบร้อย',
  };
}

/**
 * เรียก API เซิร์ฟเวอร์ `/api/gemini/evaluate-criteria` เพื่อให้โมเดล Gemini AI
 * คิดสรุปผลและข้อเสนอแนะแยกตามแต่ละเกณฑ์ตามระเบียบมาตรฐาน กฟภ.
 * พร้อม Fallback ไปยังฟังก์ชันมาตรฐานแบบไม่ผิดพลาดและเสถียร 100%
 */
export async function evaluateCriteriaWithAiApi(
  data: Partial<InspectionRecord>
): Promise<{
  criteria: EvaluationCriterion[];
  overallClassification: TransformerClassification;
  overallResult: InspectionStatus;
  overallSummary: string;
  overallActionItems: string;
  mode?: string;
  notice?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('/api/gemini/evaluate-criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspection: data }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.criteria) && json.criteria.length > 0) {
        // Enforce lock flag
        const lockedCriteria = json.criteria.map((c: EvaluationCriterion) => ({
          ...c,
          isAiLocked: true,
        }));

        return {
          criteria: lockedCriteria,
          overallClassification: json.overallClassification || 'หม้อแปลงดี',
          overallResult: json.overallResult || 'pass',
          overallSummary: json.overallSummary || '',
          overallActionItems: json.overallActionItems || '',
          mode: json.mode || 'gemini',
          notice: json.notice,
        };
      }
    }
  } catch (err) {
    console.warn('Gemini server evaluation API error or offline/timeout, falling back to local standard rule engine:', err);
  }

  // Fallback to local standard evaluation
  return evaluateCriteriaWithStandardRules(data);
}
