import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET && String(process.env.SESSION_SECRET).trim() ? process.env.SESSION_SECRET : 'your-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

export const generateToken = (user) => {
  const payload = {
    id: user && user.id != null ? String(user.id) : '',
    email: (user && user.email) ? String(user.email) : '',
    role: (user && user.role) ? String(user.role) : 'user'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
