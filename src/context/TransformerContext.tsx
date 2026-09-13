import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Transformer, UserRole, AccountRecord, AuditLogItem, NavTab } from '../types';
import { DEFAULT_TRANSFORMERS, DEFAULT_ACCOUNTS, INITIAL_AUDIT_LOGS } from '../data/defaultData';
import {
  fetchTransformersApi,
  saveTransformersApi,
  saveSingleTransformerApi,
  deleteTransformerApi,
  resetTransformersApi,
  fetchAccountsApi,
  saveAccountApi,
  updateAccountApi,
  fetchAuditLogsApi,
  addAuditLogApi,
  fetchSyncStatusApi,
} from '../lib/api';

const STORAGE_KEY = 'smart_transformer_db';
const ACCOUNTS_STORAGE_KEY = 'pea_access_requests';
const SESSION_USER_KEY = 'pea_admin_user';
const SESSION_STATUS_KEY = 'pea_admin_session';
const BROADCAST_CHANNEL_NAME = 'pea_smart_grid_sync';

interface ToastState {
  show: boolean;
  message: string;
  badge: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface TransformerContextType {
  transformers: Transformer[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  selectedTransformer: Transformer | undefined;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: AccountRecord | null;
  accounts: AccountRecord[];
  auditLogs: AuditLogItem[];
  toast: ToastState;
  showToast: (message: string, badge?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
  saveTransformer: (transformer: Partial<Transformer> & { id: string }) => void;
  deleteTransformer: (id: string) => void;
  resetToDefaults: () => void;
  login: (empid: string, pass: string, otp?: string) => { success: boolean; message: string; account?: AccountRecord };
  loginWithGoogle: (email: string, name?: string, avatar?: string) => { success: boolean; status: 'approved' | 'pending' | 'rejected'; message: string; account: AccountRecord };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  approveRequest: (id: string | number) => void;
  rejectRequest: (id: string | number) => void;
  temporaryGrant: (id: string | number) => void;
  revokeAccess: (id: string | number) => void;
  submitRequest: (data: Omit<AccountRecord, 'id' | 'status' | 'timeText' | 'pass' | 'otp'> & { pass?: string; otp?: string }) => void;
  addAuditLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  triggerSync: () => void;
  metrics: {
    total: number;
    normal: number;
    warning: number;
    critical: number;
    totalKva: number;
    totalActiveKva: number;
    totalMva: string;
    avgLoadPercent: number;
    activeMw: string;
  };
}

const TransformerContext = createContext<TransformerContextType | undefined>(undefined);

export const TransformerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Transformer Fleet State
  const [transformers, setTransformers] = useState<Transformer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading transformers from localStorage', e);
    }
    return DEFAULT_TRANSFORMERS;
  });

  const [selectedId, setSelectedId] = useState<string>('TR-001');
  const [activeTab, setActiveTab] = useState<NavTab>('landing');

  // 2. User & Auth State
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const isAuth = localStorage.getItem(SESSION_STATUS_KEY) === 'true';
    if (isAuth) {
      try {
        const user = JSON.parse(localStorage.getItem(SESSION_USER_KEY) || '{}');
        if (user.empid && (user.empid.toLowerCase() === 'super9955' || user.empid === 'PEA-SUPERADMIN-01')) return 'superadmin';
        return 'admin';
      } catch {
        return 'admin';
      }
    }
    return 'guest';
  });

  const [currentUser, setCurrentUser] = useState<AccountRecord | null>(() => {
    try {
      const storedUser = localStorage.getItem(SESSION_USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [accounts, setAccounts] = useState<AccountRecord[]>(() => {
    let list = DEFAULT_ACCOUNTS;
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading accounts from localStorage', e);
    }
    // Ensure Super9955 is present and configured
    const superIdx = list.findIndex(a => a.empid.toLowerCase() === 'super9955');
    if (superIdx >= 0) {
      list[superIdx] = {
        ...list[superIdx],
        empid: 'Super9955',
        pass: '13579',
        status: 'approved',
        role: 'Super Administrator',
      };
      return list;
    }
    return [
      {
        id: 'super-9955',
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
        provider: 'pea',
      },
      ...list,
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // 3. Toast Notifications
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    badge: 'SCADA_SYNC_OK',
    timestamp: '',
    type: 'success',
  });

  const showToast = (
    message: string,
    badge: string = 'SCADA_SYNC_OK',
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC+7`;
    setToast({
      show: true,
      message,
      badge,
      timestamp: timeStr,
      type,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const lastSyncTimestamp = useRef<number>(0);
  const isSyncing = useRef<boolean>(false);

  // Sync latest data from server to ensure all devices show identical data
  const syncFromServer = async (showNotification = false) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      const [trRes, accRes, logRes] = await Promise.all([
        fetchTransformersApi(),
        fetchAccountsApi(),
        fetchAuditLogsApi(),
      ]);

      if (trRes && Array.isArray(trRes.data) && trRes.data.length > 0) {
        setTransformers(trRes.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trRes.data));
        if (trRes.lastUpdated) {
          lastSyncTimestamp.current = Math.max(lastSyncTimestamp.current, trRes.lastUpdated);
        }
      }

      if (accRes && Array.isArray(accRes.data) && accRes.data.length > 0) {
        setAccounts(accRes.data);
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accRes.data));
      }

      if (logRes && Array.isArray(logRes.data) && logRes.data.length > 0) {
        setAuditLogs(logRes.data);
      }

      if (showNotification) {
        showToast('ซิงค์ข้อมูลกับเซิร์ฟเวอร์กลางสำเร็จ ข้อมูลตรงกันทุกอุปกรณ์', 'SERVER_SYNC_OK', 'info');
      }
    } catch (e) {
      console.warn('Sync from server error:', e);
    } finally {
      isSyncing.current = false;
    }
  };

  // Initial load from server on mount
  useEffect(() => {
    syncFromServer();
  }, []);

  // Periodic polling (every 3s) & instant sync when tab is focused/visible
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await fetchSyncStatusApi();
        if (status && status.lastUpdated > lastSyncTimestamp.current) {
          await syncFromServer();
        }
      } catch {}
    }, 3000);

    const handleFocus = () => {
      syncFromServer();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromServer();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Persist transformers to localStorage, BroadcastChannel & Server API (all devices)
  const persistTransformers = (newList: Transformer[], broadcast = true) => {
    setTransformers(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      if (broadcast) {
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'DB_UPDATED', data: newList, timestamp: Date.now() });
          channel.close();
        }
      }
      // Cross-device server persistence
      saveTransformersApi(newList).then(() => {
        lastSyncTimestamp.current = Date.now();
      });
    } catch (e) {
      console.error('Storage write error', e);
    }
  };

  // Persist accounts
  const persistAccounts = (newAccounts: AccountRecord[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(newAccounts));
    } catch (e) {
      console.error('Account storage write error', e);
    }
  };

  // Cross-tab broadcast listener (same device tabs)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === 'DB_UPDATED' && Array.isArray(event.data.data)) {
            setTransformers(event.data.data);
            showToast('ซิงค์ข้อมูลเรียลไทม์จากระบบเครือข่ายสำเร็จ', 'BROADCAST_SYNC', 'info');
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setTransformers(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const addAuditLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newItem: AuditLogItem = {
      id: Date.now().toString(),
      timestamp: 'เมื่อสักครู่',
      message,
      type,
    };
    setAuditLogs(prev => [newItem, ...prev.slice(0, 49)]);
    addAuditLogApi(message, type);
  };

  // Transformer actions
  const saveTransformer = (record: Partial<Transformer> & { id: string }) => {
    const kva = record.kva || 500;
    const loadKva = record.loadKva !== undefined ? record.loadKva : 325;
    const percent = Math.min(150, Math.round((loadKva / kva) * 100 * 10) / 10);
    const loadKw = Math.round(loadKva * 0.92);

    let status = record.status || 'normal';
    if (percent > 90) status = 'critical';
    else if (percent > 80) status = 'warning';
    else if (status === 'critical' || status === 'warning') status = 'normal';

    const index = transformers.findIndex(t => t.id === record.id);
    let updated: Transformer[];

    if (index >= 0) {
      const existing = transformers[index];
      const merged: Transformer = {
        ...existing,
        ...record,
        kva,
        loadKva,
        loadKw,
        percent,
        status,
        note: record.area || existing.note,
      };
      updated = [...transformers];
      updated[index] = merged;
      persistTransformers(updated);
      saveSingleTransformerApi(record.id, merged);
      showToast(`ซิงค์ข้อมูลสำเร็จ! อัปเดตข้อมูล ${record.id} เรียบร้อยแล้ว (ซิงค์ทุกอุปกรณ์ทันที)`, 'SCADA_SYNC_OK', 'success');
      addAuditLog(`${record.id}: ปรับปรุงข้อมูลและพิกัดเสร็จสมบูรณ์ (${loadKva} kVA / ${percent}%)`, 'success');
    } else {
      const newTr: Transformer = {
        id: record.id,
        name: record.name || `หม้อแปลง ${record.id}`,
        area: record.area || 'พื้นที่ให้บริการ กฟภ.',
        kva,
        loadKva,
        loadKw,
        percent,
        voltage: record.voltage || '22 kV / 400-230 V',
        pf: record.pf || '0.92 Lag',
        fuse: record.fuse || '25T Type K',
        mccb: record.mccb || '800A 3P 36kA ICS',
        lat: record.lat || '14.9738',
        lng: record.lng || '102.0837',
        poleId: record.poleId || 'PEA-KORAT-NEW',
        mountType: record.mountType || 'นั่งร้านเสาคู่ H-Beam 12 ม.',
        status,
        note: record.area,
        isNew: true,
        windingTemp: 52.0,
        oilLevel: 95.0,
        altitude: '185 ม.',
      };
      updated = [...transformers, newTr];
      persistTransformers(updated);
      saveSingleTransformerApi(record.id, newTr);
      showToast(`เพิ่มหม้อแปลงใหม่ ${record.id} เข้าสู่ระบบและบรอดแคสต์เรียบร้อย!`, 'NEW_RECORD_SYNC', 'success');
      addAuditLog(`${record.id}: บรรจุเข้าฐานข้อมูลหม้อแปลงลูกใหม่ (${kva} kVA)`, 'info');
    }
  };

  const deleteTransformer = (id: string) => {
    const updated = transformers.filter(t => t.id !== id);
    persistTransformers(updated);
    deleteTransformerApi(id);
    if (selectedId === id && updated.length > 0) {
      setSelectedId(updated[0].id);
    }
    showToast(`ลบหม้อแปลง ${id} ออกจากระบบเรียบร้อยแล้ว`, 'RECORD_DELETED', 'warning');
    addAuditLog(`${id}: ถูกปลดออกจากระบบฐานข้อมูลควบคุม กฟภ.`, 'error');
  };

  const resetToDefaults = () => {
    persistTransformers(DEFAULT_TRANSFORMERS);
    resetTransformersApi();
    setSelectedId('TR-001');
    showToast('รีเซ็ตฐานข้อมูลหม้อแปลงเป็นค่ามาตรฐานเริ่มต้น 6 เครื่องแล้ว (ซิงค์ทุกอุปกรณ์)', 'DB_RESET', 'info');
    addAuditLog('รีเซ็ตฐานข้อมูลกลางเป็นค่าเริ่มต้น 6 เครื่อง', 'info');
  };

  const triggerSync = () => {
    persistTransformers([...transformers]);
    saveTransformersApi(transformers).then(() => {
      lastSyncTimestamp.current = Date.now();
    });
    showToast('⚡ ซิงค์ข้อมูลขึ้นเซิร์ฟเวอร์กลางเรียบร้อย ค่าตรงกันทุกอุปกรณ์ทันที (100% Synced)', 'BROADCAST_OK', 'success');
  };

  // Auth actions
  const login = (empid: string, pass: string, otp?: string) => {
    const cleanId = empid.trim();
    if (!cleanId) {
      showToast('กรุณาระบุยูสเซอร์เนม / รหัสเข้าใช้งาน', 'INPUT_REQUIRED', 'error');
      return { success: false, message: 'กรุณาระบุยูสเซอร์เนม / รหัสเข้าใช้งาน' };
    }

    // 1. Super Admin Check: Super9955 / 13579
    if (cleanId.toLowerCase() === 'super9955') {
      if (pass !== '13579') {
        showToast('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 'AUTH_ERROR', 'error');
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง' };
      }
      let superAccount = accounts.find(a => a.empid.toLowerCase() === 'super9955');
      if (!superAccount) {
        superAccount = {
          id: 'super-9955',
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
          provider: 'pea',
        };
      }
      localStorage.setItem(SESSION_STATUS_KEY, 'true');
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(superAccount));
      setCurrentUser(superAccount);
      setUserRole('superadmin');
      showToast('ยืนยันตัวตนสำเร็จ เข้าถึงคำสั่งควบคุมการอนุมัติสิทธิ์แล้ว', 'AUTH_GRANTED', 'success');
      addAuditLog('ยืนยันตัวตนสำเร็จ เข้าสู่ระบบจัดการสิทธิ์', 'success');
      return { success: true, message: 'เข้าสู่ระบบสำเร็จ', account: superAccount };
    }

    // 2. Regular Admin Lookup by Username (empid) or Email
    const account = accounts.find(
      a => a.empid.toLowerCase() === cleanId.toLowerCase() || (a.email && a.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!account) {
      showToast(`ไม่พบยูสเซอร์เนม "${cleanId}" ในระบบ กรุณากดขอสิทธิ์เข้าถึง`, 'AUTH_NOT_FOUND', 'error');
      return { success: false, message: `ไม่พบยูสเซอร์เนม "${cleanId}" ในระบบ กรุณากดขอสิทธิ์เข้าถึง` };
    }

    // Check Approval Status
    if (account.status === 'pending') {
      showToast(`บัญชี "${account.empid}" อยู่ระหว่างรอการอนุมัติสิทธิ์`, 'AUTH_PENDING', 'warning');
      return { success: false, message: `บัญชี "${account.empid}" ยังไม่ได้รับการยืนยันตัวตน กรุณารอการอนุมัติก่อนเข้าใช้งาน`, account };
    }

    if (account.status === 'rejected') {
      showToast(`บัญชี "${account.name}" ถูกระงับสิทธิ์การเข้าใช้งาน`, 'AUTH_REJECTED', 'error');
      return { success: false, message: `คำขอของบัญชีนี้ถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ`, account };
    }

    // Check password if set on account
    if (account.pass && pass && account.pass !== pass) {
      showToast('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 'AUTH_ERROR', 'error');
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', account };
    }

    // Success login for regular approved admin
    localStorage.setItem(SESSION_STATUS_KEY, 'true');
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(account));
    setCurrentUser(account);
    setUserRole('admin');

    showToast(`ยินดีต้อนรับ ${account.name} เข้าสู่หน้าแก้ไขคำสั่งต่างๆ`, 'AUTH_GRANTED', 'success');
    addAuditLog(`${account.empid} (${account.name}): ยืนยันตัวตนสำเร็จ เข้าสู่หน้าแก้ไข`, 'success');

    return { success: true, message: 'เข้าสู่ระบบสำเร็จ', account };
  };

  // Google / Gmail Login with First-Time Super Admin Approval Workflow
  const loginWithGoogle = (email: string, name?: string, avatar?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('กรุณาระบุที่อยู่อีเมล Gmail ให้ถูกต้อง', 'INVALID_EMAIL', 'error');
      const dummy: AccountRecord = {
        id: 0,
        empid: 'INVALID',
        name: 'Invalid Email',
        role: 'None',
        position: '',
        dept: '',
        status: 'rejected',
        reason: 'อีเมลไม่ถูกต้อง',
        timeText: '',
        pass: '',
        otp: '',
      };
      return {
        success: false,
        status: 'rejected' as const,
        message: 'รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมล @gmail.com หรือ Google Workspace',
        account: dummy,
      };
    }

    // Check if account is already registered (matched by email or empid)
    const existing = accounts.find(
      a => (a.email && a.email.toLowerCase() === cleanEmail) || a.empid.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.status === 'approved') {
        // Already approved by Super Admin -> Enter immediately without approval!
        localStorage.setItem(SESSION_STATUS_KEY, 'true');
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(existing));
        setCurrentUser(existing);

        if (existing.role === 'Super Administrator' || existing.empid === 'PEA-SUPERADMIN-01') {
          setUserRole('superadmin');
        } else {
          setUserRole('admin');
        }

        showToast(
          `เข้าสู่ระบบด้วย Gmail (${cleanEmail}) สำเร็จแล้ว! ยินดีต้อนรับ ${existing.name}`,
          'GMAIL_LOGIN_OK',
          'success'
        );
        addAuditLog(`${cleanEmail} (${existing.name}): ซิงค์ล็อกอินผ่าน Gmail สำเร็จ (สิทธิ์อนุมัติแล้ว)`, 'success');

        return {
          success: true,
          status: 'approved' as const,
          message: 'เข้าสู่ระบบสำเร็จ บัญชี Gmail นี้ได้รับอนุมัติจาก Super Admin เรียบร้อยแล้ว',
          account: existing,
        };
      }

      if (existing.status === 'pending') {
        showToast(
          `บัญชี Gmail (${cleanEmail}) อยู่ระหว่างรอ Super Admin อนุมัติครั้งแรก`,
          'AUTH_PENDING',
          'warning'
        );
        return {
          success: false,
          status: 'pending' as const,
          message: 'บัญชี Gmail นี้อยู่ระหว่างรอการอนุมัติครั้งแรกจาก Super Admin เมื่อได้รับการอนุมัติแล้ว ครั้งต่อไปจะเข้าได้ทันที',
          account: existing,
        };
      }

      if (existing.status === 'rejected') {
        showToast(`บัญชี Gmail (${cleanEmail}) ถูกระงับสิทธิ์การใช้งาน`, 'AUTH_REJECTED', 'error');
        return {
          success: false,
          status: 'rejected' as const,
          message: 'บัญชีนี้ถูกปฏิเสธหรือระงับสิทธิ์การเข้าใช้งาน กรุณาติดต่อ Super Admin',
          account: existing,
        };
      }
    }

    // FIRST-TIME LOGIN WITH THIS GMAIL:
    // Create new account with status = 'pending' (requires Super Admin approval on first login)
    const username = cleanEmail.split('@')[0];
    const formattedName = name || username.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const newAccount: AccountRecord = {
      id: Date.now(),
      empid: `GMAIL-${username.toUpperCase().slice(0, 10)}`,
      email: cleanEmail,
      name: formattedName,
      role: 'Transformer Editor',
      position: 'วิศวกรประจำเขต (เข้าสู่ระบบด้วย Gmail SSO)',
      dept: 'กฟภ. การไฟฟ้าส่วนภูมิภาค (ระบบคลาวด์ Google Workspace)',
      status: 'pending', // <--- Requires Super Admin approval on first login!
      reason: 'เข้าสู่ระบบครั้งแรกผ่านบัญชี Gmail รอการอนุมัติสิทธิ์จาก Super Admin เมื่ออนุมัติแล้วครั้งต่อไปจะเข้าได้อัตโนมัติ',
      timeText: `ล็อกอินครั้งแรกเมื่อสักครู่ (${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})`,
      pass: 'GOOGLE_OAUTH_TOKEN',
      otp: 'G-AUTH',
      provider: 'google',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
    };

    const updated = [newAccount, ...accounts];
    persistAccounts(updated);
    saveAccountApi(newAccount);

    showToast(
      `ลงทะเบียน Gmail (${cleanEmail}) สำเร็จ! ระบบส่งคำขอไปยัง Super Admin เพื่ออนุมัติครั้งแรกเรียบร้อย`,
      'GMAIL_FIRST_PENDING',
      'warning'
    );
    addAuditLog(`${cleanEmail}: เข้าใช้งานครั้งแรกผ่าน Gmail ระบบส่งคำขอรอ Super Admin อนุมัติ`, 'warning');

    return {
      success: false,
      status: 'pending' as const,
      message: 'เข้าสู่ระบบครั้งแรกสำเร็จ! บัญชีของคุณถูกส่งเข้าคิวรอ Super Admin อนุมัติครั้งแรก เมื่อได้รับการอนุมัติแล้ว ในครั้งต่อไปจะสามารถเข้าใช้งานได้ทันที',
      account: newAccount,
    };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_STATUS_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    setCurrentUser(null);
    setUserRole('guest');
    showToast('ออกจากระบบเรียบร้อย สิ้นสุด Session แล้ว', 'LOGOUT_OK', 'info');
    addAuditLog('ผู้ดูแลระบบออกจากระบบ สิ้นสุดการทำงาน Session', 'info');
  };

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'guest') {
      logout();
    } else if (role === 'admin') {
      const adminAcc = accounts.find(a => a.empid === 'PEA-108842') || accounts[0];
      setCurrentUser(adminAcc);
      localStorage.setItem(SESSION_STATUS_KEY, 'true');
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(adminAcc));
      showToast('สลับเข้าสู่โหมด Admin (นายสมศักดิ์ มั่นคง)', 'ROLE_SWITCHED', 'success');
    } else if (role === 'superadmin') {
      const superAcc = accounts.find(a => a.empid === 'PEA-SUPERADMIN-01') || accounts[3];
      setCurrentUser(superAcc);
      localStorage.setItem(SESSION_STATUS_KEY, 'true');
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(superAcc));
      showToast('สลับเข้าสู่โหมด Super Admin (นายช่างวิศวกรอาวุโส)', 'ROLE_SWITCHED', 'success');
    }
  };

  const approveRequest = (id: string | number) => {
    const timeText = `อนุมัติโดย Super Admin เมื่อสักครู่ (${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})`;
    const approvedAt = new Date().toISOString();
    const approvedBy = 'นายช่างวิศวกรอาวุโส (Super Admin)';
    const updated = accounts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'approved' as const,
          timeText,
          approvedAt,
          approvedBy,
        };
      }
      return a;
    });
    persistAccounts(updated);
    updateAccountApi(id, { status: 'approved', timeText, approvedAt, approvedBy });
    const target = updated.find(a => a.id === id);
    showToast(`อนุมัติสิทธิ์ให้ "${target?.name}" (${target?.email || target?.empid}) สำเร็จแล้ว! สามารถเข้าใช้งานได้ทันที`, 'REQUEST_APPROVED', 'success');
    addAuditLog(`Super Admin อนุมัติสิทธิ์ให้ ${target?.email || target?.empid} (${target?.name})`, 'success');
  };

  const rejectRequest = (id: string | number) => {
    const timeText = `ปฏิเสธคำขอเมื่อสักครู่ (${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})`;
    const updated = accounts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'rejected' as const,
          timeText,
        };
      }
      return a;
    });
    persistAccounts(updated);
    updateAccountApi(id, { status: 'rejected', timeText });
    const target = updated.find(a => a.id === id);
    showToast(`ปฏิเสธคำขอของ "${target?.name}" เรียบร้อยแล้ว`, 'REQUEST_REJECTED', 'warning');
    addAuditLog(`Super Admin ปฏิเสธคำขอของ ${target?.empid} (${target?.name})`, 'warning');
  };

  const temporaryGrant = (id: string | number) => {
    const timeText = 'อนุมัติชั่วคราว 24 ชั่วโมง (Auto-expire)';
    const updated = accounts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'approved' as const,
          timeText,
        };
      }
      return a;
    });
    persistAccounts(updated);
    updateAccountApi(id, { status: 'approved', timeText });
    const target = updated.find(a => a.id === id);
    showToast(`อนุมัติสิทธิ์ชั่วคราว (24 ชม.) ให้ "${target?.name}" สำเร็จ`, 'TEMP_GRANT_OK', 'info');
    addAuditLog(`อนุมัติสิทธิ์ชั่วคราว (24h) ให้ ${target?.empid} (${target?.name})`, 'info');
  };

  const revokeAccess = (id: string | number) => {
    const timeText = 'เพิกถอนสิทธิ์การใช้งานโดย Super Admin';
    const updated = accounts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'rejected' as const,
          timeText,
        };
      }
      return a;
    });
    persistAccounts(updated);
    updateAccountApi(id, { status: 'rejected', timeText });
    const target = updated.find(a => a.id === id);
    showToast(`เพิกถอนสิทธิ์ของ "${target?.name}" สำเร็จ ระบบตัดการเชื่อมต่อทันที`, 'ACCESS_REVOKED', 'warning');
    addAuditLog(`เพิกถอนสิทธิ์ของ ${target?.empid} (${target?.name})`, 'error');
  };

  const submitRequest = (data: Omit<AccountRecord, 'id' | 'status' | 'timeText' | 'pass' | 'otp'> & { pass?: string; otp?: string }) => {
    const newAccount: AccountRecord = {
      ...data,
      id: Date.now(),
      status: 'pending',
      timeText: 'ยื่นคำขอเมื่อสักครู่ • รอการอนุมัติสิทธิ์',
      pass: data.pass || '123456',
      otp: data.otp || '784912',
    };
    const updated = [newAccount, ...accounts];
    persistAccounts(updated);
    saveAccountApi(newAccount);
    showToast(`ส่งคำขอสิทธิ์สำหรับ "${data.name}" (${data.empid}) สำเร็จ รอการอนุมัติสิทธิ์`, 'REQUEST_SUBMITTED', 'info');
    addAuditLog(`${data.empid} (${data.name}) ยื่นขอสิทธิ์เข้าใช้งาน`, 'info');
  };

  // Aggregated metrics computation
  const selectedTransformer = transformers.find(t => t.id === selectedId) || transformers[0];

  const total = transformers.length;
  let normal = 0, warning = 0, critical = 0;
  let totalKva = 0, totalActiveKva = 0;

  transformers.forEach(t => {
    totalKva += t.kva;
    totalActiveKva += t.loadKva;
    if (t.percent > 90 || t.status === 'critical') critical++;
    else if (t.percent > 80 || t.status === 'warning') warning++;
    else normal++;
  });

  const totalMva = (totalKva / 1000).toFixed(1);
  const avgLoadPercent = totalKva > 0 ? Math.round((totalActiveKva / totalKva) * 100) : 0;
  const activeMw = ((totalActiveKva * 0.90) / 1000).toFixed(2);

  const metrics = {
    total,
    normal,
    warning,
    critical,
    totalKva,
    totalActiveKva,
    totalMva,
    avgLoadPercent,
    activeMw,
  };

  return (
    <TransformerContext.Provider
      value={{
        transformers,
        selectedId,
        setSelectedId,
        selectedTransformer,
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        currentUser,
        accounts,
        auditLogs,
        toast,
        showToast,
        hideToast,
        saveTransformer,
        deleteTransformer,
        resetToDefaults,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        approveRequest,
        rejectRequest,
        temporaryGrant,
        revokeAccess,
        submitRequest,
        addAuditLog,
        triggerSync,
        metrics,
      }}
    >
      {children}
    </TransformerContext.Provider>
  );
};

export const useTransformers = () => {
  const context = useContext(TransformerContext);
  if (!context) {
    throw new Error('useTransformers must be used within a TransformerProvider');
  }
  return context;
};
