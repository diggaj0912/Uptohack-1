import React, { useState, useEffect } from "react";
import { Resume, Experience, Education, Project, ATSFeedback, UserCareerState } from "../types";
import { 
  FileText, Plus, Trash2, CheckCircle, AlertOctagon, Sparkles, 
  HelpCircle, Printer, RefreshCw, Send, BookOpen, Briefcase, Award 
} from "lucide-react";

interface ResumeModuleProps {
  onAddXP: (amount: number, skill?: string) => void;
  careerState: UserCareerState;
  onUpdateCareer: (updatedCareer: UserCareerState) => void;
}

export default function ResumeModule({ onAddXP, careerState, onUpdateCareer }: ResumeModuleProps) {
  const [resume, setResume] = useState<Resume>({
    fullName: "",
    email: "",
    phone: "",
    website: "",
    skills: [],
    experience: [],
    education: [],
    projects: []
  });

  const [newSkill, setNewSkill] = useState("");
  const [jobDescription, setJobDescription] = useState("Senior Full-Stack Web Developer");
  
  // Scoring state
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<ATSFeedback | null>(null);

  // Form states for adding items
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduYear, setEduYear] = useState("");

  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTech, setProjTech] = useState("");

  // Load existing profile CV
  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const response = await fetch("/api/resume");
      const data = await response.json();
      if (data) setResume(data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveResume = async (updated: Resume) => {
    setResume(updated);
    try {
      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddField = (type: 'skill' | 'exp' | 'edu' | 'proj') => {
    const updated = { ...resume };
    if (type === "skill" && newSkill.trim()) {
      if (!updated.skills.includes(newSkill.trim())) {
        updated.skills.push(newSkill.trim());
        setNewSkill("");
      }
    } else if (type === "exp" && expCompany && expRole) {
      const newExp: Experience = {
        company: expCompany,
        role: expRole,
        duration: expDuration,
        description: expDesc
      };
      updated.experience.push(newExp);
      setExpCompany(""); setExpRole(""); setExpDuration(""); setExpDesc("");
    } else if (type === "edu" && eduSchool && eduDegree) {
      const newEdu: Education = {
        school: eduSchool,
        degree: eduDegree,
        year: eduYear
      };
      updated.education.push(newEdu);
      setEduSchool(""); setEduDegree(""); setEduYear("");
    } else if (type === "proj" && projName && projDesc) {
      const newProj: Project = {
        name: projName,
        description: projDesc,
        technologies: projTech.split(",").map(t => t.trim()).filter(Boolean)
      };
      updated.projects.push(newProj);
      setProjName(""); setProjDesc(""); setProjTech("");
    }
    saveResume(updated);
  };

  const handleRemoveField = (type: 'skill' | 'exp' | 'edu' | 'proj', index: number) => {
    const updated = { ...resume };
    if (type === "skill") {
      updated.skills.splice(index, 1);
    } else if (type === "exp") {
      updated.experience.splice(index, 1);
    } else if (type === "edu") {
      updated.education.splice(index, 1);
    } else if (type === "proj") {
      updated.projects.splice(index, 1);
    }
    saveResume(updated);
  };

  const runAIScan = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await response.json();
      if (data) {
        setFeedback(data);
        // Reward candidate XP based on ATS Score!
        const xpAwarded = Math.floor(data.score * 2.5);
        
        // Save score update back into career stats tracker
        const updatedSkills = { ...careerState.skillsTracker };
        updatedSkills["ATS Alignment"] = data.score;
        
        const resCarrier = await fetch("/api/user/career/add-xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: xpAwarded, skill: "ATS Alignment" }),
        });
        const finalCareer = await resCarrier.json();
        onUpdateCareer(finalCareer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    if (score >= 60) return "text-blue-400 border-blue-500/20 bg-blue-500/10";
    return "text-amber-400 border-amber-500/20 bg-amber-500/10";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ats-resume-builder-viewport">
      {/* Inputs Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Core Info */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Candidate Persona Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400">FullName</label>
              <input 
                type="text" 
                placeholder="Alex Rivera"
                value={resume.fullName || ""}
                onChange={(e) => saveResume({ ...resume, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400">Email Address</label>
              <input 
                type="email" 
                placeholder="alex.rivera@engineers.io"
                value={resume.email || ""}
                onChange={(e) => saveResume({ ...resume, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400">Phone</label>
              <input 
                type="text" 
                placeholder="+1 (555) 728-1920"
                value={resume.phone || ""}
                onChange={(e) => saveResume({ ...resume, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-neutral-400">Personal Website</label>
              <input 
                type="url" 
                placeholder="https://alexrivera.dev"
                value={resume.website || ""}
                onChange={(e) => saveResume({ ...resume, website: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Core Professional Tech-Stack
          </h3>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Docker, Redis, Kubernetes, React"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddField("skill")}
              className="flex-1 px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-700"
            />
            <button 
              onClick={() => handleAddField("skill")}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-lg hover:bg-neutral-750"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {resume.skills?.map((skill, idx) => (
              <span 
                key={idx} 
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded bg-neutral-950 border border-neutral-800 text-neutral-300"
              >
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleRemoveField("skill", idx)}
                  className="p-0.5 rounded text-neutral-500 hover:text-white hover:bg-neutral-800"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Professional Experience */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Engineering & Commercial Experience
          </h3>

          <div className="space-y-4 p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Company e.g. Vercel" 
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Role e.g. Staff Architect" 
                value={expRole}
                onChange={(e) => setExpRole(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Duration e.g. 2024 - Present" 
                value={expDuration}
                onChange={(e) => setExpDuration(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
              />
            </div>
            <textarea 
              rows={3}
              placeholder="Responsibilities and concrete accomplishments. Detail quantitative performance metrics (e.g., 'reduced render delays by 34%')."
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full p-3 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none resize-none"
            />
            <button
              onClick={() => handleAddField("exp")}
              className="flex items-center justify-center gap-1 w-full py-2 border border-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold bg-neutral-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              Prepend Experience Point
            </button>
          </div>

          <div className="space-y-3">
            {resume.experience?.map((exp, idx) => (
              <div key={idx} className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{exp.company}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">{exp.duration}</span>
                  </div>
                  <span className="text-xs text-emerald-400 block mb-1.5">{exp.role}</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">{exp.description}</p>
                </div>
                <button 
                  onClick={() => handleRemoveField("exp", idx)}
                  className="p-1 rounded text-neutral-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Credentials */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Academic Credentials
          </h3>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-neutral-950/40 border border-neutral-800">
            <input 
              type="text" 
              placeholder="School" 
              value={eduSchool}
              onChange={(e) => setEduSchool(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white"
            />
            <input 
              type="text" 
              placeholder="Degree" 
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white"
            />
            <input 
              type="text" 
              placeholder="Year" 
              value={eduYear}
              onChange={(e) => setEduYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white"
            />
            <button
              onClick={() => handleAddField("edu")}
              className="col-span-3 flex items-center justify-center gap-1 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs rounded-lg mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Confirm Academic Entry
            </button>
          </div>

          <div className="space-y-2">
            {resume.education?.map((edu, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{edu.school}</span>
                  <span className="text-neutral-400 text-xs block">{edu.degree} ({edu.year})</span>
                </div>
                <button 
                  onClick={() => handleRemoveField("edu", idx)}
                  className="p-1 rounded text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Engineering Portfolios & Open-Source
          </h3>

          <div className="space-y-2 p-3 bg-neutral-950/40 border border-neutral-800 rounded-xl">
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Project Name" 
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-lg"
              />
              <input 
                type="text" 
                placeholder="Tech Tags (comma separated)" 
                value={projTech}
                onChange={(e) => setProjTech(e.target.value)}
                className="px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-lg"
              />
            </div>
            <textarea 
              rows={2} 
              placeholder="Technical architecture details and results"
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full p-2.5 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-lg resize-none focus:outline-none"
            />
            <button
              onClick={() => handleAddField("proj")}
              className="flex items-center justify-center gap-1 w-full py-1.5 bg-neutral-800 text-neutral-200 text-xs rounded-lg font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Append Project
            </button>
          </div>

          <div className="space-y-3">
            {resume.projects?.map((proj, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{proj.name}</span>
                    <div className="flex gap-1 flex-wrap">
                      {proj.technologies?.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">{proj.description}</p>
                </div>
                <button 
                  onClick={() => handleRemoveField("proj", idx)}
                  className="p-1 rounded text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outputs / Grading Sidebar Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* ATS Auditor Model Action Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
          
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            ATS AI Audit Engine
          </h3>
          
          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
            Upload details to evaluate your profile metrics. Our advanced models analyze vocabulary density, job role relevancy, and provide detailed structural suggestions.
          </p>

          <div className="space-y-3 mb-4">
            <label className="text-[10px] uppercase font-mono text-neutral-400 block">Target Corporate Position</label>
            <input 
              type="text" 
              placeholder="e.g. Frontend Engineer at Stripe"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
            />
          </div>

          <button
            onClick={runAIScan}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-bold rounded-xl transition shadow-lg disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                Running LLM Audit...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-neutral-950" />
                Audit CV Profile (+XP)
              </>
            )}
          </button>
        </div>

        {/* ATS Score and Feedbacks Output Box */}
        {feedback ? (
          <div className="p-5 rounded-xl bg-neutral-900 bg-neutral-900/60 border border-neutral-800 space-y-5 animate-fade-in">
            {/* Score circle layout */}
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 shrink-0 border-2 rounded-full flex flex-col items-center justify-center font-mono ${getScoreColor(feedback.score)}`}>
                <span className="text-2xl font-bold font-mono">{feedback.score}</span>
                <span className="text-[9px] uppercase text-neutral-400">Score</span>
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-400">Scan Complete</span>
                <h4 className="text-sm font-bold text-white mb-1">ATS Matching Summary</h4>
                <p className="text-[11px] text-neutral-400 leading-normal">{feedback.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Verified Keywords Matches ({feedback.strengths?.length || 0})
              </span>
              <ul className="space-y-1 pl-1">
                {feedback.strengths?.map((str, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 shrink-0 select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-medium text-amber-400 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                Detected Industry Gaps ({feedback.weaknesses?.length || 0})
              </span>
              <ul className="space-y-1 pl-1">
                {feedback.weaknesses?.map((weak, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                    <span className="text-amber-500 shrink-0 select-none">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="space-y-1.5 border-t border-neutral-800/80 pt-3">
              <span className="text-[10px] uppercase font-mono font-medium text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Recommended Performance Actions
              </span>
              <ul className="space-y-1 pl-1">
                {feedback.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-1.5">
                    <span className="text-blue-500 shrink-0 select-none">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 p-6 rounded-xl bg-neutral-900/20 border border-neutral-850 text-neutral-500">
            <HelpCircle className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
            <span className="block text-sm mb-1 text-neutral-400">Score Pending</span>
            <span className="text-xs">Customize your profiles on the left, then trigger our AI Auditor to calculate match metrics.</span>
          </div>
        )}

        {/* Printable typo CV sandbox */}
        <div className="p-6 bg-white rounded-xl shadow-xl border border-neutral-200">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-neutral-100">
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Interactive CV Template Format</span>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 py-1 text-neutral-600 hover:text-black border border-neutral-200 rounded hover:bg-neutral-50 text-[10px] font-medium"
            >
              <Printer className="w-3 h-3" />
              Download Layout
            </button>
          </div>

          <div className="text-center pb-5 border-b border-neutral-100">
            <h1 className="text-lg font-bold text-neutral-900 uppercase tracking-tight">{resume.fullName || "Candidate FullName"}</h1>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[9px] text-neutral-500 mt-1">
              <span>{resume.email || "email@domain.com"}</span>
              <span>•</span>
              <span>{resume.phone || "(555) 000-0000"}</span>
              {resume.website && (
                <>
                  <span>•</span>
                  <span>{resume.website}</span>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 py-4 font-sans text-left">
            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-neutral-900 uppercase border-b border-neutral-100 pb-0.5 mb-1.5 tracking-wider">Expertise Tech Stack</h5>
                <p className="text-[10px] text-neutral-700 leading-normal leading-relaxed">
                  {resume.skills.join(", ")}
                </p>
              </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-neutral-900 uppercase border-b border-neutral-100 pb-0.5 mb-2.5 tracking-wider">Professional Chronology</h5>
                <div className="space-y-3">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-900">{exp.company} — <span className="text-neutral-500 font-normal italic">{exp.role}</span></span>
                        <span className="text-[9px] font-mono text-neutral-500 italic">{exp.duration}</span>
                      </div>
                      <p className="text-[9.5px] text-neutral-600 leading-normal font-sans pr-2">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-neutral-900 uppercase border-b border-neutral-100 pb-0.5 mb-2.5 tracking-wider">Open-Source Portfolio Contributions</h5>
                <div className="space-y-2">
                  {resume.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-neutral-950">{proj.name}</span>
                        <span className="text-[8px] font-mono font-medium px-1 bg-neutral-100 text-neutral-500 rounded">{proj.technologies?.join(", ")}</span>
                      </div>
                      <p className="text-[9.5px] text-neutral-600 leading-normal">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-neutral-900 uppercase border-b border-neutral-100 pb-0.5 mb-1.5 tracking-wider">Education</h5>
                <div className="space-y-1.5">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[9.5px] text-neutral-750">
                      <span className="font-bold">{edu.school}</span>
                      <span className="text-neutral-500 italic">{edu.degree} ({edu.year})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
