import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.EXTERNAL_DATABASE_URL;

if (!connectionString) {
  console.error('EXTERNAL_DATABASE_URL is not set');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    const res = await client.query('SELECT current_schema(), current_user');
    console.log('Database context:', res.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    // Forçar schema public explicitamente se não estiver presente
    let modifiedText = text;
    if (!text.toLowerCase().includes('public.')) {
      // Tenta adicionar "public." antes dos nomes das tabelas conhecidas
      modifiedText = text.replace(/\b(profiles|qr_codes|users)\b/gi, 'public.$1');
    }

    const res = await pool.query(modifiedText, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: modifiedText.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};
