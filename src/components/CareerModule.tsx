import React, { useState, useEffect } from "react";
import { UserCareerState, Resume } from "../types";
import { 
  Trophy, Flame, Sparkles, AlertCircle, CheckCircle2, ArrowRight, 
  Share2, ArrowUpRight, BarChart3, HelpCircle, FileCheck, CalendarDays,
  Award, Download, RefreshCw
} from "lucide-react";

interface CareerModuleProps {
  career: UserCareerState;
  resume: Resume;
  onAddXP: (amount: number, skill?: string) => void;
  onRefreshCareer: () => void;
  onNavigateTab: (tabName: string) => void;
}

export default function CareerModule({ career, resume, onAddXP, onRefreshCareer, onNavigateTab }: CareerModuleProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certSvg, setCertSvg] = useState<string | null>(null);
  const [activeRecommendation, setActiveRecommendation] = useState<any>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resume,
          userCareer: career
        })
      });
      const data = await response.json();
      if (data) {
        setActiveRecommendation(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecs(false);
    }
  };

  const triggerGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const response = await fetch("/api/ai/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resume.fullName || "Candidate Challenger",
          trackName: "Staff Cloud Architect",
          score: `${Math.min(100, 80 + career.level * 2)}% Global System Rigor`
        })
      });
      const data = await response.json();
      if (data && data.svg) {
        setCertSvg(data.svg);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulated activity bar heights for Image 1's "Activity Matrix"
  const activityData = [
    { day: "Mon", activeScore: 65, interviews: 1, resumeUpdates: 2 },
    { day: "Tue", activeScore: 85, interviews: 2, resumeUpdates: 0 },
    { day: "Wed", activeScore: 40, interviews: 0, resumeUpdates: 1 },
    { day: "Thu", activeScore: 95, interviews: 3, resumeUpdates: 1 },
    { day: "Fri", activeScore: 70, interviews: 1, resumeUpdates: 0 },
    { day: "Sat", activeScore: 30, interviews: 0, resumeUpdates: 0 },
    { day: "Sun", activeScore: 50, interviews: 1, resumeUpdates: 3 },
  ];

  const resumeScore = career.skillsTracker["ATS Alignment"] || 84;

  return (
    <div className="space-y-6 animate-fade-in text-neutral-200" id="career-growth-fluid">
      
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest font-mono uppercase text-purple-400 font-bold">
            ARCHITECT SYSTEMS REPORT • LEVEL {career.level}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Welcome back, {resume.fullName || "Candidate"}
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time analytics portal representing parsed capability profiles and matching indexes.
          </p>
        </div>

        {/* Global Level Indicator Badge */}
        <div className="flex items-center gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/85 backdrop-blur max-w-max">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
            <Trophy className="w-5 h-5 text-purple-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center bg-purple-600 rounded-full text-[9px] font-bold text-white shadow">
              {career.level}
            </div>
          </div>
          <div className="text-left">
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 gap-6">
              <span>XP Portfolio: {career.xp}</span>
              <span>Next Lvl: {career.level * 1000}</span>
            </div>
            <div className="h-1.5 w-32 rounded-full bg-neutral-900 mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (career.xp % 1000) / 10)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Column Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Dashboard Metrics Area (Image 1 Style Blocks) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Triple Cards Block (Resume Score + Comm Streak + Upcoming Registrations) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Resume Score Card */}
            <div 
              onClick={() => onNavigateTab("resume")}
              className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-750 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full" />
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  Resume Score
                </span>
                <span className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  +12 pts
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono tracking-tight">{resumeScore}</span>
                <span className="text-xs text-neutral-500">/ 100</span>
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1 group-hover:text-purple-400 transition">
                <span>Configure profile details</span>
                <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 2: Community Streak Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  Community Streak
                </span>
                <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500/30 animate-pulse" />
              </div>
              <div>
                <span className="text-3xl font-black text-white font-mono tracking-tight">14 Days</span>
                <div className="flex justify-between mt-3 gap-0.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 text-[9px]">
                      <span className="text-neutral-500 font-mono scale-90">{day}</span>
                      <div className={`w-3 h-3 rounded-full ${i < 5 ? 'bg-purple-500' : 'bg-neutral-800'} border border-neutral-900`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Upcoming registrations */}
            <div 
              onClick={() => onNavigateTab("events")}
              className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-750 cursor-pointer transition text-left flex flex-col justify-between min-h-[160px]"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                  Registrations
                </span>
                <CalendarDays className="w-4 h-4 text-purple-400" />
              </div>

              <div>
                <span className="text-3xl font-black text-white font-mono tracking-tight">3 Flagship</span>
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                    <span>FinTech Hackathon</span>
                    <span className="text-purple-400">June 15</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-purple-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Activity Matrix Chart */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  Candidate Activity Matrix
                </h3>
                <p className="text-[11px] text-neutral-500">Evaluates coding contributions and mock sessions over standard cycles.</p>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                ACTIVE STATUS
              </span>
            </div>

            {/* Custom Interactive Column Chart */}
            <div className="flex items-end justify-between h-40 pt-4 px-2 select-none border-b border-neutral-800">
              {activityData.map((data, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center flex-1"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip on Hover */}
                  <div className={`absolute mb-24 bg-neutral-950 border border-neutral-800 text-[10px] p-2 rounded-lg transition-opacity duration-200 z-10 space-y-0.5 ${hoveredBar === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <p className="font-bold text-white">{data.day} Performance</p>
                    <p className="text-purple-400 font-mono">Intensity Index: {data.activeScore}%</p>
                    <p className="text-neutral-400 text-[9px]">Interviews Run: {data.interviews}</p>
                  </div>

                  {/* Visual Column Bar */}
                  <div className="w-8 sm:w-12 bg-neutral-950 rounded-t-lg overflow-hidden h-32 flex items-end">
                    <div 
                      className={`w-full bg-gradient-to-t from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 transition-all duration-300 cursor-pointer rounded-t`}
                      style={{ height: `${data.activeScore}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] font-mono text-neutral-500 mt-2">{data.day}</span>
                </div>
              ))}
            </div>
            
            {/* Legend parameters */}
            <div className="pt-4 flex flex-wrap gap-4 justify-center text-[10px] text-neutral-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-500" /> Coding Hours</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-600" /> Mock Technicals</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-neutral-800" /> Idle State</span>
            </div>
          </div>

          {/* AI-powered Personal Matchmaking Recommendations */}
          {activeRecommendation && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-neutral-900/40 border border-purple-900/15 space-y-4 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
              <div className="flex justify-between items-center transition-all">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      AI Matchmaking Catalyst
                    </h3>
                    <p className="text-[10px] text-purple-400 font-mono">PERSONALIZED ARCHITECT RECOMMENDATIONS</p>
                  </div>
                </div>

                <button
                  onClick={loadAIRecommendations}
                  disabled={loadingRecs}
                  className="px-2.5 py-1 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-[10px] text-neutral-400 flex items-center gap-1 font-mono hover:text-white transition cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingRecs ? "animate-spin" : ""}`} />
                  {loadingRecs ? "Syncing..." : "Sync Matchmaker"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Event Match */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-850 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                    Dynamic Target Event
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {activeRecommendation.eventMatch?.title || "Retrieving Event..."}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {activeRecommendation.eventMatch?.reason}
                  </p>
                </div>

                {/* Community Match */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-850 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold block">
                    Community Channel Pair
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {activeRecommendation.communityMatch?.channel || "Retrieving Forum..."}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {activeRecommendation.communityMatch?.reason}
                  </p>
                </div>

                {/* Sponsor Match */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-850 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono uppercase text-purple-400 font-bold block">
                    Matching Sponsor Tier
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {activeRecommendation.sponsorMatch?.tier || "Analyzing Sponsors..."}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {activeRecommendation.sponsorMatch?.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs at bottom of metrics box */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigateTab("resume")}
              className="px-5 py-3 bg-white text-neutral-950 hover:bg-neutral-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-neutral-950" />
              Update Resume Profile
            </button>
            
            <button
              onClick={handleShareProfile}
              className="px-5 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-neutral-400" />
              {copied ? "Copied URL to Clipboard!" : "Share Candidate Profile"}
            </button>
          </div>

        </div>

        {/* Right Side Column Option: Nexus Intelligence */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 relative overflow-hidden min-h-max">
            
            {/* Visual shine circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Nexus Intelligence
                </h3>
                <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block">LLM REASONER V1</span>
              </div>
            </div>

            {/* Dynamic Interactive Feed Recommendation 1 */}
            <div className="space-y-4">
              <div 
                onClick={() => onNavigateTab("resume")}
                className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-850 hover:border-purple-900/30 cursor-pointer transition text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-mono font-black mt-0.5">
                    12
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      Your recent addition of <span className="text-white font-bold">React Native</span> to your tech credentials increased your global resume score by <span className="text-emerald-400 font-bold">12 index points</span>.
                    </p>
                    <span className="text-[10px] text-purple-400 font-mono group-hover:underline flex items-center gap-1 pt-1">
                      View Details
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Feed Recommendation 2 */}
              <div 
                onClick={() => onNavigateTab("communities")}
                className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-850 hover:border-purple-900/30 cursor-pointer transition text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-xs font-mono font-black mt-0.5">
                    🔥
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      Based on your activity matrix timing checkpoints, we recommend joining the <span className="text-white font-bold">Web3 Builders Collective</span> forum to safely preserve your community streak index.
                    </p>
                    <span className="text-[10px] text-purple-400 font-mono group-hover:underline flex items-center gap-1 pt-1">
                      Explore channels
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills breakdown stats list */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>CAPABILITY PROFILE MATRIX</span>
                  <span>XP VALUE</span>
                </div>

                <div className="space-y-2">
                  {Object.entries(career.skillsTracker).map(([skill, val]) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-neutral-400">{skill}</span>
                        <span className="text-neutral-300 font-mono">{val}% Rating</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* AI Certificate Portal Card */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 relative overflow-hidden text-left space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Certification Desk
                </h3>
                <span className="text-[9px] font-mono text-neutral-500 uppercase">SYS SECURE CERT-ID-2026</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Synthesize an elite verification badge reflecting your Level {career.level} developer achievements. Standard SVG format, cryptographic signature, and verification token.
            </p>

            <button
              onClick={triggerGenerateCertificate}
              disabled={generatingCert}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {generatingCert ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Compiling SVG Layout...
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  Generate Dynamic Certificate
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Certificate Overlay Modal */}
      {certSvg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl max-w-2xl w-full space-y-4 relative">
            <button
              onClick={() => setCertSvg(null)}
              className="absolute top-4 right-4 text-xs font-mono font-bold text-neutral-400 hover:text-white border border-neutral-800 px-2 py-1 rounded cursor-pointer"
            >
              Close
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-black text-white">Your Algorithmic Badge of Honor</h3>
              <p className="text-xs text-neutral-400">Custom synthesized SVG template generated serverside by Gemini LLM.</p>
            </div>

            <div 
              className="border border-neutral-800 rounded-xl overflow-hidden aspect-[8/5] bg-black p-2 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: certSvg }}
            />

            <div className="flex justify-between items-center bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              <div className="text-left">
                <p className="text-[10px] font-mono text-neutral-400">CERTIFICATE REGISTRY</p>
                <p className="text-xs font-bold text-white">{resume.fullName || "Candidate Master"}</p>
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([certSvg], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Certificate-${resume.fullName?.replace(/\s+/g, "-") || "Scholar"}.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Raw SVG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
