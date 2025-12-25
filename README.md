# Velvet Key API (Production)

> **The Privacy-First, Adult-Oriented Rental Marketplace Backend**

![Status](https://img.shields.io/badge/Status-Dev_Complete-success)
![Version](https://img.shields.io/badge/Version-0.4.0-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📖 Table of Contents
1. [Project Vision](#-project-vision)
2. [Architecture & Technology](#-architecture--technology)
3. [Key Features](#-key-features)
4. [Security & Hardening](#-security--hardening)
5. [API Documentation](#-api-documentation)
6. [Database Schema](#-database-schema)
7. [Installation & Setup](#-installation--setup)
8. [Deployment Workflow](#-deployment-workflow)
9. [Project Structure](#-project-structure)

---

## 👁️ Project Vision

**Velvet Key** addresses a critical gap in the hospitality market: a safe, trusted, and high-end platform for adult lifestyle travel. Mainstream platforms (Airbnb, VRBO) often discriminate against or ban users for lifestyle-related activities. Velvet Key provides:

-   **Uncompromising Privacy**: Your data is sacred. We use minimal data retention and strict access controls.
-   **Vetted Community**: A bidrectional review system ensuring hosts and guests can trust one another.
-   **Specialized Search**: Find rentals with specific amenities like "Dungeon", "Soundproof", "Sybian", or "Group Play Areas".
-   **Legal Safety**: Explicit 21+ age verification and liability waivers built-in.

---

## 🏗️ Architecture & Technology

We use a modern, scalable, and type-safe stack designed for performance and reliability.

| Layer | Technology | Description |
|-------|------------|-------------|
| **Runtime** | **Node.js v18+** | High-performance, event-driven JavaScript runtime. |
| **Framework** | **Express.js** | Robust REST API framework with custom middleware. |
| **Database** | **PostgreSQL 14** | Relational data integrity for Bookings and Users. |
| **ORM** | **Prisma** | Type-safe database queries and schema management. |
| **Auth** | **Firebase Auth** | Industry-standard identity management (Tokens, MFA). |
| **Storage** | **Firebase Storage** | Scalable object storage for high-res listing photos. |
| **Logs** | **Google Firestore** | Real-time structured audit logs for Host Activity feeds. |
| **Security** | **Helmet / Rate-Limit** | OWASP-grade security headers and DDOS protection. |

### Why this stack?
-   **Prisma + Postgres**: Ensures data consistency for financial transactions (Bookings).
-   **Firebase**: Offloads complex security (Password hashing, 2FA) to Google's infrastructure while keeping business logic local.
-   **Node/Express**: Allows for rapid iteration and sharing logic with the React Native client.

---

## 🌟 Key Features

### 1. Robust User Management
-   **Registration Wizard**: Multi-step sign-up flow collecting User details, DOB (21+ check), and optional "Persona" details.
-   **Identity**: Firebase UID linked to local Postgres ID for faster joins.
-   **Profiles**: Edit bio, avatar, and relationship status.

### 2. Advanced Rental Engine
-   **CRUD**: Hosts can Create, Read, Update, and Delete listings.
-   **Image Gallery**: Upload up to 10 high-res images per listing.
-   **Dynamic Amenities**: Filters for 50+ specific amenities stored as searchable JSON.
-   **Hybrid Search**: Backend filtering logic that handles complex queries ("Show me Villas in Nevada with a Hot Tub").

### 3. State-Machine Booking Flow
The booking system follows a strict state transition logic to prevent errors:
1.  `PENDING`: Guest requests dates.
2.  `CONFIRMED`: Host approves the request.
3.  `DECLINED`: Host rejects the request.
4.  `CANCELLED`: Guest or Host cancels (triggering refund logic).
5.  `COMPLETED`: Automated after checkout date passes.

### 4. Bidirectional Reviews (Phase 7)
-   **Guest Reviews**: Rate the Property and Host (1-5 Stars).
-   **Host Reviews**: Rate the Guest behavior.
-   **Aggregation**: Automatic calculation of "Average Rating" on profiles and listings.

### 5. Host Audit Logs (Phase 8)
-   **Transparency**: Every action (Edit Listing, Accept Booking) is logged to Firestore.
-   **Feed**: Hosts can see a "Activity Feed" in their dashboard to track co-host actions or system events.

---

## 🛡️ Security & Hardening (Phase 13)

We take security seriously. The API is hardened against common web vulnerabilities.

-   **Rate Limiting**:
    -   Global: 100 requests / 15 min per IP.
    -   Auth Routes: Stricter limits to prevent Brute Force.
-   **HTTP Headers (Helmet)**:
    -   `Strict-Transport-Security` (HSTS)
    -   `X-Content-Type-Options: nosniff`
    -   `X-Frame-Options: DENY`
-   **Input Sanitization**:
    -   `xss-clean`: Prevents Cross-Site Scripting attacks in JSON bodies.
    -   `express-validator`: Strict type checking on all inputs (Email, UUIDs, Dates).
-   **CORS**: Whitelisted origins only.

---

## 📚 API Documentation

### Base URL
-   **Production**: `http://172.233.140.74:4000/api`
-   **Development**: `http://localhost:4000/api`

### Authentication Header
All private routes require a valid Firebase ID Token:
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

### Core Endpoints

#### User
-   `POST /auth/register` - Create account.
-   `POST /auth/login` - Sync Firebase user to Postgres.
-   `GET /auth/me` - Get full profile.

#### Rentals
-   `GET /rentals` - Search listings (Query: `city`, `guests`, `priceMin`).
-   `POST /rentals` - Create listing (Host only).
-   `GET /rentals/:id` - Get details.

#### Bookings
-   `POST /bookings` - Request a stay.
-   `GET /bookings` - Get my trips.
-   `PATCH /bookings/:id/status` - Host Accept/Decline.

#### Reviews
-   `POST /reviews` - Submit review `{ rentalId, rating, comment }`.
-   `GET /reviews/rental/:id` - Read rental reviews.

> *For a complete specification including request/response bodies, see [CONTRACT.md](./CONTRACT.md).*

---

## 💾 Database Schema

**User**
- `id`: UUID (PK)
- `email`: String (Unique)
- `firstName`, `lastName`: String
- `role`: Enum (GUEST, HOST, ADMIN)

**Rental**
- `id`: UUID (PK)
- `hostId`: UUID (FK -> User)
- `title`: String
- `pricePerNight`: Float
- `amenities`: JSON String (Array)
- `images`: JSON String (Array of URLs)

**Booking**
- `id`: UUID (PK)
- `status`: Enum (PENDING, CONFIRMED...)
- `totalPrice`: Float
- `checkInDate`, `checkOutDate`: DateTime

**Review**
- `id`: UUID (PK)
- `rating`: Int (1-5)
- `comment`: Text

---

## 💻 Installation & Setup

### Prerequisites
-   Node.js v18.0.0 or higher
-   PostgreSQL 14 locally installed
-   Firebase Admin Service Account (`serviceAccountKey.json`)

### 1. Clone & Install
```bash
git clone https://github.com/mattcallaway/Velvet_Key.git
cd Velvet_Key/api
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root:
```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/velvet_key?schema=public"

# Firebase (Client)
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...

# Security
CORS_ORIGINS=http://localhost:3000,http://172.233.140.74
```

### 3. Database Setup
Run migrations to create tables:
```bash
npx prisma migrate dev --name init
```
Seed the database with test data:
```bash
npx prisma seed
```

### 4. Run Locally
```bash
npm run dev
# Server starting on port 4000...
# Database connected...
```

---

## 🔄 Deployment Workflow

We use a simple, robust git-based deployment to our Linode server.

1.  **Local**: Standard Git flow.
    ```bash
    git add .
    git commit -m "feat: new cool thing"
    git push origin main
    ```

2.  **Server (Linode)**:
    -   SSH into server.
    -   Pull changes: `git pull origin main`
    -   Install deps: `npm install --production`
    -   Migrate DB: `npx prisma migrate deploy`
    -   Restart Process: `pm2 restart velvet-key-api`

---

## 📁 Project Structure

```
src/
├── config/         # Env vars and Firebase setup
├── controllers/    # Request handlers (Logic)
├── middleware/     # Auth, Validation, Error Handling
├── routes/         # Express Route definitions
├── services/       # Database access (Prisma calls)
├── utils/          # Helpers (Response formatting)
└── app.js          # App Entry point
prisma/
├── schema.prisma   # DB Schema definition
└── seed.js         # Test data generator
```
