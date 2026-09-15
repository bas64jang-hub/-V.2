import { Transformer, AccountRecord, PeaMatrixRow, AuditLogItem } from '../types';
import { IMPORTED_TRANSFORMERS } from './importedTransformers';

export const DEFAULT_TRANSFORMERS: Transformer[] = IMPORTED_TRANSFORMERS;

export const PEA_FUSE_MATRIX: PeaMatrixRow[] = [
  { kva: 50, fla22: 1.31, fuse22: '3T', fla33: 0.87, fuse33: '2T', sec400: 72.2, mccb: '100A', note: 'หม้อแปลงเสาเดี่ยว / ระบบทั่วไป' },
  { kva: 100, fla22: 2.62, fuse22: '6T', fla33: 1.75, fuse33: '3T', sec400: 144.3, mccb: '175A', note: 'หม้อแปลงระบบจำหน่าย' },
  { kva: 160, fla22: 4.20, fuse22: '8T', fla33: 2.80, fuse33: '6T', sec400: 230.9, mccb: '300A', note: 'หม้อแปลงนั่งร้าน' },
  { kva: 250, fla22: 6.56, fuse22: '15T', fla33: 4.37, fuse33: '8T', sec400: 360.8, mccb: '400A', note: 'หม้อแปลงนั่งร้าน' },
  { kva: 315, fla22: 8.27, fuse22: '15T', fla33: 5.51, fuse33: '10T', sec400: 454.7, mccb: '500A', note: 'หม้อแปลงนั่งร้าน' },
  { kva: 400, fla22: 10.50, fuse22: '20T', fla33: 7.00, fuse33: '15T', sec400: 577.4, mccb: '630A', note: 'หม้อแปลงลานกลางแจ้ง' },
  { kva: 500, fla22: 13.12, fuse22: '25T', fla33: 8.75, fuse33: '15T', sec400: 721.7, mccb: '800A', note: 'ลานหม้อแปลง / นิคมอุตสาหกรรม' },
  { kva: 800, fla22: 20.99, fuse22: '40T', fla33: 13.99, fuse33: '25T', sec400: 1154.7, mccb: '1250A', note: 'โรงงานอุตสาหกรรม' },
  { kva: 1000, fla22: 26.24, fuse22: '50T', fla33: 17.50, fuse33: '30T', sec400: 1443.4, mccb: '1600A', note: 'สถานีเฉพาะรายอุตสาหกรรม' },
  { kva: 1250, fla22: 32.80, fuse22: '65T', fla33: 21.87, fuse33: '40T', sec400: 1804.2, mccb: '2000A', note: 'สถานีเฉพาะรายอุตสาหกรรม' },
  { kva: 1600, fla22: 41.99, fuse22: '80T', fla33: 27.99, fuse33: '50T', sec400: 2309.4, mccb: '2500A', note: 'สถานีเฉพาะรายอุตสาหกรรมหนัก' },
  { kva: 2000, fla22: 52.49, fuse22: '100T', fla33: 34.99, fuse33: '65T', sec400: 2886.8, mccb: '3200A', note: 'รับไฟระบบย่อย' },
  { kva: 2500, fla22: 65.61, fuse22: '140T', fla33: 43.74, fuse33: '80T', sec400: 3608.4, mccb: '4000A', note: 'รับไฟระบบย่อย' }
];

export const STANDARD_FUSE_SIZES = [1, 2, 3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 65, 80, 100, 140, 200];

export const DEFAULT_ACCOUNTS: AccountRecord[] = [
  {
    id: 1,
    empid: 'PEA-108842',
    name: 'นายสมศักดิ์ มั่นคง',
    role: 'Transformer Editor',
    position: 'วิศวกรไฟฟ้า 6',
    dept: 'กฟภ. เขต 3 (ภาคตะวันออกเฉียงเหนือ) นครราชสีมา',
    status: 'approved',
    reason: 'สำรวจและปรับสมดุลโหลดหม้อแปลง 500 kVA นิคมสุรนารี',
    timeText: 'อนุมัติโดย Super Admin เมื่อสักครู่',
    pass: 'Admin@2024',
    otp: '784912',
    email: 'somsak.man@pea.co.th',
    provider: 'pea'
  },
  {
    id: 2,
    empid: 'PEA-999999',
    name: 'นายรังสิมันต์ ยอดเดชา',
    role: 'Grid Protection Operator',
    position: 'ช่างเทคนิคไฟฟ้า 5',
    dept: 'กฟภ. เขต 1 (ภาคกลาง) อยุธยา',
    status: 'pending',
    reason: 'ขอสิทธิ์เข้าถึง Fuse Calculator เพื่อซ่อมบำรุงเบรกเกอร์สถานีพระนคร',
    timeText: 'ยื่นเมื่อ: 15 นาทีที่แล้ว • ID: REQ-2024-9999',
    pass: 'Admin@2024',
    otp: '784912',
    email: 'rangsiman.yod@pea.co.th',
    provider: 'pea'
  },
  {
    id: 3,
    empid: 'PEA-204118',
    name: 'น.ส. พิมพาพร ดวงดี',
    role: 'Transformer Editor & Analytics',
    position: 'วิศวกรระบบควบคุม',
    dept: 'กฟภ. สำนักงานใหญ่ (บางเขน)',
    status: 'pending',
    reason: 'วิเคราะห์ข้อมูลโหลดหม้อแปลงเกินพิกัดโครงการ Smart Grid Pilot',
    timeText: 'ยื่นเมื่อ: 45 นาทีที่แล้ว • ID: REQ-2024-0981',
    pass: 'Admin@2024',
    otp: '784912',
    email: 'phimpaporn.d@pea.co.th',
    provider: 'pea'
  },
  {
    id: 4,
    empid: 'Super9955',
    name: 'Super Admin (Super9955)',
    role: 'Super Administrator',
    position: 'หัวหน้างานวิศวกรรมระบบสายส่งและหม้อแปลง (ผู้อนุมัติระบบ)',
    dept: 'กฟภ. สำนักงานใหญ่',
    status: 'approved',
    reason: 'ผู้ดูแลระบบสูงสุด มีสิทธิ์เห็นคำสั่งควบคุมการอนุมัติสิทธิ์',
    timeText: 'สิทธิ์ถาวรระดับ Tier-3 Super Admin',
    pass: '13579',
    otp: '13579',
    email: 'superadmin@pea.co.th',
    provider: 'pea'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: '1',
    timestamp: 'เมื่อสักครู่',
    message: 'TR23-011134: บันทึกและปรับพิกัด 160 kVA (ซิงก์เรียบร้อย)',
    type: 'success'
  },
  {
    id: '2',
    timestamp: '5 นาทีที่แล้ว',
    message: 'TR-006: บรรจุเข้าฐานข้อมูลจุดจ่ายไฟใหม่ (800 kVA)',
    type: 'info'
  },
  {
    id: '3',
    timestamp: '15 นาทีที่แล้ว',
    message: 'TR-002: ปรับพิกัดฟิวส์ 50T Type K ตามเกณฑ์ กฟภ.',
    type: 'warning'
  },
  {
    id: '4',
    timestamp: '30 นาทีที่แล้ว',
    message: 'TR-003: สัญญาณเตือนโหลด 95% เสี่ยงตัดวงจร โซน C',
    type: 'error'
  }
];
