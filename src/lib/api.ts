import { Transformer, AccountRecord, AuditLogItem, InspectionRecord, TransformerIncidentLog } from '../types';

export interface SyncStatus {
  lastUpdated: number;
  count: number;
  accountsCount: number;
  inspectionsCount?: number;
}

export async function fetchTransformersApi(): Promise<{ data: Transformer[]; lastUpdated: number } | null> {
  try {
    const res = await fetch('/api/transformers', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch transformers from server API:', err);
    return null;
  }
}

export async function saveTransformersApi(transformers: Transformer[]): Promise<boolean> {
  try {
    const res = await fetch('/api/transformers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transformers }),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save transformers to server API:', err);
    return false;
  }
}

export async function saveSingleTransformerApi(id: string, record: Partial<Transformer>): Promise<boolean> {
  try {
    const res = await fetch(`/api/transformers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to update transformer on server API:', err);
    return false;
  }
}

export async function deleteTransformerApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transformers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete transformer on server API:', err);
    return false;
  }
}

export async function resetTransformersApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/transformers/reset', {
      method: 'POST',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to reset transformers on server API:', err);
    return false;
  }
}

export async function fetchAccountsApi(): Promise<{ data: AccountRecord[]; lastUpdated: number } | null> {
  try {
    const res = await fetch('/api/accounts', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch accounts from server API:', err);
    return null;
  }
}

export async function saveAccountApi(account: AccountRecord): Promise<boolean> {
  try {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save account to server API:', err);
    return false;
  }
}

export async function updateAccountApi(id: string | number, updates: Partial<AccountRecord>): Promise<boolean> {
  try {
    const res = await fetch(`/api/accounts/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to update account on server API:', err);
    return false;
  }
}

export async function deleteAccountApi(id: string | number): Promise<boolean> {
  try {
    const res = await fetch(`/api/accounts/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete account on server API:', err);
    return false;
  }
}

export async function fetchAuditLogsApi(): Promise<{ data: AuditLogItem[] } | null> {
  try {
    const res = await fetch('/api/audit-logs', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch audit logs from server API:', err);
    return null;
  }
}

export async function addAuditLogApi(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<boolean> {
  try {
    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type }),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to post audit log to server API:', err);
    return false;
  }
}

export async function fetchSyncStatusApi(): Promise<SyncStatus | null> {
  try {
    const res = await fetch('/api/sync/status', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchInspectionsApi(): Promise<{ data: InspectionRecord[]; lastUpdated: number } | null> {
  try {
    const res = await fetch('/api/inspections', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch inspections from server API:', err);
    return null;
  }
}

export async function saveInspectionApi(record: InspectionRecord): Promise<boolean> {
  try {
    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save inspection to server API:', err);
    return false;
  }
}

export async function deleteInspectionApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/inspections/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete inspection from server API:', err);
    return false;
  }
}

export async function resetInspectionsApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/inspections/reset', {
      method: 'POST',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to reset inspections on server API:', err);
    return false;
  }
}

// Line Cutout Records API
export async function fetchLineCutoutRecordsApi(): Promise<{ data: any[]; lastUpdated?: number }> {
  try {
    const res = await fetch('/api/line-cutout-records', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch line cutout records from server API:', err);
    return { data: [] };
  }
}

export async function saveLineCutoutRecordApi(record: any): Promise<boolean> {
  try {
    const res = await fetch('/api/line-cutout-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save line cutout record to server API:', err);
    return false;
  }
}

export async function deleteLineCutoutRecordApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/line-cutout-records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete line cutout record from server API:', err);
    return false;
  }
}

// Quick Field Logs API
export async function fetchQuickFieldLogsApi(): Promise<{ data: any[]; lastUpdated?: number }> {
  try {
    const res = await fetch('/api/quick-field-logs', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch quick field logs from server API:', err);
    return { data: [] };
  }
}

export async function saveQuickFieldLogApi(log: any): Promise<boolean> {
  try {
    const res = await fetch('/api/quick-field-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save quick field log to server API:', err);
    return false;
  }
}

export async function deleteQuickFieldLogApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/quick-field-logs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete quick field log from server API:', err);
    return false;
  }
}

export async function fetchTransformerIncidentsApi(): Promise<{ data: TransformerIncidentLog[] }> {
  try {
    const res = await fetch('/api/transformer-incidents', { credentials: 'same-origin' });
    if (!res.ok) return { data: [] };
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch transformer incidents from server API:', err);
    return { data: [] };
  }
}

export async function saveTransformerIncidentApi(incident: TransformerIncidentLog): Promise<boolean> {
  try {
    const res = await fetch('/api/transformer-incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save transformer incident to server API:', err);
    return false;
  }
}

export async function deleteTransformerIncidentApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/transformer-incidents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete transformer incident from server API:', err);
    return false;
  }
}

