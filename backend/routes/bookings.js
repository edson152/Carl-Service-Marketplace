const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { auth } = require('../middleware/auth');

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  try {
    const db = getDb();
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can book' });

    const { provider_id, service_category, date, time, address, description, total_price } = req.body;
    if (!provider_id || !service_category || !date || !time || !address)
      return res.status(400).json({ error: 'Missing required booking fields' });

    const provider = await db.get(
      "SELECT * FROM providers WHERE id = ? AND status = 'approved' AND subscription_status = 'active'",
      [provider_id]
    );
    if (!provider) return res.status(404).json({ error: 'Provider not found or unavailable' });

    const id = uuidv4();
    const currency = req.user.country === 'ZW' ? 'USD' : 'ZAR';
    await db.run(
      `INSERT INTO bookings (id, customer_id, provider_id, service_category, date, time, address, description, total_price, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, provider_id, service_category, date, time, address, description || '', total_price || null, currency]
    );

    // Notify provider
    const providerUser = await db.get('SELECT user_id FROM providers WHERE id = ?', [provider_id]);
    if (providerUser) {
      await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
        [uuidv4(), providerUser.user_id, 'New Booking Request',
          `${req.user.name} booked you for ${service_category} on ${date} at ${time}.`]);
    }

    res.status(201).json({ id, message: 'Booking created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// GET /api/bookings/my
router.get('/my', auth, async (req, res) => {
  try {
    const db = getDb();
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customers only' });

    const bookings = await db.all(`
      SELECT b.*, u.name as provider_name, u.phone as provider_phone, p.category, p.hourly_rate
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT /api/bookings/:id/status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    const validStatuses = ['accepted', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const booking = await db.get(`
      SELECT b.*, p.user_id as provider_user_id
      FROM bookings b JOIN providers p ON b.provider_id = p.id
      WHERE b.id = ?
    `, [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (req.user.role === 'provider' && booking.provider_user_id !== req.user.id)
      return res.status(403).json({ error: 'Not authorized' });
    if (req.user.role === 'customer' && status !== 'cancelled')
      return res.status(403).json({ error: 'Customers can only cancel bookings' });

    await db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    // Notify customer
    if (req.user.role === 'provider') {
      const msgs = {
        accepted:    'Your booking has been accepted!',
        in_progress: 'Your service is now in progress.',
        completed:   'Your service has been marked as completed.',
        cancelled:   'Your booking has been cancelled by the provider.'
      };
      await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
        [uuidv4(), booking.customer_id, 'Booking Update', msgs[status]]);
    }

    res.json({ message: `Booking marked as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Status update failed' });
  }
});

// POST /api/bookings/:id/review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const db = getDb();
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customers only' });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const booking = await db.get(
      "SELECT * FROM bookings WHERE id = ? AND status = 'completed'", [req.params.id]
    );
    if (!booking) return res.status(404).json({ error: 'Completed booking not found' });
    if (booking.customer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const existing = await db.get('SELECT id FROM reviews WHERE booking_id = ?', [req.params.id]);
    if (existing) return res.status(400).json({ error: 'Already reviewed' });

    await db.run(
      `INSERT INTO reviews (id, booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), req.params.id, req.user.id, booking.provider_id, parseInt(rating), comment || '']
    );

    // Recalculate provider rating
    const stats = await db.get(
      'SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE provider_id = ?',
      [booking.provider_id]
    );
    await db.run('UPDATE providers SET rating = ?, total_reviews = ? WHERE id = ?',
      [Math.round(stats.avg * 10) / 10, stats.cnt, booking.provider_id]);

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Review failed' });
  }
});

// GET /api/bookings/notifications/me
router.get('/notifications/me', auth, async (req, res) => {
  try {
    const db = getDb();
    const notes = await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/bookings/notifications/read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    const db = getDb();
    await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
