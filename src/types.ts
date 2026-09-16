export type OperationalStatus = 'normal' | 'warning' | 'critical' | 'maintenance' | 'offline';

export interface LineCutout {
  id: string; // e.g. "LC-01"
  name: string; // e.g. "ฟิวส์ตัดไลน์ที่ 1 (สายแยกบ้านน้ำเพอะพะ)"
  poleId: string; // e.g. "1000001370"
  feeder: string; // e.g. "ฟีดเดอร์ BGA01"
  area: string; // e.g. "กฟส.บ้านโฮ่ง จ.ลำพูน"
  voltage: number; // 22 or 33 (kV)
  installedFuse: string; // e.g. "40T"
  fuseType: 'T' | 'K';
  status: OperationalStatus;
  lat?: string;
  lng?: string;
  diversityFactor?: number; // e.g. 0.80
  multiplier?: number; // e.g. 1.75
  notes?: string;
  customTargetLoadKva?: number;
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

export type NavTab = 'landing' | 'dashboard' | 'detail' | 'linecutout' | 'calculator' | 'admin';

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
