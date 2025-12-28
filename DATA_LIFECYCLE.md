# DATA_LIFECYCLE.md

> **"Data Minimization is Law"**

This document acts as the "Table of Truth" for every piece of data stored in Velvet Key. If a field is not listed here with a justification, it must be deleted.

## 1. Classification Levels
*   **[CP] Critical PII**: Identity data (Name, Phone, Email). Highest risk.
*   **[SC] Sensitive Context**: Data revealing lifestyle/preferences (Rentals, Bookings, Messages). High risk.
*   **[OP] Operational**: Timestamps, IDs, Status flags. Low risk.
*   **[EP] Ephemeral**: Logs, caches. Must auto-expire.

## 2. Field-by-Field Map (PostgreSQL)

### Model: `User`
| Field | Level | Justification | Retention | Deletion |
|-------|-------|---------------|-----------|----------|
| `id` | [OP] | Primary Key | Permanent | Hard Delete |
| `firebaseUid` | [OP] | Auth Link | Permanent | Hard Delete |
| `email` | [CP] | Communication/Login | Permanent | Hard Delete |
| `dateOfBirth` | [CP] | 21+ Verification | Permanent | Hard Delete |
| `firstName` | [CP] | Identity Checks | Permanent | Hard Delete |
| `lastName` | [CP] | Identity Checks | Permanent | Hard Delete |
| `phoneNumber` | [CP] | 2FA/Urgent Contact | Permanent | Hard Delete |
| `location` | [SC] | Search Preference | Permanent | Hard Delete |
| `bio` | [SC] | User Profile | Permanent | Hard Delete |
| `relationshipStatus`| [SC] | Match Context | Permanent | Hard Delete |
| `genderIdentity` | [SC] | Match Context | Permanent | Hard Delete |
| `identityProvider` | [OP] | Verification Source | Permanent | Hard Delete |

### Model: `Rental`
| Field | Level | Justification | Retention | Deletion |
|-------|-------|---------------|-----------|----------|
| `addressLine1` | [CP] | Physical Location | Permanent | Hard Delete |
| `latitude/longitude`| [CP] | Map Pin | Permanent | Hard Delete (Fuzzified on Frontend) |
| `images` | [SC] | Visuals | Permanent | Manual Delete (Sync with Storage) |
| `amenities` | [SC] | Search Filters | Permanent | Hard Delete |

### Model: `Message`
| Field | Level | Justification | Retention | Deletion |
|-------|-------|---------------|-----------|----------|
| `content` | [SC] | Communication | **1 Year** (TBD) | Hard Delete |
| `attachments` | [SC] | Media Sharing | **1 Year** (TBD) | Hard Delete + File Wipe |

### Model: `Booking`
| Field | Level | Justification | Retention | Deletion |
|-------|-------|---------------|-----------|----------|
| `checkIn/Out` | [SC] | Scheduling | 7 Years (Tax) | Anonymize after 7 years |
| `totalPrice` | [OP] | Financials | 7 Years (Tax) | Keep Anonymized |

## 3. Data Deletion Protocol ("The Kill Switch")

When a user requests deletion (or is banned):
1.  **Postgres**: Delete `User` record (Cascades to Rentals, Messages, Active Bookings).
    *   *Constraint*: Completed Bookings must be kept for Tax/Legal reasons? -> **Action**: Anonymize `guestId` in Bookings instead of deleting?
2.  **Firebase Auth**: Delete `User` from Firebase Authentication.
3.  **Firebase Storage**: List and delete all files in `users/{userId}/*` and `rentals/{hostId}/*`.
4.  **Firestore**: Mark Audit Logs as `user_deleted`.
5.  **Backup**: User remains in backups for 30 days (Rotation policy).

## 4. Log Reduction Policy
*   **NEVER Log**:
    *   Passwords (obviously)
    *   Tokens (JWT)
    *   Message Content
    *   Full User Objects
*   **REDACTION**: All logs passing through `winston` must run through a scrubber that replaces Email/Phone with `[REDACTED]`.
