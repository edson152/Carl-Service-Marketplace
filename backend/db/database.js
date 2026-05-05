const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

let db;

const initDb = async () => {
  db = await open({
    filename: path.join(__dirname, '../carlservices.db'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA journal_mode = WAL');
  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      phone      TEXT,
      role       TEXT NOT NULL DEFAULT 'customer',
      country    TEXT NOT NULL DEFAULT 'ZA',
      city       TEXT NOT NULL DEFAULT 'Johannesburg',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS providers (
      id                      TEXT PRIMARY KEY,
      user_id                 TEXT NOT NULL UNIQUE,
      category                TEXT NOT NULL,
      bio                     TEXT,
      experience_years        INTEGER DEFAULT 0,
      id_number               TEXT,
      status                  TEXT DEFAULT 'pending',
      rejection_reason        TEXT,
      subscription_status     TEXT DEFAULT 'inactive',
      subscription_expires_at DATETIME,
      hourly_rate             REAL DEFAULT 0,
      rating                  REAL DEFAULT 0,
      total_reviews           INTEGER DEFAULT 0,
      documents               TEXT DEFAULT '[]',
      created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id               TEXT PRIMARY KEY,
      customer_id      TEXT NOT NULL,
      provider_id      TEXT NOT NULL,
      service_category TEXT NOT NULL,
      date             TEXT NOT NULL,
      time             TEXT NOT NULL,
      address          TEXT NOT NULL,
      description      TEXT,
      status           TEXT DEFAULT 'pending',
      total_price      REAL,
      currency         TEXT DEFAULT 'ZAR',
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (provider_id) REFERENCES providers(id)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id          TEXT PRIMARY KEY,
      booking_id  TEXT NOT NULL UNIQUE,
      customer_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      rating      INTEGER NOT NULL,
      comment     TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id                TEXT PRIMARY KEY,
      provider_id       TEXT NOT NULL,
      amount            REAL NOT NULL,
      currency          TEXT NOT NULL,
      payment_reference TEXT,
      status            TEXT DEFAULT 'pending',
      period_start      DATETIME,
      period_end        DATETIME,
      confirmed_by      TEXT,
      created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers(id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      is_read    INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await seedAdmin();
  await seedDemoData();
  console.log('✅ Database ready');
  return db;
};

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'carl@carlservices.com';
  const existing = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!existing) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@Carl2024', 10);
    await db.run(
      `INSERT INTO users (id, name, email, password, role, country, city) VALUES (?, ?, ?, ?, 'admin', 'ZA', 'Johannesburg')`,
      [uuidv4(), 'Carl Admin', adminEmail, hash]
    );
    console.log('✅ Admin seeded:', adminEmail);
  }
};

const seedDemoData = async () => {
  const row = await db.get("SELECT COUNT(*) as cnt FROM users WHERE role = 'provider'");
  if (row.cnt > 0) return;

  const demos = [
    { name: 'Sipho Ndlovu',    email: 'sipho@demo.com',   phone: '0712345678', country: 'ZA', city: 'Johannesburg', category: 'Electrician', bio: 'Licensed electrician with 12 years experience. Specializing in residential and commercial wiring.',        exp: 12, rate: 350, rating: 4.8, reviews: 42 },
    { name: 'Tendai Moyo',     email: 'tendai@demo.com',  phone: '0773456789', country: 'ZW', city: 'Harare',       category: 'Plumber',     bio: 'Professional plumber covering all residential and commercial plumbing needs.',                             exp:  8, rate:  25, rating: 4.6, reviews: 28 },
    { name: 'Thabo Dlamini',   email: 'thabo@demo.com',   phone: '0612345678', country: 'ZA', city: 'Durban',       category: 'Mechanic',    bio: 'Auto mechanic specializing in Toyota, VW and Ford vehicles.',                                             exp: 15, rate: 400, rating: 4.9, reviews: 65 },
    { name: 'Grace Chikwanda', email: 'grace@demo.com',   phone: '0774567890', country: 'ZW', city: 'Bulawayo',     category: 'Cleaner',     bio: 'Professional cleaning services for homes and offices.',                                                    exp:  5, rate:  15, rating: 4.7, reviews: 31 },
    { name: 'Bongani Zulu',    email: 'bongani@demo.com', phone: '0823456789', country: 'ZA', city: 'Cape Town',    category: 'Carpenter',   bio: 'Custom carpentry and furniture making. Kitchen cabinets, wardrobes, and more.',                            exp: 10, rate: 380, rating: 4.5, reviews: 19 },
    { name: 'Farai Mutasa',    email: 'farai@demo.com',   phone: '0771234567', country: 'ZW', city: 'Harare',       category: 'Painter',     bio: 'Interior and exterior painting. Quality finish guaranteed.',                                               exp:  7, rate:  20, rating: 4.4, reviews: 22 },
  ];

  const hash = bcrypt.hashSync('Demo@123', 10);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  for (const d of demos) {
    const uid = uuidv4(); const pid = uuidv4();
    await db.run(
      `INSERT INTO users (id, name, email, password, phone, role, country, city) VALUES (?, ?, ?, ?, ?, 'provider', ?, ?)`,
      [uid, d.name, d.email, hash, d.phone, d.country, d.city]
    );
    await db.run(
      `INSERT INTO providers (id, user_id, category, bio, experience_years, hourly_rate, status, subscription_status, subscription_expires_at, rating, total_reviews)
       VALUES (?, ?, ?, ?, ?, ?, 'approved', 'active', ?, ?, ?)`,
      [pid, uid, d.category, d.bio, d.exp, d.rate, expires, d.rating, d.reviews]
    );
  }
  console.log('✅ Demo providers seeded');
};

const getDb = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

module.exports = { initDb, getDb };
