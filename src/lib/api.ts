import { Transformer, AccountRecord, AuditLogItem } from '../types';

export interface SyncStatus {
  lastUpdated: number;
  count: number;
  accountsCount: number;
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
