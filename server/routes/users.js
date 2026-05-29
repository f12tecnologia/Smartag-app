import express from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
const ROLES = { USER: 'user', ADMIN: 'admin', SUPERADMIN: 'superadmin' };
const isSuperAdmin = (role) => role === ROLES.SUPERADMIN;
const isAdminRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
const assignableRoles = (actorRole) => {
  if (isSuperAdmin(actorRole)) return [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN];
  if (actorRole === ROLES.ADMIN) return [ROLES.USER, ROLES.ADMIN];
  return [];
};

const router = express.Router();

const requireUserManagement = (req, res, next) => {
  if (!isAdminRole(req.user?.role)) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

const listUsersQuery = async () => {
  try {
    return await query(
      `SELECT u.id, u.email, u.role, u.created_at, p.full_name 
       FROM users u 
       LEFT JOIN profiles p ON u.id::text = p.id::text 
       ORDER BY u.created_at DESC`
    );
  } catch (error) {
    console.warn('listUsers com profiles falhou, usando fallback:', error.message);
    return await query(
      `SELECT id, email, role, created_at, NULL::text AS full_name 
       FROM users ORDER BY created_at DESC`
    );
  }
};

const getTargetUser = async (id) => {
  const result = await query('SELECT id, email, role FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const assertCanModifyTarget = (actor, target, newRole) => {
  if (!target) {
    return { ok: false, status: 404, error: 'Usuário não encontrado' };
  }

  if (isSuperAdmin(target.role) && !isSuperAdmin(actor.role)) {
    return { ok: false, status: 404, error: 'Usuário não encontrado' };
  }

  if (newRole === ROLES.SUPERADMIN && !isSuperAdmin(actor.role)) {
    return { ok: false, status: 403, error: 'Apenas super administradores podem atribuir a função super administrador.' };
  }

  const allowed = assignableRoles(actor.role);
  if (newRole && !allowed.includes(newRole)) {
    return { ok: false, status: 403, error: 'Você não tem permissão para atribuir esta função.' };
  }

  return { ok: true };
};

router.get('/', authenticateToken, requireUserManagement, async (req, res) => {
  try {
    const result = await listUsersQuery();
    let rows = result.rows;
    if (!isSuperAdmin(req.user.role)) {
      rows = rows.filter((u) => u.role !== ROLES.SUPERADMIN);
    }
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários', detail: error.message });
  }
});

router.post('/invite', authenticateToken, requireUserManagement, async (req, res) => {
  const { email, password, role, full_name } = req.body;
  const targetRole = role || ROLES.USER;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const permission = assertCanModifyTarget(req.user, { role: ROLES.USER }, targetRole);
  if (!permission.ok) {
    return res.status(permission.status).json({ error: permission.error });
  }

  try {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const result = await query(
      'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [id, email, hashedPassword, targetRole]
    );

    const user = result.rows[0];

    try {
      await query(
        'INSERT INTO profiles (id, full_name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name',
        [String(user.id), full_name || '']
      );
    } catch (profileErr) {
      console.warn('Invite: profiles insert skipped', profileErr.message);
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: 'Erro ao convidar usuário' });
  }
});

router.put('/:id/role', authenticateToken, requireUserManagement, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowed = assignableRoles(req.user.role);
  if (!role || !allowed.includes(role)) {
    return res.status(400).json({ error: 'Função inválida ou não permitida.' });
  }

  if (String(req.user.id) === String(id) && !isSuperAdmin(req.user.role)) {
    return res.status(400).json({ error: 'Você não pode alterar sua própria função. Peça a outro administrador.' });
  }

  try {
    const target = await getTargetUser(id);
    const permission = assertCanModifyTarget(req.user, target, role);
    if (!permission.ok) {
      return res.status(permission.status).json({ error: permission.error });
    }

    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erro ao atualizar papel do usuário' });
  }
});

router.delete('/:id', authenticateToken, requireUserManagement, async (req, res) => {
  const { id } = req.params;

  if (String(req.user.id) === String(id) && !isSuperAdmin(req.user.role)) {
    return res.status(400).json({ error: 'Você não pode remover sua própria conta.' });
  }

  try {
    const target = await getTargetUser(id);
    const permission = assertCanModifyTarget(req.user, target);
    if (!permission.ok) {
      return res.status(permission.status).json({ error: permission.error });
    }

    try {
      await query('DELETE FROM profiles WHERE id::text = $1', [id]);
    } catch (profileErr) {
      if (profileErr.code !== '42P01' && !/profiles/i.test(profileErr.message)) {
        throw profileErr;
      }
    }
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
