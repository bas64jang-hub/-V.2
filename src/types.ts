export type OperationalStatus = 'normal' | 'warning' | 'critical' | 'maintenance' | 'offline';

export interface LineCutout {
  id: string; // e.g. "BGA02VF-158"
  name: string; // e.g. "อุปกรณ์ป้องกันแรงสูง BGA02VF-158 (สายแยกห้วยกาน)"
  poleId: string; // e.g. "1000001430"
  feeder: string; // e.g. "ฟีดเดอร์ BGA02"
  area: string; // e.g. "กฟส.บ้านโฮ่ง จ.ลำพูน"
  voltage: number; // 22 or 33 (kV)
  installedFuse: string; // e.g. "25T"
  fuseType: 'T' | 'K';
  status: OperationalStatus;
  lat?: string;
  lng?: string;
  diversityFactor?: number; // e.g. 0.80
  multiplier?: number; // e.g. 1.75
  notes?: string;
  customTargetLoadKva?: number;
  transformerIds?: string[];
}

export interface LineCutoutRecord {
  id: string; // e.g. "LCR-68-001"
  cutoutId: string; // e.g. "BGA02VF-158"
  cutoutName: string;
  poleId: string;
  feeder: string;
  voltage: number;
  recordedAt: number;
  recordedDate: string;
  recordedTime: string;
  engineerName: string;
  installedFuseBefore: string;
  recommendedFuse: string;
  installedFuseAfter?: string;
  statusVsInstalled: 'undersized' | 'optimal' | 'oversized';
  totalTransformersCount: number;
  totalConnectedKva: number;
  totalLoadKva: number;
  actualLoadCurrent: number;
  sizingCurrent: number;
  diversityFactor: number;
  multiplier: number;
  fuseType: 'T' | 'K';
  actionType: 'calculation_audit' | 'fuse_replacement' | 'routine_survey' | 'emergency_repair';
  notes?: string;
}

export interface QuickFieldLog {
  id: string;
  targetType: 'transformer' | 'linecutout';
  targetId: string;
  targetName: string;
  poleId: string;
  timestamp: number;
  dateText: string;
  timeText: string;
  engineerName: string;
  currentA?: number;
  currentB?: number;
  currentC?: number;
  currentN?: number;
  voltageAvg?: number;
  loadKva?: number;
  loadPercent?: number;
  tempC?: number;
  oilPercent?: number;
  installedFuse?: string;
  status: OperationalStatus;
  notes?: string;
}

export interface Transformer {
  id: string;
  name: string;
  area: string;
  kva: number;
  loadKva: number;
  loadKw: number;
  percent: number;
  voltage: string;
  pf: string;
  fuse: string;
  mccb: string;
  lat: string;
  lng: string;
  poleId: string;
  mountType: string;
  status: OperationalStatus;
  note?: string;
  isNew?: boolean;
  windingTemp?: number;
  oilLevel?: number;
  altitude?: string;
  lineCutoutId?: string;
  lineCutoutName?: string;
  // Rich Electrical, Telemetry & Testing Parameters
  phase?: number;
  currentA?: number;
  currentB?: number;
  currentC?: number;
  currentN?: number;
  voltageAN?: number;
  voltageBN?: number;
  voltageCN?: number;
  voltageAB?: number;
  voltageBC?: number;
  voltageCA?: number;
  insulationHV_LV?: number;
  insulationHV_G?: number;
  insulationLV_G?: number;
  oilBDV?: number;
  groundResistance?: number;
  manufacturer?: string;
  serialNo?: string;
  gisId?: string;
  mfgYear?: string;
  unbalancePercent?: number;
  complianceStatus?: 'pass' | 'warning' | 'fail';
  recommendation?: string;
}

export type UserRole = 'guest' | 'admin' | 'superadmin';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccountRecord {
  id: number | string;
  empid: string;
  name: string;
  role: string;
  position: string;
  dept: string;
  status: RequestStatus;
  reason: string;
  timeText: string;
  pass: string;
  otp: string;
  email?: string;
  avatar?: string;
  provider?: 'pea' | 'google';
  approvedAt?: string;
  approvedBy?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PeaMatrixRow {
  kva: number;
  fla22: number;
  fuse22: string;
  fla33: number;
  fuse33: string;
  sec400: number;
  mccb: string;
  note: string;
}

export type NavTab = 'landing' | 'dashboard' | 'detail' | 'linecutout' | 'calculator' | 'admin' | 'inspection' | 'incidents';

export type InspectionStatus = 'pass' | 'warning' | 'corrective' | 'segregate';

export type TransformerClassification =
  | 'หม้อแปลงดี'
  | 'หม้อแปลงชำรุดเล็กน้อย'
  | 'หม้อแปลงชำรุดหนัก'
  | 'หม้อแปลงชำรุดหนักเห็นควรจำหน่าย';

export interface EvaluationCriterion {
  id: string; // 'visual' | 'grounding' | 'insulation' | 'oil' | 'winding' | 'load'
  name: string;
  category: string;
  standardBenchmark: string;
  measuredSummary: string;
  status: 'pass' | 'warning' | 'fail';
  aiSummary: string; // ผลสรุปการวิเคราะห์โดย AI ตามเกณฑ์มาตรฐาน (ล็อก ไม่ให้เปลี่ยนแปลงได้)
  aiRecommendation: string; // ข้อเสนอแนะและงานแก้ไขโดย AI ตามเกณฑ์มาตรฐาน (ล็อก ไม่ให้เปลี่ยนแปลงได้)
  evaluatedAt?: string;
  isAiLocked: boolean;
}

export type VisualCheckStatus = 'good' | 'warning' | 'defect' | 'na';

export interface VisualCheckItem {
  id: string;
  name: string;
  category: string;
  status: VisualCheckStatus;
  remark?: string;
}

export interface VoltageRatioTapData {
  tap: number;
  v1Supply: number;
  v2a: number;
  v2b: number;
  v2c: number;
  measuredRatioA?: number;
  measuredRatioB?: number;
  measuredRatioC?: number;
  errorPercentA?: number;
  errorPercentB?: number;
  errorPercentC?: number;
  status?: 'pass' | 'fail';
}

export interface CircuitCurrentTest {
  phaseA: number; // Amperes
  phaseB: number;
  phaseC: number;
  unbalancePercent: number;
  status: 'pass' | 'fail';
}

export interface WindingResistance {
  h1h2?: number; // mΩ or Ω
  h2h3?: number;
  h3h1?: number;
  x1x2?: number;
  x2x3?: number;
  x3x1?: number;
  unbalanceHvPercent?: number;
  unbalanceLvPercent?: number;
}

export interface InsulationResistance {
  testVoltage: string; // '1000V' | '2500V' | '5000V'
  hvGround1Min?: number; // MΩ
  hvGround10Min?: number; // MΩ
  polarizationIndex?: number; // R10min / R1min
  lvGround1Min?: number; // MΩ
  hvLv1Min?: number; // MΩ
  ambientTempC?: number;
  humidityPercent?: number;
}

export interface OilTestBdv {
  shot1?: number; // kV
  shot2?: number;
  shot3?: number;
  shot4?: number;
  shot5?: number;
  shot6?: number;
  averageKv?: number;
  oilColor?: string; // e.g. '0.5 เหลืองอ่อนใส', '1.0 เหลือง', '2.0 ส้ม', etc.
  appearance?: string; // 'ใสไร้ตะกอน', 'มีตะกอนปนเปื้อน', 'มีกลิ่นไหม้'
  moisturePpm?: number;
}

export interface GroundTest {
  surgeArresterGroundOhm?: number; // ≤ 5 Ω
  lvNeutralGroundOhm?: number; // ≤ 5 Ω
  tankGroundOhm?: number;
  groundRodCondition?: 'good' | 'loose' | 'corroded' | 'missing';
}

export interface LoadMeasurement {
  vAb?: number;
  vBc?: number;
  vCa?: number;
  vAn?: number;
  vBn?: number;
  vCn?: number;
  iA?: number;
  iB?: number;
  iC?: number;
  iNeutral?: number;
  currentUnbalancePercent?: number;
  calculatedLoadKva?: number;
  loadPercent?: number;
}

export interface InspectionRecord {
  id: string; // e.g. "INS-2025-001" or timestamp
  docNumber: string; // Form number: "ข-2 มป.11-ป.68"
  transformerId: string; // e.g. "TR41-001773"
  transformerName: string;
  poleId: string;
  feeder: string;
  substationArea: string; // e.g. "กฟส.บ้านโฮ่ง จ.ลำพูน"
  brand: string;
  serialNo: string;
  ratedKva: number;
  hvVoltageKv: number; // 22 or 33
  lvVoltageV: number; // 400 or 460
  phase: string; // '3 Phase 4 Wires' | '1 Phase 3 Wires' | '1 Phase 2 Wires'
  vectorGroup: string; // 'Dyn11' | 'Ynd11' | 'I0'
  impedanceZPercent?: number;
  tapPosition: string; // e.g. '3 (0%)'
  mfgYear?: string;
  
  inspectionDate: string; // YYYY-MM-DD
  inspectionTime?: string; // HH:MM
  purpose: 'routine_pm' | 'pre_commission' | 'post_fault' | 'segregation_repair';
  purposeDetail?: string;
  
  // Test Sections
  visualChecks: VisualCheckItem[];
  insulationTest: InsulationResistance;
  oilTest: OilTestBdv;
  voltageRatioTaps?: VoltageRatioTapData[];
  shortCircuitTest?: CircuitCurrentTest;
  openCircuitTest?: CircuitCurrentTest;
  groundTest: GroundTest;
  windingResistance: WindingResistance;
  loadMeasurement: LoadMeasurement;
  
  // Physical Tank Check
  tankDamaged?: boolean;
  tankDamageNotes?: string;

  // Evaluation & Action
  overallResult: InspectionStatus;
  classification?: TransformerClassification;
  summaryNotes: string;
  actionItems: string;
  workOrderNo?: string;
  criteriaEvaluations?: EvaluationCriterion[];
  
  // Signatures
  inspectorName: string;
  inspectorPosition: string;
  inspectorDept: string;
  approverName: string;
  approverPosition: string;
  approvedDate?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
  isSimulated?: boolean;
}

export interface NearbyTransformer extends Transformer {
  distanceKm: number;
  distanceFormatted: string;
}

export type IncidentCause =
  | 'fuse_blown_lightning' // ฟิวส์แรงสูงขาดจากฟ้าผ่า / Overvoltage Surge
  | 'fuse_blown_overload' // โหลดเกินพิกัด (Overload Trip)
  | 'fuse_blown_tree' // กิ่งไม้พาดสาย / สัมผัสสาย (Tree Contact)
  | 'fuse_blown_animal' // สัตว์แตะสายไฟ / งู / กระรอก (Animal Contact)
  | 'fuse_aged' // ฟิวส์เสื่อมสภาพตามอายุการใช้งาน (Aging / Fatigue)
  | 'short_circuit_lv' // ลัดวงจรฝั่งแรงต่ำ (Secondary Short Circuit)
  | 'arrester_fault' // กับดักฟ้าผ่าชำรุด (Surge Arrester Failed)
  | 'other'; // เหตุอื่นๆ

export type IncidentResolutionStatus =
  | 'resolved_standard' // แก้ไขเสร็จสิ้น - ฟิวส์ตรงมาตรฐาน
  | 'pending_standard_replacement' // แก้ไขชั่วคราว - ฟิวส์ไม่ตรงมาตรฐาน (รอเปลี่ยนให้ตรงมาตรฐานในงานซ่อมแซมครั้งต่อไป)
  | 'scheduled_followup'; // นัดหมายติดตามผลเพิ่มเติม

export interface TransformerIncidentLog {
  id: string; // e.g. "INC-2025-001"
  transformerId: string; // e.g. "TR41-001773"
  transformerName: string;
  poleId: string;
  area: string;
  feeder?: string;
  transformerKva: number;
  voltageKv: number; // 22 or 33
  
  // วันที่/เวลา และ ผู้ปฏิบัติงาน
  incidentDate: string; // YYYY-MM-DD
  incidentTime: string; // HH:MM
  linemanName: string; // ชื่อช่าง/ผู้ปฏิบัติงาน
  linemanEmpId?: string; // รหัสพนักงาน กฟภ.
  crewDept: string; // สังกัด/แผนกปฏิบัติการ
  ticketNumber?: string; // เลขที่ใบสั่งงาน / เลขที่แจ้งเหตุ
  
  // สาเหตุและรายงานเหตุการณ์
  cause: IncidentCause;
  causeLabel: string;
  causeDetail: string; // รายละเอียดเหตุการณ์
  symptoms: string; // อาการที่ตรวจพบหน้างาน
  actionTaken: string; // งานที่ได้ดำเนินการแก้ไข
  
  // การจัดการฟิวส์ (เดิม vs เปลี่ยนใหม่ vs มาตรฐาน)
  originalFuse: string; // ขนาดฟิวส์เดิมของหม้อแปลงเครื่องนี้ (เช่น "6T", "25T")
  standardFuse: string; // ขนาดฟิวส์มาตรฐาน กฟภ. แนะนำตามขนาด kVA และแรงดัน (เช่น "6T", "25T")
  newFuseInstalled: string; // ขนาดฟิวส์ที่เปลี่ยนใหม่หน้างาน (เช่น "15T", "25T", etc.)
  fuseType?: 'T' | 'K';
  
  // ผลการตรวจสอบความตรงกันของระบบ (System Automated Verification)
  isFuseMatchOriginal: boolean; // ตรงกับฟิวส์เดิมหรือไม่
  isFuseMatchStandard: boolean; // ตรงกับมาตรฐาน กฟภ. หรือไม่
  
  // คำเตือนและข้อกำหนดสำหรับงานซ่อมแซมในอนาคต
  verificationStatus: 'match' | 'mismatch_warning';
  verificationMessage: string;
  futureActionNotice?: string; // ข้อความแสดงว่าในอนาคตเมื่อมาซ่อมแซมให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน
  
  // ข้อมูลวัดซ้ำหลังจ่ายไฟ
  loadAmpAfter?: number;
  voltageAfter?: number;
  status: IncidentResolutionStatus;
  
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
