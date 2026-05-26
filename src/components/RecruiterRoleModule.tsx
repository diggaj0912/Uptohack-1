import React, { useState, useEffect } from "react";
import { Users, Briefcase, FileCheck, Search, Star, AudioWaveform, HelpCircle, Eye, Sparkles, Filter } from "lucide-react";

interface RecruiterRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
}

export default function RecruiterRoleModule({ sessionToken, onAddXP }: RecruiterRoleModuleProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCand, setSelectedCand] = useState<any | null>(null);

  // Job matching requirement fields
  const [jobReqs, setJobReqs] = useState("TypeScript, React, Node.js");
  const [matchingResults, setMatchingResults] = useState<any | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profiles", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter elements that are students or with resume entries
        const studs = data.filter(u => u.role === "student");
        setCandidates(studs);
        if (studs.length > 0 && !selectedCand) {
          setSelectedCand(studs[0]);
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAtsAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCand) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recruiter/ats-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ userId: selectedCand.id, jobKeywords: jobReqs })
      });
      const data = await res.json();
      if (res.ok) {
        setMatchingResults(data);
        onAddXP(120);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(cand => 
    cand.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cand.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Intro strip */}
      <div className="p-4 bg-gradient-to-tr from-emerald-500/15 via-neutral-950 to-neutral-950 border border-emerald-500/10 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">recruitment workspace</span>
          <h2 className="text-md font-bold text-white mt-1">Recruiter Ecosystem & Talent board</h2>
          <p className="text-xs text-neutral-450 text-neutral-400">Query student profiles, run multi-criteria ATS parser matching, and review AI technical screen transcripts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Directory and search */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase text-neutral-300 font-mono">Talent Pool Directory</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-neutral-600" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-805 rounded px-2.5 pl-7 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredCandidates.length === 0 ? (
              <p className="text-xs text-neutral-600 py-4 text-center">No student pioneers match criteria query.</p>
            ) : (
              filteredCandidates.map((cand) => {
                const isSelected = selectedCand?.id === cand.id;
                return (
                  <button
                    key={cand.id}
                    onClick={() => {
                      setSelectedCand(cand);
                      setMatchingResults(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition text-xs relative ${
                      isSelected ? "bg-neutral-900 border-emerald-500/40 text-white" : "bg-neutral-950 border-neutral-900 text-neutral-450 text-neutral-400 hover:border-neutral-800"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <span className="font-bold text-white block">{cand.fullName}</span>
                      <span className="text-[10px] font-mono text-neutral-500 block">{cand.email}</span>
                      <div className="flex gap-1 flex-wrap pt-1">
                        <span className="text-[8px] bg-neutral-950 border border-neutral-850 px-1 py-0.2 rounded text-indigo-400 font-mono">XP Index: {cand.xp || 750}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content panel: Submissions ATS Analysis and Mock Player */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCand ? (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest block">portfolio audit</span>
                    <h3 className="text-md font-bold text-white mt-1">{selectedCand.fullName}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{selectedCand.email}</p>
                  </div>
                  <div className="px-3 py-1 bg-neutral-900 border border-neutral-850 rounded-xl font-mono text-xs text-neutral-300">
                    Confidence Badge: <strong className="text-emerald-400">92%</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-900 pt-4 text-xs font-sans">
                  {/* ATS matcher */}
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-white">Keyword Matching Ratios (ATS Rules)</h4>
                      <p className="text-[10px] text-neutral-500">Examine how candidate's credentials map to target job specs.</p>
                    </div>

                    <form onSubmit={handleRunAtsAudit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-neutral-500">Job specification keywords</label>
                        <input 
                          type="text" 
                          value={jobReqs}
                          onChange={(e) => setJobReqs(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-805 rounded px-2.5 py-1 text-xs text-white outline-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-sans text-xs font-bold rounded flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 fill-neutral-950" /> Compute Keyword Matching
                      </button>
                    </form>

                    {matchingResults && (
                      <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-2 animate-fade-in font-mono text-[10px] leading-relaxed text-neutral-300">
                        <div className="flex justify-between font-bold">
                          <span>ATS Alignment Rank:</span>
                          <span className="text-emerald-400 text-xs">{matchingResults.score}% Score</span>
                        </div>
                        <p>Found phrases: <strong className="text-purple-400">{matchingResults.matches?.join(', ')}</strong></p>
                        <p className="text-neutral-500 font-sans italic">"Candidate shows strong telemetry but should emphasize edge architectures."</p>
                      </div>
                    )}
                  </div>

                  {/* AI Interview Prep results review */}
                  <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-neutral-900 md:pl-4">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-white">AI technical Mock Interview recording</h4>
                      <p className="text-[10px] text-neutral-500">Review transcription logs of completed student simulations.</p>
                    </div>

                    <div className="p-3 rounded bg-neutral-900 border border-neutral-850 space-y-2">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-neutral-500 uppercase">
                        <span>cto prep: algorithms</span>
                        <span>Completed UTC 14:02</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 block font-bold">Overall Verdict: STRONG RECOMMENDATION</span>
                      <p className="text-[9.5px] text-neutral-400 line-clamp-2 leading-relaxed">
                        "Host and client coordinate using an isolated database json model, utilizing synchronous polling states..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-10 text-center text-neutral-600">
              No developer catalog profile has been loaded. Focus a candidate on the left listing to review metrics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
