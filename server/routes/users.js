import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.role, u.created_at, p.full_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id::text = p.id::text 
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/invite', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, role, full_name } = req.body;
  
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
      [email, hashedPassword, role || 'user']
    );
    
    const user = result.rows[0];
    
    // Usando id::text para garantir compatibilidade com UUID se necessário
    await query(
      'INSERT INTO profiles (id, full_name) VALUES ($1::uuid, $2)',
      [user.id, full_name || '']
    );
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Erro ao convidar usuário' });
  }
});

router.put('/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Role inválido' });
  }
  
  try {
    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erro ao atualizar papel do usuário' });
  }
});

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Você não pode remover sua própria conta' });
  }
  
  try {
    await query('DELETE FROM profiles WHERE id::text = $1', [id]);
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

export default router;
