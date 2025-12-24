# Velvet Key - Privacy-Focused Rental Marketplace API

A production-grade REST API for an adult-only, privacy-focused rental marketplace platform. Built with Node.js, Express, PostgreSQL, and Firebase.

---

## 🎯 Project Overview

Velvet Key is a rental marketplace platform focused on privacy-sensitive, adult-only lifestyle events. The platform facilitates property rentals with an emphasis on:

- **Privacy**: User data protection and discretion
- **Trust & Safety**: Identity verification and review systems
- **Non-Exploitative Model**: Minimal or no service fees
- **Legal Clarity**: Clear terms and age verification

---

## 🛠️ Observability & Validation

### 🛠️ Host Audit Logging System (Phase 8)
The platform includes a robust audit trail for all host-related mutations.
- **Event Contract**: Standardized JSON schema (event_id, actor_id, host_id, action, etc.).
- **Storage**: Hybrid model (Firestore `audit_events` for UI, `stdout` for operational logs).
- **Correlation**: Every request is assigned a unique `X-Request-Id` for end-to-end tracing.

### 🧪 Connectivity Validation Suite
To ensure production health on Linode:
- **`smoke-test.sh`**: Verify API health, Env config, and Firebase E2E connectivity in one command.
- **Debug Routes**: Protected endpoints at `/api/debug/config` and `/api/debug/firebase`.

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js v18+ | Server runtime |
| **Framework** | Express.js (CommonJS) | Web framework |
| **Database** | PostgreSQL 14+ | Rentals, bookings, reviews data |
| **ORM** | Prisma | Type-safe database access |
| **Authentication** | Firebase Authentication | User signup, login, verification |
| **Audit Log** | Firestore | Host activity feed storage |
| **Image Storage** | Firebase Storage | Rental property images |
| **Process Manager** | PM2 | Production process management |

---

## 📊 Database Schema

### Core Models

#### **User**
- id (UUID), firebaseUid (link), email, role, profile info, verification flags.

#### **Rental**
- id (UUID), hostId, title, description, location, pricing, amenities, houseRules, images, status.

#### **Booking**
- id (UUID), rentalId, guestId, checkIn/Out, status (PENDING -> CONFIRMED/CANCELLED), pricing snapshot.

#### **Review**
- id (UUID), bookingId, authorId, rating, comment, reviewType.

---

## 📡 API Endpoints

### Health & Debug
- `GET /health` - API health status
- `GET /api/debug/config` - View environment and firebase status
- `GET /api/debug/firebase` - Run E2E Firebase/Firestore connectivity test

### Authentication
- `POST /api/auth/register` - Register after Firebase email signup
- `POST /api/auth/login` - Sync data after Firebase login
- `POST /api/auth/anonymous-upgrade` - Upgrade guest account
- `GET /api/auth/me` - Current user profile

### Host & Activity
- **`GET /api/host/activity`** - Paginated feed of host actions

### Rentals & Bookings
- Standard CRUD for `/api/rentals` and `/api/bookings`.
- Status updates via `PUT /api/bookings/:id/status`.

---

## 🚀 Deployment

- **Server**: Linode Ubuntu server (172.233.140.74)
- **Workflow**: Local Development → Git Commit → GitHub Push → Linode Git Pull → PM2 Restart
- **Script**: `deploy.ps1` (Local) and `smoke-test.sh` (Server)

---

## 🔧 Setup Instructions

1. **Clone & Install**: `git clone ... && npm install`
2. **Environment**: `cp .env.example .env` (Add Firebase/DB credentials)
3. **Database**: `npx prisma migrate dev`
4. **Run**: `npm run dev`

---

## 📝 Development Phases

- [x] **Phase 1-2**: Foundation (DB, Architecture)
- [x] **Phase 3-4**: Firebase, Auth, User Management
- [x] **Phase 5-6**: Rentals, Bookings, Status Workflows
- [x] **Phase 8**: Refinement (Audit Logging, Connectivity Validation)
- [ ] **Phase 7**: Reviews & Trust (In Progress)

---

**Last Updated**: December 24, 2025
**Version**: 0.3.0 (Beta-Ready)
**Status**: Active Development
