# Velvet Key API - Project Roadmap

**Last Updated**: December 24, 2025  
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

### Core Principles

1. **Privacy**: User data is sacred
2. **Non-Exploitative**: Find revenue streams that don't burden users
3. **Trust & Safety**: Verification and reviews build community
4. **Transparency**: Clear terms, no hidden fees
5. **Quality**: Production-grade code, not MVP shortcuts

---

## 🕰️ Where We Came From

### Initial State (December 21, 2025 - Morning)

**Infrastructure Already in Place:**
- ✅ Linode Ubuntu server (172.233.140.74)
- ✅ UFW firewall configured (ports 22, 80, 443)
- ✅ Nginx reverse proxy (port 80 → 4000)
- ✅ PM2 process manager installed
- ✅ Node.js installed on server
- ✅ Basic Express server with `/health` endpoint
- ✅ GitHub repository: https://github.com/mattcallaway/Velvet_Key
- ✅ Git workflow established (local → GitHub → Linode)

**What We Built (December 21, 2025 - Day 1):**

### Phase 1: Planning & Architecture (COMPLETED ✅)
- Created comprehensive architecture document
- Designed complete database schema (Users, Rentals, Bookings, Reviews)
- Documented all API endpoints
- Planned authentication strategy (initially JWT, switched to Firebase)
- Defined technology stack

### Phase 2: Database Layer (COMPLETED ✅)
- Installed PostgreSQL 14 on Linode server
- Created database: `velvet_key_db`
- Created database user: `velvet_key_user`
- Set up Prisma ORM with complete schema
- Created comprehensive seed data (test users, rentals, bookings)
- Installed all dependencies (bcrypt, JWT, express-validator, multer, etc.)
- Pushed all code to GitHub
- Deployed to Linode server
- **Status**: Database tables created, ready for data

---

## 🕰️ Where We Came From

**Completed Recently:**
- ✅ **Phase 3-4 (Auth/Users)**: Full Firebase integration and User CRUD.
- ✅ **Phase 5-6 (Rentals/Bookings)**: Complete listing management and booking workflows.
- ✅ **Phase 8 (Logging)**: Standardized hybrid logging and host activity feed.
- ✅ **Phase 8.5 (Search)**: Hybrid search indexing (Option B) with amenity filters.
- ✅ **API Contract**: Established `CONTRACT.md` as the shared source of truth.

---

## 📍 Where We Are Now

### Current Status (December 24, 2025)

**Completed:**
- ✅ Full database schema designed and implemented
- ✅ PostgreSQL running on Linode with all tables created
- ✅ Firebase Authentication & Storage integrated
- ✅ **Phase 3-6**: Register, Login, User CRUD, Rentals, Bookings
- ✅ **Phase 8-8.5**: Audit Logging, Hybrid Search Indexing
- ✅ **Shared Contract**: CONTRACT.md established across app/server

**In Progress:**
- 🔄 Phase 9: Mobile UI Integration (React Native)
- 🔄 Refinement: Global error handling and validation consistency

**Next Immediate Steps:**
1. Open port 4000 on Linode Firewall (`ufw allow 4000/tcp`)
2. Begin Mobile App E2E testing against Dev Base URL
3. Implement Reviews & Trust system (Phase 7)

**Blockers:**
- None currently

**Technical Debt:**
- [x] Need to remove bcrypt/JWT dependencies (replaced by Firebase)
- [x] Need to update User model to include `firebaseUid` field
- [ ] **Decimal Precision**: Current pricing uses `Number()` (float). Migrate to `decimal.js` or `Prisma.Decimal` for financial accuracy.

---

## 🚀 Where We're Going

### Short-Term Goals (Next 2 Weeks)

**Phase 9: Mobile UI Integration** (Starting Now)
- Connect React Native app to standard API endpoints
- Implement E2E flow for registration and login
- Real-time sync verification

**Phase 7: Reviews & Trust** (Next)
- Bidirectional review system (guest ↔ host)
- Rating aggregation
- Review moderation
- Verification status display

---

## 📋 Detailed Phase Breakdown

### Phase 8: Refinement & Observability (COMPLETED ✅)
- Host Audit Logging system
- Request ID middleware
- Connectivity validation suite
- Anonymous account upgrades

### Phase 8.5: Amenities & Search (COMPLETED ✅)
- Global Amenity Catalog
- Firestore Hybrid Search Index
- Option B Search Engine implementation

---

## 🤔 Technical Decisions & Rationale

### Why Hybrid Search (Option B)?
**Decision**: Use Firestore for coarse filtering and Node.js for fine-grained amenity logic.
**Rationale**: Balances Firestore's query limitations with the need for flexible, multi-type amenity filtering without requiring a heavy Elasticsearch setup for the MVP.

---

## ✅ Success Criteria

### MVP Core Success (COMPLETED ✅)
- [x] Complete user registration and authentication (Firebase)
- [x] Hosts can list properties with images
- [x] Guests can search (Hybrid) and book rentals
- [x] Host approval workflow functional
- [x] API documented in CONTRACT.md

---

## ⚠️ Risk & Mitigation

### Technical Risks
- **Risk**: Firestore/Postgres sync lag. 
- **Mitigation**: Triggered re-indexing on rental updates.

---

## 🎓 Onboarding New Developers

### Required Reading
1. [CONTRACT.md](./CONTRACT.md) - **Master API Contract**
2. [README.md](./README.md) - Setup and architecture
3. [implementation_plan.md](./docs/implementation_plan.md) - Technical details

---

## 📞 Contact & Support

**Project Lead**: Antigravity (AI Architect)  
**Repository**: https://github.com/mattcallaway/Velvet_Key  
**Server**: 172.233.140.74  

---

**This roadmap is a living document. Last sync: 2025-12-24 02:05 UTC.**
