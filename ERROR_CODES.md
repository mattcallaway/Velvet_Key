# ERROR_CODES.md

> **"No Leaking Internal Details"**

All API errors must return a stable `code` from this list. Do not invent new codes without updating this document.

## 1. Authentication & Authorization
| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid token. |
| `AUTH_EXPIRED` | 401 | Token expired. |
| `ACCESS_DENIED` | 403 | User does not have permission (Role/Ownership). |
| `ACCOUNT_SUSPENDED` | 403 | User is banned or suspended. |

## 2. Resource Access
| Code | HTTP | Description |
|------|------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Record does not exist (or is hidden/blocked). |
| `RESOURCE_GONE` | 410 | Record permanently deleted. |
| `DUPLICATE_RESOURCE` | 409 | Record already exists (e.g. Email overlap). |

## 3. Input Validation
| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_FAILED` | 400 | General schema failure. |
| `INVALID_FORMAT` | 400 | Bad email, uuid, or date format. |
| `MISSING_FIELD` | 400 | Required field is null. |
| `PAYLOAD_TOO_LARGE` | 413 | Upload size exceeded. |

## 4. Business Logic
| Code | HTTP | Description |
|------|------|-------------|
| `ACTION_NOT_ALLOWED` | 400 | State transition invalid (e.g. Cancelling a completed booking). |
| `INSUFFICIENT_FUNDS` | 402 | Payment failure (Placeholder). |
| `RATE_LIMIT_EXCEEDED`| 429 | Too many requests. |
| `SERVICE_UNAVAILABLE`| 503 | External dependency down (Firebase/Database). |

## 5. System
| Code | HTTP | Description |
|------|------|-------------|
| `INTERNAL_ERROR` | 500 | Unhandled exception (Generic). |
| `NOT_IMPLEMENTED` | 501 | Feature disabled or missing. |

## 6. Anti-Leakage Rules
*   **NEVER** return `DB_CONNECTION_FAILED` to client. Use `SERVICE_UNAVAILABLE`.
*   **NEVER** return raw SQL errors. Use `INTERNAL_ERROR`.
*   **NEVER** differentiate between "Email not found" and "Wrong password" for login. Use `AUTH_FAILED`.
