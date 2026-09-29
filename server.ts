import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_TRANSFORMERS, DEFAULT_ACCOUNTS, INITIAL_AUDIT_LOGS } from './src/data/defaultData';
import { INITIAL_INSPECTIONS } from './src/data/defaultInspections';
import { INITIAL_LINE_CUTOUT_RECORDS } from './src/data/defaultLineCutoutRecords';
import { INITIAL_TRANSFORMER_INCIDENTS } from './src/data/defaultIncidents';
import { Transformer, AccountRecord, AuditLogItem, InspectionRecord, LineCutoutRecord, QuickFieldLog, TransformerIncidentLog } from './src/types';
import { generateStandardCriteriaEvaluations } from './src/lib/peaEvaluationCriteria';

interface DatabaseSchema {
  transformers: Transformer[];
  accounts: AccountRecord[];
  auditLogs: AuditLogItem[];
  inspections: InspectionRecord[];
  lineCutoutRecords?: LineCutoutRecord[];
  quickFieldLogs?: QuickFieldLog[];
  transformerIncidents?: TransformerIncidentLog[];
  lastUpdated: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read data
function readData(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transformers) && parsed.transformers.length > 0) {
        const validIds = new Set(DEFAULT_TRANSFORMERS.map(t => t.id));
        const filteredTransformers = parsed.transformers.filter((t: Transformer) => validIds.has(t.id));
        const finalTransformers = filteredTransformers.length === DEFAULT_TRANSFORMERS.length ? filteredTransformers : DEFAULT_TRANSFORMERS;
        return {
          transformers: finalTransformers,
          accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : DEFAULT_ACCOUNTS,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_AUDIT_LOGS,
          inspections: Array.isArray(parsed.inspections) && parsed.inspections.length > 0 ? parsed.inspections : INITIAL_INSPECTIONS,
          lineCutoutRecords: Array.isArray(parsed.lineCutoutRecords) ? parsed.lineCutoutRecords : INITIAL_LINE_CUTOUT_RECORDS,
          quickFieldLogs: Array.isArray(parsed.quickFieldLogs) ? parsed.quickFieldLogs : [],
          transformerIncidents: Array.isArray(parsed.transformerIncidents) && parsed.transformerIncidents.length > 0 ? parsed.transformerIncidents : INITIAL_TRANSFORMER_INCIDENTS,
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
  }

  // Seed default data
  const initialData: DatabaseSchema = {
    transformers: DEFAULT_TRANSFORMERS,
    accounts: DEFAULT_ACCOUNTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    inspections: INITIAL_INSPECTIONS,
    lineCutoutRecords: INITIAL_LINE_CUTOUT_RECORDS,
    quickFieldLogs: [],
    transformerIncidents: INITIAL_TRANSFORMER_INCIDENTS,
    lastUpdated: Date.now(),
  };
  writeData(initialData);
  return initialData;
}

// Helper to write data
function writeData(data: DatabaseSchema): void {
  try {
    data.lastUpdated = Date.now();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS / Cache control for API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // 1. Health check & Sync Version API
  app.get('/api/health', (req, res) => {
    const data = readData();
    res.json({ status: 'ok', lastUpdated: data.lastUpdated });
  });

  app.get('/api/sync/status', (req, res) => {
    const data = readData();
    res.json({
      lastUpdated: data.lastUpdated,
      count: data.transformers.length,
      accountsCount: data.accounts.length,
    });
  });

  // 2. Transformers Endpoints
  app.get('/api/transformers', (req, res) => {
    const data = readData();
    res.json({
      data: data.transformers,
      lastUpdated: data.lastUpdated,
    });
  });

  // Bulk save or update transformers list
  app.post('/api/transformers', (req, res) => {
    const { transformers } = req.body;
    if (!Array.isArray(transformers)) {
      return res.status(400).json({ error: 'Expected array of transformers' });
    }
    const current = readData();
    current.transformers = transformers;
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Save/Update a single transformer
  app.put('/api/transformers/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body as Partial<Transformer>;
    const current = readData();
    const idx = current.transformers.findIndex(t => t.id.toLowerCase() === id.toLowerCase());

    if (idx >= 0) {
      current.transformers[idx] = { ...current.transformers[idx], ...updateData };
    } else {
      current.transformers.push(updateData as Transformer);
    }

    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Delete a transformer
  app.delete('/api/transformers/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    current.transformers = current.transformers.filter(t => t.id.toLowerCase() !== id.toLowerCase());
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Reset transformers to default
  app.post('/api/transformers/reset', (req, res) => {
    const current = readData();
    current.transformers = DEFAULT_TRANSFORMERS;
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // 3. Accounts Endpoints
  app.get('/api/accounts', (req, res) => {
    const data = readData();
    res.json({ data: data.accounts, lastUpdated: data.lastUpdated });
  });

  // Add / Request account
  app.post('/api/accounts', (req, res) => {
    const newAccount = req.body as AccountRecord;
    if (!newAccount || !newAccount.empid) {
      return res.status(400).json({ error: 'Invalid account data' });
    }
    const current = readData();
    const idx = current.accounts.findIndex(
      a => a.empid.toLowerCase() === newAccount.empid.toLowerCase() || a.id === newAccount.id
    );

    if (idx >= 0) {
      current.accounts[idx] = { ...current.accounts[idx], ...newAccount };
    } else {
      current.accounts.push(newAccount);
    }

    writeData(current);
    res.json({ success: true, data: current.accounts, lastUpdated: current.lastUpdated });
  });

  // Update account (approve, reject, grant temporary, etc.)
  app.put('/api/accounts/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body as Partial<AccountRecord>;
    const current = readData();
    const idx = current.accounts.findIndex(a => String(a.id) === String(id) || a.empid.toLowerCase() === id.toLowerCase());

    if (idx >= 0) {
      current.accounts[idx] = { ...current.accounts[idx], ...updates };
      writeData(current);
      return res.json({ success: true, account: current.accounts[idx], lastUpdated: current.lastUpdated });
    }
    res.status(404).json({ error: 'Account not found' });
  });

  // Delete / Revoke account
  app.delete('/api/accounts/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    current.accounts = current.accounts.filter(a => String(a.id) !== String(id) && a.empid.toLowerCase() !== id.toLowerCase());
    writeData(current);
    res.json({ success: true, data: current.accounts, lastUpdated: current.lastUpdated });
  });

  // 4. Audit Logs Endpoints
  app.get('/api/audit-logs', (req, res) => {
    const data = readData();
    res.json({ data: data.auditLogs, lastUpdated: data.lastUpdated });
  });

  app.post('/api/audit-logs', (req, res) => {
    const { message, type } = req.body;
    const current = readData();
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: 'เมื่อสักครู่',
      message: message || 'บันทึกรายการ',
      type: type || 'info',
    };
    current.auditLogs = [newLog, ...current.auditLogs.slice(0, 49)];
    writeData(current);
    res.json({ success: true, data: current.auditLogs, lastUpdated: current.lastUpdated });
  });

  // 5. Inspections Endpoints (Form ข-2 มป.11-ป.68)
  app.get('/api/inspections', (req, res) => {
    const data = readData();
    res.json({ data: data.inspections || [], lastUpdated: data.lastUpdated });
  });

  app.post('/api/inspections', (req, res) => {
    const record = req.body as InspectionRecord;
    if (!record || !record.id) {
      return res.status(400).json({ error: 'Invalid inspection record data' });
    }
    const current = readData();
    if (!current.inspections) current.inspections = [];
    const idx = current.inspections.findIndex(ins => ins.id === record.id);
    if (idx >= 0) {
      current.inspections[idx] = { ...current.inspections[idx], ...record, updatedAt: Date.now() };
    } else {
      current.inspections.unshift({ ...record, createdAt: record.createdAt || Date.now(), updatedAt: Date.now() });
    }
    writeData(current);
    res.json({ success: true, data: current.inspections, lastUpdated: current.lastUpdated });
  });

  app.put('/api/inspections/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body as Partial<InspectionRecord>;
    const current = readData();
    if (!current.inspections) current.inspections = [];
    const idx = current.inspections.findIndex(ins => ins.id === id);
    if (idx >= 0) {
      current.inspections[idx] = { ...current.inspections[idx], ...updates, updatedAt: Date.now() };
      writeData(current);
      return res.json({ success: true, data: current.inspections[idx], lastUpdated: current.lastUpdated });
    }
    res.status(404).json({ error: 'Inspection record not found' });
  });

  app.delete('/api/inspections/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    if (!current.inspections) current.inspections = [];
    current.inspections = current.inspections.filter(ins => ins.id !== id);
    writeData(current);
    res.json({ success: true, data: current.inspections, lastUpdated: current.lastUpdated });
  });

  app.post('/api/inspections/reset', (req, res) => {
    const current = readData();
    current.inspections = INITIAL_INSPECTIONS;
    writeData(current);
    res.json({ success: true, data: current.inspections, lastUpdated: current.lastUpdated });
  });

  // 6. Line Cutout Records Endpoints
  app.get('/api/line-cutout-records', (req, res) => {
    const data = readData();
    res.json({ data: data.lineCutoutRecords || [], lastUpdated: data.lastUpdated });
  });

  app.post('/api/line-cutout-records', (req, res) => {
    const record = req.body as LineCutoutRecord;
    if (!record || !record.id) {
      return res.status(400).json({ error: 'Invalid line cutout record' });
    }
    const current = readData();
    if (!current.lineCutoutRecords) current.lineCutoutRecords = [];
    const idx = current.lineCutoutRecords.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      current.lineCutoutRecords[idx] = { ...current.lineCutoutRecords[idx], ...record };
    } else {
      current.lineCutoutRecords.unshift(record);
    }
    writeData(current);
    res.json({ success: true, data: current.lineCutoutRecords, lastUpdated: current.lastUpdated });
  });

  app.delete('/api/line-cutout-records/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    if (!current.lineCutoutRecords) current.lineCutoutRecords = [];
    current.lineCutoutRecords = current.lineCutoutRecords.filter(r => r.id !== id);
    writeData(current);
    res.json({ success: true, data: current.lineCutoutRecords, lastUpdated: current.lastUpdated });
  });

  // 7. Quick Field Logs Endpoints
  app.get('/api/quick-field-logs', (req, res) => {
    const data = readData();
    res.json({ data: data.quickFieldLogs || [], lastUpdated: data.lastUpdated });
  });

  app.post('/api/quick-field-logs', (req, res) => {
    const log = req.body as QuickFieldLog;
    if (!log || !log.id) {
      return res.status(400).json({ error: 'Invalid quick field log' });
    }
    const current = readData();
    if (!current.quickFieldLogs) current.quickFieldLogs = [];
    current.quickFieldLogs = [log, ...current.quickFieldLogs.slice(0, 49)];
    writeData(current);
    res.json({ success: true, data: current.quickFieldLogs, lastUpdated: current.lastUpdated });
  });

  app.delete('/api/quick-field-logs/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    if (!current.quickFieldLogs) current.quickFieldLogs = [];
    current.quickFieldLogs = current.quickFieldLogs.filter(l => l.id !== id);
    writeData(current);
    res.json({ success: true, data: current.quickFieldLogs, lastUpdated: current.lastUpdated });
  });

  // 8. Transformer Incident & Fuse Replacement Logs Endpoints
  app.get('/api/transformer-incidents', (req, res) => {
    const data = readData();
    res.json({ data: data.transformerIncidents || [], lastUpdated: data.lastUpdated });
  });

  app.post('/api/transformer-incidents', (req, res) => {
    const record = req.body as TransformerIncidentLog;
    if (!record || !record.id) {
      return res.status(400).json({ error: 'Invalid incident record' });
    }
    const current = readData();
    if (!current.transformerIncidents) current.transformerIncidents = [];
    const idx = current.transformerIncidents.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      current.transformerIncidents[idx] = { ...current.transformerIncidents[idx], ...record, updatedAt: Date.now() };
    } else {
      current.transformerIncidents.unshift({ ...record, createdAt: record.createdAt || Date.now(), updatedAt: Date.now() });
    }
    writeData(current);
    res.json({ success: true, data: current.transformerIncidents, lastUpdated: current.lastUpdated });
  });

  app.delete('/api/transformer-incidents/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    if (!current.transformerIncidents) current.transformerIncidents = [];
    current.transformerIncidents = current.transformerIncidents.filter(r => r.id !== id);
    writeData(current);
    res.json({ success: true, data: current.transformerIncidents, lastUpdated: current.lastUpdated });
  });

  // 9. Gemini AI Evaluation Endpoint for PEA Criteria (Server-Side using @google/genai)
  app.post('/api/gemini/evaluate-criteria', async (req, res) => {
    const inspection = (req.body?.inspection as Partial<InspectionRecord>) || {};
    const standardCriteria = generateStandardCriteriaEvaluations(inspection);

    function computeFallbackResult() {
      const hasFail = standardCriteria.some((c) => c.status === 'fail');
      const hasWarning = standardCriteria.some((c) => c.status === 'warning');
      const isTankDamaged = Boolean(inspection.tankDamaged);

      let overallClassification = 'หม้อแปลงดี';
      let overallResult: 'pass' | 'warning' | 'corrective' | 'segregate' = 'pass';
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
        const failedCriteria = standardCriteria.filter((c) => c.status === 'fail').map((c) => c.category).join(', ');
        overallSummary = `ไม่ผ่านเกณฑ์มาตรฐานในด้าน: ${failedCriteria} ต้องได้รับการแก้ไขทางวิศวกรรมก่อนจ่ายไฟ`;
        overallActionItems = standardCriteria.filter((c) => c.status === 'fail').map((c) => c.aiRecommendation).join(' | ');
      } else if (hasWarning) {
        overallClassification = 'หม้อแปลงชำรุดเล็กน้อย';
        overallResult = 'warning';
        const warningCriteria = standardCriteria.filter((c) => c.status === 'warning').map((c) => c.category).join(', ');
        overallSummary = `หม้อแปลงจ่ายไฟได้ปกติ แต่พบข้อเฝ้าระวังในด้าน: ${warningCriteria} ตามมาตรฐาน กฟภ.`;
        overallActionItems = standardCriteria.filter((c) => c.status === 'warning').map((c) => c.aiRecommendation).join(' | ');
      } else {
        overallClassification = 'หม้อแปลงดี';
        overallResult = 'pass';
        overallSummary = 'หม้อแปลงผ่านเกณฑ์มาตรฐาน กฟภ. พ.ศ. 2568 ครบทั้ง 6 ด้าน พร้อมจ่ายไฟฟ้าอย่างปลอดภัย';
        overallActionItems = 'ดำเนินการบำรุงรักษาตามวาระรอบปกติ (PM ประจำปี)';
      }

      return {
        criteria: standardCriteria,
        overallClassification,
        overallResult,
        overallSummary,
        overallActionItems,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = computeFallbackResult();
      return res.json({
        success: true,
        ...fallback,
        mode: 'standard-rule-engine',
        notice: 'ประเมินผลด้วยระบบเกณฑ์มาตรฐาน กฟภ. 2568 (PEA Distribution Standard Engine) สำเร็จ 100%',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `คุณคือวิศวกรผู้เชี่ยวชาญการบำรุงรักษาหม้อแปลงระบบจำหน่ายของการไฟฟ้าส่วนภูมิภาค (กฟภ.)
กรุณาวิเคราะห์ผลการตรวจสอบและทดสอบหม้อแปลงตามแบบฟอร์ม ข-2 มป.11-ป.68 และระเบียบ กฟภ. ปี 2568 อย่างเคร่งครัด
โดยต้องแยกการประเมินออกเป็น 6 เกณฑ์มาตรฐาน และสำหรับแต่ละเกณฑ์ ให้สรุปผล (aiSummary) และให้ข้อเสนอแนะเชิงวิศวกรรมที่นำไปปฏิบัติได้จริง (aiRecommendation) โดยอ้างอิงระเบียบ กฟภ.

ข้อมูลหม้อแปลงที่ตรวจวัดได้หน้างาน:
- รหัสหม้อแปลง: ${inspection.transformerId || 'TR41-001773'} พิกัด: ${inspection.ratedKva || 100} kVA แรงดัน: ${inspection.hvVoltageKv || 22} kV
- สภาพตัวถัง: ${inspection.tankDamaged ? 'ชำรุดเสียหาย/บวม' : 'ปกติ'}
- การตรวจสภาพภายนอก 15 ข้อ: ปกติ ${inspection.visualChecks?.filter((v) => v.status === 'good').length || 0}, เฝ้าระวัง ${inspection.visualChecks?.filter((v) => v.status === 'warning').length || 0}, ชำรุด ${inspection.visualChecks?.filter((v) => v.status === 'defect').length || 0}
- ค่าความต้านทานดิน: ล่อฟ้า = ${inspection.groundTest?.surgeArresterGroundOhm || 'N/A'} Ω (เกณฑ์ ≤5.0 Ω), นิวทรัล = ${inspection.groundTest?.lvNeutralGroundOhm || 'N/A'} Ω (เกณฑ์ ≤2.0 Ω)
- ค่าความต้านทานฉนวน: HV-G (1min) = ${inspection.insulationTest?.hvGround1Min || 'N/A'} MΩ, P.I. = ${inspection.insulationTest?.polarizationIndex || 'N/A'} (เกณฑ์ ≥1.5), อุณหภูมิ = ${inspection.insulationTest?.ambientTempC || 30}°C
- ค่าน้ำมันหม้อแปลง: BDV เฉลี่ย = ${inspection.oilTest?.averageKv || 'N/A'} kV (เกณฑ์ ≥30.0 kV), สี = ${inspection.oilTest?.oilColor || 'N/A'}, ลักษณะ = ${inspection.oilTest?.appearance || 'N/A'}
- ความต้านทานขดลวด: % Unbalance HV = ${inspection.windingResistance?.unbalanceHvPercent || 'N/A'}%, LV = ${inspection.windingResistance?.unbalanceLvPercent || 'N/A'}% (เกณฑ์ ≤2-3%)
- ภาระโหลด: % Load = ${inspection.loadMeasurement?.loadPercent || 'N/A'}% (เกณฑ์ 30%-80%), % Current Unbalance = ${inspection.loadMeasurement?.currentUnbalancePercent || 'N/A'}% (เกณฑ์ ≤20%)

ให้ตอบกลับเป็น JSON ที่มีโครงสร้างดังนี้:
{
  "criteria": [
    {
      "id": "visual",
      "name": "เกณฑ์ที่ 1: การตรวจสภาพภายนอกและโครงสร้างกายภาพ (Visual & Mechanical)",
      "category": "โครงสร้างและตัวถัง",
      "standardBenchmark": "แบบฟอร์ม มป.11 ข้อ 1-15: อุปกรณ์ภายนอก ครีบระบายความร้อน บุชชิ่ง HV/LV ซีลยาง และระบบดูดความชื้นสมบูรณ์",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "สรุปผลการประเมินทางวิศวกรรมเฉพาะเกณฑ์นี้...",
      "aiRecommendation": "ข้อเสนอแนะและมาตรการแก้ไขเฉพาะเกณฑ์นี้ อ้างอิงระเบียบ กฟภ...."
    },
    {
      "id": "grounding",
      "name": "เกณฑ์ที่ 2: ระบบต่อลงดินและอุปกรณ์ป้องกันฟ้าผ่า (Grounding & Surge Protection)",
      "category": "ระบบดินและป้องกันฟ้าผ่า",
      "standardBenchmark": "ระเบียบ กฟภ. ข้อ 2.4.3: ความต้านทานดินเสิร์จอาร์เรสเตอร์ ≤ 5.0 Ω, ดินรวมสายนิวทรัลแรงต่ำ ≤ 2.0 Ω",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "...",
      "aiRecommendation": "..."
    },
    {
      "id": "insulation",
      "name": "เกณฑ์ที่ 3: ความเป็นฉนวนไฟฟ้าและดัชนีโพลาไรเซชัน (Insulation & Polarization Index)",
      "category": "ฉนวนไฟฟ้า",
      "standardBenchmark": "ระเบียบ กฟภ. ข้อ 2.1.2: ค่าความต้านทานฉนวน HV-G เทียบอุณหภูมิ, ค่า P.I. ≥ 1.50",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "...",
      "aiRecommendation": "..."
    },
    {
      "id": "oil",
      "name": "เกณฑ์ที่ 4: ความคงทนทางไฟฟ้าของฉนวนน้ำมัน (Oil Breakdown Voltage - BDV)",
      "category": "น้ำมันหม้อแปลง",
      "standardBenchmark": "ระเบียบ กฟภ. ข้อ 2.1.3 และ IEC 60156: ค่าเฉลี่ย BDV ≥ 30.0 kV / 2.5 มม.",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "...",
      "aiRecommendation": "..."
    },
    {
      "id": "winding",
      "name": "เกณฑ์ที่ 5: ความต้านทานขดลวดไฟฟ้าและความสมดุล (Winding Resistance & Balance)",
      "category": "ขดลวดไฟฟ้า",
      "standardBenchmark": "ภาคผนวก ข-2: ความไม่สมดุลของความต้านทานขดลวดระหว่างเฟส ≤ 2.0% - 3.0%",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "...",
      "aiRecommendation": "..."
    },
    {
      "id": "load",
      "name": "เกณฑ์ที่ 6: ภาระโหลดและการจ่ายพลังงานไฟฟ้า (Load Profile & Current Balance)",
      "category": "ภาระโหลดและสมดุลเฟส",
      "standardBenchmark": "ระเบียบ กฟภ. ข้อ 4.5.6 - 4.5.7: สัดส่วนโหลด 30% - 80% ของพิกัด, ความไม่สมดุลกระแสเฟส ≤ 20.0%",
      "measuredSummary": "...",
      "status": "pass",
      "aiSummary": "...",
      "aiRecommendation": "..."
    }
  ],
  "overallClassification": "หม้อแปลงดี",
  "overallResult": "pass",
  "overallSummary": "สรุปภาพรวมทั้งหมด...",
  "overallActionItems": "ข้อเสนอแนะและงานแก้ไขภาพรวมทั้งหมด..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      if (parsed && Array.isArray(parsed.criteria) && parsed.criteria.length >= 6) {
        return res.json({
          success: true,
          criteria: parsed.criteria.map((c: any) => ({ ...c, isAiLocked: true })),
          overallClassification: parsed.overallClassification || 'หม้อแปลงดี',
          overallResult: parsed.overallResult || 'pass',
          overallSummary: parsed.overallSummary || '',
          overallActionItems: parsed.overallActionItems || '',
          mode: 'gemini-2.5-flash',
        });
      }

      const fallback = computeFallbackResult();
      return res.json({
        success: true,
        ...fallback,
        mode: 'standard-rule-engine',
      });
    } catch (error: any) {
      console.warn('Gemini generateContent error in evaluate-criteria, falling back to rule engine:', error?.message || error);
      const fallback = computeFallbackResult();
      return res.json({
        success: true,
        ...fallback,
        mode: 'standard-rule-engine-fallback',
        notice: 'ระบบประเมินผลด้วยเกณฑ์มาตรฐาน กฟภ. 2568 (PEA Distribution Standard Engine) สำเร็จ 100% (สำรองอัตโนมัติ)',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
