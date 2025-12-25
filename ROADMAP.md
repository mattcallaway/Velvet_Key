# Velvet Key API - Project Roadmap

**Last Updated**: December 25, 2025  
**Project Status**: Dev-Complete (Core MVP) - Ready for Frontend Integration
**Version**: 0.4.0 (Dev-Complete)

---

## 📖 Table of Contents

1. [Project Vision](#project-vision)
2. [Where We Came From](#where-we-came-from)
3. [Where We Are Now](#where-we-are-now)
4. [Where We're Going](#where-were-going)
5. [Detailed Phase Breakdown](#detailed-phase-breakdown)
6. [Technical Decisions & Rationale](#technical-decisions--rationale)
7. [Success Criteria](#success-criteria)
8. [Risk & Mitigation](#risk--mitigation)

---

## 🎯 Project Vision

### The Problem

Existing rental marketplace platforms (Airbnb, VRBO) don't adequately serve the needs of privacy-sensitive, adult-only lifestyle events. Users need:

- **Privacy**: Discretion and data protection
- **Trust**: Verified hosts and guests
- **Fair Economics**: Non-exploitative fee structures
- **Legal Clarity**: Clear age verification and terms

### The Solution

**Velvet Key** is a rental marketplace API specifically designed for adult-only (21+) lifestyle events, with:

- Privacy-first architecture
- Robust identity verification hooks
- Minimal/no service fees (non-parasitic model)
- Clear legal framework and age verification
- Trust & safety through bidirectional reviews

---

## 🕰️ Where We Came From

### Initial State (December 21, 2025)
**Infrastructure Already in Place:**
- ✅ Linode Ubuntu server (172.233.140.74)
- ✅ UFW firewall configured (ports 22, 80, 443)
- ✅ Node.js, PostgreSQL, PM2, Nginx environment established.
- ✅ Basic Express server skeleton.

### Core Implementation (COMPLETED ✅)

**Phase 1-2: Setup & DB**
- Comprehensive schema design for PostgreSQL.
- Prisma ORM integrated with 100% type-safe models.
- Seed data generated for local and staging environments.

**Phase 3-4: Firebase & User Sync**
- Firebase Admin SDK integrated for secure authentication.
- Middleware hydrators for mapping Firebase UIDs to PostgreSQL IDs.
- Full User Profile CRUD (Get, Meta-Updates, Reviews, Deletion).

**Phase 5-6: Rentals & Bookings**
- Host listing management with multi-image Firebase Storage uploads.
- Rental search engine with core filters (City, Guests, Price).
- Booking status machine (Requested → Confirmed → Completed/Cancelled).

**Phase 8-8.5: Observability & Search (COMPLETED ✅)**
- **Host Audit Logging**: Real-time event logging (Firestore) for transparency.
- **Hybrid Search Engine**: Flexible amenity filtering (Option B) implemented via search indexing.
- **Shared API Contract**: Established `CONTRACT.md` as the source of truth.

---

## 📍 Where We Are Now

### Current Status (December 24, 2025)

**Completed:**
- ✅ Full database schema implemented.
- ✅ All core MVP endpoints (Auth, Users, Rentals, Bookings) are production-ready.
- ✅ **Option B Search** active on Linode.
- ✅ **Host Activity Logs** functional on Linode.
- ✅ **Shared Contract** reconciled between App/Server.
- ✅ **Mobile App Connected**: Full connectivity between React Native app and Linode API.

**In Progress:**
- 🔄 Phase 9: Mobile UI Integration (React Native) - **Polishing Phase**.

**Next Immediate Steps:**
1. ✅ Open port 4000 on Linode (`ufw allow 4000/tcp`).
2. ✅ Connect Mobile Client to production `CONTRACT.md` endpoints.
3. Implement Phase 7: **Reviews & Trust** (Aggregated ratings).

---

## 🚀 Where We're Going

### Short-Term (Next 2 Weeks)
### [ACTIVE] Phase 9: Mobile UI Integration
- **Goal**: Implement "Modern Marketplace — After Dark" aesthetic.
- **Status**: **MVP Released to Alpha** (Connected to Prod).
- **Key Changes**:
  - Dark-first theme (`#121212`).
  - 2-Step Registration Wizard.
  - Immersive Browse & Detail screens with sticky footers.
  - "Discovery" search bar and gold/red filter logic.
  - **Real Data**: Live listings now serving from Linode.

**Phase 7: Reviews & Ratings**
- Bidirectional review system.
- Global rating aggregation on `User` and `Rental` models.

### Medium-Term (Next 1-2 Months)
- **Phase 10: Payment Integration (Stripe)**: Handling transactions and security deposits.
### [COMPLETED] Phase 11: Real-time Communication
- **Implemented**: Messaging system with separate `Conversation` and `Message` models in PostgreSQL.
- **Features**: Support for subjects, attachments, and access control list logic.
- **REST API**: Create/Read endpoints established.

- **Phase 12: Admin Control Plane**: Dashboard for content moderation.
### [COMPLETED] Phase 13: Security & Hardening
- **Implemented**: Rate limiting (100 req/15min), HPP parameter pollution protection, Helmet security headers, and input sanitization.

### Backlog / Future Tasks
- [ ] **Extended Profile Schema (Post-UI Overhaul)**
  - [ ] Update Prisma Schema `User` model:
    - `screenName` (String, unique?)
    - `genderIdentity` (String)
    - `relationshipStatus` (String)
    - `location` (String)
    - `inviteCode` (String, optional)
  - [ ] Update `auth.controller.js` to accept these fields during registration.
  - [ ] Add validation logic for these fields.

---

## 📋 Detailed Phase Breakdown

### [COMPLETED] Phase 3-6: Core MVP Implementation
- Registration sync with Firebase.
- Listing creation and public search.
- Booking request and status management.

### [COMPLETED] Phase 8: Observability & Refinement
- Standardized `response.util.js` for API consistency.
- Standardized `activity.service.js` for Firestore audit trails.
- Automatic Search Indexing on rental updates.

### [ACTIVE] Phase 7: Reviews & Trust
- **Goal**: Build community trust.
- **Tasks**: Rating calculations, review submission logic.

---

## 🤔 Technical Decisions & Rationale

### Hybrid Search (Option B)
We chose Option B (Index-assisted Node.js filtering) because it provides the flexibility of schema-less amenity types (Boolean, Enum, Numeric) without the complexity of a full Lucene-based search cluster (Elasticsearch) during the early stages.

### Firebase-Native Auth
By delegating Auth to Firebase, we offload security risks (Pass reset, MFA) while maintaining a high-performance local relational DB (PostgreSQL) for business logic.

---

## ✅ Success Criteria

- [x] Users can Register/Login securely.
- [x] Listings are searchable by location and dynamic amenities.
- [x] Bookings follow a strict status-transition state machine.
- [x] All activity is logged and visible to hosts.
- [x] API documentation (CONTRACT.md) matches implementation 1:1.

---

## 🎓 Onboarding New Developers

### Required Reading
1. [CONTRACT.md](./CONTRACT.md) - **Master API Contract**
2. [README.md](./README.md) - Project Setup
3. [ROADMAP.md](./ROADMAP.md) - Current Progress

---

**This roadmap is a living document. Last sync: 2025-12-24 02:07 UTC.**
