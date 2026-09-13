export type OperationalStatus = 'normal' | 'warning' | 'critical' | 'maintenance' | 'offline';

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

export type NavTab = 'landing' | 'dashboard' | 'detail' | 'calculator' | 'admin';
