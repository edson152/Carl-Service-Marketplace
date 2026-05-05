require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/admin',     require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Carl Service Marketplace API' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// ─── Init DB first, then start server ──────────────────────────────────────────
async function main() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log('\n╔══════════════════════════════════════════╗');
      console.log('║    Carl Service Marketplace API          ║');
      console.log(`║    Running on http://localhost:${PORT}      ║`);
      console.log('║    Admin: carl@carlservices.com          ║');
      console.log('║    Pass:  Admin@Carl2024                 ║');
      console.log('╚══════════════════════════════════════════╝\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
