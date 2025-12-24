# Velvet Key API - Project Roadmap

**Last Updated**: December 24, 2025  
**Project Status**: Active Development - Phase 8 (Refinement) Complete
**Version**: 0.2.0 (Beta-Ready)

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

### Key Architectural Decision: Firebase Integration

**Decision Made**: Switch from custom JWT authentication to Firebase Authentication + Storage

**Rationale**:
- Better security out of the box
- Email verification, password resets built-in
- Less code to maintain
- MFA ready for future
- Firebase Storage cheaper than AWS S3
- Industry-standard solution

---

## 🕰️ Where We Came From

### Status Update (December 24, 2025)

**Completed Today:**
- ✅ **Connectivity & Validation**: Created `smoke-test.sh` and debug endpoints.
- ✅ **Anonymous Auth**: Implemented anonymous login and account upgrade logic.
- ✅ **Host Audit Logging**: Built a standardized, hybrid logging system with Activity Feed UI support.
- ✅ **Linode Health**: 100% verified E2E connectivity on the production server.

---

## 📍 Where We Are Now

### Current Status (December 24, 2025)

**Completed:**
- ✅ Full database schema designed and implemented
- ✅ PostgreSQL running on Linode with all tables created
- ✅ Firebase Authentication & Storage integrated
- ✅ **Audit Event System** (Phase 8) implemented and verified
- ✅ **Connectivity Suite** implemented and verified
- ✅ **Anonymous Account Upgrade** implemented and verified
- ✅ **Host Activity Feed API** implemented and verified

**In Progress:**
- 🔄 Phase 7: Reviews & Trust
- 🔄 Enhancing request tracing depth

**Next Immediate Steps:**
1. Verify database migrations completed successfully
2. Set up Firebase Admin SDK
3. Create Firebase authentication middleware
4. Build user sync endpoints

**Blockers:**
- None currently

**Technical Debt:**
- [x] Need to remove bcrypt/JWT dependencies (replaced by Firebase)
- [x] Need to update User model to include `firebaseUid` field
- [ ] **Decimal Precision**: Current pricing uses `Number()` (float). Migrate to `decimal.js` or `Prisma.Decimal` for financial accuracy.

---

## 🚀 Where We're Going

### Short-Term Goals (Next 2 Weeks)

**Phase 3: Firebase Integration** (Starting Now)
- Set up Firebase Admin SDK in Node.js
- Configure Firebase Authentication
- Create middleware to verify Firebase tokens
- Build user registration/login sync endpoints
- Configure Firebase Storage for images
- Update User model with `firebaseUid`

**Phase 4: User Management** (Week 2)
- User profile CRUD endpoints
- Role-based access control (GUEST, HOST, ADMIN)
- Identity verification hooks (structure only)
- User review retrieval

### Medium-Term Goals (Weeks 3-6)

**Phase 5: Rental Listings**
- Rental CRUD endpoints
- Image upload to Firebase Storage
- Search and filtering (by location, price, dates)
- Listing approval workflow (admin)
- Availability calendar

**Phase 6: Booking System**
- Booking creation (guest)
- Host approval workflow (no instant book)
- Availability conflict checking
- Booking status management
- Cancellation logic
- Pricing calculations

**Phase 7: Reviews & Trust** (CURRENT)
- Bidirectional review system (guest ↔ host)
- Rating aggregation
- Review moderation
- Verification status display

**Phase 8: Refinement & Observability** (COMPLETED ✅)
- Host Audit Logging system
- Request ID middleware
- Connectivity validation suite
- Anonymous account upgrades

**Phase 9: Payment Integration** (Next Month)
- Stripe integration for payments
- Security deposit handling
- Refund logic
- Payout to hosts

**Phase 10: Communication**
- Email notifications (Mailgun or self-hosted)
- Booking confirmations
- Reminder emails
- Host-guest messaging (in-app)

**Phase 11: Advanced Features**
- Advanced search (amenities, property type)
- Calendar sync (iCal)
- Multi-property management for hosts
- Saved searches for guests
- Favorites/wishlists

**Phase 12: Admin Dashboard**
- User management
- Listing approval
- Content moderation
- Analytics and reporting

**Phase 13: Web Frontend**
- React/Next.js web frontend

**Phase 14: Mobile App** (Active Development)
- React Native mobile app (See mobile repo for details)

---

## 📋 Detailed Phase Breakdown

### Phase 3: Firebase Integration & Authentication (CURRENT)

**Goal**: Replace custom JWT auth with Firebase, enable secure user authentication

**Tasks**:
1. **Firebase Admin SDK Setup**
   - Install `firebase-admin` package
   - Create `src/config/firebase.js` with Admin SDK initialization
   - Add Firebase credentials to `.env`
   - Test connection

2. **Update Database Schema**
   - Add `firebaseUid` field to User model
   - Create migration for schema change
   - Update seed data

3. **Authentication Middleware**
   - Create `src/middleware/auth.middleware.js`
   - Verify Firebase ID tokens from request headers
   - Attach user data to `req.user`
   - Handle token expiration/invalid tokens

4. **User Sync Endpoints**
   - `POST /api/auth/register` - Create DB user after Firebase signup
   - `POST /api/auth/login` - Sync user data after Firebase login
   - `GET /api/auth/me` - Get current user profile

5. **Firebase Storage Configuration**
   - Create `src/config/storage.js`
   - Set up Firebase Storage bucket
   - Create upload utilities
   - Test image upload/retrieval

**Deliverables**:
- Firebase Admin SDK integrated
- Authentication middleware working
- User registration/login flow functional
- Firebase Storage ready for images

**Estimated Time**: 3-5 days

**Success Criteria**:
- Users can register via Firebase and sync to PostgreSQL
- Protected routes verify Firebase tokens correctly
- Images can be uploaded to Firebase Storage

---

### Phase 4: User Management (NEXT)

**Goal**: Complete user profile management and role-based access

**Tasks**:
1. **User Service Layer**
   - Create `src/services/user.service.js`
   - Implement profile retrieval
   - Implement profile updates
   - Implement account deletion

2. **User Controllers**
   - Create `src/controllers/users.controller.js`
   - GET `/api/users/:id` - Public profile
   - PUT `/api/users/:id` - Update profile (authenticated)
   - DELETE `/api/users/:id` - Delete account (authenticated)
   - GET `/api/users/:id/reviews` - User reviews

3. **Role-Based Access Control**
   - Create `src/middleware/role.middleware.js`
   - Implement role checking (GUEST, HOST, ADMIN)
   - Protect endpoints by role
   - Test authorization

4. **Validation**
   - Create `src/middleware/validation.middleware.js`
   - Validate user input (email, phone, dates, etc.)
   - Sanitize inputs
   - Return clear error messages

5. **Identity Verification Hooks**
   - Add verification status fields to User model
   - Create placeholder endpoints for verification
   - Document integration points for future services

**Deliverables**:
- Complete user CRUD operations
- Role-based access working
- Input validation on all endpoints
- Verification hooks ready

**Estimated Time**: 4-6 days

**Success Criteria**:
- Users can view and update their profiles
- Only hosts can create rentals
- Only admins can approve listings
- All inputs validated and sanitized

---

### Phase 5: Rental Listings

**Goal**: Enable hosts to create, manage, and showcase properties

**Tasks**:
1. **Rental Service Layer**
   - Create `src/services/rental.service.js`
   - CRUD operations for rentals
   - Search and filtering logic
   - Availability checking

2. **Rental Controllers**
   - Create `src/controllers/rentals.controller.js`
   - GET `/api/rentals` - Search/list (with filters)
   - GET `/api/rentals/:id` - Rental details
   - POST `/api/rentals` - Create (host only)
   - PUT `/api/rentals/:id` - Update (owner/admin)
   - DELETE `/api/rentals/:id` - Delete (owner/admin)
   - GET `/api/rentals/:id/availability` - Check dates

3. **Image Upload**
   - POST `/api/rentals/:id/images` - Upload to Firebase Storage
   - Generate signed URLs for images
   - Handle multiple image uploads
   - Image validation (size, type)

4. **Search & Filtering**
   - Filter by location (city, state)
   - Filter by price range
   - Filter by dates (availability)
   - Filter by capacity (guests, bedrooms)
   - Filter by amenities
   - Sort by price, rating, distance

5. **Listing Approval**
   - Admin approval workflow
   - `isApproved` flag on rentals
   - Only show approved listings to guests
   - Admin dashboard endpoint

**Deliverables**:
- Hosts can create and manage rentals
- Images upload to Firebase Storage
- Search and filtering working
- Admin approval workflow

**Estimated Time**: 5-7 days

**Success Criteria**:
- Hosts can create listings with images
- Guests can search and filter rentals
- Only approved listings visible to public
- Images load from Firebase Storage

---

### Phase 6: Booking System

**Goal**: Enable guests to book rentals with host approval

**Tasks**:
1. **Booking Service Layer**
   - Create `src/services/booking.service.js`
   - Booking creation logic
   - Availability conflict checking
   - Pricing calculations
   - Status management

2. **Booking Controllers**
   - Create `src/controllers/bookings.controller.js`
   - GET `/api/bookings` - User's bookings
   - GET `/api/bookings/:id` - Booking details
   - POST `/api/bookings` - Create request (guest)
   - PUT `/api/bookings/:id/confirm` - Approve (host)
   - PUT `/api/bookings/:id/decline` - Decline (host)
   - PUT `/api/bookings/:id/cancel` - Cancel (guest/host)

3. **Availability Management**
   - Check for date conflicts
   - Block dates when booking confirmed
   - Release dates when booking cancelled
   - Handle overlapping requests

4. **Pricing Logic**
   - Calculate number of nights
   - Apply per-night rate
   - Add cleaning fee
   - Calculate service fee (if any)
   - Total price calculation
   - Store pricing snapshot

5. **Booking Workflow**
   - Guest creates booking request (status: PENDING)
   - Host receives notification (future)
   - Host approves (status: CONFIRMED) or declines (status: DECLINED)
   - Guest or host can cancel (status: CANCELLED)
   - After checkout date (status: COMPLETED)

**Deliverables**:
- Complete booking workflow
- Availability checking working
- Pricing calculations accurate
- Host approval required

**Estimated Time**: 6-8 days

**Success Criteria**:
- Guests can request bookings
- Hosts can approve/decline
- No double-booking possible
- Pricing calculated correctly

---

### Phase 7: Reviews & Trust

**Goal**: Build trust through bidirectional reviews

**Tasks**:
1. **Review Service Layer**
   - Create `src/services/review.service.js`
   - Review creation logic
   - Rating aggregation
   - Review validation

2. **Review Controllers**
   - POST `/api/bookings/:id/review` - Submit review
   - GET `/api/rentals/:id/reviews` - Rental reviews
   - GET `/api/users/:id/reviews` - User reviews

3. **Review Rules**
   - Only after booking completed
   - One review per booking
   - Both guest and host can review
   - Rating 1-5 stars required
   - Comment optional

4. **Rating Aggregation**
   - Calculate average rating for rentals
   - Calculate average rating for users
   - Display review count
   - Sort by rating

**Deliverables**:
- Bidirectional review system
- Rating aggregation
- Review display on profiles/listings

**Estimated Time**: 3-4 days

**Success Criteria**:
- Users can leave reviews after stays
- Ratings displayed accurately
- Reviews build trust in platform

---

### Phase 8: Payment Integration (FUTURE)

**Goal**: Enable secure payments via Stripe

**Tasks**:
1. Stripe account setup
2. Payment intent creation
3. Security deposit handling
4. Refund logic
5. Host payout system
6. Payment webhook handling

**Estimated Time**: 7-10 days

---

### Phase 9: Communication (FUTURE)

**Goal**: Email notifications and in-app messaging

**Tasks**:
1. Email service setup (Mailgun/self-hosted)
2. Booking confirmation emails
3. Reminder emails
4. Host notification emails
5. In-app messaging system

**Estimated Time**: 5-7 days

---

### Phase 10: Testing & Polish (FUTURE)

**Goal**: Production-ready quality

**Tasks**:
1. Unit tests for all services
2. Integration tests for API endpoints
3. End-to-end tests
4. Performance optimization
5. Security audit
6. API documentation (Swagger/OpenAPI)

**Estimated Time**: 10-14 days

---

## 🤔 Technical Decisions & Rationale

### Why PostgreSQL?

**Decision**: Use PostgreSQL for primary data storage

**Rationale**:
- ✅ Relational data (users, rentals, bookings) fits well
- ✅ ACID compliance for booking transactions
- ✅ Excellent performance for complex queries
- ✅ JSON support for flexible fields (amenities, images)
- ✅ Strong ecosystem and tooling
- ✅ Free and open-source

**Alternatives Considered**:
- MongoDB: Too flexible, harder to maintain data integrity
- MySQL: PostgreSQL has better JSON support and features

---

### Why Prisma ORM?

**Decision**: Use Prisma as the ORM

**Rationale**:
- ✅ Type-safe database access (TypeScript-friendly)
- ✅ Excellent migration system
- ✅ Auto-generated client
- ✅ Great developer experience
- ✅ Built-in connection pooling
- ✅ Supports PostgreSQL features well

**Alternatives Considered**:
- Sequelize: Older, less type-safe
- TypeORM: More complex, steeper learning curve

---

### Why Firebase Authentication?

**Decision**: Use Firebase Authentication instead of custom JWT

**Rationale**:
- ✅ Industry-standard security
- ✅ Email verification built-in
- ✅ Password reset flows included
- ✅ MFA ready for future
- ✅ Less code to maintain
- ✅ Better security practices
- ✅ Social login options available
- ✅ Free tier generous

**Alternatives Considered**:
- Custom JWT + bcrypt: More code, more security responsibility
- Auth0: More expensive, similar features
- AWS Cognito: More complex setup

---

### Why Firebase Storage?

**Decision**: Use Firebase Storage for images

**Rationale**:
- ✅ Cheaper than AWS S3 for small scale
- ✅ Integrates with Firebase Auth
- ✅ Simple SDK
- ✅ CDN included
- ✅ Free tier sufficient for MVP

**Alternatives Considered**:
- AWS S3: More expensive, more complex
- Local file storage: Not scalable, backup issues

---

### Why Express.js (CommonJS)?

**Decision**: Use Express.js with CommonJS modules

**Rationale**:
- ✅ Most popular Node.js framework
- ✅ Mature ecosystem
- ✅ Simple and flexible
- ✅ CommonJS for compatibility
- ✅ Easy to understand and maintain

**Alternatives Considered**:
- Fastify: Faster but less ecosystem
- NestJS: Too opinionated, steeper learning curve
- ES Modules: Compatibility issues with some packages

---

### Why Minimal Service Fees?

**Decision**: Minimal or no service fees on bookings

**Rationale**:
- ✅ Non-exploitative business model
- ✅ Competitive advantage
- ✅ Builds trust with users
- ✅ Explore alternative revenue (premium features, ads, partnerships)

**Alternatives Considered**:
- Percentage fees (like Airbnb): Feels parasitic
- Subscription model: May limit growth

---

## ✅ Success Criteria

### Phase 3 Success
- [ ] Firebase Admin SDK integrated and working
- [ ] Users can register and login via Firebase
- [ ] Protected routes verify Firebase tokens
- [ ] User data syncs to PostgreSQL
- [ ] Images can upload to Firebase Storage

### Phase 4 Success
- [ ] Users can view and edit profiles
- [ ] Role-based access control working
- [ ] Only hosts can create rentals
- [ ] Input validation on all endpoints

### Phase 5 Success
- [ ] Hosts can create listings with images
- [ ] Guests can search and filter rentals
- [ ] Images load from Firebase Storage
- [ ] Admin can approve listings

### Phase 6 Success
- [ ] Guests can request bookings
- [ ] Hosts can approve/decline bookings
- [ ] No double-booking possible
- [ ] Pricing calculated correctly
- [ ] Cancellation logic works

### Phase 7 Success
- [ ] Reviews submitted after completed stays
- [ ] Ratings displayed on profiles/listings
- [ ] Review aggregation accurate

### MVP Success (All Phases 3-7)
- [ ] Complete user registration and authentication
- [ ] Hosts can list properties with images
- [ ] Guests can search and book rentals
- [ ] Host approval workflow functional
- [ ] Reviews build trust
- [ ] API documented
- [ ] Deployed and accessible publicly

---

## ⚠️ Risk & Mitigation

### Technical Risks

**Risk**: Firebase costs escalate with scale  
**Mitigation**: Monitor usage, set billing alerts, have migration plan to self-hosted auth

**Risk**: Database performance issues at scale  
**Mitigation**: Proper indexing, query optimization, connection pooling, caching layer

**Risk**: Image storage costs  
**Mitigation**: Image compression, size limits, CDN caching, monitor usage

**Risk**: Security vulnerabilities  
**Mitigation**: Regular security audits, dependency updates, input validation, rate limiting

### Business Risks

**Risk**: Low user adoption  
**Mitigation**: Focus on niche market, build trust, word-of-mouth marketing

**Risk**: Legal/compliance issues  
**Mitigation**: Clear terms of service, age verification, legal review, privacy policy

**Risk**: Content moderation challenges  
**Mitigation**: Admin approval workflow, reporting system, clear guidelines

### Operational Risks

**Risk**: Server downtime  
**Mitigation**: PM2 auto-restart, monitoring, backup server, database backups

**Risk**: Data loss  
**Mitigation**: Regular PostgreSQL backups, Firebase automatic backups

**Risk**: Scaling challenges  
**Mitigation**: Horizontal scaling plan, load balancing, database replication

---

## 📊 Metrics & KPIs

### Development Metrics
- Code coverage (target: 80%+)
- API response time (target: <200ms)
- Error rate (target: <1%)
- Deployment frequency (target: weekly)

### Business Metrics (Future)
- User registrations
- Active listings
- Booking conversion rate
- Average booking value
- User retention rate
- Review completion rate

---

## 🎓 Onboarding New Developers

### Required Reading
1. This roadmap document
2. [README.md](./README.md) - Setup and architecture
3. [implementation_plan.md](./docs/implementation_plan.md) - Technical details
4. [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration

### Setup Checklist
- [ ] Read all documentation
- [ ] Clone repository
- [ ] Set up local PostgreSQL
- [ ] Create Firebase project
- [ ] Configure `.env` file
- [ ] Run migrations
- [ ] Seed database
- [ ] Test `/health` endpoint
- [ ] Review Prisma schema
- [ ] Understand project structure

### Key Concepts to Understand
- Firebase Authentication flow
- Prisma ORM usage
- Express middleware pattern
- Role-based access control
- Booking workflow and status transitions
- Review system rules

---

## 📞 Contact & Support

**Project Lead**: [Your Name]  
**Repository**: https://github.com/mattcallaway/Velvet_Key  
**Server**: 172.233.140.74  

---

**This roadmap is a living document. Update it as the project evolves.**
