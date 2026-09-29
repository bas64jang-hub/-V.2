import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transformer, AccountRecord, AuditLogItem, InspectionRecord, LineCutoutRecord, QuickFieldLog } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as required
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client appears offline. Realtime fallback in place.');
    }
  }
}
testConnection();

// Collection references
const TRANSFORMERS_COL = 'transformers';
const ACCOUNTS_COL = 'accounts';
const AUDIT_LOGS_COL = 'auditLogs';
const INSPECTIONS_COL = 'inspections';
const LINE_CUTOUT_RECORDS_COL = 'lineCutoutRecords';
const QUICK_FIELD_LOGS_COL = 'quickFieldLogs';

/**
 * Real-time listener for all transformers.
 * Fires instantly across all devices whenever any transformer is added, edited, or deleted.
 */
export function subscribeToTransformers(
  onUpdate: (transformers: Transformer[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, TRANSFORMERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Transformer[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Transformer);
      });
      // Sort items by ID
      items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to transformers in Firestore:', err);
      onError?.(err);
    }
  );
}

/**
 * Save / Update a transformer in Firestore.
 * Triggers realtime snapshot update to all listening clients worldwide.
 */
export async function saveTransformerToFirestore(transformer: Transformer): Promise<void> {
  const docRef = doc(db, TRANSFORMERS_COL, transformer.id);
  await setDoc(docRef, transformer, { merge: true });
}

/**
 * Delete a transformer from Firestore.
 */
export async function deleteTransformerFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, TRANSFORMERS_COL, id);
  await deleteDoc(docRef);
}

/**
 * Batch seed transformers if the collection is empty, has mismatched count, or contains old data.
 * Guarantees that only the exact 15 fleet transformers exist.
 */
export async function seedInitialTransformersIfEmpty(
  initialList: Transformer[]
): Promise<boolean> {
  try {
    const colRef = collection(db, TRANSFORMERS_COL);
    const snap = await getDocs(colRef);
    const validIds = new Set(initialList.map((t) => t.id));

    // Check if Firestore matches the exact 15 transformers
    const hasExact15 =
      !snap.empty &&
      snap.size === initialList.length &&
      snap.docs.every((d) => validIds.has(d.id));

    if (!hasExact15 && initialList.length > 0) {
      // Purge all old or mismatched documents
      if (!snap.empty) {
        const delBatch = writeBatch(db);
        snap.forEach((d) => delBatch.delete(d.ref));
        await delBatch.commit();
      }

      // Batch set the 15 transformers
      const batch = writeBatch(db);
      for (const item of initialList) {
        const ref = doc(db, TRANSFORMERS_COL, item.id);
        batch.set(ref, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to seed initial transformers:', e);
    return false;
  }
}

/**
 * Reset all transformers to defaults in Firestore.
 */
export async function resetTransformersInFirestore(defaultList: Transformer[]): Promise<void> {
  try {
    const colRef = collection(db, TRANSFORMERS_COL);
    const snap = await getDocs(colRef);
    
    // Delete in chunks
    const docRefs = snap.docs.map((d) => d.ref);
    const chunkSize = 350;
    for (let i = 0; i < docRefs.length; i += chunkSize) {
      const delBatch = writeBatch(db);
      const slice = docRefs.slice(i, i + chunkSize);
      slice.forEach((ref) => delBatch.delete(ref));
      await delBatch.commit();
    }

    // Insert in chunks
    for (let i = 0; i < defaultList.length; i += chunkSize) {
      const addBatch = writeBatch(db);
      const slice = defaultList.slice(i, i + chunkSize);
      for (const item of slice) {
        const ref = doc(db, TRANSFORMERS_COL, item.id);
        addBatch.set(ref, item);
      }
      await addBatch.commit();
    }
  } catch (e) {
    console.warn('Failed to reset transformers in Firestore:', e);
  }
}

/**
 * Real-time listener for accounts
 */
export function subscribeToAccounts(
  onUpdate: (accounts: AccountRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, ACCOUNTS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AccountRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AccountRecord);
      });
      items.sort((a, b) => Number(b.id) - Number(a.id));
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to accounts:', err);
      onError?.(err);
    }
  );
}

export async function saveAccountToFirestore(account: AccountRecord): Promise<void> {
  const docRef = doc(db, ACCOUNTS_COL, String(account.id));
  await setDoc(docRef, account, { merge: true });
}

export async function updateAccountInFirestore(
  id: string | number,
  partial: Partial<AccountRecord>
): Promise<void> {
  const docRef = doc(db, ACCOUNTS_COL, String(id));
  await setDoc(docRef, partial, { merge: true });
}

export async function seedInitialAccountsIfEmpty(
  initialAccounts: AccountRecord[]
): Promise<boolean> {
  try {
    const colRef = collection(db, ACCOUNTS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty && initialAccounts.length > 0) {
      const batch = writeBatch(db);
      for (const item of initialAccounts) {
        const ref = doc(db, ACCOUNTS_COL, String(item.id));
        batch.set(ref, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to seed accounts:', e);
    return false;
  }
}

/**
 * Real-time listener for audit logs
 */
export function subscribeToAuditLogs(
  onUpdate: (logs: AuditLogItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, AUDIT_LOGS_COL);
  const q = query(colRef, orderBy('id', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AuditLogItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AuditLogItem);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to audit logs:', err);
      onError?.(err);
    }
  );
}

export async function addAuditLogToFirestore(log: AuditLogItem): Promise<void> {
  const docRef = doc(db, AUDIT_LOGS_COL, String(log.id));
  await setDoc(docRef, log);
}

/**
 * Real-time listener for inspections (Form ข-2 มป.11-ป.68)
 */
export function subscribeToInspections(
  onUpdate: (inspections: InspectionRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, INSPECTIONS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: InspectionRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as InspectionRecord);
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to inspections:', err);
      onError?.(err);
    }
  );
}

export async function saveInspectionToFirestore(inspection: InspectionRecord): Promise<void> {
  const docRef = doc(db, INSPECTIONS_COL, inspection.id);
  await setDoc(docRef, inspection, { merge: true });
}

export async function deleteInspectionFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, INSPECTIONS_COL, id);
  await deleteDoc(docRef);
}

export async function seedInitialInspectionsIfEmpty(
  initialList: InspectionRecord[]
): Promise<boolean> {
  try {
    const colRef = collection(db, INSPECTIONS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty && initialList.length > 0) {
      const batch = writeBatch(db);
      for (const item of initialList) {
        const ref = doc(db, INSPECTIONS_COL, item.id);
        batch.set(ref, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to seed inspections in Firestore:', e);
    return false;
  }
}

/**
 * Real-time listener for Line Cutout Records
 */
export function subscribeToLineCutoutRecords(
  onUpdate: (records: LineCutoutRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, LINE_CUTOUT_RECORDS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: LineCutoutRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as LineCutoutRecord);
      });
      items.sort((a, b) => (b.recordedAt || 0) - (a.recordedAt || 0));
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to line cutout records:', err);
      onError?.(err);
    }
  );
}

export async function saveLineCutoutRecordToFirestore(record: LineCutoutRecord): Promise<void> {
  const docRef = doc(db, LINE_CUTOUT_RECORDS_COL, record.id);
  await setDoc(docRef, record, { merge: true });
}

export async function deleteLineCutoutRecordFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, LINE_CUTOUT_RECORDS_COL, id);
  await deleteDoc(docRef);
}

export async function seedInitialLineCutoutRecordsIfEmpty(
  initialList: LineCutoutRecord[]
): Promise<boolean> {
  try {
    const colRef = collection(db, LINE_CUTOUT_RECORDS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty && initialList.length > 0) {
      const batch = writeBatch(db);
      for (const item of initialList) {
        const ref = doc(db, LINE_CUTOUT_RECORDS_COL, item.id);
        batch.set(ref, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to seed line cutout records in Firestore:', e);
    return false;
  }
}

/**
 * Real-time listener for Quick Field Logs
 */
export function subscribeToQuickFieldLogs(
  onUpdate: (logs: QuickFieldLog[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, QUICK_FIELD_LOGS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: QuickFieldLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as QuickFieldLog);
      });
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(items);
    },
    (err) => {
      console.warn('Error subscribing to quick field logs:', err);
      onError?.(err);
    }
  );
}

export async function saveQuickFieldLogToFirestore(log: QuickFieldLog): Promise<void> {
  const docRef = doc(db, QUICK_FIELD_LOGS_COL, log.id);
  await setDoc(docRef, log, { merge: true });
}

export async function deleteQuickFieldLogFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, QUICK_FIELD_LOGS_COL, id);
  await deleteDoc(docRef);
}

export async function seedInitialQuickFieldLogsIfEmpty(
  initialList: QuickFieldLog[]
): Promise<boolean> {
  try {
    const colRef = collection(db, QUICK_FIELD_LOGS_COL);
    const snap = await getDocs(colRef);
    if (snap.empty && initialList.length > 0) {
      const batch = writeBatch(db);
      for (const item of initialList) {
        const ref = doc(db, QUICK_FIELD_LOGS_COL, item.id);
        batch.set(ref, item);
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Failed to seed quick field logs in Firestore:', e);
    return false;
  }
}
