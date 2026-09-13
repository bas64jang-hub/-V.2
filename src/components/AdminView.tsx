import React, { useState, useEffect } from 'react';
import { useTransformers } from '../context/TransformerContext';
import { Transformer, OperationalStatus, AccountRecord } from '../types';
import {
  Shield,
  ShieldCheck,
  Lock,
  UserCheck,
  UserPlus,
  Key,
  BadgeAlert,
  Send,
  Radio,
  FileSpreadsheet,
  UploadCloud,
  Download,
  RotateCcw,
  Save,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Copy,
  Check,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  LogOut,
  Sliders,
  Compass,
  Mail,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AtSign,
} from 'lucide-react';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AdminView: React.FC = () => {
  const {
    transformers,
    selectedId,
    setSelectedId,
    saveTransformer,
    deleteTransformer,
    resetToDefaults,
    triggerSync,
    userRole,
    currentUser,
    login,
    loginWithGoogle,
    logout,
    accounts,
    approveRequest,
    rejectRequest,
    temporaryGrant,
    revokeAccess,
    submitRequest,
    showToast,
  } = useTransformers();

  // Auth portal state: 'login' as default so users see the username window directly
  const [authTab, setAuthTab] = useState<'login' | 'request'>('login');

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [unapprovedWarn, setUnapprovedWarn] = useState<{ show: boolean; empid: string; name: string } | null>(null);
  const [requestSuccessNotice, setRequestSuccessNotice] = useState<{ show: boolean; username: string; name: string } | null>(null);

  // Approval Center filtering (For Super Admin Console)
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'gmail' | 'pea'>('all');
  const [showAllPasswords, setShowAllPasswords] = useState<boolean>(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string | number, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [vaultSearch, setVaultSearch] = useState<string>('');

  const togglePasswordVisibility = (id: string | number) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // fallback
    }
    setCopiedKey(key);
    showToast(`คัดลอก "${text}" เรียบร้อยแล้ว`, 'COPIED', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Logged-in admin console tab switcher
  const [activeAdminTab, setActiveAdminTab] = useState<'transformers' | 'accounts'>('transformers');
  const [preApproveEmail, setPreApproveEmail] = useState('');
  const [preApproveName, setPreApproveName] = useState('');
  const [preApproveRole, setPreApproveRole] = useState('Transformer Editor');

  // Request form state (initially empty)
  const [reqName, setReqName] = useState('');
  const [reqPosition, setReqPosition] = useState('วิศวกรไฟฟ้า');
  const [reqEmpid, setReqEmpid] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPass, setReqPass] = useState('');
  const [reqDept, setReqDept] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqRole, setReqRole] = useState('Transformer Editor');
  const [reqReason, setReqReason] = useState('');

  // Computed Super Admin flag (Only Super Admin sees approval control commands)
  const isSuperAdmin =
    userRole === 'superadmin' ||
    currentUser?.empid?.toLowerCase() === 'super9955' ||
    currentUser?.name?.toLowerCase() === 'super9955';

  // Transformer Editor State
  const [editingId, setEditingId] = useState<string>('TR-001');
  const [formId, setFormId] = useState<string>('TR-001');
  const [formName, setFormName] = useState<string>('');
  const [formArea, setFormArea] = useState<string>('');
  const [formKva, setFormKva] = useState<number>(500);
  const [formLoadKva, setFormLoadKva] = useState<number>(325);
  const [formVoltage, setFormVoltage] = useState<string>('400/230 V');
  const [formPf, setFormPf] = useState<string>('0.92 Lag');
  const [formFuse, setFormFuse] = useState<string>('25T Type K');
  const [formMccb, setFormMccb] = useState<string>('800A 3P 36kA ICS');
  const [formStatus, setFormStatus] = useState<OperationalStatus>('normal');
  const [formLat, setFormLat] = useState<string>('14.9738');
  const [formLng, setFormLng] = useState<string>('102.0837');
  const [formPoleId, setFormPoleId] = useState<string>('PEA-KORAT-A109');
  const [formMountType, setFormMountType] = useState<string>('นั่งร้านเสาคู่ H-Beam 12 ม.');
  const [pinPos, setPinPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [adminMapMode, setAdminMapMode] = useState<'google' | 'grid'>('google');

  // Table filter in Admin
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Sync selected transformer into editor
  useEffect(() => {
    const target = transformers.find((t) => t.id === editingId) || transformers[0];
    if (target) {
      setFormId(target.id);
      setFormName(target.name);
      setFormArea(target.area);
      setFormKva(target.kva);
      setFormLoadKva(target.loadKva);
      setFormVoltage(target.voltage);
      setFormPf(target.pf);
      setFormFuse(target.fuse);
      setFormMccb(target.mccb);
      setFormStatus(target.status);
      setFormLat(target.lat);
      setFormLng(target.lng);
      setFormPoleId(target.poleId);
      setFormMountType(target.mountType);
    }
  }, [editingId, transformers]);

  const handlePreApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preApproveEmail.trim() || !preApproveEmail.includes('@')) {
      showToast('กรุณาระบุอีเมล Gmail ให้ถูกต้อง', 'INVALID_EMAIL', 'error');
      return;
    }

    const cleanEmail = preApproveEmail.trim().toLowerCase();
    const username = cleanEmail.split('@')[0];
    const name = preApproveName.trim() || username;

    // Check if already in accounts
    const existing = accounts.find((a) => a.email?.toLowerCase() === cleanEmail);
    if (existing) {
      approveRequest(existing.id);
      showToast(`อนุมัติสิทธิ์ให้บัญชี ${cleanEmail} เรียบร้อยแล้ว`, 'PRE_APPROVED', 'success');
    } else {
      submitRequest({
        empid: `GMAIL-${username.toUpperCase().slice(0, 10)}`,
        name,
        email: cleanEmail,
        role: preApproveRole,
        position: 'วิศวกรไฟฟ้า (อนุมัติสิทธิ์ล่วงหน้า)',
        dept: 'กฟภ. การไฟฟ้าส่วนภูมิภาค (Gmail SSO)',
        reason: 'Super Admin อนุมัติสิทธิ์ล่วงหน้า เข้าสู่ระบบครั้งแรกได้ทันที',
        provider: 'google',
      });
      // Immediately approve it
      setTimeout(() => {
        const newlyAdded = accounts.find((a) => a.email?.toLowerCase() === cleanEmail);
        if (newlyAdded) approveRequest(newlyAdded.id);
      }, 50);
      showToast(`เพิ่มและอนุมัติสิทธิ์ล่วงหน้าให้ ${cleanEmail} เรียบร้อย สามารถล็อกอินได้ทันที`, 'PRE_APPROVED', 'success');
    }

    setPreApproveEmail('');
    setPreApproveName('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(loginId, loginPass);
    if (!result.success) {
      if (result.account && result.account.status === 'pending') {
        setUnapprovedWarn({
          show: true,
          empid: result.account.empid,
          name: result.account.name,
        });
      }
    } else {
      setUnapprovedWarn(null);
      setRequestSuccessNotice(null);
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmpid = reqEmpid.trim();
    const cleanName = reqName.trim();
    const cleanEmail = reqEmail.trim();

    if (!cleanEmpid || !cleanName) {
      showToast('กรุณาระบุชื่อและรหัสเข้าใช้งาน / ยูสเซอร์เนม', 'VALIDATION_ERR', 'error');
      return;
    }

    submitRequest({
      empid: cleanEmpid,
      name: cleanName,
      email: cleanEmail,
      pass: reqPass.trim() || '123456',
      role: reqRole,
      position: reqPosition,
      dept: reqDept,
      reason: reqReason,
      provider: 'pea',
    });

    // Notify user that request is submitted and approval will be verified by Super Admin
    setRequestSuccessNotice({
      show: true,
      username: cleanEmpid,
      name: cleanName,
    });

    // Auto-fill username into login form and switch to login tab
    setLoginId(cleanEmpid);
    setLoginPass(reqPass.trim() || '123456');
    setAuthTab('login');
    setUnapprovedWarn(null);
  };

  const handleQuickApprovePending = (empid: string) => {
    const target = accounts.find((a) => a.empid === empid);
    if (target) {
      approveRequest(target.id);
      setUnapprovedWarn(null);
    }
  };

  // Editor calculations
  const calculatedPercent = formKva > 0 ? Math.min(150, Math.round((formLoadKva / formKva) * 100 * 10) / 10) : 0;

  const handleSelectKva = (val: number) => {
    setFormKva(val);
    // Auto-suggest fuse
    if (val <= 250) setFormFuse('15T Type K');
    else if (val <= 500) setFormFuse('25T Type K');
    else if (val <= 800) setFormFuse('40T Type K');
    else if (val <= 1000) setFormFuse('50T Type K');
    else if (val <= 1600) setFormFuse('80T Type K');
    else setFormFuse('100T Type K');
  };

  const handleSaveRecord = () => {
    saveTransformer({
      id: formId,
      name: formName,
      area: formArea,
      kva: formKva,
      loadKva: formLoadKva,
      voltage: formVoltage,
      pf: formPf,
      fuse: formFuse,
      mccb: formMccb,
      status: formStatus,
      lat: formLat,
      lng: formLng,
      poleId: formPoleId,
      mountType: formMountType,
    });
  };

  const handleAddNewTransformer = () => {
    const nextNum = transformers.length + 1;
    const nextId = `TR-${String(nextNum).padStart(3, '0')}`;
    setEditingId(nextId);
    setFormId(nextId);
    setFormName(`สถานีจ่ายไฟชุมชนใหม่ โซน ${String.fromCharCode(65 + transformers.length)}`);
    setFormArea('ต.เมืองใหม่ อ.เมืองนครราชสีมา (ขยายเขตบริการ กฟภ.)');
    setFormKva(500);
    setFormLoadKva(250);
    setFormVoltage('22 kV / 400-230 V');
    setFormPf('0.92 Lag');
    setFormFuse('25T Type K');
    setFormMccb('800A 3P 36kA ICS');
    setFormStatus('normal');
    setFormLat('14.9780');
    setFormLng('102.0950');
    setFormPoleId(`PEA-KORAT-NEW${nextNum}`);
    setFormMountType('นั่งร้านเสาคู่ H-Beam 12 ม.');
    showToast(`เข้าสู่โหมดเพิ่มหม้อแปลงลูกใหม่ (${nextId}) กรุณากรอกสเปกและกดบันทึก`, 'FORM_READY', 'info');
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);

    setPinPos({ x: pctX, y: pctY });

    const newLat = (14.9500 + ((rect.height - y) / rect.height) * 0.05).toFixed(4);
    const newLng = (102.0700 + (x / rect.width) * 0.05).toFixed(4);

    setFormLat(newLat);
    setFormLng(newLng);
    showToast(`ปักหมุดพิกัดใหม่: ${newLat}° N, ${newLng}° E`, 'GPS_UPDATED', 'info');
  };

  const handleExportReport = () => {
    const headers = ['ID', 'Name', 'Area', 'kVA', 'Load_kVA', 'Load_Percent', 'Voltage', 'Fuse', 'MCCB', 'Latitude', 'Longitude', 'Pole_ID'];
    const rows = transformers.map((t) => [
      t.id,
      `"${t.name}"`,
      `"${t.area}"`,
      t.kva,
      t.loadKva,
      t.percent,
      `"${t.voltage}"`,
      `"${t.fuse}"`,
      `"${t.mccb}"`,
      t.lat,
      t.lng,
      `"${t.poleId}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PEA_Transformer_Grid_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`ส่งออกรายงานสรุปพิกัดหม้อแปลง (${transformers.length} เครื่อง) สำเร็จ!`, 'EXPORT_OK', 'success');
  };

  // Filtered Table rows
  const filteredTableRows = transformers.filter((t) => {
    const q = tableSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.area.toLowerCase().includes(q) ||
      t.poleId.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (tableStatusFilter === 'all') return true;
    return t.status === tableStatusFilter;
  });

  // Render Portal if user is Guest
  // Render Portal if user is Guest
  if (userRole === 'guest') {
    return (
      <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
        {/* Security Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                <span>PEA AUTHORIZED ACCESS</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ระบบยืนยันตัวตนและเข้าใช้งานแอดมิน (Admin Portal)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ระบบจัดการการอนุมัติสิทธิ์ และแอดมินที่ได้รับอนุมัติแล้วสามารถเข้าสู่หน้าแก้ไขคำสั่งต่างๆ
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <Shield className="w-6 h-6 text-[#006948]" />
            <div className="text-xs">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">SECURITY LEVEL</span>
              <span className="font-bold text-slate-800">PEA Security Enforced</span>
            </div>
          </div>
        </div>

        {/* Notice 1: Request Success Banner */}
        {requestSuccessNotice?.show && (
          <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl flex items-start gap-3.5 animate-in fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#006948] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-900">
                  ✅ บันทึกคำขอสิทธิ์เข้าถึงสำเร็จแล้ว!
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                  PENDING CLEARANCE
                </span>
              </div>
              <p className="leading-relaxed text-slate-700">
                ระบบได้ส่งคำขอสิทธิ์ของ <strong>{requestSuccessNotice.name}</strong> เข้าสู่ระบบเรียบร้อยแล้ว
              </p>
              <div className="p-3 bg-white/90 rounded-lg border border-emerald-200 space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#006948]" />
                  <span>ข้อมูลยูสเซอร์สำหรับเข้าใช้งาน:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>รหัสเข้าใช้งาน (Username): <strong className="font-mono text-emerald-800 text-sm">{requestSuccessNotice.username}</strong></div>
                  <div>ชื่อผู้ขอสิทธิ์: <strong className="text-slate-800">{requestSuccessNotice.name}</strong></div>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                  🔒 <strong>ระเบียบความปลอดภัย:</strong> หน้าต่างยืนยันสิทธิ์จะย้ายไปรอการยืนยันตัวตนก่อน เมื่อได้รับการอนุมัติสิทธิ์แล้ว ท่านสามารถนำยูสเซอร์เนมนี้มากรอกในหน้าต่างด้านล่างเพื่อเปลี่ยนไปหน้าแก้ไขคำสั่งต่างๆ ได้ทันที
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRequestSuccessNotice(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                >
                  ปิดข้อความนี้
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notice 2: Unapproved Account Warning */}
        {unapprovedWarn?.show && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl flex items-start gap-3.5 animate-in fade-in shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold text-sm text-amber-900 flex items-center justify-between">
                <span>ยูสเซอร์เนม {unapprovedWarn.empid} อยู่ระหว่างรอการอนุมัติสิทธิ์</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                  WAITING APPROVAL
                </span>
              </div>
              <p className="leading-relaxed text-slate-700">
                ยูสเซอร์เนม <strong>{unapprovedWarn.empid}</strong> ({unapprovedWarn.name}) ได้รับการบันทึกแล้ว แต่หน้าต่างยืนยันสิทธิ์จะย้ายไปรอการยืนยันตัวตนก่อน เมื่อได้รับการอนุมัติแล้ว ท่านจะสามารถใส่ยูสเซอร์เนมนี้เพื่อเปลี่ยนไปหน้าแก้ไขคำสั่งต่างๆ ได้ทันที
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUnapprovedWarn(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  ปิดการแจ้งเตือน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portal Forms Container */}
        <div className="flex flex-col gap-4">
          {/* Segmented Mode Control Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center border border-slate-200 gap-1 sm:gap-0 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setUnapprovedWarn(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                authTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Key className="w-4 h-4 text-[#006948]" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab('request');
                setUnapprovedWarn(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                authTab === 'request'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#006948]" />
              <span>ขอสิทธิ์เข้าถึง (Request Access)</span>
            </button>
          </div>

          {/* TAB 1: USERNAME / PASSWORD LOGIN */}
          {authTab === 'login' && (
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#006948]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      หน้าต่างใส่ยูสเซอร์เนมเพื่อเข้าสู่ระบบ (Sign In Window)
                    </h2>
                    <p className="text-xs text-slate-500">
                      หลังจากสมัครยูสแล้ว ให้ใส่ยูสเซอร์เนมเพื่อเปลี่ยนไปหน้าแก้ไขคำสั่งต่างๆ
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  PEA SECURE AUTH
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>ยูสเซอร์เนม *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder=""
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>รหัสผ่านเข้าใช้งาน (Password) *</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#006948] hover:bg-[#005137] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors mt-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (เปลี่ยนไปหน้าแก้ไขคำสั่งต่างๆ)</span>
                </button>

                {/* Quick test credentials helper */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">ล็อกอินด่วนเพื่อทดสอบ:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId('Super9955');
                        setLoginPass('13579');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      👑 Super Admin (Super9955 / 13579)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginId('PEA-108842');
                        setLoginPass('Admin@2024');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      แอดมิน (PEA-108842)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REQUEST ACCESS (Name, Username, Email, Password) */}
          {authTab === 'request' && (
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#006948]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      หน้ากดขอสิทธิ์เข้าถึง (Request Access Form)
                    </h2>
                    <p className="text-xs text-slate-500">
                      กำหนดชื่อ ยูสเซอร์เนม อีเมล และรหัสผ่าน เพื่อส่งคำขออนุมัติสิทธิ์เข้าใช้งาน
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  ACCESS REQUEST
                </span>
              </div>

              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      ชื่อ-นามสกุล (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      ยูสเซอร์เนม *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqEmpid}
                      onChange={(e) => setReqEmpid(e.target.value)}
                      placeholder=""
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400">
                      ยูสเซอร์นี้จะใช้สำหรับใส่ในหน้าต่างเข้าสู่ระบบหลังจากได้รับการอนุมัติ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      ที่อยู่อีเมล (Email Address) *
                    </label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="กรอกอีเมล เช่น user@gmail.com หรือ user@pea.co.th"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">
                      รหัสผ่านเข้าใช้งาน (Password) *
                    </label>
                    <input
                      type="password"
                      required
                      value={reqPass}
                      onChange={(e) => setReqPass(e.target.value)}
                      placeholder="กำหนดรหัสผ่านเข้าใช้งาน"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]/30 focus:border-[#006948] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">ตำแหน่งงาน (Position)</label>
                    <input
                      type="text"
                      value={reqPosition}
                      onChange={(e) => setReqPosition(e.target.value)}
                      placeholder="เช่น วิศวกรไฟฟ้า หรือ ช่างเทคนิค"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800">ระดับสิทธิ์ที่ต้องการ</label>
                    <select
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs"
                    >
                      <option value="Transformer Editor">สิทธิ์แก้ไขข้อมูลหม้อแปลงและ GIS (Transformer Editor)</option>
                      <option value="Grid Protection Operator">สิทธิ์คำนวณและปรับฟิวส์ (Protection Operator)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">เหตุผลความจำเป็นในการขอสิทธิ์</label>
                  <textarea
                    rows={2}
                    required
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    placeholder="ระบุเหตุผลความจำเป็น"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  ></textarea>
                </div>

                {/* Important Workflow Notice */}
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>ขั้นตอนหลังคลิกยืนยันขอใช้สิทธิ์:</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    เมื่อคลิก <strong>"ยืนยันขอใช้สิทธิ์"</strong> ข้อมูลจะถูกส่งเข้าสู่ระบบเพื่อรอการยืนยันตัวตนและอนุมัติสิทธิ์ก่อน เมื่อได้รับการอนุมัติแล้ว ท่านสามารถนำยูสเซอร์เนมมากรอกในหน้าต่างล็อกอินเพื่อเปลี่ยนไปหน้าแก้ไขคำสั่งต่างๆ ได้ทันที
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#006948] hover:bg-[#005137] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ยืนยันขอใช้สิทธิ์ (Submit Access Request)</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Admin Management Center if logged in
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Breadcrumb & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span>ระบบจัดการข้อมูล (แอดมิน)</span>
            <span>/</span>
            <span className="text-[#006948]">จัดการข้อมูลหม้อแปลงและพิกัดเสา GIS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>ระบบจัดการข้อมูลและควบคุมหม้อแปลงไฟฟ้า (Admin Console)</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948]">
              READ / WRITE ACCESS
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>นำเข้า CSV / GIS</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงาน</span>
          </button>

          <button
            type="button"
            onClick={triggerSync}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006948] text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-emerald-200 shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทดสอบซิงค์ไปหน้าบ้าน</span>
          </button>

          <button
            type="button"
            onClick={handleAddNewTransformer}
            className="px-3.5 py-2 bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มหม้อแปลงลูกใหม่</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1 border border-red-200 transition-colors"
            title="ออกจากระบบแอดมิน"
          >
            <LogOut className="w-4 h-4" />
            <span>ออก</span>
          </button>
        </div>
      </div>

      {/* Admin Session Identity & Module Switcher Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 shrink-0">
            {currentUser?.email ? (
              <GoogleIcon className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#006948]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">เข้าสู่ระบบโดย:</span>
              <strong className="text-xs sm:text-sm text-slate-900">{currentUser?.name}</strong>
              {currentUser?.email && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-semibold flex items-center gap-1">
                  <GoogleIcon className="w-3 h-3" />
                  <span>{currentUser.email}</span>
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>ตำแหน่ง/สิทธิ์: <strong className="text-[#006948]">{currentUser?.role}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">สถานะ: อนุมัติสิทธิ์สมบูรณ์</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs (Only Super Admin sees approval control commands) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveAdminTab('transformers')}
            className={`flex-1 md:flex-initial py-2 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeAdminTab === 'transformers'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#006948]" />
            <span>หน้าแก้ไข คำสั่งต่างๆ (Edit &amp; Commands)</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveAdminTab('accounts')}
              className={`flex-1 md:flex-initial py-2 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeAdminTab === 'accounts'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>จัดการสิทธิ์ &amp; รหัสผ่านแอดมิน (Super Admin Vault)</span>
              {accounts.filter((a) => a.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                  {accounts.filter((a) => a.status === 'pending').length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SUPER ADMIN ACCOUNTS & APPROVAL MANAGEMENT (Super Admin Only) */}
      {isSuperAdmin && activeAdminTab === 'accounts' && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in">
          {/* Pre-Approve Gmail Form Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#006948]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    อนุมัติสิทธิ์ล่วงหน้าให้บัญชี Gmail (Pre-Approve Gmail Account)
                  </h2>
                  <p className="text-xs text-slate-500">
                    เพิ่มและอนุมัติบัญชี Gmail ล่วงหน้า เพื่อให้ผู้ใช้สามารถล็อกอินเข้าสู่ระบบได้ทันทีโดยไม่ต้องรออนุมัติ
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#006948] font-bold self-start sm:self-auto">
                SUPER ADMIN PRIVILEGE
              </span>
            </div>

            <form onSubmit={handlePreApproveSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>ที่อยู่อีเมล Gmail</span>
                </label>
                <input
                  type="email"
                  required
                  value={preApproveEmail}
                  onChange={(e) => setPreApproveEmail(e.target.value)}
                  placeholder="เช่น Bas64jang@gmail.com"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#006948] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>ชื่อผู้ใช้งาน (Display Name)</span>
                </label>
                <input
                  type="text"
                  value={preApproveName}
                  onChange={(e) => setPreApproveName(e.target.value)}
                  placeholder="เช่น วิศวกรประจำเขต กฟภ."
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#006948] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>ระดับสิทธิ์</span>
                </label>
                <select
                  value={preApproveRole}
                  onChange={(e) => setPreApproveRole(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#006948] focus:bg-white"
                >
                  <option value="Super Admin (ผู้อนุมัติระบบ)">Super Admin (ผู้อนุมัติระบบ)</option>
                  <option value="Transformer Editor">Transformer Editor (จัดการหม้อแปลง)</option>
                  <option value="Grid Protection Operator">Grid Protection Operator (ฟิวส์)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-10 bg-[#006948] hover:bg-[#005137] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>อนุมัติทันที</span>
                </button>
              </div>
            </form>
          </div>

          {/* SUPER ADMIN CREDENTIAL VAULT: View all admin usernames and passwords */}
          <div className="bg-white text-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      สมุดข้อมูลยูสเซอร์เนมและรหัสผ่านแอดมินทั้งหมด (Super Admin Vault)
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      SUPER ADMIN ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    เฉพาะ Super Admin เท่านั้นที่สามารถดูชื่อยูสเซอร์เนม (Username) และรหัสผ่าน (Password) ของแอดมินทุกคนในระบบได้
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllPasswords(!showAllPasswords)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {showAllPasswords ? <EyeOff className="w-3.5 h-3.5 text-slate-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{showAllPasswords ? 'ซ่อนรหัสผ่านทั้งหมด' : 'แสดงรหัสผ่านทั้งหมด'}</span>
                </button>
              </div>
            </div>

            {/* Vault Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, ยูสเซอร์เนม, แผนก, หรืออีเมล..."
                  className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006948]"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="text-xs text-slate-500 self-end sm:self-auto font-mono">
                พบแอดมิน/ผู้ใช้งาน: <strong className="text-slate-900">{accounts.length}</strong> บัญชี
              </div>
            </div>

            {/* Credential Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs text-slate-700 min-w-[850px]">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">ชื่อ-นามสกุล / ตำแหน่ง</th>
                    <th className="py-3 px-3.5">ชื่อยูสเซอร์เนม (Username)</th>
                    <th className="py-3 px-3.5">รหัสผ่าน (Password)</th>
                    <th className="py-3 px-3.5">อีเมล / แผนก</th>
                    <th className="py-3 px-3.5">ระดับสิทธิ์</th>
                    <th className="py-3 px-3.5">สถานะ</th>
                    <th className="py-3 px-3.5 text-right">คัดลอก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts
                    .filter((acc) => {
                      if (!vaultSearch.trim()) return true;
                      const q = vaultSearch.toLowerCase();
                      return (
                        acc.name?.toLowerCase().includes(q) ||
                        acc.empid?.toLowerCase().includes(q) ||
                        acc.email?.toLowerCase().includes(q) ||
                        acc.dept?.toLowerCase().includes(q) ||
                        acc.position?.toLowerCase().includes(q)
                      );
                    })
                    .map((acc) => {
                      const isPwdRevealed = showAllPasswords || revealedPasswords[acc.id];
                      const isGoogle = acc.provider === 'google' || acc.email?.includes('@gmail.com');
                      return (
                        <tr key={`vault-${acc.id}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              {acc.empid?.toLowerCase() === 'super9955' && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{acc.position || 'เจ้าหน้าที่ กฟภ.'}</div>
                          </td>

                          {/* Username column */}
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[#006948] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs select-all">
                                {acc.empid}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(acc.empid, `table-user-${acc.id}`)}
                                title="คัดลอกชื่อยูสเซอร์เนม"
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                {copiedKey === `table-user-${acc.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Password column */}
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs select-all min-w-[90px] text-center">
                                {isPwdRevealed
                                  ? (acc.pass || (isGoogle ? '(Google SSO)' : '123456'))
                                  : '••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                title={isPwdRevealed ? 'ซ่อนรหัส' : 'ดูรหัสผ่าน'}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-800 transition-colors cursor-pointer"
                              >
                                {isPwdRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(acc.pass || (isGoogle ? 'Google SSO' : '123456'), `table-pass-${acc.id}`)}
                                title="คัดลอกรหัสผ่าน"
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                {copiedKey === `table-pass-${acc.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Email & Dept */}
                          <td className="py-2.5 px-3.5">
                            <div className="text-slate-800 font-mono text-[11px]">{acc.email || '-'}</div>
                            <div className="text-[10px] text-slate-500">{acc.dept || 'กฟภ.'}</div>
                          </td>

                          {/* Role */}
                          <td className="py-2.5 px-3.5">
                            <span className="text-[11px] font-semibold text-slate-800">{acc.role}</span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3.5">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                acc.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : acc.status === 'rejected'
                                  ? 'bg-red-50 text-red-800 border border-red-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                              }`}
                            >
                              {acc.status === 'approved'
                                ? 'อนุมัติแล้ว'
                                : acc.status === 'rejected'
                                ? 'เพิกถอน'
                                : 'รออนุมัติ'}
                            </span>
                          </td>

                          {/* Quick copy both */}
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const credText = `Username: ${acc.empid}\nPassword: ${acc.pass || '123456'}`;
                                copyToClipboard(credText, `table-both-${acc.id}`);
                              }}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-mono transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="คัดลอกทั้งชื่อยูสและรหัสผ่าน"
                            >
                              {copiedKey === `table-both-${acc.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">คัดลอกแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-500" />
                                  <span>ยูส+รหัส</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accounts List & Approvals Table */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#006948]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    รายการบัญชีผู้ใช้และการอนุมัติสิทธิ์ (All Accounts &amp; Approvals)
                  </h3>
                  <p className="text-xs text-slate-500">
                    เมื่อ Gmail ล็อกอินครั้งแรก จะขึ้นสถานะ "รออนุมัติ" เมื่อกดอนุมัติแล้ว ครั้งต่อไปจะสามารถเข้าใช้งานได้ทันที
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setApprovalFilter('all')}
                  className={`py-1 px-2.5 rounded-md transition-all ${
                    approvalFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ทั้งหมด ({accounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('pending')}
                  className={`py-1 px-2.5 rounded-md transition-all ${
                    approvalFilter === 'pending' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  รออนุมัติ ({accounts.filter((a) => a.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('gmail')}
                  className={`py-1 px-2.5 rounded-md transition-all flex items-center gap-1 ${
                    approvalFilter === 'gmail' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <GoogleIcon className="w-3 h-3" />
                  <span>Gmail ({accounts.filter((a) => a.provider === 'google' || a.email?.includes('@gmail.com')).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('pea')}
                  className={`py-1 px-2.5 rounded-md transition-all ${
                    approvalFilter === 'pea' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  กฟภ. ({accounts.filter((a) => a.provider !== 'google' && !a.email?.includes('@gmail.com')).length})
                </button>
              </div>
            </div>

            {/* Grid Cards of Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {accounts
                .filter((acc) => {
                  if (approvalFilter === 'pending') return acc.status === 'pending';
                  if (approvalFilter === 'gmail') return acc.provider === 'google' || acc.email?.includes('@gmail.com');
                  if (approvalFilter === 'pea') return acc.provider !== 'google' && !acc.email?.includes('@gmail.com');
                  return true;
                })
                .map((acc) => {
                  const isAppr = acc.status === 'approved';
                  const isRej = acc.status === 'rejected';
                  const isGoogle = acc.provider === 'google' || acc.email?.includes('@gmail.com');

                  return (
                    <div
                      key={acc.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        isAppr
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : isRej
                          ? 'bg-red-50/20 border-red-200 opacity-75'
                          : 'bg-white border-amber-300 shadow-xs ring-2 ring-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                            {isGoogle ? <GoogleIcon className="w-4 h-4" /> : <Shield className="w-4 h-4 text-[#006948]" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              {isGoogle && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                  GMAIL SSO
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {acc.email ? (
                                <span className="text-slate-800 font-semibold">{acc.email}</span>
                              ) : (
                                <span>{acc.position} • รหัส: <strong className="text-slate-800">{acc.empid}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isAppr
                              ? 'bg-emerald-100 text-[#006948]'
                              : isRej
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {isAppr ? 'อนุมัติแล้ว (เข้าได้ทันที)' : isRej ? 'ปฏิเสธ' : 'รออนุมัติครั้งแรก'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1">
                        <div>
                          <strong>สิทธิ์:</strong> <span className="text-[#006948] font-bold">{acc.role}</span>
                        </div>
                        {acc.reason && <div><strong>เหตุผล:</strong> {acc.reason}</div>}
                        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>ยื่นคำขอ: {acc.timeText}</span>
                          {acc.approvedAt && isAppr && (
                            <span className="text-[#006948] font-semibold">อนุมัติโดย: {acc.approvedBy || 'Super Admin'}</span>
                          )}
                        </div>
                      </div>

                      {/* Super Admin Credential Box: View Username & Password */}
                      <div className="p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs flex flex-col gap-2 shadow-xs">
                        <div className="flex items-center justify-between text-[10px] text-amber-800 font-mono font-bold uppercase tracking-wider pb-1 border-b border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>ข้อมูลล็อกอินของแอดมิน (Super Admin Visible)</span>
                          </div>
                          <span className="text-slate-400 font-mono">ID #{acc.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                          {/* Username */}
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-sans">ชื่อยูสเซอร์เนม (Username):</span>
                              <span className="font-mono font-bold text-[#006948] text-xs select-all">{acc.empid}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.empid, `card-user-${acc.id}`)}
                              title="คัดลอกชื่อยูส"
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              {copiedKey === `card-user-${acc.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 font-sans">รหัสผ่าน (Password):</span>
                              <span className="font-mono font-bold text-amber-900 text-xs select-all">
                                {showAllPasswords || revealedPasswords[acc.id]
                                  ? (acc.pass || (isGoogle ? '(Google SSO)' : '123456'))
                                  : '••••••••••••'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                title={revealedPasswords[acc.id] ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-amber-800 transition-colors cursor-pointer"
                              >
                                {revealedPasswords[acc.id] || showAllPasswords ? (
                                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(acc.pass || (isGoogle ? 'Google SSO' : '123456'), `card-pass-${acc.id}`)}
                                title="คัดลอกรหัสผ่าน"
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                {copiedKey === `card-pass-${acc.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {acc.email && (
                          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-400">อีเมลลงทะเบียน:</span>
                            <span className="font-mono text-slate-700">{acc.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {!isAppr ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approveRequest(acc.id)}
                              className="flex-1 py-1.5 px-3 bg-[#006948] hover:bg-[#005137] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>อนุมัติสิทธิ์ (Approve)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectRequest(acc.id)}
                              className="py-1.5 px-3 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-[#006948] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>บัญชีนี้สามารถล็อกอินเข้าได้ทันทีตลอดเวลา</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => revokeAccess(acc.id)}
                              className="py-1 px-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              เพิกถอนสิทธิ์
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TRANSFORMER MANAGEMENT & GIS EDITOR */}
      {activeAdminTab === 'transformers' && (
        <>
          {/* Live Sync Bridge Banner */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-[#006948] animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <span>🔗 ระบบซิงค์ข้อมูลแบบเรียลไทม์ (Live Sync Bridge Active: LocalStorage &amp; BroadcastChannel)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#006948] text-white font-bold">
                    SYNC BROADCAST: LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ทุกการบันทึกค่าพิกัด kVA, โหลดกระแสจริง, พิกัดฟิวส์ และ GIS เสา กฟภ. จะถูก Broadcast ส่งผลทันทีในหน้า “แดชบอร์ดภาพรวม” และ “ข้อมูลหม้อแปลงและแผนที่”
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetToDefaults}
              className="text-xs text-[#006948] hover:underline font-bold shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น 6 เครื่อง</span>
            </button>
          </div>

      {/* INLINE ACTIVE TRANSFORMER EDITOR & GEO-PINNING FORM */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
        {/* Editor Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006948] shrink-0">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  แก้ไขข้อมูลหม้อแปลง: {formId} ({formName || 'หม้อแปลงไฟฟ้า'})
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#006948] text-white px-2 py-0.5 rounded">
                  LIVE RECORD
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ปรับแต่งค่าพิกัดไฟฟ้า, การป้องกันฟิวส์ และปักหมุดพิกัดเสา กฟภ. ในระบบพร้อมกัน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditingId('TR-001')}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              คืนค่าเดิม
            </button>
            <button
              type="button"
              onClick={handleSaveRecord}
              className="py-2 px-4 rounded-xl bg-[#006948] hover:bg-[#005137] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกและซิงค์ข้อมูล (Save &amp; Sync)</span>
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Electrical Specs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">รหัสหม้อแปลง (ID) *</label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">ชื่อสถานที่ติดตั้ง *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 uppercase text-[11px]">ตำบล / พื้นที่ให้บริการ</label>
              <input
                type="text"
                value={formArea}
                onChange={(e) => setFormArea(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* kVA Rating Selector Quick Buttons */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 uppercase text-[11px]">ขนาดพิกัดกำลังไฟฟ้า (Rating kVA) *</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[250, 500, 800, 1000, 1600, 2000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectKva(val)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                      formKva === val
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val.toLocaleString()} kVA
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-slate-400 text-[11px]">กำหนดเอง:</span>
                  <input
                    type="number"
                    min="50"
                    value={formKva}
                    onChange={(e) => handleSelectKva(parseInt(e.target.value, 10) || 500)}
                    className="w-20 h-8 px-2 bg-slate-50 border border-slate-200 rounded font-mono text-xs font-bold text-right"
                  />
                  <span className="text-slate-500 font-mono">kVA</span>
                </div>
              </div>
            </div>

            {/* Voltage & Actual Load */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">แรงดันฝั่งต่ำ (Secondary Voltage)</label>
                <select
                  value={formVoltage}
                  onChange={(e) => setFormVoltage(e.target.value)}
                  className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="400/230 V">400/230 V (มาตรฐาน กฟภ.)</option>
                  <option value="380/220 V">380/220 V (ระบบดั้งเดิม)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">โหลดจริง (kVA Actual)</label>
                <input
                  type="number"
                  min="0"
                  value={formLoadKva}
                  onChange={(e) => setFormLoadKva(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">เพาเวอร์แฟกเตอร์ (PF)</label>
                <input
                  type="text"
                  value={formPf}
                  onChange={(e) => setFormPf(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-sm"
                />
              </div>
            </div>

            {/* Load Computation Slider & Bar */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-sans font-bold text-slate-700">อัตราส่วนการรับโหลดที่คำนวณได้:</span>
                <span
                  className={`font-bold text-sm ${
                    calculatedPercent > 90
                      ? 'text-red-600'
                      : calculatedPercent > 80
                      ? 'text-amber-600'
                      : 'text-[#006948]'
                  }`}
                >
                  {calculatedPercent}% {calculatedPercent > 90 ? '(วิกฤต)' : calculatedPercent > 80 ? '(เฝ้าระวัง)' : '(ปกติ)'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={Math.max(formKva * 1.2, 1000)}
                value={formLoadKva}
                onChange={(e) => setFormLoadKva(parseFloat(e.target.value))}
                className="w-full accent-[#006948] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    calculatedPercent > 90
                      ? 'bg-red-600'
                      : calculatedPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-[#006948]'
                  }`}
                  style={{ width: `${Math.min(calculatedPercent, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Protection Fuse & MCCB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">ฟิวส์ กฟภ. (Cutout)</label>
                <input
                  type="text"
                  value={formFuse}
                  onChange={(e) => setFormFuse(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">เมนสวิตช์ (MCCB)</label>
                <input
                  type="text"
                  value={formMccb}
                  onChange={(e) => setFormMccb(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 uppercase text-[11px]">สถานะการทำงาน</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as OperationalStatus)}
                  className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="normal">ปกติ (Normal)</option>
                  <option value="warning">เฝ้าระวัง (Warning)</option>
                  <option value="critical">วิกฤต (Critical)</option>
                  <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
                  <option value="offline">ปลดจ่ายไฟ (Offline)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Geo-Location & Interactive Map (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#006948]" />
                <span>พิกัดและเสาไฟฟ้า กฟภ. (GIS Pinning)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const lat = (14.9730 + Math.random() * 0.005).toFixed(4);
                  const lng = (102.0830 + Math.random() * 0.005).toFixed(4);
                  setFormLat(lat);
                  setFormLng(lng);
                  showToast(`ดึงพิกัด GPS สำเร็จ: ${lat}, ${lng}`, 'GPS_OK', 'info');
                }}
                className="text-[11px] text-[#006948] font-bold hover:underline"
              >
                ดึง GPS ปัจจุบัน
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">ละติจูด (Lat)</label>
                <input
                  type="text"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">ลองจิจูด (Lng)</label>
                <input
                  type="text"
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">รหัสเสา กฟภ.</label>
                <input
                  type="text"
                  value={formPoleId}
                  onChange={(e) => setFormPoleId(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">รูปแบบฐานติดตั้ง</label>
                <input
                  type="text"
                  value={formMountType}
                  onChange={(e) => setFormMountType(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Interactive Pinning Map Container */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">พิกัด GPS:</span>
                  <span className="font-mono text-[#006948] font-bold">{formLat}, {formLng}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAdminMapMode('google')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      adminMapMode === 'google'
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Google Maps สด
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminMapMode('grid')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      adminMapMode === 'grid'
                        ? 'bg-[#006948] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    คลิกปรับตำแหน่ง
                  </button>
                </div>
              </div>

              {adminMapMode === 'google' ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 flex flex-col">
                  <iframe
                    title="Live Google Maps Preview"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(formLat || '14.9738')},${encodeURIComponent(formLng || '102.0837')}&hl=th&z=16&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-800 border border-slate-200 shadow-xs flex items-center gap-1 pointer-events-none">
                    <MapPin className="w-3 h-3 text-red-600 fill-current" />
                    <span>{formId || 'หม้อแปลง'} • {formLat}, {formLng}</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleMapClick}
                  className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 cursor-crosshair select-none flex items-center justify-center"
                >
                  {/* Visual grid */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#006948_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {/* Vector Grid Roads */}
                  <svg className="absolute inset-0 w-full h-full text-slate-400/50" preserveAspectRatio="none" viewBox="0 0 400 200">
                    <path d="M 20 180 Q 150 120 220 80 T 380 40" fill="none" stroke="currentColor" strokeDasharray="6,4" strokeWidth="3" />
                    <path d="M 120 20 L 120 180" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M 200 90 L 320 180" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>

                  {/* Substation Landmark */}
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200 shadow-xs">
                    สถานีไฟฟ้านครราชสีมา 2 (22kV)
                  </div>

                  {/* Draggable/Movable Pin */}
                  <div
                    className="absolute z-10 flex flex-col items-center pointer-events-none transition-all duration-200"
                    style={{ left: `${pinPos.x}%`, top: `${pinPos.y}%`, transform: 'translate(-50%, -100%)' }}
                  >
                    <div className="bg-[#006948] text-white px-1.5 py-0.5 rounded font-mono text-[9px] font-bold shadow">
                      {formId}
                    </div>
                    <MapPin className="w-8 h-8 text-[#006948] fill-current drop-shadow-md" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRANSFORMER TABLE MANAGEMENT */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>รายการหม้อแปลงไฟฟ้าในระบบควบคุม</span>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {transformers.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              ตารางแสดงสถานะ โหลดพิกัด พิกัดฟิวส์ และเครื่องมือแก้ไขพิกัดแบบเร่งด่วน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="ค้นหารหัส, พื้นที่, เสา กฟภ..."
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <select
              value={tableStatusFilter}
              onChange={(e) => setTableStatusFilter(e.target.value)}
              className="h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="normal">ปกติ (Normal)</option>
              <option value="warning">เฝ้าระวัง (Warning)</option>
              <option value="critical">วิกฤต (Critical)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs min-w-[920px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">รหัส (ID)</th>
                <th className="py-2.5 px-3">ชื่อ / โซนติดตั้ง</th>
                <th className="py-2.5 px-3">ขนาดพิกัด</th>
                <th className="py-2.5 px-3">โหลดปัจจุบัน (% Load)</th>
                <th className="py-2.5 px-3">แรงดัน</th>
                <th className="py-2.5 px-3">พิกัด GIS / เสา กฟภ.</th>
                <th className="py-2.5 px-3">ฟิวส์ กฟภ.</th>
                <th className="py-2.5 px-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableRows.map((item) => {
                const isSelected = item.id === editingId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setEditingId(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/80 font-semibold ring-1 ring-[#006948]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#006948]">{item.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.area}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{item.kva.toLocaleString()} kVA</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold">{item.percent}%</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            item.percent > 90
                              ? 'bg-red-100 text-red-700'
                              : item.percent > 80
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-[#006948]'
                          }`}
                        >
                          {item.percent > 90 ? 'วิกฤต' : item.percent > 80 ? 'เฝ้าระวัง' : 'ปกติ'}
                        </span>
                      </div>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            item.percent > 90 ? 'bg-red-600' : item.percent > 80 ? 'bg-amber-500' : 'bg-[#006948]'
                          }`}
                          style={{ width: `${Math.min(item.percent, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{item.voltage}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="font-mono text-[11px]">{item.lat}, {item.lng}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.poleId}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.fuse}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(item.id);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3 text-[#006948]" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(item.id);
                            // navigate to detail
                          }}
                          className="p-1 hover:text-[#006948] text-slate-400"
                          title="ดูในหน้ารายละเอียด"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTransformer(item.id);
                          }}
                          className="p-1 hover:text-red-600 text-slate-400"
                          title="ลบข้อมูลหม้อแปลง"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#006948]" />
                <span>นำเข้าข้อมูลหม้อแปลง (CSV / GIS)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              อัปโหลดไฟล์ CSV หรือ GeoJSON มาตรฐาน กฟภ. เพื่อนำเข้าพิกัดเสาและข้อมูลหม้อแปลงอัตโนมัติ
            </p>

            <div
              onClick={() => {
                showToast('นำเข้าชุดข้อมูลตัวอย่าง PEA_Korat_Grid_Export.csv สำเร็จ 6 เครื่อง!', 'IMPORT_SUCCESS', 'success');
                setIsImportModalOpen(false);
              }}
              className="p-8 border-2 border-dashed border-slate-300 hover:border-[#006948] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors text-center"
            >
              <UploadCloud className="w-10 h-10 text-[#006948]" />
              <span className="text-xs font-bold text-slate-800">คลิกเพื่อจำลองการอัปโหลดไฟล์ CSV / GIS</span>
              <span className="text-[10px] text-slate-400">รองรับไฟล์ .csv, .geojson, .shp (สูงสุด 25MB)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
