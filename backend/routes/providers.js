const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { getDb } = require('../db/database');
const { auth, providerOnly } = require('../middleware/auth');

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Provider Registration ────────────────────────────────────────────────────
router.post('/register', upload.array('documents', 5), async (req, res) => {
  try {
    const db = getDb();
    const { name, email, password, phone, country, city, category, bio, experience_years, id_number, hourly_rate } = req.body;
    if (!name || !email || !password || !country || !city || !category)
      return res.status(400).json({ error: 'Missing required fields' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const userId = uuidv4();
    const providerId = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    const documents = req.files ? req.files.map(f => f.filename) : [];

    await db.run('BEGIN');
    try {
      await db.run(
        `INSERT INTO users (id, name, email, password, phone, role, country, city) VALUES (?, ?, ?, ?, ?, 'provider', ?, ?)`,
        [userId, name.trim(), email.toLowerCase(), hash, phone || null, country, city]
      );
      await db.run(
        `INSERT INTO providers (id, user_id, category, bio, experience_years, id_number, hourly_rate, documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [providerId, userId, category, bio || '', parseInt(experience_years) || 0, id_number || '', parseFloat(hourly_rate) || 0, JSON.stringify(documents)]
      );
      await db.run('COMMIT');
    } catch (e) {
      await db.run('ROLLBACK');
      throw e;
    }

    // Notify admin
    const admin = await db.get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admin) {
      await db.run(
        'INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
        [uuidv4(), admin.id, 'New Provider Registration', `${name} registered as ${category} in ${city}, ${country}. Please review their application.`]
      );
    }

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: userId, name, email: email.toLowerCase(), role: 'provider', country, city },
      message: 'Registration submitted. Awaiting admin approval.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── List Approved Active Providers ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { category, country, city, search } = req.query;

    let sql = `
      SELECT p.*, u.name, u.email, u.phone, u.country, u.city
      FROM providers p JOIN users u ON p.user_id = u.id
      WHERE p.status = 'approved' AND p.subscription_status = 'active'
    `;
    const params = [];
    if (category) { sql += ' AND p.category = ?';                            params.push(category); }
    if (country)  { sql += ' AND u.country = ?';                             params.push(country); }
    if (city)     { sql += ' AND u.city = ?';                                params.push(city); }
    if (search)   { sql += ' AND (u.name LIKE ? OR p.bio LIKE ?)';           params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.rating DESC, p.total_reviews DESC';

    const providers = await db.all(sql, params);
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// ─── Provider Detail ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get(`
      SELECT p.*, u.name, u.email, u.phone, u.country, u.city
      FROM providers p JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.status = 'approved' AND p.subscription_status = 'active'
    `, [req.params.id]);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const reviews = await db.all(`
      SELECT r.*, u.name as customer_name
      FROM reviews r JOIN users u ON r.customer_id = u.id
      WHERE r.provider_id = ? ORDER BY r.created_at DESC LIMIT 20
    `, [req.params.id]);

    res.json({ ...provider, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// ─── Provider Dashboard ───────────────────────────────────────────────────────
router.get('/dashboard/me', auth, providerOnly, async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });

    const [bookings, subscriptions] = await Promise.all([
      db.all(`
        SELECT b.*, u.name as customer_name, u.phone as customer_phone
        FROM bookings b JOIN users u ON b.customer_id = u.id
        WHERE b.provider_id = ? ORDER BY b.created_at DESC
      `, [provider.id]),
      db.all('SELECT * FROM subscriptions WHERE provider_id = ? ORDER BY created_at DESC', [provider.id])
    ]);

    const stats = {
      total:     bookings.length,
      pending:   bookings.filter(b => b.status === 'pending').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      earnings:  bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_price || 0), 0)
    };

    res.json({ provider: { ...provider, ...req.user }, bookings, stats, subscriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ─── Update Provider Profile ──────────────────────────────────────────────────
router.put('/profile/update', auth, providerOnly, async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
    if (!provider) return res.status(404).json({ error: 'Not found' });

    const { bio, experience_years, hourly_rate } = req.body;
    await db.run('UPDATE providers SET bio = ?, experience_years = ?, hourly_rate = ? WHERE id = ?',
      [bio || provider.bio, parseInt(experience_years) || provider.experience_years, parseFloat(hourly_rate) || provider.hourly_rate, provider.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// ─── Submit Subscription Payment ──────────────────────────────────────────────
router.post('/subscription/request', auth, providerOnly, async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get('SELECT * FROM providers WHERE user_id = ?', [req.user.id]);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    if (provider.status !== 'approved') return res.status(400).json({ error: 'Your application must be approved first' });

    const { payment_reference } = req.body;
    const currency = req.user.country === 'ZW' ? 'USD' : 'ZAR';
    const amount   = req.user.country === 'ZW' ? 20 : 200;
    const subId    = uuidv4();

    await db.run(
      `INSERT INTO subscriptions (id, provider_id, amount, currency, payment_reference, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
      [subId, provider.id, amount, currency, payment_reference || null]
    );

    const admin = await db.get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admin) {
      await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
        [uuidv4(), admin.id, 'Subscription Payment Submitted',
          `${req.user.name} submitted a subscription payment (${currency} ${amount}). Ref: ${payment_reference || 'Not provided'}. Please confirm.`]);
    }

    res.status(201).json({ message: 'Payment submitted. Admin will confirm within 24 hours.', subId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;
