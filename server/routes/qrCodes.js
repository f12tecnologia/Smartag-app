import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, url, type, category, description, clicks, created_at FROM public.qr_codes ORDER BY created_at DESC'
    );
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Erro ao buscar QR codes' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, url, type, category, description } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }
  
  try {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO public.qr_codes (id, title, url, type, category, description, clicks, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 0, NOW()) 
       RETURNING *`,
      [id, title || '', url, type || 'url', category || '', description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Erro ao criar QR code' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, url, type, category, description } = req.body;
  
  try {
    const result = await query(
      `UPDATE public.qr_codes 
       SET title = $1, url = $2, type = $3, category = $4, description = $5
       WHERE id = $6 
       RETURNING *`,
      [title, url, type, category, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ error: 'Erro ao atualizar QR code' });
  }
});

router.get('/reports', authenticateToken, async (req, res) => {
  const { from, to } = req.query;
  
  try {
    let queryText = 'SELECT id, title, url, type, category, description, clicks, created_at FROM public.qr_codes';
    const params = [];
    
    if (from && to) {
      queryText += ' WHERE created_at >= $1 AND created_at <= $2';
      params.push(from, to);
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Erro ao buscar relatórios' });
  }
});

router.get('/redirect/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query(
      'SELECT url, clicks FROM public.qr_codes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code não encontrado' });
    }
    
    const qrCode = result.rows[0];
    
    await query(
      'UPDATE public.qr_codes SET clicks = clicks + 1 WHERE id = $1',
      [id]
    );
    
    res.json({ url: qrCode.url });
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Erro ao processar redirecionamento' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await query('DELETE FROM public.qr_codes WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code não encontrado' });
    }
    
    res.json({ message: 'QR code removido com sucesso' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Erro ao remover QR code' });
  }
});

export default router;
