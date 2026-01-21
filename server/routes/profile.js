import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, full_name, role, created_at, updated_at FROM profiles WHERE id::text = $1',
      [String(req.user.id)]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        id: req.user.id, 
        full_name: req.user.email?.split('@')[0] || '', 
        role: req.user.role || 'user'
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.json({ 
      id: req.user.id, 
      full_name: req.user.email?.split('@')[0] || '', 
      role: req.user.role || 'user'
    });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  const { full_name } = req.body;
  
  try {
    const result = await query(
      'UPDATE profiles SET full_name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, role, created_at, updated_at',
      [full_name, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        id: req.user.id, 
        full_name: full_name || '',
        role: req.user.role || 'user'
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;
