import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_TRANSFORMERS, DEFAULT_ACCOUNTS, INITIAL_AUDIT_LOGS } from './src/data/defaultData';
import { Transformer, AccountRecord, AuditLogItem } from './src/types';

interface DatabaseSchema {
  transformers: Transformer[];
  accounts: AccountRecord[];
  auditLogs: AuditLogItem[];
  lastUpdated: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read data
function readData(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transformers) && parsed.transformers.length > 0) {
        return {
          transformers: parsed.transformers,
          accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : DEFAULT_ACCOUNTS,
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_AUDIT_LOGS,
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
  }

  // Seed default data
  const initialData: DatabaseSchema = {
    transformers: DEFAULT_TRANSFORMERS,
    accounts: DEFAULT_ACCOUNTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    lastUpdated: Date.now(),
  };
  writeData(initialData);
  return initialData;
}

// Helper to write data
function writeData(data: DatabaseSchema): void {
  try {
    data.lastUpdated = Date.now();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS / Cache control for API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // 1. Health check & Sync Version API
  app.get('/api/health', (req, res) => {
    const data = readData();
    res.json({ status: 'ok', lastUpdated: data.lastUpdated });
  });

  app.get('/api/sync/status', (req, res) => {
    const data = readData();
    res.json({
      lastUpdated: data.lastUpdated,
      count: data.transformers.length,
      accountsCount: data.accounts.length,
    });
  });

  // 2. Transformers Endpoints
  app.get('/api/transformers', (req, res) => {
    const data = readData();
    res.json({
      data: data.transformers,
      lastUpdated: data.lastUpdated,
    });
  });

  // Bulk save or update transformers list
  app.post('/api/transformers', (req, res) => {
    const { transformers } = req.body;
    if (!Array.isArray(transformers)) {
      return res.status(400).json({ error: 'Expected array of transformers' });
    }
    const current = readData();
    current.transformers = transformers;
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Save/Update a single transformer
  app.put('/api/transformers/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body as Partial<Transformer>;
    const current = readData();
    const idx = current.transformers.findIndex(t => t.id.toLowerCase() === id.toLowerCase());

    if (idx >= 0) {
      current.transformers[idx] = { ...current.transformers[idx], ...updateData };
    } else {
      current.transformers.push(updateData as Transformer);
    }

    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Delete a transformer
  app.delete('/api/transformers/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    current.transformers = current.transformers.filter(t => t.id.toLowerCase() !== id.toLowerCase());
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // Reset transformers to default
  app.post('/api/transformers/reset', (req, res) => {
    const current = readData();
    current.transformers = DEFAULT_TRANSFORMERS;
    writeData(current);
    res.json({ success: true, data: current.transformers, lastUpdated: current.lastUpdated });
  });

  // 3. Accounts Endpoints
  app.get('/api/accounts', (req, res) => {
    const data = readData();
    res.json({ data: data.accounts, lastUpdated: data.lastUpdated });
  });

  // Add / Request account
  app.post('/api/accounts', (req, res) => {
    const newAccount = req.body as AccountRecord;
    if (!newAccount || !newAccount.empid) {
      return res.status(400).json({ error: 'Invalid account data' });
    }
    const current = readData();
    const idx = current.accounts.findIndex(
      a => a.empid.toLowerCase() === newAccount.empid.toLowerCase() || a.id === newAccount.id
    );

    if (idx >= 0) {
      current.accounts[idx] = { ...current.accounts[idx], ...newAccount };
    } else {
      current.accounts.push(newAccount);
    }

    writeData(current);
    res.json({ success: true, data: current.accounts, lastUpdated: current.lastUpdated });
  });

  // Update account (approve, reject, grant temporary, etc.)
  app.put('/api/accounts/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body as Partial<AccountRecord>;
    const current = readData();
    const idx = current.accounts.findIndex(a => String(a.id) === String(id) || a.empid.toLowerCase() === id.toLowerCase());

    if (idx >= 0) {
      current.accounts[idx] = { ...current.accounts[idx], ...updates };
      writeData(current);
      return res.json({ success: true, account: current.accounts[idx], lastUpdated: current.lastUpdated });
    }
    res.status(404).json({ error: 'Account not found' });
  });

  // Delete / Revoke account
  app.delete('/api/accounts/:id', (req, res) => {
    const { id } = req.params;
    const current = readData();
    current.accounts = current.accounts.filter(a => String(a.id) !== String(id) && a.empid.toLowerCase() !== id.toLowerCase());
    writeData(current);
    res.json({ success: true, data: current.accounts, lastUpdated: current.lastUpdated });
  });

  // 4. Audit Logs Endpoints
  app.get('/api/audit-logs', (req, res) => {
    const data = readData();
    res.json({ data: data.auditLogs, lastUpdated: data.lastUpdated });
  });

  app.post('/api/audit-logs', (req, res) => {
    const { message, type } = req.body;
    const current = readData();
    const newLog: AuditLogItem = {
      id: Date.now().toString(),
      timestamp: 'เมื่อสักครู่',
      message: message || 'บันทึกรายการ',
      type: type || 'info',
    };
    current.auditLogs = [newLog, ...current.auditLogs.slice(0, 49)];
    writeData(current);
    res.json({ success: true, data: current.auditLogs, lastUpdated: current.lastUpdated });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
