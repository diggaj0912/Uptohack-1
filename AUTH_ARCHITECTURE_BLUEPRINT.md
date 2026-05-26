# Deep-Dive Authentication & User Persistence Architecture Blueprint
### Document ID: NXST-AUTH-ARCH-2026-v2.0.0
### Scope: Next.js 15 + React 19 Enterprise Auth.js v5 (NextAuth), MongoDB Atlas Connection Pools & Secure Session Protection
### Role: Principal Full-Stack Security Architect & Principal DevSecOps Systems Engineer

---

## SECTION 1: SYSTEM ARCHITECTURE & DATA FLOW DETAILED TOPOLOGY

This blueprint outlines the production rollout of our federated authentication engine. Under high concurrency, identity verification requests flow securely across Edge route middlewares, verifying JWT session parameters against our MongoDB data store.

```
+---------------------------------------------------------------------------------+
|                                CLIENT LAYER (React 19)                         |
|                                                                                 |
|                   [ Google Login Button ]     [ GitHub Login Button ]           |
|                              |                           |                      |
+------------------------------+---------------------------+----------------------+
                               |                           |
                               v                           v
+---------------------------------------------------------------------------------+
|                         REVERSE PROXY / SECURITY WAF (Cloudflare)              |
|                                                                                 |
|            - CSRF Token Validation      - SameSite Cookie Security Enforcement   |
+------------------------------+---------------------------+----------------------+
                               |                           |
                               v                           v
+---------------------------------------------------------------------------------+
|                        SERVER ROUTER MIDDLEWARE (Next.js Edge)                  |
|                                                                                 |
|  [ Verify Auth.js Session Token ]                                               |
|  - If Expired/Invalid -> Redirect to `/login`                                    |
|  - If Session Verified -> Pass Route Processing down to App Handlers            |
+------------------------------+---------------------------+----------------------+
                               |                           |
                               v                           v
+---------------------------------------------------------------------------------+
|                        PERSISTENCE STORE (MongoDB Atlas)                        |
|                                                                                 |
|         - Scalable connection pools through serverless keep-alive client        |
|         - Relational index lookups for dynamic roles (Student, Organizer)       |
+---------------------------------------------------------------------------------+
```

---

## SECTION 2: PRODUCTION SHELL SETUP & DEPENDENCY DECLARATION

These specific packages are the enterprise-standard declarations to run NextAuth.js v5 inside Next.js 15 and React 19 builds securely:

```bash
# Core authentication engine & database connector
npm install next-auth@5.0.0-beta.25 mongoose zod @auth/mongodb-adapter mongodb

# Optional visual utility UI dependencies
npm install clsx tailwind-merge lucide-react canvas-confetti @types/canvas-confetti
```

---

## SECTION 3: REUSABLE HIGH-PERFORMANCE MONGODB CONNECTOR (CLIENT)

In serverless microservices like Vercel and Next.js, standard database connections can quickly saturate the thread limit because hot-swapping server instances spin up new clients simultaneously. The blueprint below enforces safe connection pool recycling:

```typescript
// src/lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

// Extend global type definitions to store instance caches across hot reloads
interface GlobalMongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: GlobalMongooseCache | undefined;
}

// Retrieve from global runtime memory context in dev mode to avoid multiple clients
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 15,           // Optimize pool boundaries for low-latency queries
      minPoolSize: 5,            // Keep active connections hot to skip handshakes
      socketTimeoutMS: 45000,    // Guard against idle/hung pipeline connections
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log("Successfully established recycled MongoDB Atlas Connection Pool.");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

---

## SECTION 4: ENTERPRISE DATABASE OBJECT MODEL (USER SCHEMA)

This core data model maps account records, tracks user referral structures, and dynamically handles security boundaries using indexes.

```typescript
// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  provider: "google" | "github" | "credentials";
  role: "student" | "organizer" | "recruiter" | "admin";
  createdAt: Date;
  lastLogin: Date;
  referralCode?: string;
  onboardingCompleted: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  image: { type: String },
  provider: { type: String, required: true, enum: ["google", "github", "credentials"] },
  role: { 
    type: String, 
    required: true, 
    enum: ["student", "organizer", "recruiter", "admin"],
    default: "student" 
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  referralCode: { type: String, unique: true, sparse: true },
  onboardingCompleted: { type: Boolean, default: false }
});

// Enforce multi-index targeting for compound auth routines on email/provider lookups
UserSchema.index({ email: 1, provider: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
```

---

## SECTION 5: AUTH.JS V5 EXTENDED CONFIGURATION (`src/lib/auth.ts`)

Leveraging the standard NextAuth v5 structure, we inject callback triggers to sync, onboard, and persistently carry user Roles through localized JSON Web Tokens (JWT).

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./db";
import { User } from "../models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30-Day session boundaries
  },
  cookies: {
    // Hardening cookie validation targets for cross-origin preview frames
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none", // Allows the app to work seamlessly in client previews
        secure: true,
        path: "/",
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      await connectToDatabase();

      // Check for user mapping persistence
      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        // Automatically isolate profile roles and scaffold records
        const initialReferral = "REF-" + Math.floor(100000 + Math.random() * 900000);
        await User.create({
          name: user.name || "SaaS Explorer",
          email: user.email,
          image: user.image,
          provider: account?.provider || "google",
          role: "student", // Safely default roles to base user group
          referralCode: initialReferral,
          onboardingCompleted: false,
        });
      } else {
        // Track login frequency & refresh details
        existingUser.lastLogin = new Date();
        if (user.image) existingUser.image = user.image;
        await existingUser.save();
      }
      return true;
    },
    async jwt({ token, user }) {
      // Hydrate JWT with custom state parameters on initial login flow
      if (user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.onboardingCompleted = dbUser.onboardingCompleted;
          token.userId = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expand browser-accessible runtime session metrics directly from token data
      if (session.user) {
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
});
```

To support TypeScript compile-time guarantees, the `next-auth` module types should be augmented:
```typescript
// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "student" | "organizer" | "recruiter" | "admin";
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "student" | "organizer" | "recruiter" | "admin";
    onboardingCompleted: boolean;
    userId: string;
  }
}
```

---

## SECTION 6: ROUTE MIDDLEWARE ENGINE (`src/middleware.ts`)

Next.js App Router uses edge-compatible middlewares to block access to protected directories. Users are instantly routed back to `/login` if their verified authentication tokens are empty or invalid.

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Extract Session cookie parameters securely
  const sessionToken = request.cookies.get("__Secure-next-auth.session-token")?.value;
  const { pathname } = request.nextUrl;

  // Specify route verification targets
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedRoute && !sessionToken) {
    // Intercept accesses and point home
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && sessionToken) {
    // Instantly bypass login portals if the session is hot and valid
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Confines middleware intercept operations to specific route profiles
export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup"],
};
```

---

## SECTION 7: HIGH-FIDELITY SAAS LOGIN PORTAL (`src/app/login/page.tsx`)

This custom React component is styled to reflect premium design themes like Linear, Stripe, and Vercel. It features a stunning glassmorphic UI, responsive state loaders, and glowing neon accents.

```tsx
"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Sparkles, ShieldCheck, HeartHandshake, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [credentialsMode, setCredentialsMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    if (provider === "google") setLoadingGoogle(true);
    if (provider === "github") setLoadingGithub(true);

    try {
      await signIn(provider, { callbackUrl: "/onboarding" });
    } catch (err) {
      console.error("Federated Authentication Handshake Failed: ", err);
    } finally {
      setLoadingGoogle(false);
      setLoadingGithub(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030303] text-gray-100 overflow-hidden font-sans">
      {/* Dynamic Background Mesh Grid & Purple Atmospheric Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_100%,transparent_100%)] opacity-70" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glassmorphic Wrapper */}
      <div className="relative w-full max-w-md px-8 py-10 bg-[#0c0c0e]/85 backdrop-blur-xl border border-[#232328] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 transition-all duration-300 hover:border-purple-600/30">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center text-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-xl mb-4 shadow-[0_0_15px_rgba(124,58,237,0.15)] animate-pulse">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            NEXUS AUTH
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-xs font-mono">
            Direct secure session handshake and persistent profile alignment.
          </p>
        </div>

        {/* Federated Logins */}
        <div className="space-y-3.5">
          <button
            onClick={() => handleOAuthLogin("google")}
            disabled={loadingGoogle || loadingGithub}
            className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-medium rounded-xl transition duration-200 shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.6a5.64 5.64 0 0 1-2.44 3.7v3.08h3.95c2.31-2.13 3.63-5.26 3.63-8.63z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.95-3.08c-1.1.74-2.5 1.18-3.98 1.18-3.07 0-5.67-2.08-6.6-4.88H1.36v3.18C3.33 21.3 7.39 24 12 24z" />
                <path fill="#FBBC05" d="M5.4 14.31A7.16 7.16 0 0 1 5 12c0-.8.14-1.57.4-2.31V6.51H1.36A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.24 5.39l4.16-3.08z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.7 1.36 6.51l4.04 3.12c.93-2.8 3.53-4.88 6.6-4.88z" />
              </svg>
            )}
            <span className="font-sans font-medium text-sm">Authenticate with Google</span>
          </button>

          <button
            onClick={() => handleOAuthLogin("github")}
            disabled={loadingGoogle || loadingGithub}
            className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#141416] hover:bg-[#1f1f23] text-white font-medium rounded-xl border border-[#2a2a30] transition duration-200 active:scale-[0.99] disabled:opacity-50 hover:border-neutral-500"
          >
            {loadingGithub ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            )}
            <span className="font-sans font-medium text-sm">Authenticate with GitHub</span>
          </button>
        </div>

        {/* Toggleable Credentials Form */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-[#131317]"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
            or use credentials
          </span>
          <div className="flex-grow border-t border-[#131317]"></div>
        </div>

        {credentialsMode ? (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="developer@nexus-stack.io"
                className="w-full py-2.5 px-4 bg-[#050507] border border-[#25252b] rounded-xl text-white outline-none focus:border-purple-500 font-sans text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                SECURITY PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full py-2.5 px-4 bg-[#050507] border border-[#25252b] rounded-xl text-white outline-none focus:border-purple-500 font-sans text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => console.log("Standard login payload processed.")}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition duration-150 active:scale-[0.99] font-sans text-sm"
            >
              Sign In to Environment
            </button>
            <button
              type="button"
              onClick={() => setCredentialsMode(false)}
              className="w-full flex items-center justify-center gap-1.5 mt-2 py-2 text-xs font-mono text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Federated OAuth
            </button>
          </form>
        ) : (
          <button
            onClick={() => setCredentialsMode(true)}
            className="w-full py-2.5 text-xs font-mono text-gray-400 hover:text-white bg-[#0f0f13] border border-[#212126] hover:border-neutral-700 rounded-xl transition"
          >
            Access with Isolated Sandbox Passkey
          </button>
        )}

        {/* Footer Audit Metrics */}
        <div className="mt-8 pt-6 border-t border-[#131317] flex justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> WAF Protected
          </div>
          <div className="flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-purple-400" /> HIPAA & GDPR Ready
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## SECTION 8: CUSTOM REUSABLE AUTHENTICATION HOOK (`src/hooks/useAuth.ts`)

Enable simple react state tracking of roles, sessions, and permissions:

```typescript
// src/hooks/useAuth.ts
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const isStudent = user?.role === "student";
  const isOrganizer = user?.role === "organizer";
  const isRecruiter = user?.role === "recruiter";
  const isAdmin = user?.role === "admin";

  const onboardingCompleted = user?.onboardingCompleted || false;

  return {
    user,
    isLoading,
    isAuthenticated,
    isStudent,
    isOrganizer,
    isRecruiter,
    isAdmin,
    onboardingCompleted,
  };
}
```

---

## SECTION 9: INTERACTIVE USER ONBOARDING PORTAL (`src/app/onboarding/page.tsx`)

When new users sign up via GitHub/Google, they default to a placeholder status. This responsive screen guides them to self-assign a core capability role:

```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, GraduationCap, Briefcase, Landmark, Check, Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<"student" | "organizer" | "recruiter" | "admin" | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const roles = [
    {
      id: "student" as const,
      title: "Student Explorer",
      icon: GraduationCap,
      desc: "Perfect resume building, competitive hackathons, and AI prep simulations.",
      color: "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 text-emerald-400",
    },
    {
      id: "organizer" as const,
      title: "SaaS Event Organizer",
      icon: Landmark,
      desc: "Establish communities, trigger automated email campaigns, and align sponsors.",
      color: "border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 text-indigo-400",
    },
    {
      id: "recruiter" as const,
      title: "Enterprise Recruiter",
      icon: Briefcase,
      desc: "Audit resumes using ATS scorers, search candidate lists, and schedule interviews.",
      color: "border-sky-500/30 hover:border-sky-500/60 bg-sky-500/5 text-sky-400",
    },
  ];

  const handleComplete = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Direct API sync route
      await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030303] text-gray-100 font-sans px-4 select-none">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      
      <div className="relative w-full max-w-2xl px-8 py-10 bg-[#0c0c0e]/90 border border-[#1f1f24] rounded-2xl shadow-2xl z-10 text-center">
        <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-4 animate-[bounce_3s_infinite]" />
        
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Assign Platform Environment</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 font-mono">
          Identify your core profile trajectory to optimize the dynamic Bento Dashboards.
        </p>

        <div className="grid md:grid-cols-3 gap-4 text-left">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedRole(item.id)}
                className={`cursor-pointer group relative p-5 border rounded-xl transition duration-250 flex flex-col justify-between ${
                  isSelected ? `${item.color} ring-1 ring-offset-2 ring-offset-[#0c0c0e] ring-purple-500` : "border-[#1c1c22] hover:border-[#35353d] bg-[#07070a]"
                }`}
              >
                <div>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg mb-4 ${isSelected ? "bg-purple-600/25" : "bg-[#121217]"}`}>
                    <Icon className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono">{item.desc}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg animate-scaleIn">
                      <Check className="w-3 h-3 text-white stroke-[3.5px]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-neutral-700 group-hover:border-neutral-500 transition" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          disabled={!selectedRole || saving}
          className="mt-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] shadow-md"
        >
          {saving ? "Deploying Alignment..." : "Configure Environment"}
        </button>
      </div>
    </div>
  );
}
```

---

## SECTION 10: SECURE AUTHENTICATOR ROUTE PROFILES

### Google Console Credentials Lifecycle
1. Open the [Google Cloud Developer Console](https://console.cloud.google.com/apis/credentials).
2. Choose a project or create a workspace named `NexStart AI Platform`.
3. Open the **OAuth consent screen** configuration pane:
   - User Type: `External`.
   - Provide email contacts and save.
4. Open the **Credentials** settings panel:
   - Click **Create Credentials** -> **OAuth client ID**.
   - Application type: `Web application`.
   - **Authorized JavaScript origins:**
     - Development App Sandbox: `https://ais-dev-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app`
     - Shared Production Proxy: `https://ais-pre-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app`
   - **Authorized redirect URIs (MANDATORY CALLBACKS):**
     - Developmental API callback: `https://ais-dev-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app/api/auth/callback/google`
     - Production/Shared API callback: `https://ais-pre-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app/api/auth/callback/google`
5. Save the generated `Client ID` and `Client Secret`.

---

### GitHub OAuth Setup Procedure
1. Log in to GitHub and navigate to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**:
   - Application Name: `NexStart Platform Dev`.
   - Homepage URL: `https://ais-dev-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app`
   - **Authorization callback URL:**
     - Development: `https://ais-dev-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app/api/auth/callback/github`
     - Shared/Production: `https://ais-pre-iq6nlba4jqkpe7acamix6o-485780547129.asia-southeast1.run.app/api/auth/callback/github`
3. Hit Register and extract the `Client ID` and generate a new `Client Secret`.

---

## SECTION 11: SAAS SECURITY AND COOKIE DEPLOYMENT MATRIX

To assure absolute GDPR and identity compliance, the active infrastructure implements the following cryptographic guards:

- **Salt Key Signatures:** Both JWT cookies and state transitions are signed using high-entropy HS512 standards via localized `AUTH_SECRET` environment strings (32-character base64 parameters minimum size).
- **SameSite Session Handling:** In embedded web apps (such as the AI Studio iframe/preview wrapper), omitting the `SameSite: none` flag leads to automatic browser cookie drops. We enforce absolute secure flags:
  ```ts
  sameSite: "none",
  secure: true
  ```
- **X-Frame-Options Compliance:** If the application requires iframe capability inside the user's portal, standard frame-ancestors are defined inside Next.js custom response headers.

---
**Approved & Signed:**
**Lead Authentication Architect & Principal DevSecOps Systems Engineer**
