import React, { useState, useEffect } from "react";
import { Award, Compass, Heart, Radio, Star, Landmark, HelpCircle, Save, CheckCircle, RefreshCw, ChevronRight } from "lucide-react";

interface JudgeRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
}

export default function JudgeRoleModule({ sessionToken, onAddXP }: JudgeRoleModuleProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  // Score attributes
  const [innovation, setInnovation] = useState(8);
  const [design, setDesign] = useState(7);
  const [technical, setTechnical] = useState(8);
  const [feedbackText, setFeedbackText] = useState("");

  const [loading, setLoading] = useState(false);
  const [gradingSuccess, setGradingSuccess] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Fetch submissions for evt-1 (or global list)
      const res = await fetch("/api/hackathon/submissions/evt-1");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
        if (data.length > 0 && !selectedSub) {
          setSelectedSub(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hackathon/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          grades: {
            innovation,
            design,
            technical,
            feedback: feedbackText
          }
        })
      });
      if (res.ok) {
        setGradingSuccess(true);
        setFeedbackText("");
        onAddXP(100);
        setTimeout(() => setGradingSuccess(false), 2500);
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Intro strip */}
      <div className="p-4 bg-gradient-to-tr from-rose-500/10 to-neutral-950 border border-rose-500/10 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">technical judge station</span>
          <h2 className="text-md font-bold text-white mt-1">Hackathon Evaluation panel</h2>
          <p className="text-xs text-neutral-450 text-neutral-400">Classify code submissions, audit GitHub repositories, and assign composite scorecard points.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Submissions list */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase text-neutral-300 font-mono">Builds under review</h3>
          
          <div className="space-y-2">
            {submissions.length === 0 ? (
              <p className="text-xs text-neutral-600 font-sans py-4 text-center">No project builds registered for evaluation.</p>
            ) : (
              submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setFeedbackText("");
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition text-xs ${
                      isSelected ? "bg-neutral-900 border-rose-500/30 text-white" : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-850"
                    }`}
                  >
                    <span className="font-bold block text-white">{sub.title}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 block line-clamp-1">{sub.tagline}</span>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-neutral-900">
                      <span className="text-[9px] text-neutral-500 font-mono">By {sub.submitterName}</span>
                      {sub.averageScore ? (
                        <span className="text-[9px] font-mono font-bold text-rose-400">Score: {sub.averageScore}%</span>
                      ) : (
                        <span className="text-[8px] font-mono text-neutral-600 uppercase">Not judged</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center/Right: Scorecard Grid */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSub ? (
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-5">
              
              {/* Submission details */}
              <div className="border-b border-neutral-900 pb-4 space-y-1.5 min-w-0">
                <span className="text-[8px] font-mono uppercase text-neutral-500">Evaluating submission ({selectedSub.eventTitle})</span>
                <h3 className="text-md font-bold text-white leading-snug">{selectedSub.title}</h3>
                <p className="text-xs text-rose-400 font-mono">"{selectedSub.tagline}"</p>
                <p className="text-xs text-neutral-400 leading-relaxed pt-2">{selectedSub.description}</p>
                
                <div className="flex gap-4 text-xs font-mono pt-3">
                  <a href={selectedSub.githubUrl} target="_blank" no-referrer="true" className="text-purple-400 hover:underline">GitHub Code</a>
                  <a href={selectedSub.demoUrl} target="_blank" no-referrer="true" className="text-purple-400 hover:underline">Product Demo</a>
                </div>
              </div>

              {/* Grading criteria sliders */}
              {gradingSuccess && (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-400 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Grading matrices updated & committed to the hackathon leaderboard!</span>
                </div>
              )}

              <form onSubmit={handleSubmitGrades} className="space-y-4">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-neutral-300">Complexity & Innovation (Weight: 35%)</label>
                      <span className="font-mono font-bold text-rose-400">{innovation}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={innovation}
                      onChange={(e) => setInnovation(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-neutral-300">Visual Styling & Polish (Weight: 25%)</label>
                      <span className="font-mono font-bold text-rose-400">{design}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={design}
                      onChange={(e) => setDesign(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-neutral-300">Code Optimization & Scalability (Weight: 40%)</label>
                      <span className="font-mono font-bold text-rose-400">{technical}/10</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={technical}
                      onChange={(e) => setTechnical(Number(e.target.value))}
                      className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-[9px] font-mono uppercase text-neutral-500">Technical feedback commentary (Deliver to developer)</label>
                  <textarea 
                    rows={3}
                    placeholder="Excellent use of cached vector indices, but look out for concurrent memory locks inside your express routers..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="p-2 w-full bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Commit Grades Score
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-neutral-950 p-10 border border-neutral-900 rounded-xl text-center text-neutral-600">
              No project build has been loaded. Set focus on left list items to score.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
