# Velvet Key API Contract v0.4.0

This document defines the shared contract between the **Velvet Key API** (Server) and the **Velvet Key Mobile App** (Client). All changes to endpoints or schemas must be updated here first.

**Last Updated**: 2025-12-24
**Status**: Dev-Complete (Option B Search Active)

---

## 1. Environments

| Name | Base URL | Status |
|------|----------|--------|
| **Local** | `http://localhost:4000` | Active |
| **Dev (Linode)** | `http://172.233.140.74:4000` | Active (Firewall Restricted) |

---

## 2. Authentication

- **Method**: Bearer Authentication
- **Header**: `Authorization: Bearer <ID_TOKEN>`
- **Token**: Firebase ID Token (JWT).
- **Behavior**:
  - Unauthenticated requests to protected routes return `401 Unauthorized`.
  - The server verifies the token with Firebase Admin SDK and hydrates the PostgreSQL user.

---

## 3. Endpoints Table

### Authentication
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Private | Create DB user after Firebase signup. |
| POST | `/api/auth/login` | Private | Sync user data on login. |
| GET | `/api/auth/me` | Private | Get current profile + database ID. |

### Amenities & Search
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/amenities/catalog` | Public | Get dynamic amenity definitions. |
| GET | `/api/rentals` | Public | Search listings with filters. |

### Rentals & Bookings
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/rentals/:id` | Public | Get listing details. |
| POST | `/api/rentals` | Host | Create new listing. |
| POST | `/api/rentals/:id/images` | Host | Upload images (Multi-part). |
| POST | `/api/bookings` | Guest | Request a booking. |
| PATCH | `/api/bookings/:id/status` | Owner | Confirm/Decline/Cancel booking. |

### Activity
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/host/activity` | Host | Host-specific audit trail. |

### Messaging
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/messages/conversations` | Private | List all conversations. |
| GET | `/api/messages/conversations/:id` | Private | Get messages in a thread. |
| POST | `/api/messages/send` | Private | Send a message (Auto-create thread). |

---

## 4. Payload Schemas

### Registration Request
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "role": "HOST",
  "phoneNumber": "+1234567890"
}
```

### Search Response (Standard List)
```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "uuid",
        "title": "Luxury Loft",
        "pricePerNight": 150,
        "amenities": { "wifi": true, "pool": false }
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 100 }
  }
}
```

---

## 5. Error Format
All errors follow this structure:
```json
{
  "success": false,
  "error": "Error identifier string",
  "message": "Human readable hint"
}
```

---

## 6. Search & Amenities Schema

### Hybrid Search Logic (Option B)
When searching by amenities, the client **MUST** stringify the amenity object in the query parameter.

**Format**: `GET /api/rentals?amenities={"key": value}`

- **Boolean Filters**: `{ "wifi": true }` (Filter for listings that have WiFi).
- **Numeric Filters**: `{ "bed_count": 2 }` (Filter for listings with >= 2 beds).

### Mismatch Awareness:
- **CURRENT SERVER**: Expects `amenities` as a JSON string in query params.
- **CURRENT CLIENT**: May be sending as multiple query keys (e.g., `?wifi=true`).
- **REQUIRED CHANGE**: Client must use `JSON.stringify()` for the `amenities` key.

---

## 7. Version History
- **v0.4.0**: Added Hybrid Search contract and standardized Error/Success utility responses.
- **v0.3.0**: Integrated Host Audit Logging and Firebase Auth middleware.
