import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', (_req, res) => {
  res.status(403).json({
    error: 'Cadastro público desabilitado. Solicite acesso a um administrador.',
  });
});

router.post('/signin', async (req, res) => {
  if (!process.env.EXTERNAL_DATABASE_URL) {
    console.error('Signin: EXTERNAL_DATABASE_URL não definida. Verifique o arquivo .env e reinicie o servidor.');
    return res.status(500).json({
      error: 'Erro ao fazer login',
      detail: 'Servidor sem configuração de banco. Reinicie com: cd Smartag-app && npm run dev'
    });
  }

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  const emailNorm = (email && typeof email === 'string') ? email.trim() : '';
  if (!emailNorm) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  let result;
  try {
    result = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER($1)', [emailNorm]);
  } catch (dbErr) {
    console.error('Signin query error:', dbErr);
    return res.status(500).json({
      error: 'Erro ao fazer login',
      detail: dbErr.message || String(dbErr)
    });
  }

  try {
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const storedHash = user.password_hash || user.password;
    if (!storedHash || typeof storedHash !== 'string') {
      console.error('Signin: hash de senha ausente ou inválido para email', emailNorm);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(String(password), storedHash);
    } catch (bcryptErr) {
      console.error('Signin bcrypt.compare error:', bcryptErr.message);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const payload = { id: String(user.id), email: String(user.email || emailNorm), role: String(user.role || 'user') };
    let token;
    try {
      token = generateToken(payload);
    } catch (tokenErr) {
      console.error('Signin generateToken error:', tokenErr);
      return res.status(500).json({ error: 'Erro ao gerar sessão: ' + (tokenErr.message || '') });
    }
    res.json({ 
      user: payload, 
      token 
    });
  } catch (error) {
    console.error('Signin error:', error);
    const detail = error.message || String(error);
    res.status(500).json({ error: 'Erro ao fazer login', detail: detail });
  }
});

router.get('/session', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Erro ao verificar sessão' });
  }
});

router.post('/signout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

export default router;
