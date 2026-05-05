const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();
    const [
      users, pTotal, pPending, pApproved, pActive,
      bTotal, bPending, bCompleted, revZA, revZW, subsPending, notifsUnread,
      byCategory, byCity, recentBookings
    ] = await Promise.all([
      db.get("SELECT COUNT(*) as c FROM users WHERE role = 'customer'"),
      db.get("SELECT COUNT(*) as c FROM providers"),
      db.get("SELECT COUNT(*) as c FROM providers WHERE status = 'pending'"),
      db.get("SELECT COUNT(*) as c FROM providers WHERE status = 'approved'"),
      db.get("SELECT COUNT(*) as c FROM providers WHERE subscription_status = 'active'"),
      db.get("SELECT COUNT(*) as c FROM bookings"),
      db.get("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'"),
      db.get("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'"),
      db.get("SELECT COALESCE(SUM(amount),0) as s FROM subscriptions WHERE currency = 'ZAR' AND status = 'confirmed'"),
      db.get("SELECT COALESCE(SUM(amount),0) as s FROM subscriptions WHERE currency = 'USD' AND status = 'confirmed'"),
      db.get("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'pending'"),
      db.get('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]),
      db.all("SELECT p.category, COUNT(*) as count FROM providers p WHERE p.status = 'approved' GROUP BY p.category ORDER BY count DESC"),
      db.all("SELECT u.city, u.country, COUNT(*) as count FROM providers p JOIN users u ON p.user_id = u.id WHERE p.status = 'approved' GROUP BY u.city ORDER BY count DESC LIMIT 10"),
      db.all(`SELECT b.*, cu.name as customer_name, pu.name as provider_name FROM bookings b JOIN users cu ON b.customer_id = cu.id JOIN providers p ON b.provider_id = p.id JOIN users pu ON p.user_id = pu.id ORDER BY b.created_at DESC LIMIT 10`)
    ]);

    res.json({
      stats: {
        users: users.c, providers_total: pTotal.c, providers_pending: pPending.c,
        providers_approved: pApproved.c, providers_active: pActive.c,
        bookings_total: bTotal.c, bookings_pending: bPending.c, bookings_completed: bCompleted.c,
        revenue_za: revZA.s, revenue_zw: revZW.s,
        subs_pending: subsPending.c, notifications_unread: notifsUnread.c
      },
      byCategory, byCity, recentBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// GET /api/admin/providers
router.get('/providers', async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;
    let sql = `
      SELECT p.*, u.name, u.email, u.phone, u.country, u.city, u.created_at as registered_at
      FROM providers p JOIN users u ON p.user_id = u.id
    `;
    const params = [];
    if (status) { sql += ' WHERE p.status = ?'; params.push(status); }
    sql += ' ORDER BY p.created_at DESC';
    res.json(await db.all(sql, params));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// PUT /api/admin/providers/:id/approve
router.put('/providers/:id/approve', async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get('SELECT * FROM providers WHERE id = ?', [req.params.id]);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    await db.run("UPDATE providers SET status = 'approved', rejection_reason = NULL WHERE id = ?", [req.params.id]);

    const user = await db.get('SELECT id, country FROM users WHERE id = ?', [provider.user_id]);
    const currency = user.country === 'ZW' ? 'USD 20' : 'ZAR 200';
    await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
      [uuidv4(), provider.user_id, '🎉 Application Approved!',
        `Congratulations! Your application has been approved. Pay the monthly subscription (${currency}) to go live.`]);

    res.json({ message: 'Provider approved' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

// PUT /api/admin/providers/:id/reject
router.put('/providers/:id/reject', async (req, res) => {
  try {
    const db = getDb();
    const { reason } = req.body;
    const provider = await db.get('SELECT * FROM providers WHERE id = ?', [req.params.id]);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    await db.run("UPDATE providers SET status = 'rejected', rejection_reason = ? WHERE id = ?",
      [reason || 'Application did not meet requirements', req.params.id]);
    await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
      [uuidv4(), provider.user_id, 'Application Update',
        `Your application was not approved. Reason: ${reason || 'Did not meet requirements'}.`]);

    res.json({ message: 'Provider rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// PUT /api/admin/providers/:id/suspend
router.put('/providers/:id/suspend', async (req, res) => {
  try {
    const db = getDb();
    await db.run("UPDATE providers SET subscription_status = 'inactive' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Provider suspended' });
  } catch (err) {
    res.status(500).json({ error: 'Suspend failed' });
  }
});

// DELETE /api/admin/providers/:id
router.delete('/providers/:id', async (req, res) => {
  try {
    const db = getDb();
    const provider = await db.get('SELECT user_id FROM providers WHERE id = ?', [req.params.id]);
    if (!provider) return res.status(404).json({ error: 'Not found' });
    await db.run('DELETE FROM users WHERE id = ?', [provider.user_id]);
    res.json({ message: 'Provider deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// GET /api/admin/subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;
    let sql = `
      SELECT s.*, u.name as provider_name, u.email as provider_email, u.country, p.category
      FROM subscriptions s JOIN providers p ON s.provider_id = p.id JOIN users u ON p.user_id = u.id
    `;
    const params = [];
    if (status) { sql += ' WHERE s.status = ?'; params.push(status); }
    sql += ' ORDER BY s.created_at DESC';
    res.json(await db.all(sql, params));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// PUT /api/admin/subscriptions/:id/confirm
router.put('/subscriptions/:id/confirm', async (req, res) => {
  try {
    const db = getDb();
    const sub = await db.get('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.run(
      "UPDATE subscriptions SET status = 'confirmed', period_start = ?, period_end = ?, confirmed_by = ? WHERE id = ?",
      [now.toISOString(), expires.toISOString(), req.user.id, req.params.id]
    );
    await db.run(
      "UPDATE providers SET subscription_status = 'active', subscription_expires_at = ? WHERE id = ?",
      [expires.toISOString(), sub.provider_id]
    );

    const provUser = await db.get('SELECT user_id FROM providers WHERE id = ?', [sub.provider_id]);
    if (provUser) {
      await db.run('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)',
        [uuidv4(), provUser.user_id, '✅ Subscription Activated!',
          `Your subscription is confirmed and active until ${expires.toDateString()}. You are now visible to customers!`]);
    }

    res.json({ message: 'Subscription confirmed and provider activated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Confirmation failed' });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;
    let sql = `
      SELECT b.*, cu.name as customer_name, pu.name as provider_name, p.category
      FROM bookings b JOIN users cu ON b.customer_id = cu.id
      JOIN providers p ON b.provider_id = p.id JOIN users pu ON p.user_id = pu.id
    `;
    const params = [];
    if (status) { sql += ' WHERE b.status = ?'; params.push(status); }
    sql += ' ORDER BY b.created_at DESC';
    res.json(await db.all(sql, params));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  try {
    const db = getDb();
    res.json(await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    ));
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// PUT /api/admin/notifications/read
router.put('/notifications/read', async (req, res) => {
  try {
    const db = getDb();
    await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Done' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    res.json(await db.all(
      "SELECT id, name, email, phone, role, country, city, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC"
    ));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
