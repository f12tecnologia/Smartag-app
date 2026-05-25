#!/usr/bin/env node
/**
 * Importa dados dos CSVs (qr_codes e profiles) para o banco configurado em .env
 * Uso: node tools/import-data.js
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { initializeDatabase } from '../server/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Usar pool do db.js após garantir que o banco existe (db.js exporta pool)
let pool;
async function getPool() {
  if (pool) return pool;
  const { pool: p } = await import('../server/db.js');
  pool = p;
  return pool;
}

async function ensureDatabase() {
  const url = process.env.EXTERNAL_DATABASE_URL;
  if (!url) return false;
  const match = url.match(/\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(?:\?|$)/);
  const dbName = match ? match[5] : null;
  if (!dbName) return true;
  const baseUrl = url.replace(/\/([^/?]+)(\?.*)?$/, (_, _db, q) => '/postgres' + (q || ''));
  const tempPool = new pg.Pool({
    connectionString: baseUrl,
    ssl: /localhost|127\.0\.0\.1/.test(baseUrl) ? false : { rejectUnauthorized: false }
  });
  try {
    const res = await tempPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rows.length === 0) {
      await tempPool.query(`CREATE DATABASE "${dbName}"`);
      console.log('Banco criado:', dbName);
    }
  } catch (e) {
    console.warn('Não foi possível criar o banco (pode já existir):', e.message);
  } finally {
    await tempPool.end();
  }
  return true;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || (c === '\r' && !inQuotes)) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCSVLine(line));
  return { headers, rows };
}

async function importQrCodes() {
  const csvPath = path.join(__dirname, '..', 'attached_assets', 'qr_codes_rows_1768959343076.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('CSV não encontrado:', csvPath);
    return 0;
  }
  const content = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCSV(content);
  if (headers[0] !== 'id' || !rows.length) {
    console.warn('Formato do CSV qr_codes inválido.');
    return 0;
  }
  const db = await getPool();
  let inserted = 0;
  for (const row of rows) {
    const [id, url, title, created_at, clicks, description] = row;
    if (!id || !url) continue;
    try {
      await db.query(
        `INSERT INTO qr_codes (id, url, title, created_at, clicks, description)
         VALUES ($1, $2, $3, $4::timestamptz, $5::int, $6)
         ON CONFLICT (id) DO UPDATE SET
           url = EXCLUDED.url,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           clicks = COALESCE(qr_codes.clicks, EXCLUDED.clicks)`,
        [id, url, title || null, created_at || null, clicks ? parseInt(clicks, 10) : 0, description || null]
      );
      inserted++;
    } catch (err) {
      console.error('Erro ao inserir qr_code', id, err.message);
    }
  }
  return inserted;
}

async function importProfiles() {
  const csvPath = path.join(__dirname, '..', 'attached_assets', 'profiles_rows_(1)_1768959347524.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('CSV não encontrado:', csvPath);
    return 0;
  }
  const content = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCSV(content);
  if (!headers.includes('id') || !rows.length) {
    console.warn('Formato do CSV profiles inválido.');
    return 0;
  }
  const idIdx = headers.indexOf('id');
  const userIdIdx = headers.indexOf('user_id');
  const fullNameIdx = headers.indexOf('full_name');
  const companyNameIdx = headers.indexOf('company_name');
  const avatarUrlIdx = headers.indexOf('avatar_url');
  const phoneIdx = headers.indexOf('phone');
  const roleIdx = headers.indexOf('role');
  const createdAtIdx = headers.indexOf('created_at');
  const updatedAtIdx = headers.indexOf('updated_at');

  const db = await getPool();
  let inserted = 0;
  for (const row of rows) {
    const id = row[idIdx];
    if (!id) continue;
    const user_id = userIdIdx >= 0 ? row[userIdIdx] : null;
    const full_name = fullNameIdx >= 0 ? row[fullNameIdx] : null;
    const company_name = companyNameIdx >= 0 ? row[companyNameIdx] : null;
    const avatar_url = avatarUrlIdx >= 0 ? row[avatarUrlIdx] : null;
    const phone = phoneIdx >= 0 ? row[phoneIdx] : null;
    const role = roleIdx >= 0 ? row[roleIdx] : 'user';
    const created_at = createdAtIdx >= 0 ? row[createdAtIdx] : null;
    const updated_at = updatedAtIdx >= 0 ? row[updatedAtIdx] : null;
    try {
      await db.query(
        `INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           updated_at = EXCLUDED.updated_at`,
        [id, user_id || id, full_name, role, created_at, updated_at || created_at]
      );
      inserted++;
    } catch (err) {
      if (err.message && (err.message.includes('does not exist') || err.message.includes('column'))) {
        console.warn('Tabela profiles com estrutura diferente ou não existe. Pulando import de profiles.');
        return -1;
      }
      console.error('Erro ao inserir profile', id, err.message);
    }
  }
  return inserted;
}

async function main() {
  if (!process.env.EXTERNAL_DATABASE_URL) {
    console.error('EXTERNAL_DATABASE_URL não definida. Configure o .env.');
    process.exit(1);
  }
  console.log('Garantindo que o banco existe...');
  await ensureDatabase();
  console.log('Conectando ao banco e inicializando schema...');
  const initialized = await initializeDatabase();
  if (!initialized) {
    console.error('Falha ao inicializar o banco.');
    process.exit(1);
  }
  console.log('Importando qr_codes...');
  const qrCount = await importQrCodes();
  console.log('QR codes importados/atualizados:', qrCount);
  console.log('Importando profiles...');
  const profileCount = await importProfiles();
  if (profileCount >= 0) console.log('Profiles importados/atualizados:', profileCount);
  const p = await getPool();
  await p.end();
  console.log('Importação concluída.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
