# Velvet Key - Privacy-Focused Rental Marketplace API

A production-grade REST API for an adult-only, privacy-focused rental marketplace platform. Built with Node.js, Express, PostgreSQL, and Firebase.

---

## 🎯 Project Overview

Velvet Key is a rental marketplace platform (similar to Airbnb/VRBO) focused on privacy-sensitive, adult-only lifestyle events. The platform facilitates property rentals with an emphasis on:

- **Privacy**: User data protection and discretion
- **Trust & Safety**: Identity verification and review systems
- **Non-Exploitative Model**: Minimal or no service fees, finding alternative revenue streams
- **Legal Clarity**: Clear terms and age verification

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
| **Image Storage** | Firebase Storage | Rental property images |
| **Validation** | express-validator | Request validation |
| **Process Manager** | PM2 | Production process management |
| **Reverse Proxy** | Nginx | HTTP proxy on port 80 → 4000 |

### Why Firebase?

We chose Firebase Authentication and Storage for:
- ✅ **Security**: Industry-standard auth with built-in best practices
- ✅ **Features**: Email verification, password resets, MFA ready
- ✅ **Simplicity**: Less code to write and maintain
- ✅ **Scalability**: Handles auth scaling automatically
- ✅ **Cost**: Free tier generous, storage cheaper than AWS S3

---

## 📊 Database Schema

### Core Models

#### **User**
Stores user profile information. Authentication handled by Firebase.

```
- id (UUID, primary key)
- firebaseUid (string, unique) - Links to Firebase Auth
- email (string, unique)
- role (GUEST | HOST | ADMIN)
- firstName, lastName
- dateOfBirth
- phoneNumber (optional)
- bio (optional)
- profileImageUrl (optional)
- Verification flags (email, phone, identity)
- Timestamps (createdAt, updatedAt, lastLoginAt)
```

#### **Rental**
Property listings created by hosts.

```
- id (UUID, primary key)
- hostId (foreign key → User)
- title, description
- propertyType (HOUSE | APARTMENT | CONDO | VILLA | CABIN | ESTATE | OTHER)
- Location (address, city, state, zipCode, country, lat/long)
- Capacity (maxGuests, bedrooms, bathrooms, minimumAge)
- Pricing (pricePerNight, cleaningFee, securityDeposit)
- amenities (JSON array)
- houseRules (JSON array)
- images (JSON array of Firebase Storage URLs)
- Status flags (isActive, isApproved)
- Timestamps
```

#### **Booking**
Reservation requests and confirmed bookings.

```
- id (UUID, primary key)
- rentalId (foreign key → Rental)
- guestId (foreign key → User)
- checkInDate, checkOutDate
- numberOfGuests
- Pricing snapshot (captured at booking time)
- status (PENDING | CONFIRMED | CANCELLED | COMPLETED | DECLINED)
- guestMessage (optional)
- Cancellation info (cancelledAt, cancellationReason)
- Timestamps
```

#### **Review**
Bidirectional reviews (guest ↔ host).

```
- id (UUID, primary key)
- bookingId (foreign key → Booking, unique)
- rentalId (foreign key → Rental)
- authorId (foreign key → User)
- subjectId (foreign key → User)
- rating (1-5 stars)
- comment (optional)
- reviewType (GUEST_TO_HOST | HOST_TO_GUEST)
- Timestamps
```

---

## 🚀 Deployment

### Infrastructure

- **Server**: Linode Ubuntu server (172.233.140.74)
- **SSH Access**: `ssh root@172.233.140.74`
- **Firewall**: UFW (ports 22, 80, 443 open)
- **Public API**: http://172.233.140.74/health

### Deployment Workflow

```
Local Development → Git Commit → GitHub Push → 
Linode Git Pull → npm install → PM2 Restart
```

---

## 📁 Project Structure

```
velvet-key-api/
├── server.js                 # Entry point (boots server)
├── src/
│   ├── app.js               # Express app configuration
│   ├── config/
│   │   ├── database.js      # Prisma client singleton
│   │   ├── firebase.js      # Firebase Admin SDK config
│   │   └── upload.js        # Firebase Storage config
│   ├── middleware/
│   │   ├── auth.middleware.js       # Firebase token verification
│   │   ├── role.middleware.js       # Role-based access control
│   │   ├── validation.middleware.js # Request validation
│   │   └── error.middleware.js      # Global error handler
│   ├── routes/
│   │   ├── index.js         # Route aggregator
│   │   ├── health.routes.js # Health check
│   │   ├── auth.routes.js   # Firebase auth integration
│   │   ├── users.routes.js  # User profile management
│   │   ├── rentals.routes.js # Rental CRUD
│   │   └── bookings.routes.js # Booking management
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── rentals.controller.js
│   │   └── bookings.controller.js
│   ├── services/
│   │   ├── auth.service.js      # Firebase auth logic
│   │   ├── user.service.js      # User business logic
│   │   ├── rental.service.js    # Rental business logic
│   │   └── booking.service.js   # Booking business logic
│   └── utils/
│       ├── firebase.util.js     # Firebase helper functions
│       └── response.util.js     # Standardized API responses
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration history
│   └── seed.js             # Development seed data
├── .env                     # Environment variables (not in git)
├── .env.example            # Template for .env
├── package.json
└── README.md               # This file
```

---

## 🔧 Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Firebase project with Authentication and Storage enabled
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mattcallaway/Velvet_Key.git
   cd Velvet_Key
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firebase Authentication (Email/Password)
   - Enable Firebase Storage
   - Download service account key JSON
   - Add Firebase config to `.env`

5. **Set up PostgreSQL**
   - Install PostgreSQL locally
   - Create database: `createdb velvet_key_db`
   - Update `DATABASE_URL` in `.env`

6. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

7. **Seed database (optional)**
   ```bash
   npm run prisma:seed
   ```

8. **Start development server**
   ```bash
   npm run dev
   ```

### Production Deployment (Linode)

1. **SSH into server**
   ```bash
   ssh root@172.233.140.74
   ```

2. **Navigate to project**
   ```bash
   cd /root/Velvet_Key
   ```

3. **Pull latest code**
   ```bash
   git pull origin main
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Update .env file**
   ```bash
   nano .env
   # Add production values
   ```

6. **Run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

7. **Restart with PM2**
   ```bash
   pm2 restart all
   # or
   pm2 start server.js --name velvet-key-api
   ```

8. **Check status**
   ```bash
   pm2 status
   pm2 logs
   ```

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/velvet_key_db?schema=public"

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://172.233.140.74
```

---

## 📡 API Endpoints

### Health Check
- `GET /health` - API health status

### Authentication (Firebase Integration)
- `POST /api/auth/register` - Create new user (after Firebase signup)
- `POST /api/auth/login` - Sync user data (after Firebase login)
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/:id` - Get user profile (public)
- `PUT /api/users/:id` - Update user profile (authenticated)
- `DELETE /api/users/:id` - Delete user account (authenticated)
- `GET /api/users/:id/reviews` - Get user reviews

### Rentals
- `GET /api/rentals` - Search/list rentals
- `GET /api/rentals/:id` - Get rental details
- `POST /api/rentals` - Create rental (host only)
- `PUT /api/rentals/:id` - Update rental (owner/admin)
- `DELETE /api/rentals/:id` - Delete rental (owner/admin)
- `POST /api/rentals/:id/images` - Upload images (owner/admin)
- `GET /api/rentals/:id/availability` - Check availability

### Bookings
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking request (guest)
- `PUT /api/bookings/:id/confirm` - Confirm booking (host)
- `PUT /api/bookings/:id/decline` - Decline booking (host)
- `PUT /api/bookings/:id/cancel` - Cancel booking (guest/host)
- `POST /api/bookings/:id/review` - Submit review

---

## 🧪 Testing

### Test Credentials (Development Only)

After running `npm run prisma:seed`:

```
Admin:  admin@velvetkey.com / password123
Host:   host@example.com / password123
Guest:  guest@example.com / password123
```

### Manual Testing

```bash
# Health check
curl http://localhost:4000/health

# Get rentals
curl http://localhost:4000/api/rentals

# Create booking (requires auth token)
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rentalId":"...", "checkInDate":"2025-02-14", ...}'
```

---

## 📝 Development Phases

### ✅ Phase 1: Planning & Architecture
- [x] Comprehensive API architecture document
- [x] Database schema and relationships
- [x] Authentication strategy (Firebase)
- [x] API endpoints documentation

### ✅ Phase 2: Database Layer
- [x] PostgreSQL installation and configuration
- [x] Prisma ORM setup
- [x] Database schema implementation
- [x] Migrations
- [x] Seed data

### ✅ Phase 3: Firebase Integration
- [x] Firebase Admin SDK setup
- [x] Firebase Authentication middleware
- [x] User sync with Firebase
- [x] Firebase Storage configuration

### ✅ Phase 4: User Management
- [x] User profile endpoints
- [x] Role-based access control
- [x] Identity verification hooks

### ✅ Phase 5: Rental Listings
- [x] Rental CRUD endpoints
- [x] Image upload to Firebase Storage
- [x] Search and filtering
- [x] Listing validation

### ✅ Phase 6: Booking System
- [x] Booking creation and management
- [x] Availability checking
- [x] Host approval workflow
- [x] Cancellation logic

### 🔄 Phase 7: Reviews & Trust (In Progress)
- [ ] Review endpoints
- [ ] Rating aggregation
- [ ] Verification status tracking

### 📅 Phase 8: Testing & Polish
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance optimization

---

## 🔒 Security Considerations

1. **Authentication**: Firebase handles password hashing, token management
2. **Authorization**: Role-based access control on all endpoints
3. **Input Validation**: All user inputs validated before processing
4. **SQL Injection**: Prisma ORM provides protection
5. **CORS**: Configured allowed origins only
6. **HTTPS**: Nginx reverse proxy (production)
7. **Environment Variables**: Sensitive data never committed to git
8. **Rate Limiting**: To be implemented in future phase

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For technical issues or questions:
- Check the [implementation_plan.md](./docs/implementation_plan.md) for detailed architecture
- Review the [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database configuration
- Contact: [Your contact information]

---

## 🗺️ Roadmap

### Short Term
- Complete Firebase integration
- Implement user and rental endpoints
- Build booking workflow

### Medium Term
- Payment integration (Stripe)
- Email notifications (Mailgun/self-hosted)
- Advanced search and filtering
- Calendar availability system

### Long Term
- Mobile app (React Native)
- Admin dashboard
- Analytics and reporting
- Multi-language support

---

**Last Updated**: December 21, 2025
**Version**: 0.1.0 (Alpha)
**Status**: Active Development
