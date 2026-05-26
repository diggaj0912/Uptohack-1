import React, { useState, useEffect } from "react";
import { InterviewFeedback, InterviewQuestion } from "../types";
import { 
  Sparkles, Send, Mic, Play, ChevronRight, Award, 
  HelpCircle, CheckCircle, Brain, User, AlertCircle, RefreshCw
} from "lucide-react";

interface InterviewerModuleProps {
  onAddXP: (amount: number, skill?: string) => void;
}

export default function InterviewerModule({ onAddXP }: InterviewerModuleProps) {
  const [role, setRole] = useState("Web Frontend Engineering");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [history, setHistory] = useState<Record<string, { answer: string; feedback: InterviewFeedback }>>({});
  const [micActive, setMicActive] = useState(false);
  const [simulatedText, setSimulatedText] = useState("");
  const [playingVoice, setPlayingVoice] = useState(false);

  const handleSpeakQuestion = async (text: string) => {
    setPlayingVoice(true);
    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "Kore" })
      });
      const data = await response.json();
      if (data && data.audio && data.audio !== "MOCK_AUDIO_BASE64_STREAM_DATA") {
        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error("Audio block playback issue", e));
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
        } else {
          alert("Audio playback simulation executed.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPlayingVoice(false);
    }
  };

  const roles = [
    { name: "Web Frontend Engineering", track: "Full-Stack Web" },
    { name: "Backend & Cloud Architect", track: "System Design" },
    { name: "AI Software Systems", track: "AI Integration" }
  ];

  useEffect(() => {
    loadQuestions();
  }, [role]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await fetch(`/api/interview/questions/${encodeURIComponent(role)}`);
      const data = await response.json();
      if (data) {
        setQuestions(data);
        setCurrentIndex(0);
        setCurrentAnswer("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSimulateSpeech = () => {
    setMicActive(true);
    let phrases = [
      "To optimize a high-traffic websocket dashboard, we must introduce throttle handlers. Rendering should be batched inside dynamic requestAnimationFrame request ticks, ensuring the main browser thread doesn't choke during high-concurrency event loops.",
      "In Node environments, the cluster mode spawns multiple instances of the V8 engine sharing the same network ports. Unlike serverless models, clusters run stateful background memory scopes in-process, needing structured balancer layers.",
      "A secure server-side proxy protects secrets by stripping header credentials and proxying traffic downstream. We can run token bucket rate-limit rules, shielding our upstream Gemini endpoints from credential extraction and abuse."
    ];
    let phrase = phrases[currentIndex % phrases.length];
    
    // Simulate typing text over 2.5 seconds to feel highly dynamic
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < phrase.length) {
        currentText += phrase.charAt(i);
        setCurrentAnswer(currentText);
        i += 4; // type fast
      } else {
        clearInterval(interval);
        setMicActive(false);
      }
    }, 40);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !questions[currentIndex]) return;
    setSubmittingAnswer(true);
    
    const currentQ = questions[currentIndex];
    try {
      const response = await fetch("/api/interview/score-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.question,
          answer: currentAnswer,
          role: role
        }),
      });
      const feedbackData: InterviewFeedback = await response.json();
      if (feedbackData) {
        setHistory({
          ...history,
          [currentQ.id]: {
            answer: currentAnswer,
            feedback: feedbackData
          }
        });
        // Boost career tracker and user achievements via parent
        const activeTrack = roles.find(r => r.name === role)?.track || "TypeScript & Refactoring";
        onAddXP(150, activeTrack);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const currentQ = questions[currentIndex];
  const hasFeedback = currentQ && history[currentQ.id];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-interview-module-frame">
      {/* Role Selection & History Column */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" />
            Interview Target Tracks
          </h3>

          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r.name}
                onClick={() => setRole(r.name)}
                className={`w-full text-left p-3 rounded-lg text-xs font-semibold transition border ${
                  role === r.name 
                    ? "bg-neutral-800 border-neutral-700 text-white" 
                    : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white"
                }`}
              >
                <span>{r.name}</span>
                <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">{r.track} focus</span>
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Board */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono mb-4">
            Pre-evaluation Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Total Solved</span>
              <span className="font-mono text-white font-bold">{Object.keys(history).length} / {questions.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Target Role</span>
              <span className="font-mono text-emerald-400 font-bold max-w-[120px] truncate">{role}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Live Feedback</span>
              <span className="font-mono text-neutral-500">Gemini 3.5 Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas Column */}
      <div className="lg:col-span-8 space-y-6">
        {loadingQuestions ? (
          <div className="p-8 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-neutral-400">Connecting specialized technical models...</p>
            </div>
          </div>
        ) : currentQ ? (
          <div className="space-y-6 animate-fade-in">
            {/* Interviewer Question Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-950 border border-neutral-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider font-bold rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase">
                  Technical Question {currentIndex + 1} of {questions.length}
                </span>

                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {currentQ.difficulty} Mode
                </span>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-neutral-200 uppercase font-mono tracking-wide">
                      NexStart Board-CTO
                    </h4>
                    <button
                      onClick={() => handleSpeakQuestion(currentQ.question)}
                      disabled={playingVoice}
                      className="px-2 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      {playingVoice ? "Converting Speech..." : "Listen to CTO Prompt (AI Voice)"}
                    </button>
                  </div>
                  <p className="text-base font-bold text-white leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Board */}
            {!hasFeedback ? (
              <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-neutral-400" />
                    Enter Technical Response Pitch
                  </span>

                  <button
                    onClick={handleSimulateSpeech}
                    disabled={micActive}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold border border-emerald-500/25 px-2 py-1 rounded bg-emerald-500/5 hover:bg-emerald-500/10 animate-pulse disabled:opacity-50 transition"
                  >
                    <Mic className={`w-3 h-3 ${micActive ? "animate-pulse" : ""}`} />
                    Simulate Tech Speech
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Explain structural frameworks, performance tradeoffs, and architectural metrics. Be specific."
                  className="w-full p-4 text-xs font-sans bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 resize-none font-mono"
                />

                <div className="flex justify-end pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !currentAnswer.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition shadow disabled:opacity-50"
                  >
                    {submittingAnswer ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Calculating Rigor Score...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-neutral-950" />
                        Submit Pitch (+XP)
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Review Results layout */
              <div className="space-y-4 p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 animate-fade-in">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    CTO-Rigor Grading Results
                  </h4>

                  <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${getScoreColor(history[currentQ.id].feedback.score)}`}>
                    Score: {history[currentQ.id].feedback.score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Highlight */}
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block mb-1">
                      Strengths Overview
                    </span>
                    <p className="text-xs text-neutral-300 leading-normal">
                      {history[currentQ.id].feedback.strength}
                    </p>
                  </div>

                  {/* Weaknesses critique */}
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block mb-1">
                      Improvement Gaps
                    </span>
                    <p className="text-xs text-neutral-300 leading-normal">
                      {history[currentQ.id].feedback.weakness}
                    </p>
                  </div>
                </div>

                {/* Optimistic Reference Source code */}
                <div className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase font-mono tracking-wider">
                    <Brain className="w-4 h-4 text-blue-400" />
                    Ideal Technical Reference Solution
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-neutral-300 font-sans italic pr-2">
                    {history[currentQ.id].feedback.suggestedAnswer}
                  </p>
                </div>

                {/* Foot control */}
                <div className="flex justify-between items-center pt-4 border-t border-neutral-800/60">
                  <button
                    onClick={() => {
                      // reset and allow re-try
                      const updatedHistory = { ...history };
                      delete updatedHistory[currentQ.id];
                      setHistory(updatedHistory);
                      setCurrentAnswer("");
                    }}
                    className="text-[10px] text-neutral-400 hover:text-white underline font-mono font-bold"
                  >
                    Re-attempt Question
                  </button>

                  <button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        setCurrentAnswer("");
                      } else {
                        // All complete
                        onAddXP(300); // Complete set award
                        alert("Congratulations! You completed the full track simulation. XP awarded.");
                        setCurrentIndex(0);
                        setHistory({});
                        setCurrentAnswer("");
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-white rounded-lg text-xs font-semibold font-sans"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Technical Prompt
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      "Reset Entire Module Loop"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-900/20 border border-neutral-800 rounded-xl text-neutral-500">
            <Brain className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
            <span className="block text-sm mb-1 text-neutral-400">Model Initializing...</span>
            <span className="text-xs">Adjust your track parameters inside target boards block to fetch models.</span>
          </div>
        )}
      </div>
    </div>
  );
}
