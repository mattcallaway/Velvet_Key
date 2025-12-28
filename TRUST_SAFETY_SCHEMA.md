# TRUST_SAFETY_SCHEMA.md

> **"Trust & Safety is First-Class Infrastructure"**

This schema defines the models required to implement Blocking, Reporting, and Moderation. These models must be added to `prisma/schema.prisma`.

## 1. User Blocking
**Goal**: Fail closed. If A blocks B, neither exists to the other.

```prisma
model UserBlock {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())

  blockerId String
  blockedId String

  blocker   User @relation("UserBlocker", fields: [blockerId], references: [id])
  blocked   User @relation("UserBlocked", fields: [blockedId], references: [id])

  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}
```

## 2. Content Reporting
**Goal**: Immediate mitigation + Admin Queue.

```prisma
model Report {
  id        String       @id @default(uuid())
  createdAt DateTime     @default(now())
  
  reporterId String
  reporter   User        @relation("Reporter", fields: [reporterId], references: [id])
  
  // Targets (One must be set)
  reportedUserId String?
  reportedUser   User?   @relation("ReportedUser", fields: [reportedUserId], references: [id])
  
  rentalId       String?
  rental         Rental? @relation(fields: [rentalId], references: [id])
  
  // Content
  reason         ReportReason
  details        String?      // User description
  
  // Triage
  status         ReportStatus @default(PENDING)
  notes          String?      // Admin notes
  resolvedAt     DateTime?
  resolvedBy     String?      // Admin ID (Future)
  
  @@index([status])
  @@index([reporterId])
}

enum ReportReason {
  SPAM
  INAPPROPRIATE_CONTENT
  HARASSMENT
  SCAM
  OFF_PLATFORM_PAYMENT
  OTHER
}

enum ReportStatus {
  PENDING
  INVESTIGATING
  RESOLVED
  DISMISSED
}
```

## 3. Moderation Actions (Audit Log)
**Goal**: Accountability for Admin actions.

```prisma
model ModerationLog {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  
  adminId   String
  action    ModAction
  
  targetId  String   // UserID, RentalID, etc.
  targetType String  // "USER", "RENTAL"
  
  reason    String
  metadata  Json?    // Snapshot of previous state if needed
}

enum ModAction {
  BAN_USER
  SUSPEND_USER
  HIDE_RENTAL
  DELETE_CONTENT
  RESOLVE_REPORT
}
```

## 4. Required Schema Updates (User Model)
The `User` model must be updated to support these relations:

```prisma
model User {
  // ... existing fields ...
  
  // Trust & Safety
  blocksInitiated UserBlock[] @relation("UserBlocker")
  blocksReceived  UserBlock[] @relation("UserBlocked")
  
  reportsFiled    Report[]    @relation("Reporter")
  reportsReceived Report[]    @relation("ReportedUser")
}
```
