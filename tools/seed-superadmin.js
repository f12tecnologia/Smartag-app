#!/usr/bin/env node
/**
 * Cria ou atualiza superadmin(s) com acesso total ao sistema.
 * Uso: node tools/seed-superadmin.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { pool } from '../server/db.js';

const SUPERADMIN_EMAILS = ['admin@intelfoz.com.br'];
const PASSWORD = 'Eo@230578.';
const ROLE = 'superadmin';

async function getPasswordColumn() {
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'users' AND column_name IN ('password_hash', 'password', 'senha')`
  );
  const names = res.rows.map((r) => r.column_name);
  if (names.includes('password_hash')) return 'password_hash';
  if (names.includes('password')) return 'password';
  if (names.includes('senha')) return 'senha';
  throw new Error('Coluna de senha (password_hash, password ou senha) não encontrada na tabela users.');
}

async function seedSuperAdmin(email, passwordCol, hashedPassword) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE users SET ${passwordCol} = $1, role = $2 WHERE email = $3`,
      [hashedPassword, ROLE, email]
    );
    console.log('Superadmin atualizado:', email, `(role: ${ROLE})`);
  } else {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO users (id, email, ${passwordCol}, role) VALUES ($1, $2, $3, $4)`,
      [id, email, hashedPassword, ROLE]
    );
    console.log('Superadmin criado:', email, `(id: ${id}, role: ${ROLE})`);
  }
}

async function main() {
  if (!process.env.EXTERNAL_DATABASE_URL) {
    console.error('EXTERNAL_DATABASE_URL não definida. Configure o .env.');
    process.exit(1);
  }

  const passwordCol = await getPasswordColumn();
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  for (const email of SUPERADMIN_EMAILS) {
    await seedSuperAdmin(email, passwordCol, hashedPassword);
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
