const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { auth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const db = getDb();
    const { name, email, password, phone, country, city } = req.body;
    if (!name || !email || !password || !country || !city)
      return res.status(400).json({ error: 'Name, email, password, country and city are required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await db.run(
      `INSERT INTO users (id, name, email, password, phone, role, country, city) VALUES (?, ?, ?, ?, ?, 'customer', ?, ?)`,
      [id, name.trim(), email.toLowerCase(), hash, phone || null, country, city]
    );

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email: email.toLowerCase(), role: 'customer', country, city } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _pw, ...safeUser } = user;

    if (user.role === 'provider') {
      const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [user.id]);
      return res.json({ token, user: { ...safeUser, provider } });
    }

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const db = getDb();
    if (req.user.role === 'provider') {
      const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
      return res.json({ ...req.user, provider });
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, city } = req.body;
    await db.run('UPDATE users SET name = ?, phone = ?, city = ? WHERE id = ?',
      [name || req.user.name, phone || req.user.phone, city || req.user.city, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
