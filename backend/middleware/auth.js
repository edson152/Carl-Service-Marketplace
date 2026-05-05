const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');

const auth = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDb();
    const user = await db.get(
      'SELECT id, name, email, role, country, city, phone FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

const providerOnly = (req, res, next) => {
  if (req.user.role !== 'provider') return res.status(403).json({ error: 'Provider access required' });
  next();
};

module.exports = { auth, adminOnly, providerOnly };
