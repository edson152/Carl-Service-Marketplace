# ⚡ Carl Service Marketplace

> A location-based service booking platform for **Zimbabwe 🇿🇼** and **South Africa 🇿🇦**  
> Connect customers with trusted electricians, plumbers, mechanics, and more.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Local Development Setup](#local-development-setup)
4. [Admin Credentials](#admin-credentials)
5. [How the Platform Works](#how-the-platform-works)
6. [Running the Application](#running-the-application)
7. [API Overview](#api-overview)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18+ (LTS recommended) | https://nodejs.org |
| **npm** | v9+ (comes with Node.js) | — |
| **Git** | Any recent version | https://git-scm.com |

Check your versions:
```bash
node --version    # should show v18.x.x or higher
npm --version     # should show 9.x.x or higher
```

---

## 📁 Project Structure

```
carl-service-marketplace/
├── backend/                    # Express.js API server
│   ├── db/
│   │   └── database.js         # SQLite setup, schema, seed data
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile
│   │   ├── providers.js        # Provider registration, listing, dashboard
│   │   ├── bookings.js         # Booking creation, status, reviews
│   │   └── admin.js            # Admin control panel API
│   ├── uploads/                # Uploaded provider documents (auto-created)
│   ├── .env                    # Environment variables
│   ├── server.js               # Main Express server
│   ├── package.json
│   └── carlservices.db         # SQLite database (auto-created on first run)
│
├── frontend/                   # React.js application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProviderCard.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ProviderRegister.js
│   │   │   ├── Services.js
│   │   │   ├── ProviderDetail.js
│   │   │   ├── CustomerDashboard.js
│   │   │   ├── ProviderDashboard.js
│   │   │   └── AdminPanel.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── SRS.md                      # Software Requirements Specification
├── README.md                   # This file
└── package.json                # Root scripts (runs both servers)
```

---

## 🚀 Local Development Setup

### Step 1 — Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd carl-service-marketplace

# Or just navigate to the project folder
cd carl-service-marketplace
```

### Step 2 — Install All Dependencies

Run this **once** from the root folder to install dependencies for root, backend, and frontend:

```bash
npm run install-all
```

This is equivalent to running:
```bash
npm install                   # root
cd backend && npm install     # backend
cd ../frontend && npm install # frontend
```

> ⏳ This may take 2–5 minutes the first time. Be patient.

### Step 3 — Configure Environment Variables

The backend `.env` file is already pre-configured for local development:

```
backend/.env:

PORT=5000
JWT_SECRET=carl_service_marketplace_secret_key_2024_change_in_production
ADMIN_EMAIL=carl@carlservices.com
ADMIN_PASSWORD=Admin@Carl2024
NODE_ENV=development
```

> ⚠️ **Important:** Change `JWT_SECRET` and admin credentials before deploying to production.

### Step 4 — Start the Application

From the **root** folder, run:

```bash
npm run dev
```

This starts **both** servers simultaneously:
- 🔵 **Backend API:** http://localhost:5000
- 🟢 **Frontend React:** http://localhost:3000

The browser should open automatically at http://localhost:3000

> If it doesn't open automatically, navigate there manually.

---

## 🔐 Admin Credentials

| Field | Value |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | carl@carlservices.com |
| **Password** | Admin@Carl2024 |

After logging in, you'll be redirected to the **Admin Control Panel** automatically.

### From the Admin Panel you can:
- ✅ Approve or reject provider applications
- 💳 Confirm subscription payments and activate providers
- 📊 View full platform statistics
- 👥 Manage all users and bookings
- 🔔 Monitor real-time notifications

---

## ⚙️ How the Platform Works

### For Customers:
1. Register at `/register`
2. Browse services at `/services`
3. Filter by category, country, city
4. View a provider's profile and book them
5. Track bookings from `/dashboard`
6. Leave a review after job completion

### For Service Providers:
1. Register at `/register/provider` (fills in professional details + uploads documents)
2. Wait for admin review (you'll receive an in-app notification)
3. Once approved, submit your monthly subscription payment reference
4. Admin confirms payment → your profile goes live!
5. Manage incoming bookings from `/provider/dashboard`
6. Update job status: Accept → In Progress → Completed

### For Admin (Carl):
1. Log in at `/login` with admin credentials
2. Go to **Admin Panel** (`/admin`)
3. Review pending provider applications → Approve or Reject
4. When approved providers submit payment → Confirm subscriptions
5. Monitor all bookings, revenue, and platform health

---

## 💰 Subscription Model

| Country | Monthly Fee | Currency |
|---|---|---|
| 🇿🇦 South Africa | 200 | ZAR |
| 🇿🇼 Zimbabwe | 20 | USD |

**Payment Flow:**
1. Provider makes bank/mobile payment manually
2. Submits payment reference in their dashboard
3. Admin receives notification and confirms in Admin Panel
4. Provider's subscription activates for 30 days
5. Provider appears in public listings

---

## 🧪 Demo Data

The app is seeded with **6 demo providers** on first run:

| Name | Category | Location | Email |
|---|---|---|---|
| Sipho Ndlovu | Electrician | Johannesburg, ZA | sipho@demo.com |
| Tendai Moyo | Plumber | Harare, ZW | tendai@demo.com |
| Thabo Dlamini | Mechanic | Durban, ZA | thabo@demo.com |
| Grace Chikwanda | Cleaner | Bulawayo, ZW | grace@demo.com |
| Bongani Zulu | Carpenter | Cape Town, ZA | bongani@demo.com |
| Farai Mutasa | Painter | Harare, ZW | farai@demo.com |

All demo providers: password = `Demo@123`

---

## 🛠️ Running Individual Servers

If you need to run the backend or frontend separately:

```bash
# Backend only (from root)
npm run server
# or from /backend folder:
cd backend && npm run dev

# Frontend only (from root)  
npm run client
# or from /frontend folder:
cd frontend && npm start
```

---

## 📡 API Overview

Base URL: `http://localhost:5000/api`

### Public Endpoints
```
GET  /health                         # API health check
POST /auth/register                  # Customer register
POST /auth/login                     # Login (all roles)
POST /providers/register             # Provider register
GET  /providers                      # List providers (with filters)
GET  /providers/:id                  # Provider detail + reviews
```

### Authenticated Endpoints
```
GET  /auth/me                        # Current user info
PUT  /auth/profile                   # Update profile
GET  /bookings/my                    # Customer's bookings
POST /bookings                       # Create booking
PUT  /bookings/:id/status            # Update booking status
POST /bookings/:id/review            # Submit review
GET  /providers/dashboard/me         # Provider dashboard
POST /providers/subscription/request # Submit subscription payment
```

### Admin Endpoints
```
GET  /admin/stats                    # Dashboard statistics
GET  /admin/providers                # All providers
PUT  /admin/providers/:id/approve    # Approve provider
PUT  /admin/providers/:id/reject     # Reject provider
PUT  /admin/providers/:id/suspend    # Suspend provider
DELETE /admin/providers/:id          # Delete provider
GET  /admin/subscriptions            # All subscriptions
PUT  /admin/subscriptions/:id/confirm # Confirm payment
GET  /admin/bookings                 # All bookings
GET  /admin/users                    # All customers
```

Test the API health:
```bash
curl http://localhost:5000/api/health
```

---

## 🚢 Deployment Guide

### Option A: VPS (Recommended — DigitalOcean, Hetzner, Contabo)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone project
git clone <your-repo> /var/www/carlservices
cd /var/www/carlservices

# 4. Install dependencies
npm run install-all

# 5. Build React frontend
npm run build

# 6. Update .env with production values
nano backend/.env
# Change JWT_SECRET, admin credentials, NODE_ENV=production

# 7. Serve build from Express (add to backend/server.js)
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));

# 8. Install PM2 process manager
npm install -g pm2
pm2 start backend/server.js --name carlservices
pm2 startup
pm2 save

# 9. Set up Nginx reverse proxy
sudo apt install nginx
# Configure /etc/nginx/sites-available/carlservices
```

Nginx config example:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option B: Railway / Render (Easy Cloud)

1. Push code to GitHub
2. Connect repo to Railway.app or Render.com
3. Set environment variables in dashboard
4. Deploy backend first, note the URL
5. Update frontend `package.json` proxy to backend URL
6. Deploy frontend

---

## 🔧 Troubleshooting

### Port already in use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database issues (reset to clean state)
```bash
# Delete the database and let it recreate
rm backend/carlservices.db
npm run server
```

### npm install fails
```bash
# Clear npm cache
npm cache clean --force
npm run install-all
```

### Frontend shows blank page
```bash
# Check for React errors
cd frontend && npm start
# Look for errors in terminal
```

### "Cannot connect to server" in browser
- Make sure backend is running: `npm run server`
- Check http://localhost:5000/api/health in browser
- Verify frontend `package.json` has `"proxy": "http://localhost:5000"`

### Admin can't log in
```bash
# Delete DB and reseed
rm backend/carlservices.db
# Restart server — admin will be reseeded
npm run server
```

---

## 📝 Changing Admin Credentials

Edit `backend/.env`:
```
ADMIN_EMAIL=your-new-email@example.com
ADMIN_PASSWORD=YourNewPassword123
```

Then delete and reseed the database:
```bash
rm backend/carlservices.db
npm run server
```

---

## 🔒 Production Security Checklist

- [ ] Change `JWT_SECRET` to a long random string (32+ characters)
- [ ] Change admin email and password
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Set up HTTPS with Let's Encrypt / Certbot
- [ ] Configure CORS to allow only your domain
- [ ] Set up regular database backups
- [ ] Consider migrating from SQLite to PostgreSQL for high load

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | SQLite (better-sqlite3) |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| File Upload | Multer |
| Dev Tool | Nodemon, Concurrently |
| Fonts | Syne (headings), IBM Plex Sans (body) |

---

**Carl Service Marketplace** — Built for Zimbabwe 🇿🇼 & South Africa 🇿🇦  
*Questions? Contact: carl@carlservices.com*
