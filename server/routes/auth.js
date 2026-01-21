import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  try {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'user']
    );
    
    const user = result.rows[0];
    
    await query(
      'INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)',
      [user.id, full_name || '']
    );
    
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = generateToken(user);
    res.json({ 
      user: { id: user.id, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
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
