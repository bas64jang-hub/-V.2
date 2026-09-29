import { LineCutout, Transformer } from '../types';
import { HIGH_VOLTAGE_PROTECTION_DEVICES } from './protectionDevicesData';

export const DEFAULT_LINE_CUTOUTS: LineCutout[] = HIGH_VOLTAGE_PROTECTION_DEVICES;

// Map standard fuse ratings
export const STANDARD_LINE_FUSE_SIZES = [10, 12, 15, 20, 25, 30, 40, 50, 65, 80, 100, 140, 200];

/**
 * Assigns a transformer to a Line Cutout / High Voltage Protection Device based on exact assignment or fallback.
 */
export function getLineCutoutAssignment(t: Transformer): { id: string; name: string } {
  if (t.lineCutoutId && t.lineCutoutName) {
    return { id: t.lineCutoutId, name: t.lineCutoutName };
  }

  const idNorm = t.id.replace(/\s+/g, '');
  const text = `${t.name} ${t.area} ${t.note || ''}`.toLowerCase();

  // BGA02VF-158: TR 41-001773, TR 35-012428
  if (idNorm.includes('41-001773') || idNorm.includes('35-012428') || text.includes('ห้วยกาน')) {
    return { id: 'BGA02VF-158', name: DEFAULT_LINE_CUTOUTS[0].name };
  }
  // BGA02VF-159: TR 59-100462, TR 39-000925
  if (idNorm.includes('59-100462') || idNorm.includes('39-000925') || text.includes('ห้วยปางค่า')) {
    return { id: 'BGA02VF-159', name: DEFAULT_LINE_CUTOUTS[1].name };
  }
  // BGA02VF-160: TR 35-010089
  if (idNorm.includes('35-010089') || text.includes('ซอย 4')) {
    return { id: 'BGA02VF-160', name: DEFAULT_LINE_CUTOUTS[2].name };
  }
  // BGA02VF-161: TR 25-001753, TR 27-008471, TR 45-003479, TR 28-015132, TR 29-016552
  if (
    idNorm.includes('25-001753') ||
    idNorm.includes('27-008471') ||
    idNorm.includes('45-003479') ||
    idNorm.includes('28-015132') ||
    idNorm.includes('29-016552') ||
    text.includes('ซอย 10') ||
    text.includes('หัวห้วย')
  ) {
    return { id: 'BGA02VF-161', name: DEFAULT_LINE_CUTOUTS[3].name };
  }
  // BGA02VF-162: TR 45-033209
  if (idNorm.includes('45-033209') || text.includes('ป่าพลู')) {
    return { id: 'BGA02VF-162', name: DEFAULT_LINE_CUTOUTS[4].name };
  }
  // BGA02VF-163: TR 59-021021, TR 59-021057
  if (idNorm.includes('59-021021') || idNorm.includes('59-021057') || text.includes('แม่หาด')) {
    return { id: 'BGA02VF-163', name: DEFAULT_LINE_CUTOUTS[5].name };
  }
  // BGA02VF-164: TR 41-001011, TR 61-011181
  if (idNorm.includes('41-001011') || idNorm.includes('61-011181') || text.includes('ห้วยแทง')) {
    return { id: 'BGA02VF-164', name: DEFAULT_LINE_CUTOUTS[6].name };
  }

  // Fallback to first
  return { id: DEFAULT_LINE_CUTOUTS[0].id, name: DEFAULT_LINE_CUTOUTS[0].name };
}

export interface LineCutoutCalculationResult {
  totalTransformersCount: number;
  totalConnectedKva: number;
  totalLoadKva: number;
  totalLoadKw: number;
  avgPercentLoad: number;
  maxIndividualKva: number;
  maxIndividualLoadKva: number;
  maxDownstreamFuseRating: number;
  maxDownstreamFuseTag: string;
  primaryVoltage: number;
  flaConnectedTotal: number;
  actualLoadCurrent: number;
  diversityFactor: number;
  coincidentLoadKva: number;
  coincidentCurrent: number;
  multiplier: number;
  sizingCurrent: number;
  recommendedFuseRating: number;
  recommendedFuseTag: string;
  coordinationMinRating: number;
  isCoordinated: boolean;
  statusVsInstalled: 'optimal' | 'undersized' | 'oversized';
  statusText: string;
  statusBadge: 'success' | 'warning' | 'danger';
  analysisNote: string;
}

/**
 * Extracts numeric fuse ampere rating from string like "8T Type K" -> 8, "25T" -> 25
 */
export function extractFuseAmpere(fuseStr: string | undefined): number {
  if (!fuseStr) return 6;
  const match = fuseStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 6;
}

/**
 * Calculates the recommended Line Sectionalizing Cutout Fuse rating for a branch line
 * containing multiple distribution transformers according to PEA & IEEE C37.42 guidelines.
 */
export function calculateLineCutoutRating(
  transformersOnLine: Transformer[],
  installedFuseTag: string = '25T',
  lineVoltage: number = 22,
  diversityFactor: number = 0.8,
  multiplier: number = 1.75,
  fuseType: 'T' | 'K' = 'T'
): LineCutoutCalculationResult {
  const count = transformersOnLine.length;
  const totalConnectedKva = transformersOnLine.reduce((sum, t) => sum + (t.kva || 0), 0);
  const totalLoadKva = transformersOnLine.reduce((sum, t) => sum + (t.loadKva || 0), 0);
  const totalLoadKw = transformersOnLine.reduce((sum, t) => sum + (t.loadKw || 0), 0);
  const avgPercentLoad = totalConnectedKva > 0 ? (totalLoadKva / totalConnectedKva) * 100 : 0;

  let maxIndividualKva = 0;
  let maxIndividualLoadKva = 0;
  let maxDownstreamFuseRating = 0;
  let maxDownstreamFuseTag = '6T';

  transformersOnLine.forEach((t) => {
    if (t.kva > maxIndividualKva) maxIndividualKva = t.kva;
    if (t.loadKva > maxIndividualLoadKva) maxIndividualLoadKva = t.loadKva;
    const fuseAmp = extractFuseAmpere(t.fuse);
    if (fuseAmp > maxDownstreamFuseRating) {
      maxDownstreamFuseRating = fuseAmp;
      maxDownstreamFuseTag = t.fuse;
    }
  });

  // Voltage 3-phase divisor: sqrt(3) * kV
  const vDivider = Math.sqrt(3) * lineVoltage;

  // FLA of total capacity
  const flaConnectedTotal = totalConnectedKva > 0 ? totalConnectedKva / vDivider : 0;

  // Actual load current
  const actualLoadCurrent = totalLoadKva > 0 ? totalLoadKva / vDivider : 0;

  // Coincident load taking diversity into account (PEA: 0.75 - 0.85)
  const coincidentLoadKva = totalLoadKva * diversityFactor;
  const coincidentCurrent = actualLoadCurrent * diversityFactor;

  // Sizing current including safety factor & inrush/cold load pickup allowance (1.5x - 2.0x)
  const sizingCurrent = coincidentCurrent * multiplier;

  // Selective Coordination Requirement:
  // Upstream Line Cutout Fuse must be at least 1-2 steps higher than the largest downstream transformer fuse!
  let coordinationMinRating = 10;
  if (maxDownstreamFuseRating <= 2) coordinationMinRating = 6;
  else if (maxDownstreamFuseRating <= 3) coordinationMinRating = 8;
  else if (maxDownstreamFuseRating <= 6) coordinationMinRating = 12;
  else if (maxDownstreamFuseRating <= 8) coordinationMinRating = 15;
  else if (maxDownstreamFuseRating <= 15) coordinationMinRating = 25;
  else if (maxDownstreamFuseRating <= 20) coordinationMinRating = 30;
  else if (maxDownstreamFuseRating <= 25) coordinationMinRating = 40;
  else if (maxDownstreamFuseRating <= 40) coordinationMinRating = 50;
  else if (maxDownstreamFuseRating <= 50) coordinationMinRating = 65;
  else if (maxDownstreamFuseRating <= 65) coordinationMinRating = 80;
  else if (maxDownstreamFuseRating <= 80) coordinationMinRating = 100;
  else coordinationMinRating = 140;

  // Choose the smallest standard fuse that satisfies BOTH:
  // 1) sizingCurrent
  // 2) coordinationMinRating
  const requiredAmps = Math.max(sizingCurrent, coordinationMinRating);
  const recommendedFuseRating =
    STANDARD_LINE_FUSE_SIZES.find((size) => size >= requiredAmps) ||
    STANDARD_LINE_FUSE_SIZES[STANDARD_LINE_FUSE_SIZES.length - 1];

  const recommendedFuseTag = `${recommendedFuseRating}${fuseType}`;
  const isCoordinated = recommendedFuseRating >= coordinationMinRating;

  // Comparison with currently installed fuse
  const installedAmp = extractFuseAmpere(installedFuseTag);
  let statusVsInstalled: 'optimal' | 'undersized' | 'oversized' = 'optimal';
  let statusText = 'พิกัดฟิวส์ตัดไลน์ปัจจุบันเหมาะสมแล้ว';
  let statusBadge: 'success' | 'warning' | 'danger' = 'success';
  let analysisNote = '';

  if (installedAmp < recommendedFuseRating) {
    statusVsInstalled = 'undersized';
    statusText = `ขนาดฟิวส์ตัดไลน์เดิม (${installedFuseTag}) เล็กกว่าพิกัดที่คำนวณใหม่ (${recommendedFuseTag}) เสี่ยงฟิวส์ขาดผิดจังหวะ`;
    statusBadge = 'danger';
    analysisNote = `โหลดรวมของหม้อแปลงในสายสาขานี้ (${totalLoadKva.toFixed(1)} kVA) หรือเงื่อนไขการประสานการทำงานกับหม้อแปลงลูกใหญ่สุด (${maxIndividualKva} kVA / ${maxDownstreamFuseTag}) ต้องใช้ฟิวส์อย่างน้อย ${recommendedFuseTag} เพื่อไม่ให้สายสาขาดับทั้งสาย`;
  } else if (installedAmp > recommendedFuseRating * 1.8 && installedAmp >= 65) {
    statusVsInstalled = 'oversized';
    statusText = `ขนาดฟิวส์ตัดไลน์เดิม (${installedFuseTag}) ใหญ่กว่าเกณฑ์คำนวณ (${recommendedFuseTag}) เล็กน้อย`;
    statusBadge = 'warning';
    analysisNote = `พิกัดปัจจุบันสามารถทนกระแสได้สบาย แต่ควรตรวจสอบการประสานเวลากับรีโคลสเซอร์ (Recloser) ต้นทางเพื่อป้องกันการทริปซ้ำซ้อน`;
  } else {
    statusVsInstalled = 'optimal';
    statusText = `พิกัดฟิวส์ตัดไลน์ปัจจุบัน (${installedFuseTag}) สอดคล้องกับพิกัดที่คำนวณใหม่ (${recommendedFuseTag})`;
    statusBadge = 'success';
    analysisNote = `รองรับโหลดรวม ${totalLoadKva.toFixed(1)} kVA พร้อมกระแสกระชาก (Inrush) และประสานการทำงานกับหม้อแปลงทุกเครื่องได้อย่างสมบูรณ์ตามเกณฑ์ กฟภ.`;
  }

  return {
    totalTransformersCount: count,
    totalConnectedKva,
    totalLoadKva,
    totalLoadKw,
    avgPercentLoad,
    maxIndividualKva,
    maxIndividualLoadKva,
    maxDownstreamFuseRating,
    maxDownstreamFuseTag,
    primaryVoltage: lineVoltage,
    flaConnectedTotal,
    actualLoadCurrent,
    diversityFactor,
    coincidentLoadKva,
    coincidentCurrent,
    multiplier,
    sizingCurrent,
    recommendedFuseRating,
    recommendedFuseTag,
    coordinationMinRating,
    isCoordinated,
    statusVsInstalled,
    statusText,
    statusBadge,
    analysisNote,
  };
}
