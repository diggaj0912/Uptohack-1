import React, { useState } from "react";
import { Sparkles, Globe, Briefcase, Brain, Users, ArrowRight, Check, Play, Search, X, Terminal } from "lucide-react";

interface LandingModuleProps {
  onLaunchApp: () => void;
  onLaunchCommunity?: () => void;
}

export default function LandingModule({ onLaunchApp, onLaunchCommunity }: LandingModuleProps) {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showSandboxTerms = (type: "privacy" | "terms" | "api" | "changelog") => {
    if (type === "privacy") {
      setModalTitle("Data Privacy Statement");
      setModalContent("Nexus AI values candidate protection. Within this carrier sandbox, all analysis outputs, parsed experience keywords, and technical interview transcripts are cached exclusively through state sessions, with persistent simulations remaining fully isolated to safe internal variables.");
    } else if (type === "terms") {
      setModalTitle("Platform Terms of Use");
      setModalContent("This application operates as a developer career platform sandbox. All simulated mock scores, ATS keyword matches, and real-time VC dispatch logs are for validation and recruitment testing purposes. Service agreements are bound to safe sandbox limits.");
    } else if (type === "api") {
      setModalTitle("Nexus Developer API");
      setModalContent("The ecosystem exposes multiple full-stack routes for parsing and generation, including: '/api/resume/analyze', '/api/events/ai-summarize', '/api/community/posts/ai-moderate', and '/api/interview/score-answer'. Credentials are kept fully server-side for elite compliance.");
    } else {
      setModalTitle("Nexus Version History");
      setModalContent("v1.4 - Implemented full-bleed high-fidelity landing dashboard suite.\nv1.3 - Integrated high-density bento analytics grid and sentiment indicators.\nv1.2 - Bootstrapped server-side Gemini prompts with dynamic mock scores.\nv1.1 - Added ATS CV alignment logic and technical interview generators.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans select-none antialiased relative" id="nexus-landing-page">
      {/* Dynamic Background visual flare */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Primary Sticky Top Navbar exactly as in the visual presentation */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between w-full">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition mx-auto md:mx-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center border border-purple-400/25 shadow-md shadow-purple-500/10">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-black text-white tracking-widest uppercase">Nexus AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-405 text-neutral-400">
          <button onClick={() => handleScrollTo("key-capabilities")} className="hover:text-white transition cursor-pointer">Explorer</button>
          <button onClick={() => handleScrollTo("pricing-section")} className="hover:text-white transition cursor-pointer">Ecosystem</button>
          <button onClick={() => onLaunchCommunity?.()} className="hover:text-purple-400 text-purple-400/90 transition cursor-pointer flex items-center gap-1">
            Network <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded text-purple-300 font-mono">Forum</span>
          </button>
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <Search 
            className="w-4.5 h-4.5 text-neutral-400 hover:text-white cursor-pointer transition" 
            onClick={onLaunchApp}
          />
          <button 
            onClick={onLaunchApp}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 border border-purple-400/20 transition-all duration-200 cursor-pointer"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-24">
        
        {/* Hero Header Area */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-6 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono uppercase tracking-widest text-purple-400">
            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
            Nexus AI Beta Live
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none leading-tight">
            The Future of Careers, <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          <p className="text-neutral-400 text-sm md:text-base leading-relaxed tracking-normal max-w-2xl mx-auto font-sans">
            Navigate the professional landscape with precision. Nexus AI analyzes, 
            optimizes, and connects you to opportunities at machine speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
            >
              Join the Network
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400" />
              View Demo
            </button>
          </div>
        </div>

        {/* Bento Grid Features Panel */}
        <div className="space-y-6 scroll-mt-24" id="key-capabilities">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-500 font-bold">
              Key Capabilities
            </h2>
            <p className="text-base text-neutral-400 font-bold font-sans">Comprehensive AI Suite for developers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Resume Builder (8 Columns on MD) */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 transition duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Intelligent Resume Builder
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-normal mb-6 font-sans">
                  Real-time ATS optimization, keyword checks, structural alignment scoring, and high-fidelity PDF outputs.
                </p>
              </div>

              {/* Simulating image layout preview */}
              <div className="p-3.5 bg-neutral-950/80 border border-neutral-850 rounded-lg space-y-2 font-mono">
                <div className="flex justify-between items-center text-[10px] text-neutral-500">
                  <span>ATS PROFILE ENVELOPE</span>
                  <span className="text-purple-400 text-xs">ACTIVE SCORING (84/100)</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div className="h-full w-[84%] bg-gradient-to-r from-purple-500 to-indigo-500" />
                </div>
                <div className="text-[9px] text-neutral-400 font-sans leading-relaxed">
                  • Staff engineering standards • React 19 performance metrics • WebSocket throughput
                </div>
              </div>
            </div>

            {/* Card 2: Global Events (5 Columns on MD) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 transition duration-300 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Global Events
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-normal mb-6 font-sans">
                  Discover AI-curated networking masterclasses, web structures, hackathons, and webinars globally.
                </p>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase font-mono tracking-wider block">Upcoming Match</span>
                  <span className="text-white font-bold font-mono">DevCon AI 2026</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded">
                  98% Fit
                </span>
              </div>
            </div>

            {/* Card 3: AI Interviewer */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 transition duration-300 flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    AI Interviewer
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-normal mb-4 font-sans">
                  Simulated high-rigor voice/text technical prompts with continuous mock responses and analytics.
                </p>
              </div>

              <div className="flex gap-1.5 pt-2">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-neutral-400">System Design</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-neutral-400">V8 Engines</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-neutral-400">Security Proxies</span>
              </div>
            </div>

            {/* Card 4: Neural Network */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 transition duration-300 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 border border-dashed border-purple-500/20 rounded-full flex items-center justify-center animate-spin pointer-events-none">
                <div className="w-24 h-24 border border-dashed border-purple-500/30 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    The Neural Network
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 leading-normal font-sans">
                  Connect with peers, mentors, and accredited VCs in a decentralized modern talent graph dashboard.
                </p>
              </div>

              <div className="text-[10px] font-mono text-purple-400 font-medium">
                Dual-moderated sentiment engine active →
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <div className="max-w-4xl mx-auto space-y-10 scroll-mt-24" id="pricing-section">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Access the Ecosystem</h2>
            <p className="text-xs text-neutral-400 font-sans">Simple, transparent pricing for individuals and teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-850 hover:border-neutral-800 transition duration-300 flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Standard</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$0</span>
                    <span className="text-xs text-neutral-400 font-mono">/ forever</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-900">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-purple-400 text-purple-450" />
                    <span className="font-sans">Basic Resume Builder CV format</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-purple-400 text-purple-450" />
                    <span className="font-sans">Interactive channel discussions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 line-through">
                    <span className="font-sans">No AI Mock interview coaching</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs rounded-xl border border-neutral-800 transition cursor-pointer"
              >
                Start Free
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-neutral-950 border border-purple-900/50 hover:border-purple-800 relative flex flex-col justify-between gap-8 bg-gradient-to-b from-neutral-950 to-neutral-900">
              <span className="absolute -top-3 right-6 px-3 py-1 text-[9px] font-mono font-black uppercase rounded-full bg-purple-600 text-white tracking-widest shadow">
                RECOMMENDED
              </span>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Nexus Pro</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$24</span>
                    <span className="text-xs text-neutral-400 font-mono">/ month</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-purple-950/50">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="font-sans">Advanced real-time ATS optimization scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="font-sans">Unlimited technical prep mock sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="font-sans">Priority access and custom VC notifications</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-500/20 cursor-pointer animate-pulse"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* High-Fidelity Footer exactly matching layout in the screenshot */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-8 px-6 text-xs text-neutral-500 font-mono mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white tracking-widest uppercase">Nexus AI</span>
            <span className="text-neutral-700">|</span>
            <span>© 2026 Nexus AI Ecosystem. Built for the future of work.</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => showSandboxTerms("privacy")} className="hover:text-white transition cursor-pointer">Privacy</button>
            <button onClick={() => showSandboxTerms("terms")} className="hover:text-white transition cursor-pointer">Terms</button>
            <button onClick={() => showSandboxTerms("api")} className="hover:text-white transition cursor-pointer">API</button>
            <button onClick={() => showSandboxTerms("changelog")} className="hover:text-white transition cursor-pointer">ChangeLog</button>
          </div>
        </div>
      </footer>

      {/* Elegant Sandbox Info Modal */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-neutral-950 border border-neutral-850 rounded-2xl shadow-2xl relative space-y-4">
            <button 
              onClick={() => { setModalTitle(null); setModalContent(null); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 hover:bg-neutral-900 border border-neutral-850 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2.5 text-purple-400">
              <Terminal className="w-5 h-5 shrink-0 animate-pulse" />
              <h3 className="text-sm font-black tracking-wider uppercase text-white">{modalTitle}</h3>
            </div>

            <div className="text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-line p-3.5 bg-neutral-900/40 border border-neutral-850/80 rounded-xl">
              {modalContent}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => { setModalTitle(null); setModalContent(null); }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
