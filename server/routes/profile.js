import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, user_id, full_name, updated_at FROM profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ user_id: req.user.id, full_name: '' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  const { full_name } = req.body;
  
  try {
    const existing = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    let result;
    if (existing.rows.length === 0) {
      result = await query(
        'INSERT INTO profiles (user_id, full_name, updated_at) VALUES ($1, $2, NOW()) RETURNING *',
        [req.user.id, full_name]
      );
    } else {
      result = await query(
        'UPDATE profiles SET full_name = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
        [full_name, req.user.id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;
