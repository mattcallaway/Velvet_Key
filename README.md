# Velvet Key API (Production)

> **The Privacy-First, Adult-Oriented Rental Marketplace Backend**

![Status](https://img.shields.io/badge/Status-Secure_Beta-success)
![Version](https://img.shields.io/badge/Version-0.5.0-blue)
![Security](https://img.shields.io/badge/Guardrails-Maximum-red)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## 📖 Table of Contents

1.  [🔒 Security Architecture ("Bar the Doors")](#-security-architecture-bar-the-doors)
2.  [👁️ Project Vision](#-project-vision)
3.  [🏗️ Technical Architecture](#-technical-architecture)
4.  [💾 Data & Privacy Models](#-data--privacy-models)
5.  [🌟 Key Features](#-key-features)
6.  [📚 API Documentation](#-api-documentation)
7.  [💻 Setup & Development](#-setup--development)
8.  [🔄 Deployment](#-deployment)
9.  [📂 Project Structure](#-project-structure)

---

## 🔒 Security Architecture ("Bar the Doors")

Velvet Key employs an aggressive, **Fail-Closed security model** designed to protect users from stalking, doxxing, and data leaks.

### 🛡️ "The Black Mirror Suite" (Anti-Stalking)
We assume every piece of metadata can be weaponized.
*   **EXIF Stripping**: Middleware (`sharp`) physically rewrites all uploaded images to remove GPS coordinates and camera models before storage.
*   **Location Fuzzing**: The API **never** returns exact coordinates to strangers. A cryptographic RNG applies a 200-500m offset to map pins. Exact address is only revealed after a **Confirmed Booking**.
*   **Anti-Scraping**: User profiles have strict rate limits (10 views/hour) to prevent harvesting of member lists.

### 🧱 Hard Infrastructure
*   **Strict Helmet Policy**: HSTS (1 Year), CSP (Restricted), and `noSniff` enforced globally.
*   **Tiered Rate Limiting**:
    *   **Auth**: 10 requests / 15 min (Brute Force Protection).
    *   **Writes**: 50 requests / 15 min (Spam Protection).
    *   **Global**: 200 requests / 15 min (DDoS Protection).
*   **Canary Routes**: Accessing `/admin.php` or `/.env` triggers a **CRITICAL** audit alert and potential IP ban.

### 🧹 Data Lifecycle
*   **Fail-Closed Deletion**: Deleting an account triggers an atomic transaction that:
    1.  Wipes PII from PostgreSQL.
    2.  Deletes all Rentals and Messages.
    3.  Anonymizes Reviews and Bookings (Stats preserved, Identity lost).
    4.  Purges Firebase Auth & Storage buckets.
*   **Log Redaction**: `AuditService` automatically scrubs emails, names, tokens, and addresses from all logs before writing to Firestore or Stdout.

---

## 👁️ Project Vision

**Velvet Key** is the safe haven for adult lifestyle travel. We bridge the gap where Airbnb fear to tread.

*   **Uncompromising Privacy**: Your kink is your business. Our architecture proves it.
*   **Vetted Community**: A bidirectional review system ensures mutual trust.
*   **Specialized Search**: Find "Dungeons", "Sybian Machines", or "Soundproof Rooms" with dedicated filters.
*   **Legal Clarity**: Built-in 21+ verification and liability structure.

---

## 🏗️ Technical Architecture

### Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | **Node.js v20+** | High-concurrency event loop for real-time messaging. |
| **API** | **Express.js** | Battle-tested Middleware architecture for security chains. |
| **DB (Relational)** | **PostgreSQL 14** | ACID compliance for critical Booking/Financial data. |
| **ORM** | **Prisma** | Type-safe schema management and migrations. |
| **Logs (NoSQL)** | **Firestore** | Scalable, structured audit logging for Host Activity Feeds. |
| **Auth** | **Firebase Auth** | Industry-standard identity (MFA, Phone Auth, Google) without PII on our metal. |
| **Storage** | **Firebase Storage** | High-res image hosting with signed URL capabilities. |
| **Security** | **Sharp / Helmet** | Image sanitization and HTTP hardening. |

### System Diagram
```mermaid
graph TD
    Client[Mobile App / Web] -->|HTTPS| LoadBalancer[Nginx / Cloudflare]
    LoadBalancer -->|Port 4000| API[Node.js API]
    
    API -->|Auth| Firebase[Firebase Auth]
    API -->|Queries| Postgres[(PostgreSQL)]
    API -->|Audit Logs| Firestore[(Firestore)]
    API -->|Uploads| Storage[(Firebase Storage)]
    
    subgraph "Trust & Safety Boundary"
        API -- Strip EXIF --> Sharp[Image Processor]
        API -- Redact PII --> Logger[Audit Service]
        API -- Fuzz GPS --> Response[Client Response]
    end
```

---

## 💾 Data & Privacy Models

### User (PostgreSQL)
*   `id`: UUID (Reference only)
*   `firebaseUid`: Link to Auth
*   `email`: **Critical PII** (Strict Access)
*   `moderationStatus`: Enum (`ACTIVE`, `SHADOWBANNED`, `SOFT_HIDDEN`)

### Trust Models
*   `Report`: Tracks abuse (`entityType`: User/Rental/Message). Triggers auto-moderation.
*   `Block`: Bidirectional blocking matrix.

### Rental (PostgreSQL)
*   `latitude/longitude`: **Fuzzed** on read.
*   `images`: JSON Array (Cleaned URLs).

---

## 🌟 Key Features

1.  **Robust User Management**: Multi-step registration, 21+ checks, Role management (Host/Guest).
2.  **Advanced Rental Engine**: CRUD listings with dynamic amenity filters and Option B hybrid search.
3.  **Booking State Machine**: `REQUESTED` -> `CONFIRMED` -> `COMPLETED` strict flow.
4.  **Trust & Safety**: Block/Report logic, automated Shadowbanning, and Admin overrides.
5.  **Audit Logs**: Hosts see exactly who edited what and when in their dashboard.

---

## 📚 API Documentation

### Connection
*   **Production**: `http://172.233.140.74:4000/api`
*   **Local**: `http://localhost:4000/api`

### Auth Header
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

### Endpoints (Abbreviated)

| Method | Endpoint | Description | Guardrails |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create Account | Rate: 10/15m |
| `GET` | `/users/:id` | Get Profile | Rate: 10/hr (Public) |
| `POST` | `/users/delete` | **Delete Account** | **IRREVERSIBLE** |
| `GET` | `/rentals` | Search Listings | Location Fuzzed |
| `POST` | `/rentals` | Create Listing | EXIF Stripped |
| `POST` | `/trust/report` | Report User | Anon to Target |
| `POST` | `/trust/block` | Block User | Bidirectional |

> *See [CONTRACT.md](./CONTRACT.md) for full JSON specs.*

---

## 💻 Setup & Development

### Prerequisites
*   Node.js v18+
*   PostgreSQL 14+
*   Firebase Service Account (`firebase-service-account.json`)

### Quick Start
1.  **Clone**:
    ```bash
    git clone https://github.com/mattcallaway/Velvet_Key.git
    cd velvet-key-api
    ```
2.  **Install**:
    ```bash
    npm install
    # Installs sharp (native deps required)
    ```
3.  **Env**:
    ```env
    DATABASE_URL="postgresql://user:pass@localhost:5432/velvet_key"
    FIREBASE_PROJECT_ID=...
    CORS_ORIGINS=http://localhost:3000
    ```
4.  **Database**:
    ```bash
    npx prisma migrate dev
    npx prisma seed
    ```
5.  **Run**:
    ```bash
    npm run dev
    ```

---

## 🔄 Deployment

**Standard Workflow**:
1.  Push to `main`.
2.  SSH into Linode.
3.  `git pull`, `npm install`, `npx prisma migrate deploy`.
4.  `pm2 restart velvet-key-api`.

**Security Checks**:
*   `npm audit` must return 0 vulnerabilities.
*   `SECURITY_GATES.md` checks must be passed.

---

## 📂 Project Structure

```
src/
├── config/         # Sharp, Firebase, Env
├── controllers/    # Business Logic
├── middleware/     # Helmet, RateLimit, Auth
├── routes/         # API Definitions
├── services/       # Prisma & Logic Layer
│   ├── audit.service.js  # PII Redaction
│   ├── trust.service.js  # Block/Report
│   └── rental.service.js # Location Fuzzing
├── utils/          # Helpers
└── app.js          # Entry Point (Hardened)
```
