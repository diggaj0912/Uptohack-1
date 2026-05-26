# Core Platform Security & Authentication Architecture Blueprint
### Document ID: NXST-SEC-ARCH-2026-v1.0.0
### Scope: Unified Enterprise-Grade Multi-Role Security & Threat Protection Model
### Role: Chief Information Security Officer (CISO) & Principal Security Architect

---

## SECTION 1: SYSTEM SECURITY TOPOLOGY & IDENTITY MODEL

This blueprint maps the unified authentication layer designed for the **NexStart Platform**. It secures operations across 7 administrative and user-facing roles: **Student, Organizer, Recruiter, Sponsor, Judge, Mentor, and Admin**. The topology enforces cryptographic isolation at all layers of the full-stack system.

```
       [ Client Ingress: Web / Mobile ]
                     |
         [ Cloudflare WAF Firewalls ] -> Bot Protection Network, DDoS Rate limits
                     |
         [ Next.js Edge Auth Middleware ] -> JWT Session Decryption, CSRF Token Audit
                     |
         +-----------+-----------+
         |                       |
         v                       v
 [ Secure GraphQL / API ] [ Redis Session Cache ]
         |               - Device / Token Fingerprints
         |               - Slidings Limit Buckets (MFA / Login rate)
         +-----------+-----------+
                     |
                     v
       [ PostgreSQL Primary DB ] (AES-256 Row-Level columnar Encryption)
```

---

## SECTION 2: THE 10 CRITICAL IDENTITY & AUTH SECURITY MODULES

### MODULE 1: Cryptographic Persona & Role Isolation (RBAC Schema)
NexStart enforces a deterministic **Role-Based Access Control (RBAC)** architecture. No user can escalate roles unless authenticated by cryptographic token workflows.

```prisma
// Prisma Schema Isolation Definitions
enum UserRole {
  STUDENT
  ORGANIZER
  RECRUITER
  SPONSOR
  JUDGE
  MENTOR
  ADMIN
}

model UserSecret {
  id             String    @id @default(uuid()) @db.Uuid
  userId         String    @unique @db.Uuid
  passwordHash   String    @db.VarChar(255) // Argon2id high-grade hash string
  jwtSalt        String    @db.VarChar(128) // Unique salt to invalidate individual sessions
  mfaSecret      String?   @db.VarChar(255) // Encrypted TOTP secret
  isMfaEnabled   Boolean   @default(false)
  updatedAt      DateTime  @updatedAt @db.Timestamptz(6)

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

-   **Student Role Rules:** Read events, submit code solutions, schedule mentor bookings. Blocked from viewing other resumes or altering global challenge tracks.
-   **Judge Role Rules:** Query assigned submissions, write grade metrics. Zero write access to event metadata or payment processing.
-   **Admin Role Rules:** Full system config write capabilities, bypass limits on fraud audits, execute user credentials overrides. Locked behind Multi-Factor physical token validation.

---

### MODULE 2: Enterprise SSO & OAuth Hook Integration
SSO transitions natively between identity profiles (e.g. Google Workspace, GitHub Enterprise) while maintaining underlying platform invariants.

```
+---------------+     OAuth Authorize Redirect     +------------------+
| User Browser  | ------------------------------> | Google Identity  |
+---------------+                                 +------------------+
        ^                                                   |
        | Callback redirect with Authorization Code         |
        +---------------------------------------------------+
                               |
                               v
                       +---------------+
                       |  Next.js Edge |
                       +---------------+
                               |
                               v
         Exchange code for ID Token; Validate Signature (OIDC)
                               |
                               v
         Database check: If new user, force Step-Up onboarding
```

-   **Audit Verification:** User profiles unified through sub-claims mapped in PostgreSQL.
-   **OAuth Signature Audits:** OAuth profile changes trigger instantaneous transactional warnings to user primary mail accounts.

---

### MODULE 3: Edge-Based Session State & Session Management
All sessions are indexed dynamically using Redis token bucket keys to reduce query stress on PostgreSQL primary instances during peaks.

```typescript
// Next.js 15 Edge Runtime Session Verification Middleware
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("__Secure-Nexus-Session")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  const csrfCookie = req.cookies.get("__Host-Nexus-CSRF")?.value;

  // 1. Double-Submit CSRF Verification Hook
  if (req.method !== "GET" && (!csrfHeader || csrfHeader !== csrfCookie)) {
    return new NextResponse(JSON.stringify({ error: "CSRF token mismatch detected." }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // 2. Cryptographic signature check on Edge Runtime
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "nexus.io",
      audience: "nexus-app"
    });

    // 3. Inject context labels
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.sub as string);
    requestHeaders.set("x-user-role", payload.role as string);

    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  } catch (err) {
    // Invalidate stale or tempered cookie headers
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("__Secure-Nexus-Session");
    return response;
  }
}
```

---

### MODULE 4: Multi-Factor Authentication (MFA) Protocols
All privileged transitions (e.g., organizer publishing events, recruiter purchasing contact lists, admin configuring credentials) require Time-Based One-Time Password (TOTP) step-up.

```
       [ Privileged Event Initiated ] -------> [ Client prompt: Enter TOTP code ]
                                                               |
                                                               v
                                                      [ Post /api/auth/mfa ]
                                                               |
                                            Validate code with stored UserSecret mfaSecret
                                                               |
                                         +---------------------+---------------------+
                                         |                                           |
                                     (Validated)                                 (Invalid)
                                         |                                           |
                                         v                                           v
                        Generate short-term session token                  Increment rate-limit bucket
```

-   **MFA Grace Limit:** Temporary step-up token remains active for a window of `15 minutes` before invalidating.

---

### MODULE 5: Log-Structured Device Tracking & Session Audits
Every session maps a dynamic hardware snapshot containing the operating system, location hash, IP address, and browser finger-token.

```prisma
model UserSession {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @db.Uuid
  tokenHash    String   @unique @db.VarChar(256) // SHA-256 session token hash
  ipAddress    String   @db.VarChar(45)
  userAgent    String   @db.VarChar(255)
  deviceFinger String   @db.VarChar(128) // Combined device canvas fingerprints
  isValid      Boolean  @default(true)
  expiresAt    DateTime @db.Timestamptz(6)
  createdAt    DateTime @default(now()) @db.Timestamptz(6)

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_sessions")
}
```

Changes in geography coordinates > 100km inside an hour trigger security flags, immediately terminating active session states.

---

### MODULE 6: Token Bucket Rate Limiting Architecture
To neutralize credential stuffing and API exhaust exhaustion, rate limits are managed in memory at Edge-nodes via Redis sorted sets.

```typescript
// Rate limiter sliding-window structure
export async function checkRateLimit(ip: string, action: string, maxLimit = 10, windowSecs = 60) {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const redisKey = `rate:${action}:${ip}`;

  const transaction = redis.multi();
  // Clear old expired executions
  transaction.zremrangebyscore(redisKey, 0, currentTimestamp - windowSecs);
  // Fetch current score elements
  transaction.zcard(redisKey);
  // Add current execution
  transaction.zadd(redisKey, currentTimestamp, `${currentTimestamp}:${Math.random()}`);
  // Set expiry window boundary
  transaction.expire(redisKey, windowSecs);

  const [_, cardResult] = await transaction.exec();
  const requestCount = cardResult[1] as number;

  return requestCount <= maxLimit;
}
```

---

### MODULE 7: End-to-End Cryptographical Data Transit & Row Level Encryption
To conform with international healthcare and financial parameters (HIPAA/PCI-DSS), highly classified columns (such as billing identification numbers, phone records, or internal CV parameters) are stored encrypted.

-   **Cipher Choice:** AES-256-GCM symmetric algorithm.
-   **Security Secret Key Isolation:** Encrypting keys cached securely via Hardware Security Modules (HSMs) or AWS Secret Vaults, fully isolated from runtime containers.

---

### MODULE 8: Bot Protection & Automated Spam Defense
Public access boundaries (e.g., signup pages, challenge comments, public community post creation) verify legitimacy using cryptographic challenges.

-   **Challenge Vector:** Google reCAPTCHA v3 or Cloudflare Turnstile integrated directly on client and API layers.
-   **Execution Verification Rule:** API will fail with `HTTP 400 Bad Request` if payload validation checks fail Turnstile cryptographic signature tokens.

---

### MODULE 9: Secure Client-Side Action & CSRF Guardrails
React Server Actions and APIs enforce strict CSRF protection and payload sanitation:

-   **Anti-XSS Sanitation:** Filter all incoming rich markdown data against explicit strict sanitizer scripts before database writes.
-   **Explicit Cookie Parameters:** Session cookie attributes enforce highly defensive properties to block network-level interception:
    ```
    __Secure-Nexus-Session=token; Secure; HttpOnly; SameSite=Strict; Domain=nexus.io; Path=/; Max-Age=2592000
    ```

---

### MODULE 10: Highly Scalable Security Auditing System
A robust audit log is populated on all privileged writes. These records are write-once and can never be updated or deleted.

```prisma
model SecurityAuditLog {
  id             String   @id @default(uuid()) @db.Uuid
  actorUserId    String?  @db.Uuid
  actionType     String   @db.VarChar(64) // e.g. "AUTH_MFA_SUCCEEDED", "USER_ROLE_OVERRIDE"
  targetUserId   String?  @db.Uuid
  impactSeverity String   @db.VarChar(16) // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  ipAddress      String   @db.VarChar(45)
  auditPayload   Json     // Houses complete pre-change and post-change variables
  createdAt      DateTime @default(now()) @db.Timestamptz(6)

  @@index([actionType])
  @@index([createdAt])
  @@map("security_audit_logs")
}
```

---

## SECTION 3: DEPLOYMENT THREAT TAXONOMY REFERENCE

To protect production nodes against automated attack patterns, NexStart deploys deep defense configurations:

```
[ Attack Category ] --------> [ Mitigation Strategy Hook ]
1. XSS Attacks     --------> Content Security Policy (CSP) blocking external script injections
2. Brute Force     --------> Sliding-window Redis login locks with captcha escalation
3. MitM Sniffing   --------> HTTP Strict Transport Security (HSTS) with SSL pinning
4. SQL Injection   --------> Parameterized database queries enforced by Prisma engine
```

---
**Approved & Signed:**
**Chief Information Security Officer & Core Security Architect**
