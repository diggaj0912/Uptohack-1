import React, { useState } from "react";
import { 
  Sparkles, Key, Mail, ShieldAlert, ArrowRight, Check, CheckCircle, 
  Trophy, Bookmark, Star, Users, Brain, Heart, Filter, User, HelpCircle, ArrowLeft, RefreshCw
} from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface AuthModuleProps {
  onAuthComplete: (profile: UserProfile, token: string) => void;
}

export default function AuthModule({ onAuthComplete }: AuthModuleProps) {
  const [view, setView] = useState<"login" | "signup" | "otp" | "onboarding">("login");
  
  // Form fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [otpCode, setOtpCode] = useState("");
  
  // Onboarding Wizard states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [tempToken, setTempToken] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Suggested roles lists with gorgeous iconography
  const roleCards = [
    { id: "student" as const, name: "Student Pioneer", desc: "Build portfolios, audit resumes, and practice mock technical interviews guided by AI.", icon: Brain, color: "from-blue-500 to-indigo-500" },
    { id: "organizer" as const, name: "SaaS Organizer", desc: "Launch web hackathons, send WhatsApp bulletins, generate dynamic certificates, and manage registrations.", icon: Trophy, color: "from-purple-500 to-pink-500" },
    { id: "recruiter" as const, name: "Talent Recruiter", desc: "Browse real candidates, review ATS keyword scorecards, and audit interview histories.", icon: Users, color: "from-emerald-500 to-teal-500" },
    { id: "sponsor" as const, name: "Sponsor Partner", desc: "Sponsor challenges, distribute discount coupons, and review marketing performance metrics.", icon: Star, color: "from-amber-400 to-orange-500" },
    { id: "judge" as const, name: "Technical Judge", desc: "Evaluate hackathon project submissions using composite scorecards.", icon: Filter, color: "from-rose-500 to-red-500" },
    { id: "mentor" as const, name: "Ecosystem Mentor", desc: "Conduct student portfolio reviews, host coding checkposts, and view booking lists.", icon: HelpCircle, color: "from-cyan-500 to-blue-500" },
    { id: "community_manager" as const, name: "Community Director", desc: "Moderate discord chats, review CRM contact lists, and classify member sentiments.", icon: Heart, color: "from-violet-500 to-fuchsia-500" },
    { id: "admin" as const, name: "Super Admin", desc: "Platform master dashboard, anti-fraud evaluation logs, user role overrides, and system audits.", icon: ShieldAlert, color: "from-red-600 to-amber-600" }
  ];

  const tagOptions = [
    "TypeScript", "React 19", "System Design", "RAG Pipeline", "Next.js 15",
    "Tailwind CSS", "Database Sharding", "Community Outreach", "Hackathons",
    "Brand Promotion", "Staffing Diagnostics", "AI Co-Founding", "SaaS Growth"
  ];

  const handleInterestToggle = (tag: string) => {
    setInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || !fullName) {
      setError("Please fill out your full name, email, and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role, referralCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      setTempProfile(data.user);
      setTempToken(data.token);
      setView("onboarding");
      setOnboardingStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please provide a valid email and matching password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login credentials invalid.");
      }

      onAuthComplete(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSimulate = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);
    const mockEmail = `${provider}_user_${Math.floor(Math.random()*1000)}@nexus.io`;
    const mockName = `${provider === 'google' ? 'Google' : 'GitHub'} Integrant`;

    try {
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, fullName: mockName, role: "student", provider }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (!data.user.isOnboarded) {
        setTempProfile(data.user);
        setTempToken(data.token);
        setView("onboarding");
        setOnboardingStep(1);
      } else {
        onAuthComplete(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email) {
      setError("Please input an email to deliver code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setOtpSent(true);
      setOtpCode(data.code); // Presets for mock ease
      setView("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (!data.user.isOnboarded) {
        setTempProfile(data.user);
        setTempToken(data.token);
        setView("onboarding");
        setOnboardingStep(1);
      } else {
        onAuthComplete(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          role,
          interests,
          fullName: tempProfile?.fullName
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onAuthComplete(data.user, tempToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-center items-center p-6 relative font-sans overflow-y-auto selection:bg-purple-500/30">
      {/* Decorative premium grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-8 animate-fade-in py-10">
        
        {/* Platform Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/20">
            <Sparkles className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">NEXUS AI SYSTEMS</h1>
            <p className="text-xs text-neutral-500 font-mono mt-1">Multi-Role SaaS Event & Career Hub</p>
          </div>
        </div>

        {/* Outer Card Wrapper */}
        <div className="p-6 md:p-8 rounded-2xl bg-neutral-950/60 border border-neutral-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-xs text-rose-300 animate-slide-up">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {view === "login" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-white">Access account</h2>
                <p className="text-xs text-neutral-550 text-neutral-400">Log in to open your isolated role dashboard.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                      type="email" 
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">Security Password</label>
                    <button 
                      type="button"
                      onClick={() => handleRequestOtp()}
                      className="text-[10px] text-purple-400 hover:underline hover:text-purple-300 font-mono outline-none"
                    >
                      OTP Code Login?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>

              {/* Secure Quick Switch Presets */}
              <div className="pt-4 border-t border-neutral-900/60 space-y-2.5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block text-center">Fast Simulation Presets (Bypass Accounts)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setEmail("student@nexus.io");
                      setPassword("password123");
                    }} 
                    className="p-2 text-[10px] bg-neutral-900/50 border border-neutral-850 hover:border-neutral-800 rounded-lg text-left text-neutral-300 transition"
                  >
                    🚀 Student Account
                  </button>
                  <button 
                    onClick={() => {
                      setEmail("organizer@nexus.io");
                      setPassword("password123");
                    }} 
                    className="p-2 text-[10px] bg-neutral-900/50 border border-neutral-850 hover:border-neutral-800 rounded-lg text-left text-neutral-300 transition"
                  >
                    🎖️ Organizer Master
                  </button>
                  <button 
                    onClick={() => {
                      setEmail("recruiter@nexus.io");
                      setPassword("password123");
                    }} 
                    className="p-2 text-[10px] bg-neutral-900/50 border border-neutral-850 hover:border-neutral-800 rounded-lg text-left text-neutral-300 transition"
                  >
                    👥 Recruiter Expert
                  </button>
                  <button 
                    onClick={() => {
                      setEmail("admin@nexus.io");
                      setPassword("password123");
                    }} 
                    className="p-2 text-[10px] bg-neutral-900/50 border border-neutral-850 hover:border-neutral-800 rounded-lg text-left text-neutral-300 transition"
                  >
                    🛠️ Super Admin
                  </button>
                </div>
              </div>

              {/* Provider Login */}
              <div className="pt-4 border-t border-neutral-900/80 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleOAuthSimulate("google")}
                    className="py-2.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 transition rounded-xl text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    Google Sync
                  </button>
                  <button 
                    onClick={() => handleOAuthSimulate("github")}
                    className="py-2.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 transition rounded-xl text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer outline-none"
                  >
                    GitHub Sync
                  </button>
                </div>

                <p className="text-center text-xs text-neutral-500 font-sans">
                  Don't have an isolated workspace?{" "}
                  <button 
                    onClick={() => setView("signup")}
                    className="text-purple-400 hover:underline hover:text-purple-300 font-semibold"
                  >
                    Create accounts
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* 2. SIGNUP VIEW */}
          {view === "signup" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-white">Create isolated profile</h2>
                <p className="text-xs text-neutral-400">Establish a new relational profile with standard secure settings.</p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Full Label Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                      type="text" 
                      placeholder="e.g., Jane Done"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Email Identifier</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                      type="email" 
                      placeholder="pioneer@nexus.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-[12px] text-white placeholder-neutral-700 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">SaaS Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-neutral-600" />
                    <input 
                      type="password" 
                      placeholder="Must be alphanumeric"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">Optional Referral Code</label>
                  <input 
                    type="text" 
                    placeholder="INVITE-CODE (Grants credit & XP)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition font-mono"
                  />
                  {referralCode && (
                    <span className="text-[9px] font-mono text-amber-400 block mt-1">
                      💡 Validating this code awards you +100 bonus XP and $10 on onboarding finish.
                    </span>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white transition font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Initiate Setup"}
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>

              <div className="pt-4 border-t border-neutral-900/80 text-center text-xs text-neutral-500">
                Already registered?{" "}
                <button 
                  onClick={() => setView("login")}
                  className="text-purple-400 hover:underline hover:text-purple-300 font-semibold"
                >
                  Log in here
                </button>
              </div>
            </div>
          )}

          {/* 3. OTP VERIFY VIEW */}
          {view === "otp" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <button 
                  onClick={() => setView("login")}
                  className="text-neutral-500 hover:text-white flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <div className="space-y-1">
                  <h2 className="text-md font-bold text-white">Verification required</h2>
                  <p className="text-xs text-neutral-400">A security transaction code has been dispatched to your email.</p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 block">6-Digit SMS/Mail Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter security digits"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-purple-500/50 rounded-xl text-center text-sm font-mono text-white placeholder-neutral-700 outline-none transition tracking-widest"
                  />
                  <span className="text-[9px] font-mono text-neutral-500 block text-center mt-1">
                    Auto-filled matching simulation protocol.
                  </span>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition font-sans text-xs font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  Confirm Security Access
                </button>
              </form>
            </div>
          )}

          {/* 4. ONBOARDING WIZARD VIEW */}
          {view === "onboarding" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-neutral-900/40 border border-neutral-900 px-4 py-2.5 rounded-xl">
                <div>
                  <h4 className="text-[10px] uppercase font-mono text-purple-400">Step {onboardingStep} of 3</h4>
                  <span className="text-xs font-bold text-white">
                    {onboardingStep === 1 && "Choose Platform Identity"}
                    {onboardingStep === 2 && "Configure Target Tags"}
                    {onboardingStep === 3 && "Ecosystem Synchronization"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(stepNum => (
                    <div 
                      key={stepNum}
                      className={`w-2.5 h-1.5 rounded-full transition-all ${stepNum <= onboardingStep ? "bg-purple-500 w-5" : "bg-neutral-800"}`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: ROLE SELECTION */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Nexus isolates workflows completely based on your functional selection. Select the persona you'd like to inspect.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {roleCards.map(rc => {
                      const IconComponent = rc.icon;
                      const isSelected = role === rc.id;
                      return (
                        <button
                          key={rc.id}
                          type="button"
                          onClick={() => setRole(rc.id)}
                          className={`p-3 text-left rounded-xl border transition-all relative cursor-pointer ${
                            isSelected 
                              ? "bg-neutral-900/80 border-purple-500 shadow-md shadow-purple-500/5 text-white" 
                              : "bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:border-neutral-800"
                          }`}
                        >
                          <div className="flex gap-2.5 items-start">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${rc.color} flex items-center justify-center shrink-0`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-xs font-bold block">{rc.name}</span>
                              <span className="text-[10px] text-neutral-500 leading-normal block mt-1">{rc.desc}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full py-3 bg-white text-black hover:bg-neutral-200 transition text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer outline-none mt-4"
                  >
                    Continue Onboarding
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* STEP 2: INTERESTS / TAGS */}
              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-400 leading-neutral">
                    Select the tags that best match your professional goals. These populate recommendations and feed dashboards dynamically.
                  </p>

                  <div className="flex flex-wrap gap-2 py-2">
                    {tagOptions.map(tag => {
                      const isSelected = interests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInterestToggle(tag)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-medium border cursor-pointer outline-none transition ${
                            isSelected 
                              ? "bg-purple-500/10 border-purple-500 text-purple-300" 
                              : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-800"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="px-4 py-3 bg-neutral-950 border border-neutral-900 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="flex-1 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl flex justify-center items-center gap-2"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ECOSYSTEM SYNC */}
              {onboardingStep === 3 && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Your Workspace is Initializing</h3>
                    <p className="text-[11px] text-neutral-400 py-1.5 max-w-sm mx-auto leading-relaxed">
                      Ecosystem channels have aligned with <span className="text-purple-400">#{interests[0] || 'TypeScript'}</span> and isolation barriers have been configured securely.
                    </p>
                  </div>

                  {referralCode && (
                    <div className="p-3 bg-amber-500/5 border border-dashed border-amber-500/20 text-[10px] text-amber-300 rounded-xl leading-relaxed text-left">
                      🎁 Referral tracking validated! Your profile is credited with +150 XP bonus, and your inviter is rewarded!
                    </div>
                  )}

                  <div className="space-y-2 bg-neutral-900/30 border border-neutral-900 p-4 rounded-xl text-left">
                    <span className="text-[9px] font-mono tracking-wider uppercase text-neutral-500 block">Recommended Hubs Joined</span>
                    <div className="flex gap-2.5 items-center text-[10px] text-neutral-300">
                      <span className="text-purple-500 font-bold">&#35;dev-chat</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-800" />
                      <span className="text-purple-500 font-bold">&#35;ai-talks</span>
                      <span className="w-1 h-1 rounded-full bg-neutral-800" />
                      <span className="text-purple-500 font-bold">&#35;recruiter-leads</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOnboardingComplete()}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Access Dashboard Workspace"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
