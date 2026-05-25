#!/usr/bin/env node
/**
 * Corrige a coluna de senha na tabela users para a VPS.
 * - Se existir 'senha': renomeia para 'password'
 * - Se não existir coluna de senha: adiciona 'password VARCHAR(255)'
 * Uso: node tools/fix-password-column.js
 */
import 'dotenv/config';
import { pool } from '../server/db.js';

async function main() {
  if (!process.env.EXTERNAL_DATABASE_URL) {
    console.error('EXTERNAL_DATABASE_URL não definida. Configure o .env.');
    process.exit(1);
  }

  try {
    const cols = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'users' 
       AND column_name IN ('password_hash', 'password', 'senha')`
    );
    const names = cols.rows.map((r) => r.column_name);

    if (names.includes('password_hash') || names.includes('password')) {
      console.log('Coluna de senha já compatível:', names.join(', '));
      await pool.end();
      return;
    }

    if (names.includes('senha')) {
      await pool.query('ALTER TABLE users RENAME COLUMN senha TO password');
      console.log('Coluna "senha" renomeada para "password".');
    } else {
      await pool.query('ALTER TABLE users ADD COLUMN password VARCHAR(255)');
      console.log('Coluna "password" criada.');
    }

    await pool.end();
    console.log('Banco corrigido. Execute: node tools/seed-admin.js');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
