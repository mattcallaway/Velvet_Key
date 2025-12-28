# THREAT_MODEL.md

> **"Assume the worst. Make harm structurally impossible."**

This document explicitly models the threats facing Velvet Key and the mitigations required to operate safely.

## 1. Threat Scenarios (The Parade of Horribles)

### A. The "Vengeful Ex" (Doxxing & Stalking)
*   **Scenario**: A malicious user joins to find their ex-partner, screenshots their profile/kinks, and publishes it to destroy their reputation/career.
*   **Mitigation**:
    *   **No Public Indexing**: Profiles are not indexed by search engines.
    *   **Block Visibility**: Blocked users cannot see *anything* about the blocker (Fail Closed).
    *   **Screenshot Prevention**: Mobile app prevents screenshots in sensitive views (messages, profiles) (Android `FLAG_SECURE`, iOS equivalent). *Tech Debt: Not yet implemented.*
    *   **Identity Hiding**: Screen names are used by default; Legal names only visible after confirmed Booking.

### B. The "Honey Trap" (Physical Harm)
*   **Scenario**: A fake "Host" lists a venue to lure vulnerable people into an unsafe physical situation.
*   **Mitigation**:
    *   **Identity Verification**: Hosts MUST be ID verified (Phase 4).
    *   **Address Fuzzing**: Exact addresses are NEVER shown until Booking is Confirmed.
    *   **Emergency Mode**: In-app "SOS" button for guests (Future).

### C. The "Leaky Admin" (Insider Threat)
*   **Scenario**: A support agent uses their access to browse user profiles for curiosity or blackmail.
*   **Mitigation**:
    *   **Audit Logging**: Every admin read of PII is logged to an immutable audit trail (Firestore).
    *   **Scope Limits**: Admins cannot decrypt Chat Messages.
    *   **Just-in-Time Access**: Admin access requires specific ticket context (Future).

### D. The "Data Dump" (Database Breach)
*   **Scenario**: An attacker dumps the SQL database.
*   **Mitigation**:
    *   **Data Minimization**: We do not store credit card numbers (Stripe only).
    *   **Retention Policy**: Chat messages are deleted after X days (TBD).
    *   **Hashing**: Passwords managed by Firebase (not us).

### E. The "Extortionist" (Chat Blackmail)
*   **Scenario**: A user solicits sensitive photos in chat, then threatens to release them.
*   **Mitigation**:
    *   **Report & Nuke**: Reporting a user soft-hides all shared content immediately.
    *   **Content Scanning**: Automated scanning for sensitive keywords in chat (Future).
    *   **Terms**: Explicit legal waiver agreeing that blackmail results in immediate ban + law enforcement cooperation.

## 2. Accepted Risks (With Rationale)

*   **Risk**: Users can still photograph another phone's screen.
    *   **Rationale**: Physically impossible to prevent. Mitigated by vetting and trust systems.
*   **Risk**: Metadata (IP logs) existing in cloud provider (Linode/Google).
    *   **Rationale**: Operational necessity. Mitigated by strict retention (30 days) and access controls.
