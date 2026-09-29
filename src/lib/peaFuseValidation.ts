/**
 * PEA Fuse Validation & Standards Engine
 * ระบบตรวจสอบและเปรียบเทียบขนาดฟิวส์ตามเกณฑ์มาตรฐาน กฟภ.
 */

import { IncidentCause } from '../types';

export interface FuseMatchResult {
  isMatchOriginal: boolean;
  isMatchStandard: boolean;
  verificationStatus: 'match' | 'mismatch_warning';
  verificationMessage: string;
  futureActionNotice: string;
  deviationNote?: string;
}

// รายการขนาดฟิวส์ลิงค์มาตรฐาน กฟภ. (Type T / Type K)
export const PEA_STANDARD_FUSE_OPTIONS = [
  '1T',
  '2T',
  '3T',
  '5T',
  '6T',
  '8T',
  '10T',
  '12T',
  '15T',
  '20T',
  '25T',
  '30T',
  '40T',
  '50T',
  '65T',
  '80T',
  '100T',
  '140T',
  '200T',
];

export const INCIDENT_CAUSE_OPTIONS: { id: IncidentCause; label: string; description: string }[] = [
  {
    id: 'fuse_blown_lightning',
    label: '⚡ ฟ้าผ่า / เสิร์จแรงดันเกิน (Lightning / Overvoltage Surge)',
    description: 'เกิดฟ้าผ่าในบริเวณใกล้เคียง มีคลื่นเสิร์จเข้าสู่ดรอปเอาท์คัทเอาท์ ทำให้ฟิวส์ลิงค์ละลายขาด',
  },
  {
    id: 'fuse_blown_overload',
    label: '🔥 โหลดเกินพิกัดสะสม (Overload Trip)',
    description: 'ปริมาณการใช้ไฟฟ้าช่วงพีคโหลดสูงเกินพิกัดต่อเนื่อง จนฟิวส์ตัดวงจร',
  },
  {
    id: 'fuse_blown_tree',
    label: '🌳 กิ่งไม้พาดสาย / สัมผัสสาย (Tree Contact)',
    description: 'ลมพัดกิ่งไม้แตะสายไฟฟ้าแรงสูง เกิดวาบไฟชั่วขณะทำให้ฟิวส์ขาด',
  },
  {
    id: 'fuse_blown_animal',
    label: '🐿️ สัตว์แตะสายไฟ / บุชชิ่ง (Animal Contact)',
    description: 'งู นก กระรอก หรือสัตว์เลื้อยคลานสัมผัสขั้วบุชชิ่งแรงสูงหรือดรอปเอาท์',
  },
  {
    id: 'fuse_aged',
    label: '⏳ ฟิวส์เสื่อมสภาพตามอายุการใช้งาน (Aging / Fatigue)',
    description: 'ฟิวส์ลิงค์ผ่านการใช้งานมายาวนาน โดนความร้อนและสภาพอากาศสะสมจนขาดเอง',
  },
  {
    id: 'short_circuit_lv',
    label: '💥 ลัดวงจรฝั่งแรงต่ำ / สายไฟแตะกัน (Secondary Short Circuit)',
    description: 'เกิดการลัดวงจรในสายส่งแรงต่ำหรือโหลดผู้ใช้ไฟ สะท้อนกระแสเกินขึ้นมาด้านแรงสูง',
  },
  {
    id: 'arrester_fault',
    label: '🛡️ กับดักฟ้าผ่าชำรุด / ระเบิด (Surge Arrester Failed)',
    description: 'กับดักฟ้าผ่าด้านแรงสูงเสื่อมสภาพหรือแตกร้าว ทำให้กระแสลัดวงจรลงดิน',
  },
  {
    id: 'other',
    label: '🔧 สาเหตุอื่นๆ (Other)',
    description: 'สาเหตุอื่นๆ นอกเหนือจากข้างต้น (ระบุในรายละเอียดการเข้างาน)',
  },
];

/**
 * คำนวณหาขนาดฟิวส์มาตรฐาน กฟภ. สำหรับหม้อแปลง ตามพิกัด kVA และแรงดัน
 * อ้างอิงตามเกณฑ์ กฟภ. (PEA Distribution Transformer Standards)
 */
export function getStandardPeaFuseForTransformer(
  kva: number,
  voltageKv: number = 22,
  phase: number = 3
): string {
  // ระบบ 1 เฟส 22 kV / 460-230 V
  if (phase === 1) {
    if (kva <= 10) return '1T';
    if (kva <= 20) return '2T';
    if (kva <= 30) return '2T';
    if (kva <= 50) return '3T';
    return '5T';
  }

  // ระบบ 3 เฟส 33 kV
  if (voltageKv === 33) {
    if (kva <= 30) return '1T';
    if (kva <= 50) return '2T';
    if (kva <= 100) return '3T';
    if (kva <= 160) return '6T';
    if (kva <= 250) return '8T';
    if (kva <= 315) return '10T';
    if (kva <= 500) return '15T';
    if (kva <= 800) return '25T';
    if (kva <= 1000) return '30T';
    if (kva <= 1250) return '40T';
    if (kva <= 1600) return '50T';
    if (kva <= 2000) return '65T';
    return '80T';
  }

  // ระบบ 3 เฟส 22 kV (มาตรฐาน กฟภ. ทั่วไป)
  if (kva <= 30) return '2T';
  if (kva <= 50) return '3T';
  if (kva <= 100) return '6T';
  if (kva <= 160) return '8T';
  if (kva <= 250) return '15T';
  if (kva <= 315) return '15T';
  if (kva <= 400) return '20T';
  if (kva <= 500) return '25T';
  if (kva <= 800) return '40T';
  if (kva <= 1000) return '50T';
  if (kva <= 1250) return '65T';
  if (kva <= 1600) return '80T';
  if (kva <= 2000) return '100T';
  return '140T';
}

/**
 * ตัดแยกตัวเลขพิกัดแอมป์และชนิดฟิวส์เพื่อเปรียบเทียบอย่างยืดหยุ่น
 * เช่น "25T Type K" -> amp: 25, type: 'T'
 * "15A" -> amp: 15
 * "6T" -> amp: 6
 */
export function extractFuseNumericAndType(fuseStr: string): { amp: number; type: string; clean: string } {
  if (!fuseStr) return { amp: 0, type: '', clean: '' };

  const trimmed = fuseStr.trim();
  // match number like 25 from "25T", "25 A", "25T Type K", "5-6A" -> 6
  const match = trimmed.match(/(\d+(?:\.\d+)?)/);
  const amp = match ? parseFloat(match[1]) : 0;
  const isTypeK = /type\s*k/i.test(trimmed) || /k$/i.test(trimmed);
  const isTypeT = /type\s*t/i.test(trimmed) || /t/i.test(trimmed) || !isTypeK;

  const type = isTypeK ? 'K' : 'T';
  const clean = amp > 0 ? `${amp}${type}` : trimmed;

  return { amp, type, clean };
}

/**
 * ฟังก์ชันหลักในการตรวจสอบฟิวส์ที่เปลี่ยนใหม่ vs ฟิวส์เดิม และมาตรฐาน กฟภ.
 * ตามข้อกำหนดของผู้ใช้:
 * "ให้ระบบตรวจสอบว่า ฟิวส์ที่เปลี่ยนใหม่นั้น ตรงกับฟิวส์เดิมไหม เมื่อไม่ตรงกับฟิวส์เดิม
 * ให้เเสดงว่าในอนาคตเมื่อมาซ่อมแซมให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐานจากข้อมูลเว็บไซต์"
 */
export function validateReplacedFuse(params: {
  originalFuse: string;
  newFuseInstalled: string;
  standardFuse: string;
  transformerKva?: number;
  transformerName?: string;
}): FuseMatchResult {
  const { originalFuse, newFuseInstalled, standardFuse } = params;

  if (!newFuseInstalled || newFuseInstalled.trim() === '') {
    return {
      isMatchOriginal: false,
      isMatchStandard: false,
      verificationStatus: 'mismatch_warning',
      verificationMessage: 'ยังไม่ได้ระบุขนาดฟิวส์ที่เปลี่ยนใหม่',
      futureActionNotice: `ในอนาคตเมื่อมาซ่อมแซมให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน (${standardFuse}) จากข้อมูลเว็บไซต์ กฟภ.`,
    };
  }

  const pNew = extractFuseNumericAndType(newFuseInstalled);
  const pOrig = extractFuseNumericAndType(originalFuse);
  const pStd = extractFuseNumericAndType(standardFuse);

  // เปรียบเทียบ: ตรงกับฟิวส์เดิมไหม (เปรียบเทียบทั้งแบบ string exact และ numeric amp)
  const isExactOrig = originalFuse.trim().toLowerCase() === newFuseInstalled.trim().toLowerCase();
  const isAmpMatchOrig = pNew.amp > 0 && pOrig.amp > 0 && pNew.amp === pOrig.amp;
  const isMatchOriginal = isExactOrig || isAmpMatchOrig;

  // เปรียบเทียบ: ตรงกับมาตรฐาน กฟภ. ไหม
  const isExactStd = standardFuse.trim().toLowerCase() === newFuseInstalled.trim().toLowerCase();
  const isAmpMatchStd = pNew.amp > 0 && pStd.amp > 0 && pNew.amp === pStd.amp;
  const isMatchStandard = isExactStd || isAmpMatchStd;

  if (isMatchOriginal) {
    return {
      isMatchOriginal: true,
      isMatchStandard,
      verificationStatus: 'match',
      verificationMessage: `✅ ขนาดฟิวส์ที่เปลี่ยนใหม่ (${newFuseInstalled}) ตรงกับฟิวส์เดิม (${originalFuse}) และสอดคล้องกับมาตรฐาน กฟภ. (${standardFuse})`,
      futureActionNotice: `ฟิวส์ที่ติดตั้งเป็นไปตามพิกัดมาตรฐาน (${standardFuse}) ใช้งานได้ตามปกติ`,
    };
  }

  // กรณีไม่ตรงกับฟิวส์เดิม: แสดงข้อความเตือนชัดเจนและคำสั่งการในอนาคต
  const isOver = pNew.amp > pOrig.amp;
  const devWord = isOver
    ? `ขนาดใหญ่กว่าเดิม (${newFuseInstalled} แทน ${originalFuse}) ซึ่งอาจทำให้ตัดวงจรช้าเมื่อเกิดโหลดเกิน`
    : `ขนาดเล็กกว่าเดิม (${newFuseInstalled} แทน ${originalFuse}) ซึ่งอาจทำให้ฟิวส์ขาดบ่อยโดยไม่จำเป็น`;

  const futureNotice = `ในอนาคตเมื่อมาซ่อมแซมให้เปลี่ยนฟิวส์ให้ตรงกับมาตรฐาน (${standardFuse}) จากข้อมูลเว็บไซต์ กฟภ.`;

  return {
    isMatchOriginal: false,
    isMatchStandard,
    verificationStatus: 'mismatch_warning',
    verificationMessage: `⚠️ ฟิวส์ที่เปลี่ยนใหม่ (${newFuseInstalled}) ไม่ตรงกับฟิวส์เดิม (${originalFuse}): ${devWord}`,
    futureActionNotice: futureNotice,
    deviationNote: `ฟิวส์ใหม่: ${newFuseInstalled} | ฟิวส์เดิม: ${originalFuse} | มาตรฐานแนะนำ: ${standardFuse}`,
  };
}
