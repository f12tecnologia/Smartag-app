import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection, initializeDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import qrCodesRoutes from './routes/qrCodes.js';
import profileRoutes from './routes/profile.js';
import usersRoutes from './routes/users.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Não encerrar o processo para manter o servidor no ar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Evitar que Node encerre o processo em rejeições não tratadas
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? (process.env.PORT || 3002) : 3001;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnóstico: confirma backend, .env e se o Postgres responde
app.get('/api/auth/debug', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    backend: 'Smartag-app',
    version: '2026-03-db-ping',
    hasDatabaseUrl: !!process.env.EXTERNAL_DATABASE_URL,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    dbConnected: dbOk,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/qr-codes', qrCodesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Catch-all middleware for client-side routing (no wildcard pattern needed)
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will start but database operations will fail.');
    }
    
    const host = '0.0.0.0';
    const server = app.listen(PORT, host, () => {
      console.log(`Backend server running on http://${host}:${PORT}`);
      initializeDatabase().catch(err => {
        console.error('Falha na inicialização do banco de dados:', err);
      });
    });
    server.on('error', (err) => {
      console.error('Server listen error:', err);
    });
  } catch (err) {
    console.error('startServer error:', err);
    process.exit(1);
  }
};

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
