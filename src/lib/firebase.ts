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
import { Transformer, AccountRecord, AuditLogItem } from '../types';

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
      // Sort items by ID if available
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
 * Batch seed transformers if the collection is empty or contains old demo data.
 */
export async function seedInitialTransformersIfEmpty(
  initialList: Transformer[]
): Promise<boolean> {
  try {
    const colRef = collection(db, TRANSFORMERS_COL);
    const snap = await getDocs(colRef);
    // If empty or contains fewer items than the complete Ban Hong fleet (853 items)
    if ((snap.empty || snap.size < initialList.length) && initialList.length > 0) {
      // If there were old demo items, delete them
      if (!snap.empty) {
        const delBatch = writeBatch(db);
        snap.forEach((d) => delBatch.delete(d.ref));
        await delBatch.commit();
      }

      // Batch in chunks of 350 (Firestore limit is 500 per batch)
      const chunkSize = 350;
      for (let i = 0; i < initialList.length; i += chunkSize) {
        const batch = writeBatch(db);
        const slice = initialList.slice(i, i + chunkSize);
        for (const item of slice) {
          const ref = doc(db, TRANSFORMERS_COL, item.id);
          batch.set(ref, item);
        }
        await batch.commit();
      }
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
