# Software Requirements Specification (SRS)
## Carl Service Marketplace
**Version:** 1.0.0 | **Date:** 2024 | **Author:** Carl / Project Owner

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete software requirements for the **Carl Service Marketplace** platform — a location-based, two-sided marketplace connecting customers with vetted local service providers across **Zimbabwe** and **South Africa**.

### 1.2 Scope
Carl Service Marketplace enables:
- Customers to discover, filter, and book local service professionals
- Service providers (electricians, plumbers, mechanics, etc.) to register, get approved, pay subscriptions, and receive bookings
- Carl (admin) to maintain full control over provider approvals, subscription confirmations, and platform operations

### 1.3 Definitions
| Term | Definition |
|---|---|
| Admin | Carl — the sole platform owner/administrator |
| Provider | A vetted, paying service professional listed on the platform |
| Customer | A registered user who books services |
| Subscription | Monthly fee paid by providers to remain listed |
| Booking | A service appointment created by a customer |

---

## 2. Overall Description

### 2.1 Product Overview
Carl Service Marketplace is a full-stack web application with:
- **Frontend:** React.js SPA
- **Backend:** Node.js / Express REST API
- **Database:** SQLite (via better-sqlite3, upgradeable to PostgreSQL)
- **Auth:** JWT-based authentication

### 2.2 User Roles

| Role | Description |
|---|---|
| **Admin (Carl)** | Full platform control — approves providers, confirms payments, monitors all activity |
| **Provider** | Service professional — registers, awaits approval, pays subscription, manages bookings |
| **Customer** | End user — registers, browses services, books providers, leaves reviews |

### 2.3 Operating Environment
- Supported Countries: 🇿🇦 South Africa, 🇿🇼 Zimbabwe
- Currency: ZAR (South Africa), USD (Zimbabwe)
- Platform: Web (desktop + mobile responsive)

---

## 3. Functional Requirements

### 3.1 Authentication & Accounts

| ID | Requirement |
|---|---|
| FR-01 | Customers shall register with name, email, password, phone, country, and city |
| FR-02 | Providers shall register with additional fields: category, bio, experience, ID number, hourly rate |
| FR-03 | All users shall log in with email and password using JWT tokens |
| FR-04 | Password minimum length is 8 characters |
| FR-05 | Email addresses shall be unique across all user types |
| FR-06 | Users shall be able to update their profile (name, phone, city) |
| FR-07 | JWT tokens shall expire after 7 days |

### 3.2 Provider Registration & Approval

| ID | Requirement |
|---|---|
| FR-08 | Providers shall submit an application with personal and professional details |
| FR-09 | Providers may upload up to 5 supporting documents (ID, certificates, qualifications) during registration |
| FR-10 | Admin (Carl) shall receive a notification when a new provider registers |
| FR-11 | Admin shall review provider applications via the Admin Panel |
| FR-12 | Admin shall approve or reject any provider application |
| FR-13 | On approval, the provider receives a notification with subscription payment instructions |
| FR-14 | On rejection, the provider receives a notification with the rejection reason |
| FR-15 | Rejected providers may reapply |
| FR-16 | Admin shall be able to suspend any active provider at any time |
| FR-17 | Admin shall be able to permanently delete any provider account |

### 3.3 Subscription Management

| ID | Requirement |
|---|---|
| FR-18 | Monthly subscription fee: ZAR 200 (South Africa) / USD 20 (Zimbabwe) |
| FR-19 | Only approved providers may submit subscription payment requests |
| FR-20 | Providers shall submit a payment reference after making payment via EFT, EcoCash, or other methods |
| FR-21 | Admin (Carl) shall receive a notification when a provider submits a payment reference |
| FR-22 | Admin shall confirm or deny payment submissions manually |
| FR-23 | Upon confirmation, provider's subscription activates for 30 days |
| FR-24 | Provider's listing expires when subscription lapses and is hidden from customers |
| FR-25 | Admin shall view full subscription payment history |

### 3.4 Service Listing & Discovery

| ID | Requirement |
|---|---|
| FR-26 | Only approved + active-subscription providers shall appear in public listings |
| FR-27 | Customers shall filter providers by: category, country, city, keyword search |
| FR-28 | Providers shall be sorted by rating (descending) then total reviews |
| FR-29 | Supported service categories: Electrician, Plumber, Mechanic, Carpenter, Painter, Cleaner, Gardener, Tiler, Roofer, HVAC Technician, General Handyman |
| FR-30 | Admin may add new categories by updating the category list |
| FR-31 | Provider profiles shall display: name, category, city, country, bio, hourly rate, experience years, rating, reviews |

### 3.5 Booking System

| ID | Requirement |
|---|---|
| FR-32 | Only registered customers shall make bookings |
| FR-33 | Customers shall specify: date, time, address, and job description when booking |
| FR-34 | Booking date must be at least 1 day in the future |
| FR-35 | Provider shall be notified of each new booking |
| FR-36 | Provider shall accept, decline, start (in-progress), or complete bookings |
| FR-37 | Customer shall be notified of booking status changes |
| FR-38 | Customer may cancel a pending booking |
| FR-39 | Admin shall view all bookings across the platform |

### 3.6 Reviews & Ratings

| ID | Requirement |
|---|---|
| FR-40 | Customers may leave one review per completed booking |
| FR-41 | Reviews include a rating (1–5 stars) and optional text comment |
| FR-42 | Provider's aggregate rating and total review count shall update automatically |
| FR-43 | Reviews are publicly visible on the provider's profile page |

### 3.7 Admin Control Panel

| ID | Requirement |
|---|---|
| FR-44 | Admin dashboard shall display: total customers, total/active/pending providers, booking stats, subscription revenue |
| FR-45 | Admin shall manage all providers: approve, reject, suspend, delete |
| FR-46 | Admin shall confirm subscription payments and activate/deactivate providers |
| FR-47 | Admin shall view all bookings, all customers, all subscriptions |
| FR-48 | Admin shall receive real-time in-app notifications for registrations and payments |
| FR-49 | Admin account is pre-seeded and cannot be created via registration |

### 3.8 Notifications

| ID | Requirement |
|---|---|
| FR-50 | In-app notifications for admin: new provider registration, new subscription payment |
| FR-51 | In-app notifications for providers: approval/rejection, subscription confirmation, new bookings |
| FR-52 | In-app notifications for customers: booking status changes |
| FR-53 | Unread notification count shall display in the navigation bar |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | All passwords hashed with bcrypt (salt rounds: 10) |
| NFR-02 | Security | All protected routes require valid JWT token |
| NFR-03 | Security | Admin routes require admin role in JWT payload |
| NFR-04 | Performance | API response time < 500ms for standard queries |
| NFR-05 | Usability | Mobile-responsive UI (min width 320px) |
| NFR-06 | Scalability | SQLite for MVP; schema designed for PostgreSQL migration |
| NFR-07 | Reliability | Database uses WAL mode for concurrent reads |
| NFR-08 | File Storage | Uploaded documents max 5MB per file; stored server-side |
| NFR-09 | Availability | Suitable for local hosting, VPS, or cloud deployment |
| NFR-10 | Localisation | Currency displayed by country: ZAR or USD |

---

## 5. Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Full name |
| email | TEXT | Unique |
| password | TEXT | bcrypt hash |
| phone | TEXT | Optional |
| role | TEXT | customer / provider / admin |
| country | TEXT | ZA / ZW |
| city | TEXT | City name |
| created_at | DATETIME | Auto |

### providers
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| user_id | TEXT | FK → users |
| category | TEXT | Service type |
| bio | TEXT | Description |
| experience_years | INTEGER | |
| id_number | TEXT | ID/Passport |
| status | TEXT | pending / approved / rejected |
| subscription_status | TEXT | active / inactive |
| subscription_expires_at | DATETIME | |
| hourly_rate | REAL | In local currency |
| rating | REAL | Aggregate |
| total_reviews | INTEGER | |
| documents | TEXT | JSON array of filenames |

### bookings
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| customer_id | TEXT | FK → users |
| provider_id | TEXT | FK → providers |
| service_category | TEXT | |
| date | TEXT | YYYY-MM-DD |
| time | TEXT | HH:MM |
| address | TEXT | |
| description | TEXT | |
| status | TEXT | pending / accepted / in_progress / completed / cancelled |
| total_price | REAL | Estimated |
| currency | TEXT | ZAR / USD |

### subscriptions
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| provider_id | TEXT | FK → providers |
| amount | REAL | |
| currency | TEXT | ZAR / USD |
| payment_reference | TEXT | Provider's reference |
| status | TEXT | pending / confirmed |
| period_start / period_end | DATETIME | 30-day window |
| confirmed_by | TEXT | Admin user ID |

### reviews
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| booking_id | TEXT | FK → bookings (unique) |
| customer_id / provider_id | TEXT | FKs |
| rating | INTEGER | 1–5 |
| comment | TEXT | Optional |

### notifications
| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| user_id | TEXT | FK → users |
| title / message | TEXT | |
| is_read | INTEGER | 0 / 1 |

---

## 6. API Endpoints Summary

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Customer registration |
| POST | /api/auth/login | Public | Login all roles |
| GET | /api/auth/me | Auth | Get current user |
| PUT | /api/auth/profile | Auth | Update profile |

### Providers
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/providers/register | Public | Provider registration |
| GET | /api/providers | Public | List approved+active providers |
| GET | /api/providers/:id | Public | Provider profile + reviews |
| GET | /api/providers/dashboard/me | Provider | Dashboard data |
| PUT | /api/providers/profile/update | Provider | Update bio/rate |
| POST | /api/providers/subscription/request | Provider | Submit payment |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/bookings | Customer | Create booking |
| GET | /api/bookings/my | Customer | List my bookings |
| PUT | /api/bookings/:id/status | Provider/Customer | Update status |
| POST | /api/bookings/:id/review | Customer | Submit review |
| GET | /api/bookings/notifications/me | Auth | My notifications |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/providers | Admin | All providers |
| PUT | /api/admin/providers/:id/approve | Admin | Approve provider |
| PUT | /api/admin/providers/:id/reject | Admin | Reject provider |
| PUT | /api/admin/providers/:id/suspend | Admin | Suspend provider |
| DELETE | /api/admin/providers/:id | Admin | Delete provider |
| GET | /api/admin/subscriptions | Admin | All subscriptions |
| PUT | /api/admin/subscriptions/:id/confirm | Admin | Confirm payment |
| GET | /api/admin/bookings | Admin | All bookings |
| GET | /api/admin/users | Admin | All customers |

---

## 7. Future Enhancements (Phase 2)
- SMS/Email notifications via Twilio / SendGrid
- In-app payment gateway (PayFast for ZA, EcoCash API for ZW)
- Provider availability calendar
- GPS/map-based provider search
- Mobile apps (React Native)
- Multi-language support (English, Shona, Zulu)
- Document verification via third-party API
- Provider analytics dashboard
- Promotional subscription tiers

---

*End of SRS — Carl Service Marketplace v1.0*
