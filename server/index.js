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
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/qr-codes', qrCodesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const startServer = async () => {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Server will start but database operations will fail.');
  }
  
  const host = '0.0.0.0';
  app.listen(PORT, host, () => {
    console.log(`Backend server running on http://${host}:${PORT}`);
    
    // Iniciar a inicialização do banco de dados em segundo plano após o servidor abrir a porta
    initializeDatabase().catch(err => {
      console.error('Falha na inicialização do banco de dados:', err);
    });
  });
};

startServer();
