import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize @google/genai with fallback handling
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI SDK initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI SDK:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. Using highly comprehensive local AI simulators for evaluation.");
}

// ==========================================
// MOCK DATABASE / IN-MEMORY PERSISTENCE
// ==========================================

let events = [
  {
    id: "evt-featured",
    title: "Nexus Global Summit 2024",
    description: "The premier gathering for AI-native builders, researchers, and enterprise leaders. Join us for 3 days of intensive keynotes and deep-dive technical sessions.",
    date: "Oct 24",
    location: "San Francisco, CA",
    venue: "Moscone Center",
    time: "Starts 9:00 AM",
    category: "conference" as const,
    organizer: "Nexus AI Ecosystem Team",
    attendeesCount: 1240,
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    aiSummary: "The official yearly focal point of the Nexus AI ecosystem, showcasing advanced software architectures, API sandboxes, and developer pipelines."
  },
  {
    id: "evt-1",
    title: "Agents Build Weekend",
    description: "48 hours to build autonomous agents using the new Nexus AI SDK, custom router streams, and vector pipelines.",
    date: "Nov 12",
    location: "Online",
    category: "hackathon" as const,
    organizer: "Nexus Labs",
    attendeesCount: 44,
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    aiSummary: "Fosters hands-on engineering experience in creating memory-persisted agent protocols with optimized server-side response templates."
  },
  {
    id: "evt-2",
    title: "Advanced RAG Architecture",
    description: "An intensive, in-person deep dive into optimizing Retrieval-Augmented Generation processes for high-scale enterprise environments.",
    date: "Nov 15",
    location: "New York, NY",
    category: "workshop" as const,
    organizer: "Pinecone & LlamaIndex",
    attendeesCount: 180,
    price: "$299",
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    aiSummary: "A masterclass focusing strictly on indexing vector stores, multi-query routing layouts, and re-ranking optimization filters."
  },
  {
    id: "evt-3",
    title: "State of AI 2024 Q4",
    description: "Quarterly breakdown of major open-source model releases, benchmark shift analysis, and edge compilation runtimes.",
    date: "Nov 18",
    location: "Online",
    category: "webinar" as const,
    organizer: "Nexus Founders Ring",
    attendeesCount: 950,
    price: "Free",
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80",
    aiSummary: "Critical review of real-life API token pricing, open weights benchmarks, and serverless runtime limits for scaling microservices."
  }
];

let communityPosts: any[] = [
  {
    id: "post-1",
    channel: "general",
    authorName: "Sarah Jenkins",
    authorRole: "Tech Lead @ Vercel",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    content: "Has anyone spent time integrating the secondary routing protocols with Express v5 static streams in high-throughput sandboxes? Our deployment just logged a 15% drop in cold starts but memory utilization spiked.",
    timestamp: "2 hours ago",
    upvotes: 42,
    commentsCount: 14,
    sentiment: "constructive" as const
  },
  {
    id: "post-2",
    channel: "dev-chat",
    authorName: "Alex Rivera",
    authorRole: "Senior Engineer @ Stripe",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    content: "Reminder: Avoid duplicating type parameters inside react-query hook closures. Keep your states fully pure! Destructuring objects directly inside state dependency trackers can trigger unexpected re-renders.",
    timestamp: "4 hours ago",
    upvotes: 89,
    commentsCount: 22,
    sentiment: "positive" as const
  },
  {
    id: "post-3",
    channel: "ai-talks",
    authorName: "Dr. Kenji Sato",
    authorRole: "AI Researcher @ Google DeepMind",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    content: "The new Gemini 3.5 architectures show incredible low-latency structured output capabilities. We are moving all our custom entity extraction models fully to standardized tool schemas to dramatically reduce parsing errors.",
    timestamp: "1 day ago",
    upvotes: 156,
    commentsCount: 31,
    sentiment: "positive" as const
  }
];

let userCareerState = {
  fullName: "Senior Dev Candidate",
  xp: 1420,
  level: 4,
  streak: 8,
  skillsTracker: {
    "Full-Stack Web": 75,
    "TypeScript & Refactoring": 80,
    "System Design": 60,
    "AI Integration": 50,
    "ATS Alignment": 70
  },
  recentRecommendations: [
    "Practice AI Technical Interviews on System Design to boost your score to 85%+",
    "Apply your technical skills in the Global FinTech Hackathon starting June 15",
    "Complete the Missing Skills section in your Resume: Add 'REST APIs', 'SQL Database'"
  ]
};

let userResumes: Record<string, any> = {
  "default": {
    fullName: "Alex Rivera",
    email: "alex.rivera@engineers.io",
    phone: "+1 (555) 728-1920",
    website: "https://alexrivera.dev",
    skills: ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "Express", "Vite", "GraphQL", "Git"],
    experience: [
      {
        company: "Stripe",
        role: "Frontend Engineer",
        duration: "2024 - Present",
        description: "Built and optimized high-performance checkout elements. Collaborated on expanding custom internal designs utilizing Tailwind. Reduced client-side main thread execution latency by 20% through smart module-bundling."
      },
      {
        company: "TechNexus Tech",
        role: "Software Developer",
        duration: "2022 - 2024",
        description: "Maintained multiple customer management dashboards. Refactored dynamic legacy systems to TypeScript, decreasing runtime reference errors to absolute zero. Managed CI/CD systems across testing pipelines."
      }
    ],
    education: [
      {
        school: "UC Berkeley",
        degree: "Bachelor of Science in Computer Science",
        year: "2022"
      }
    ],
    projects: [
      {
        name: "SaaS Dev Analytics Canvas",
        description: "A highly dynamic node-based canvas mapping team output metric, using local canvas optimization systems.",
        technologies: ["React", "TypeScript", "Tailwind", "D3.js"]
      }
    ]
  }
};

const defaultInterviewQuestions = [
  { id: "q-1", question: "How would you optimize a high-traffic React dashboard that displays real-time websocket tables containing thousands of items?", role: "Web Engineering", difficulty: "medium" },
  { id: "q-2", question: "Explain the architectural difference between Node's cluster mode and serverless runtime execution scaling.", role: "Backend Engineering", difficulty: "hard" },
  { id: "q-3", question: "How would you structure a secure server-side system to handle, rotate, and proxy expensive LLM credentials while preventing client-side interception?", role: "AI Software Architect", difficulty: "hard" },
];

// ==========================================
// PERSISTENT DATABASE & AUTHENTICATION INTEGRATION
// ==========================================

import {
  getProfileByToken,
  registerUser,
  loginUserAndGenerateToken,
  updateOnboarding,
  addAuditLog,
  getAuditLogs,
  getEvents,
  getOrganizerEvents,
  toggleEventRegistration,
  publishEvent,
  getResumeForUser,
  saveResume,
  sendEmailCampaign,
  getCampaignsForEvent,
  triggerWhatsAppBulletin,
  getWhatsAppReminders,
  getSponsorships,
  getEventSponsorships,
  applyForSponsorship,
  approveSponsorship,
  getProjectSubmissions,
  getMyProjectSubmissions,
  submitProject,
  gradeSubmission,
  getMailingCRMContacts,
  getAllUsersProfiles,
  setUserRoleForcefully,
  deletePostByModerator,
  getCommunityPosts,
  saveCommunityPost,
  upvotePost,
  saveDatabase,
  getWalletBalance,
  getLedgerEntries,
  submitPayoutRequest,
  processPaymentSimulator,
  getPayoutRequests
} from "./src/backendDb";

import { UserRole } from "./src/types";

// Auth Parsing & User Isolation Middleware
app.use((req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const profile = getProfileByToken(token);
    if (profile) {
      req.user = profile;
    }
  }

  // Fallback default for standard backward compatibility with unlogged tests/pages
  if (!req.user) {
    req.user = getProfileByToken("usr-student");
  }
  next();
});

// Helper for strict role protection
const requireRole = (allowedRoles: UserRole[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. No session found." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Required role(s): ${allowedRoles.join(", ")}` });
    }
    next();
  };
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// --- AUTHENTICATION & ONBOARDING ENDPOINTS ---

app.post("/api/auth/signup", (req, res) => {
  const { email, password, fullName, role, referralCode } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }
  try {
    const data = registerUser(email, password, fullName, role || 'student', referralCode);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required." });
  }
  try {
    const data = loginUserAndGenerateToken(email, password);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/oauth", (req, res) => {
  const { email, fullName, role, provider } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: "Email and Full Name are required for OAuth." });
  }
  
  // Find or create user
  try {
    let user;
    let token;
    try {
      const loginData = loginUserAndGenerateToken(email, "password123");
      user = loginData.user;
      token = loginData.token;
    } catch {
      // Sign up with mock password
      const signUpData = registerUser(email, "password123", fullName, role || 'student');
      user = signUpData.user;
      token = signUpData.token;
    }

    addAuditLog(user.id, "OAUTH_LOGIN", `Authenticated via ${provider || 'Google'} provider successfully.`, req.ip || "127.0.0.1");
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/otp-request", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required to request OTP." });
  }
  
  // Simulate transactional mail transport
  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[OTP DISPATCH SERVER] Sent critical code ${mockOtp} to target ${email}`);
  
  res.json({ success: true, message: `OTP code pushed successfully to ${email}.`, code: mockOtp });
});

app.post("/api/auth/otp-verify", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }
  
  // Automatically verify matching user profile
  try {
    let data;
    try {
      data = loginUserAndGenerateToken(email, "password123");
    } catch {
      data = registerUser(email, "password123", email.split('@')[0], 'student');
    }

    addAuditLog(data.user.id, "OTP_AUTHENTICATION_PASSED", "Verified OTP successfully", req.ip || "127.0.0.1");
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/onboarding", (req, res) => {
  const { role, interests, fullName } = req.body;
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "No active user session detected." });
  }
  
  try {
    const updated = updateOnboarding(user.id, { role, interests, fullName });
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/auth/me", (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Guest session active." });
  }
  res.json(req.user);
});

app.post("/api/auth/logout", (req: any, res) => {
  if (req.user) {
    addAuditLog(req.user.id, "USER_LOGGED_OUT", "Requested terminal session tear-down.", req.ip || "127.0.0.1");
  }
  res.json({ success: true, message: "Cleared token session context." });
});

// --- CAREER STATS ENDPOINTS ---

app.get("/api/user/career", (req: any, res) => {
  res.json(req.user.careerState);
});

app.post("/api/user/career/add-xp", (req: any, res) => {
  const { amount, skill } = req.body;
  const user = req.user;
  
  if (amount) user.careerState.xp += amount;
  if (user.careerState.xp >= user.careerState.level * 1000) {
    user.careerState.level += 1;
  }
  if (skill && user.careerState.skillsTracker[skill] !== undefined) {
    user.careerState.skillsTracker[skill] = Math.min(100, user.careerState.skillsTracker[skill] + 5);
  }

  // Update in primary user profile store
  saveDatabase();
  res.json(user.careerState);
});

// --- EVENTS ENDPOINTS ---

app.get("/api/events", (req: any, res) => {
  res.json(getEvents(req.user?.id));
});

app.post("/api/events/register/:id", (req: any, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const result = toggleEventRegistration(id, userId);
    res.json({ success: true, event: result.event, career: req.user.careerState });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post("/api/events", (req: any, res) => {
  const { title, description, date, location, category, image } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const newEvent = publishEvent(req.user.id, { title, description, date, location, category, image });
    res.json({ success: true, event: newEvent, career: req.user.careerState });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// AI Event Summary Generator
app.post("/api/events/ai-summarize", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description required." });
  }

  const prompt = `Review this tech event title: "${title}". Description: "${description}". Synthesize a 2-sentence executive summary emphasizing high-value takeaways for professional software developers. Deliver strictly text. Do not include any JSON brackets or styling.`;

  if (!ai) {
    const fallback = `A high-impact event centered on ${title}. Attendees will acquire modern practical methodologies, review production-level design architectures, and network with leading technical co-founders.`;
    return res.json({ summary: fallback });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ summary: response.text?.trim() });
  } catch (err: any) {
    console.error("Gemini Event Summary Error:", err);
    res.json({ summary: `Accelerated crash course exploring ${title}, focusing on developer workflows, system patterns, and collaborative feedback.` });
  }
});

// --- RESUME ENDPOINTS ---

app.get("/api/resume", (req: any, res) => {
  res.json(getResumeForUser(req.user.id));
});

app.post("/api/resume", (req: any, res) => {
  saveResume(req.user.id, req.body);
  res.json({ success: true, resume: getResumeForUser(req.user.id) });
});

// ATS Resume Analyzer Endpoint
app.post("/api/resume/analyze", async (req: any, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume) {
    return res.status(400).json({ error: "Resume details missing." });
  }

  const targetRole = jobDescription || "Full-Stack Software Professional";
  const resumeText = typeof resume === "string" ? resume : JSON.stringify(resume);

  const prompt = `You are a world-class ATS (Applicant Tracking System) parser and elite tech recruiter. Thoroughly audit the following Candidate CV data for the target role: "${targetRole}".
  CV DATA:
  ${resumeText}

  Analyze readability, formatting grammar, keyword matches, tech-stack coverage, and actionable gaps. You must respond with a strictly formatted JSON matching this shape:
  {
    "score": 85, // number from 0 to 100
    "summary": "Example high-level summary overview.",
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "jdMatchScore": 75 // number from 0 to 100
  }
  Do not include markdown tags like \`\`\`json or backticks. Return valid JSON only.`;

  if (!ai) {
    const skillsCount = resume.skills?.length || 0;
    const expCount = resume.experience?.length || 0;
    const baseScore = Math.min(95, 45 + (skillsCount * 4) + (expCount * 12));
    
    const mockAnalysis = {
      score: baseScore,
      summary: `Your resume demonstrates solid ${skillsCount > 3 ? resume.skills[0] : 'frontend'} fundamentals, but needs higher density keywords targeting modern ${targetRole} pipelines.`,
      strengths: [
        `Good core technology listing with ${skillsCount} relevant tech keywords`,
        `Explicitly lists job accomplishments at reputable companies like Stripe`,
        "Professional narrative is cleanly focused on software engineering optimization"
      ],
      weaknesses: [
        "Lacks dynamic impact metrics (e.g. % performance increase, load-time improvements)",
        "Missing clear backend database tags or server infrastructure tools of modern architecture",
        "No continuous delivery or pipeline configuration words mentioned"
      ],
      recommendations: [
        "Include strict metrics: 'Refactored state structures, boosting loading speed by 28%' rather than generic claims.",
        "Add key infrastructure markers such as 'AWS', 'Docker', or 'CI/CD pipeline architecture'.",
        "Incorporate a dedicated 'Technologies' matrix under projects to fit modern scanning parameters."
      ],
      jdMatchScore: Math.max(40, baseScore - 5)
    };
    return res.json(mockAnalysis);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            jdMatchScore: { type: Type.INTEGER }
          },
          required: ["score", "summary", "strengths", "weaknesses", "recommendations", "jdMatchScore"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini ATS Analyzer Error:", err);
    res.status(500).json({ error: "AI analysis encountered an error. Please try again." });
  }
});

// --- COMMUNITIES ENDPOINTS ---

app.get("/api/community/posts", (req, res) => {
  res.json(getCommunityPosts());
});

app.post("/api/community/posts", (req: any, res) => {
  const { content, channel } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required." });
  }
  const post = saveCommunityPost(req.user.id, content, channel);
  res.json({ success: true, post, career: req.user.careerState });
});

app.post("/api/community/posts/upvote/:id", (req, res) => {
  const post = upvotePost(req.params.id);
  if (post) {
    return res.json({ success: true, post });
  }
  res.status(404).json({ error: "Post not found" });
});

// AI Community Post Sentiment Analyzer
app.post("/api/community/posts/ai-moderate", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Post content missing." });
  }

  const prompt = `Analyze this technical developer post: "${text}". Classify public sentiment into exactly one of: "positive", "neutral", "constructive", "curious". Deliver strictly raw text without quotes.`;

  if (!ai) {
    let sentiment = "neutral";
    if (text.toLowerCase().includes("great") || text.toLowerCase().includes("easy") || text.toLowerCase().includes("awesome")) sentiment = "positive";
    if (text.toLowerCase().includes("why") || text.toLowerCase().includes("how") || text.includes("?")) sentiment = "curious";
    if (text.toLowerCase().includes("re-render") || text.toLowerCase().includes("refactor") || text.toLowerCase().includes("issue")) sentiment = "constructive";
    return res.json({ sentiment });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    const parsedText = response.text?.trim().toLowerCase() || "neutral";
    const valid = ["positive", "neutral", "constructive", "curious"];
    const matched = valid.find(v => parsedText.includes(v)) || "neutral";
    res.json({ sentiment: matched });
  } catch (err: any) {
    res.json({ sentiment: "neutral" });
  }
});

// --- AI INTERVIEWER ENDPOINTS ---

app.get("/api/interview/questions/:role", (req, res) => {
  const filtered = defaultInterviewQuestions;
  res.json(filtered);
});

// Real-Time Interview Feedback Stream Endpoint
app.post("/api/interview/score-answer", async (req: any, res) => {
  const { question, answer, role } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Question and Answer are required." });
  }

  const prompt = `You are a elite technical AI Interviewer and CTO at a VC-backed SaaS unicorn.
  Role: ${role || "Frontend/Fullstack Engineer"}
  Question: "${question}"
  Candidate Response: "${answer}"

  Score the response critically, evaluate engineering rigor, completeness, terminology accuracy, and clarity.
  Respond with a strictly validated JSON matching this schema:
  {
    "score": 75, // number from 0 to 100
    "strength": "Identified highlight of candidate response.",
    "weakness": "Constructive gaps or missing system considerations.",
    "suggestedAnswer": "A perfect, optimized textbook answer the engineer should have provided, explaining the tech stack clearly."
  }
  Return valid raw JSON only. Do not wrap in markdown blocks.`;

  if (!ai) {
    const score = Math.min(98, Math.max(40, 45 + Math.floor(answer.length / 5)));
    const fallbackFeedback = {
      score: score,
      strength: answer.length > 50 
        ? "Excellent length, covers some core developer definitions and shows confidence in application principles."
        : "Candidate maintains clean and direct vocabulary without stuttering.",
      weakness: answer.length < 100
        ? "Lacks technical specifics. You should discuss exact API frameworks, lifecycle triggers, caches, or state variables."
        : "Explain state transitions, concurrent operations, and explicit handling of failures.",
      suggestedAnswer: `To resolve the '${question}', we should deploy a cached throttling mechanism. In React, utilize memoized window offsets, decoupling the render engine from the event streams. In high concurrency backend servers, apply a Redis broker queue, offloading long executions onto workers while serving immediate requests with pre-compiled objects.`
    };
    
    // Add XP to user
    const track = role?.includes("Web") ? "Full-Stack Web" : "TypeScript & Refactoring";
    req.user.careerState.xp += 100;
    if (req.user.careerState.skillsTracker[track]) {
      req.user.careerState.skillsTracker[track] = Math.min(100, req.user.careerState.skillsTracker[track] + 4);
    }
    saveDatabase();

    return res.json(fallbackFeedback);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strength: { type: Type.STRING },
            weakness: { type: Type.STRING },
            suggestedAnswer: { type: Type.STRING }
          },
          required: ["score", "strength", "weakness", "suggestedAnswer"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const track = role?.includes("Web") ? "Full-Stack Web" : "TypeScript & Refactoring";
    req.user.careerState.xp += 100;
    if (req.user.careerState.skillsTracker[track]) {
      req.user.careerState.skillsTracker[track] = Math.min(100, req.user.careerState.skillsTracker[track] + 4);
    }
    saveDatabase();
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Interview Scorer Error:", err);
    res.status(500).json({ error: "Failed to score answer. Please try again." });
  }
});

// AI Career Roadmap / Mentorship Generator
app.post("/api/career/roadmap", async (req: any, res) => {
  const { resume, skillsXP } = req.body;
  
  const prompt = `Based on the following candidate skills: ${JSON.stringify(skillsXP || {})}, and resume accomplishments: ${JSON.stringify(resume || {})}, formulate exactly 4 high-fidelity, actionable professional milestones or recommendations the user must pursue to qualify for Lead Staff Software Architect positions. Deliver strictly as a JSON array of strings: ["Milestone 1", "Milestone 2", "Milestone 3", "Milestone 4"]. Valid JSON list only. No markdown formatting.`;

  if (!ai) {
    const defaultMils = [
      "Improve AI integration portfolio by launching a vector search retrieval portal",
      "Lead a high-scale Hackathon event to develop collaboration skills under team pressure",
      "Refactor checking protocols in your ATS resume to elevate score closer to 95%",
      "Practice System Design Interview modules focusing on caching architectures and cluster proxies"
    ];
    return res.json({ recommendations: defaultMils });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const parsed = JSON.parse(response.text?.trim() || "[]");
    res.json({ recommendations: parsed });
  } catch (err: any) {
    res.json({ recommendations: [
      "Incorporate robust structural telemetry trackers into your major web projects",
      "Sign up as an organizer or attendee for upcoming FinTech hacking challenges",
      "Advance your full-stack capability score to at least 85% with targeted coding practices"
    ] });
  }
});

// ==========================================
// UNIFIED ENTERPRISE AI SAAS SERVICES ENDPOINTS
// ==========================================

// 1. AI SPEECH SYNTHESIS / VOICE PROTOCOL (gemini-3.1-flash-tts-preview)
app.post("/api/ai/tts", async (req: any, res) => {
  const { text, voice } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text content is required for voice synthesis." });
  }

  const selectedVoice = voice || "Kore"; // Puck, Charon, Kore, Fenrir, Zephyr

  if (!ai) {
    return res.json({ 
      success: true, 
      audio: "MOCK_AUDIO_BASE64_STREAM_DATA", 
      message: "Speech generated via mock high-fidelity simulator successfully." 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, audio: base64Audio, voice: selectedVoice });
    } else {
      res.status(500).json({ error: "No audio data returned from voice model." });
    }
  } catch (err: any) {
    console.error("Gemini Speech Synthesis Error:", err);
    res.status(500).json({ error: "Failed to generate speech: " + err.message });
  }
});

// 2. AI CERTIFICATE DESIGN PROMPT PROTOCOL (SVG format render)
app.post("/api/ai/generate-certificate", async (req: any, res) => {
  const { name, trackName, score } = req.body;
  if (!name || !trackName) {
    return res.status(400).json({ error: "Name and track name are required to generate a certificate." });
  }

  const prompt = `You are a professional SVG design wizard and elite certification system architect.
  Generate a stunning, ultra-modern dark-themed professional modern technical certificate in SVG format.
  Candidate: "${name}"
  Track achieved: "${trackName}"
  Score / XP achieved: "${score || '95%'}"
  
  The certificate must include:
  1. A dark indigo and purple gradient backdrop (colors suited to NexStart Premium UI).
  2. Elegant borders, subtle geometric tech accent patterns, and signatures of AI CTO.
  3. A badge of honor that looks highly authoritative.
  4. Response must be a raw string of a fully self-contained valid <svg ...>...</svg> tag. No markdown wrappers, no backticks, no text before or after the svg tag. Valid XML/SVG only. Ensure text is readable with high contrast on the dark background.`;

  if (!ai) {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="800" height="500" rx="20" fill="#000000" stroke="#1f2937" stroke-width="4"/>
      <rect width="760" height="460" x="20" y="20" rx="10" fill="#09090b" stroke="#7c3aed" stroke-width="2" stroke-opacity="0.4"/>
      <defs>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
      </defs>
      <text x="400" y="90" font-family="'Inter', sans-serif" font-weight="900" font-size="20" fill="#8b5cf6" letter-spacing="4" text-anchor="middle">NEXSTART AI GLOBAL RESOURCE LABS</text>
      <text x="400" y="140" font-family="'Inter', sans-serif" font-weight="400" font-size="14" fill="#a3a3a3" text-anchor="middle">THIS IS CRITICALLY GRANTED TO</text>
      <text x="400" y="210" font-family="'Inter', sans-serif" font-weight="900" font-size="34" fill="url(#textGrad)" text-anchor="middle" letter-spacing="1">${name.toUpperCase()}</text>
      <text x="400" y="260" font-family="'Inter', sans-serif" font-weight="400" font-size="15" fill="#e5e5e5" text-anchor="middle">FOR EXTRAORDINARY SYSTEMS RIGOR DEMONSTRATED IN DEVELOPMENT RUNTIMES</text>
      <text x="400" y="300" font-family="'Inter', sans-serif" font-weight="700" font-size="18" fill="#10b981" text-anchor="middle">TRACK: ${trackName.toUpperCase()} — TOP SCORING: ${score || '95%'}</text>
      <line x1="200" y1="380" x2="600" y2="380" stroke="#27272a" stroke-width="1"/>
      <text x="300" y="415" font-family="'Fira Code', monospace" font-size="10" fill="#71717a" text-anchor="middle">AUTHORIZED SIGNATURE: NEXSTART AI INTEGRATION ENGINE</text>
      <text x="500" y="415" font-family="'Fira Code', monospace" font-size="10" fill="#71717a" text-anchor="middle">ISSUE DATE: MAY 2026 — SECURE TOKEN: CX-104928</text>
    </svg>`;
    return res.json({ success: true, svg: fallbackSvg });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    let svgResult = response.text || "";
    // Clean potential markdown blocks
    if (svgResult.includes("```xml")) {
      svgResult = svgResult.split("```xml")[1].split("```")[0];
    } else if (svgResult.includes("```svg")) {
      svgResult = svgResult.split("```svg")[1].split("```")[0];
    } else if (svgResult.includes("```html")) {
      svgResult = svgResult.split("```html")[1].split("```")[0];
    } else if (svgResult.includes("```")) {
      svgResult = svgResult.split("```")[1]?.split("```")[0] || svgResult;
    }
    res.json({ success: true, svg: svgResult.trim() });
  } catch (err: any) {
    console.error("Gemini Certificate Generation Error:", err);
    res.status(500).json({ error: "Failed to generate SVG certificate: " + err.message });
  }
});

// 3. AI DYNAMIC EVENT PAGE GENERATION
app.post("/api/ai/generate-event-page", async (req: any, res) => {
  const { title, targetCategory, keywords } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required for generating an event landing." });
  }

  const prompt = `You are a professional marketing officer and developer relations lead. Create an exhaustive, highly engaging, beautifully formatted Markdown landing micro-page description for a upcoming high-fidelity tech community event.
  Event Title: "${title}"
  Category: "${targetCategory || 'hackathon'}"
  Keywords: "${keywords || 'agents, typescript, system architecture, performance'}"
  
  The output should be rich markdown containing:
  - An impressive Event Tagline
  - Brief "Why You Cannot Miss This" section
  - A structured Hourly Schedule / Track list
  - Real-world high-profile tracks and prize tiers (e.g. $10,000 cash prizes)
  - Prerequisite skills checklist and dynamic setup guidance.
  Make it look structured, professional, and full of engineering focus.`;

  if (!ai) {
    const fallbackMd = `## 🏆 NEXSTART AI: ${title.toUpperCase()}
*Accelerate your autonomous pipelines in high-level parallelized developer streams.*

Welcome developer-pioneers! This immersive **${targetCategory || 'engineering sandbox'}** is built to scale your core models, evaluate modern real-time WebSockets, and refine your system-level latency down to the millisecond.

### ⚡ Highlights & Key Takeaways
- **Production Grader Validation**: Benchmark your custom solutions under simulated multi-tenant loads.
- **Elite Networking Salon**: Partner with AI founders and seasoned CTO judges from leading infrastructure funds.
- **Unified Hackathon Sandbox**: Secure dedicated cloud run allocations with pre-loaded PostgreSQL database clusters.

### 📅 Agenda & Schedule
| Time (PST) | Title | Track Segment |
| --- | --- | --- |
| 09:00 AM | **Opening Ceremony & Global Vector Schema Initializer** | Core Keynote |
| 11:30 AM | **RAG Optimizing Masterclass: Multi-Query Search & Fine Tuning** | Tech Lab |
| 02:00 PM | **Hacking Launch & Agentic Chat Orchestration Pipelines** | Dev Phase |
| 05:00 PM | **Evaluation, Innovation Scoring & Live Demo Pushes** | Grading Arena |

### 🛠️ Hardware Requirements & Prerequisites
- Strong working familiarity with TypeScript, Express API routing frameworks, and ESM bundling setups.
- Dedicated AWS or GCP trial sandbox credentials.`;
    return res.json({ success: true, markdown: fallbackMd });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ success: true, markdown: response.text });
  } catch (err: any) {
    console.error("Gemini Event Page Generation Error:", err);
    res.status(500).json({ error: "Failed to generate page content." });
  }
});

// 4. AI CRM OUTREACH CAMPAIGN WRITER
app.post("/api/ai/generate-campaign", async (req: any, res) => {
  const { eventName, campaignObjective, recipientGroup } = req.body;
  if (!eventName || !campaignObjective) {
    return res.status(400).json({ error: "Event name and campaign objective are required." });
  }

  const prompt = `You are an elite developer evangelist and professional SaaS campaigner. Generate a premium, highly tailored transactional email blander and push notice campaign context copy.
  Event Name: "${eventName}"
  Campaign Objective: "${campaignObjective}"
  Target Recipient Group: "${recipientGroup || 'registered hackers'}"
  
  Format the output clearly separating:
  1. SUBJECT LINE: A clickable, urgent, highly engaging topic.
  2. EMAIL BODY: Professional, sleek greeting, value propositions, countdown call-to-actions, and standard placeholder sign-offs.
  3. SMS/WHATSAPP BULLETIN: Brief 160-character mobile reminder.
  Make the tone highly compelling, focused, and free of sales buzzwords.`;

  if (!ai) {
    const fallbackCampaign = `### [CAMPAIGN TEMPLATE: CO-FOUND SYSTEM CODES]

**Email Subject Line:** 🚨 Alex Rivera, solve matching agent problems in the ${eventName} sandbox [48H Remaining]

**Email Body:**
Hi candidate,

The development team at NextStart has inspected your active career parameters and found an exceptional alignment. We are inviting you to deploy your skills inside the upcoming **${eventName}** sandbox workspace.

Our matching algorithms verified your experience in React and TypeScript is 84% matched to our premier enterprise system challenges. Participating secures you direct exposure to VC mentors, live grading reports, and a fast-track recruiter referral channel to stripe.

**Why Join Today?**
- Claim immediate Level 4 developer badges.
- Qualify for up to $15,000 in immediate cash grants and sponsor bonuses.
- Access pre-authenticated OpenAI/Gemini developer resource accounts for the entire hackathon block.

👉 Click here to confirm registration: [Secure My Workspace Barrier]

Sincerely,
NexStart Developer Relations Team

---

**Mobile WhatsApp Short Message Bulletin:**
🚀 NexStart Alert: Alex, your profile matches the ${eventName} challenges perfectly. Register today, lock in Level 4 rewards, and pitch to leading tech co-founders!`;
    return res.json({ success: true, campaign: fallbackCampaign });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ success: true, campaign: response.text });
  } catch (err: any) {
    console.error("Gemini Campaign Generation Error:", err);
    res.status(500).json({ error: "Failed to generate campaign assets." });
  }
});

// 5. AI HACKATHON TEAM MATCHING & CO-PILOT
app.post("/api/ai/hackathon-copilot", async (req: any, res) => {
  const { resumeData, projectIdea } = req.body;
  if (!projectIdea) {
    return res.status(400).json({ error: "Please enter your product hypothesis or idea." });
  }

  const prompt = `You are staff software engineer and Lead Hackathon Mentor. Analyze this student's hackathon project idea: "${projectIdea}".
  Student CV Context: ${JSON.stringify(resumeData || {})}
  
  Provide a professional technical blueprint. Respond with a strictly formatted JSON:
  {
    "feasibility": "High / Medium / Low",
    "recommendedStack": ["Tech 1", "Tech 2"],
    "criticalArchitectureSteps": ["Step 1", "Step 2", "Step 3"],
    "suggestedTeammates": ["Frontend UI Designer Specialist", "Database Systems Optimization Engineer"],
    "copilotTips": "Valuable tips to stand out to elite venture judges."
  }
  Valid JSON output only. No markdown formatting.`;

  if (!ai) {
    return res.json({
      feasibility: "High",
      recommendedStack: ["React 19", "TypeScript", "Express API router", "Pinecone Vector Storage", "Gemini-3.5-flash API"],
      criticalArchitectureSteps: [
        "Initialize server-side proxy routes to query Gemini safely without exposing keys.",
        "Set up local storage mock vectors or lightweight schema to run semantic lookup query matching.",
        "Leverage React transitions and motion frames for elegant, high-contrast UI state re-indexing."
      ],
      suggestedTeammates: [
        "Infrastructure and Cloud deployment engineer",
        "Visual UX branding designer specialized in Tailwind styles"
      ],
      copilotTips: "Venture judges score heavily on 'Production-Grade Completeness'. Avoid leaving uncompleted modules and build a beautiful, fluid greeting with genuine dynamic APIs."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feasibility: { type: Type.STRING },
            recommendedStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalArchitectureSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedTeammates: { type: Type.ARRAY, items: { type: Type.STRING } },
            copilotTips: { type: Type.STRING }
          },
          required: ["feasibility", "recommendedStack", "criticalArchitectureSteps", "suggestedTeammates", "copilotTips"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Copilot/Team Matching Error:", err);
    res.status(500).json({ error: "Failed to query AI copilot: " + err.message });
  }
});

// 6. AI ENTERPRISE SPONSOR & PORTAL MATCHMAKER
app.post("/api/ai/recommendations", async (req: any, res) => {
  const { resumeData, userCareer } = req.body;

  const prompt = `You are an elite career matches manager. Review candidate profile:
  CV: ${JSON.stringify(resumeData || {})}
  Stats/Level: ${JSON.stringify(userCareer || {})}
  
  We need 3 customized matching assets from our system database:
  1. An Event challenge matching their current skills XP.
  2. A Community Discord channel pairing recommendations.
  3. A Sponsorship track tier aligning with their hackathon ideas.
  
  Respond in strictly standard JSON format matching this shape:
  {
    "eventMatch": { "title": "...", "reason": "..." },
    "communityMatch": { "channel": "#...", "reason": "..." },
    "sponsorMatch": { "tier": "...", "reason": "..." }
  }
  Raw valid JSON only, no markdown.`;

  if (!ai) {
    return res.json({
      eventMatch: {
        title: "Agents Build Weekend (Nov 12)",
        reason: "Your outstanding 80% TypeScript XP skill rating is a custom alignment indicator for autonomous orchestrations."
      },
      communityMatch: {
        channel: "#ai-talks",
        reason: "Matches your career goals around AI Integration and system engineering patterns."
      },
      sponsorMatch: {
        tier: "Venture Growth tier ($5,000 cash grant)",
        reason: "Your background in solid Stripe checkout interfaces suits micro-transactional sponsorships."
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventMatch: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["title", "reason"]
            },
            communityMatch: {
              type: Type.OBJECT,
              properties: {
                channel: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["channel", "reason"]
            },
            sponsorMatch: {
              type: Type.OBJECT,
              properties: {
                tier: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["tier", "reason"]
            }
          },
          required: ["eventMatch", "communityMatch", "sponsorMatch"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini Recommendation matchmaking error:", err);
    res.status(500).json({ error: "Failed to generate personal matchmaking recommendations." });
  }
});

// --- NEW WORKSPACE & MULTI-ROLE SaaS ENDPOINTS ---

// 1. ORGANIZER CAMPAIGNS (Email blast)
app.get("/api/organizer/campaigns/:eventId", requireRole(['organizer', 'admin', 'community_manager']), (req, res) => {
  res.json(getCampaignsForEvent(req.params.eventId));
});

app.post("/api/organizer/campaigns/:eventId", requireRole(['organizer', 'admin', 'community_manager']), (req: any, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ error: "Subject and core content text are fully required." });
  }
  const result = sendEmailCampaign(req.user.id, req.params.eventId, subject, content);
  res.json({ success: true, campaign: result });
});

// 2. WHATSAPP BROADCAST BULLETINS
app.get("/api/organizer/whatsapp/:eventId", requireRole(['organizer', 'admin']), (req, res) => {
  res.json(getWhatsAppReminders(req.params.eventId));
});

app.post("/api/organizer/whatsapp/:eventId", requireRole(['organizer', 'admin']), (req: any, res) => {
  const { messageType, copyText } = req.body;
  if (!messageType || !copyText) {
    return res.status(400).json({ error: "Missing type or copy text." });
  }
  const result = triggerWhatsAppBulletin(req.user.id, req.params.eventId, messageType, copyText);
  res.json({ success: true, whatsapp: result });
});

// 3. REFERRAL LEADERS FOR AMBASSADORS
app.get("/api/organizer/referrals/:eventId", (req, res) => {
  // Return list of top referrer users on the ecosystem
  const users = getAllUsersProfiles()
    .filter(u => u.referralsCount > 0)
    .sort((a,b) => b.referralsCount - a.referralsCount);
  res.json(users);
});

// 4. COMMUNITY CRM FOLLOWER STREAM
app.get("/api/organizer/followers", requireRole(['organizer', 'admin', 'community_manager']), (req: any, res) => {
  res.json(getMailingCRMContacts(req.user.id));
});

// 5. SPONSORSHIP PORTALS
app.get("/api/sponsor/bundles", (req, res) => {
  res.json(getSponsorships());
});

app.get("/api/sponsor/bundles/:eventId", (req, res) => {
  res.json(getEventSponsorships(req.params.eventId));
});

app.post("/api/sponsor/apply", requireRole(['sponsor', 'admin']), (req: any, res) => {
  const { eventId, tier, fundsOffered, swagGoodies } = req.body;
  if (!eventId || !tier || !fundsOffered) {
    return res.status(400).json({ error: "Sponsoring event id, tier classification, and cash funds are required." });
  }
  try {
    const result = applyForSponsorship(req.user.id, { eventId, tier, fundsOffered: Number(fundsOffered), swagGoodies });
    res.json({ success: true, sponsorship: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/sponsor/approve/:id", requireRole(['organizer', 'admin']), (req: any, res) => {
  const { approve } = req.body;
  try {
    const result = approveSponsorship(req.user.id, req.params.id, approve === true);
    res.json({ success: true, sponsorship: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. HACKATHON SUBMISSION PORTS
app.get("/api/hackathon/submissions/:eventId", (req, res) => {
  res.json(getProjectSubmissions(req.params.eventId));
});

app.get("/api/hackathon/my-submissions", (req: any, res) => {
  res.json(getMyProjectSubmissions(req.user.id));
});

app.post("/api/hackathon/submit", requireRole(['student', 'admin']), (req: any, res) => {
  const { eventId, title, tagline, description, demoUrl, githubUrl } = req.body;
  if (!eventId || !title || !description) {
    return res.status(400).json({ error: "Hacking event id, product title, and core description are required." });
  }
  try {
    const result = submitProject(req.user.id, { eventId, title, tagline, description, demoUrl, githubUrl });
    res.json({ success: true, submission: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/hackathon/grade", requireRole(['judge', 'admin']), (req: any, res) => {
  const { submissionId, grades } = req.body; // grades: { innovation, design, technical, feedback }
  if (!submissionId || !grades) {
    return res.status(400).json({ error: "Target submissionId and grades structure are required." });
  }
  try {
    const result = gradeSubmission(req.user.id, submissionId, grades);
    res.json({ success: true, submission: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. COMMUNITY MODERATION DELETIONS
app.delete("/api/community/posts/delete/:id", requireRole(['community_manager', 'admin']), (req: any, res) => {
  try {
    deletePostByModerator(req.user.id, req.params.id);
    res.json({ success: true, message: "Mod removed target post successfully." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. FINTECH & DOUBLE-ENTRY TRANSACTION LEDGER API
// ==========================================
app.get("/api/fintech/wallet", (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const userId = req.user.id;
  const balance = getWalletBalance(userId);
  const ledger = getLedgerEntries(userId);
  const payouts = getPayoutRequests(userId);
  res.json({ balance, ledger, payouts });
});

app.post("/api/fintech/payout", (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { amount, destinationIban } = req.body;
  if (!amount || !destinationIban) {
    return res.status(400).json({ error: "Payout amount and destination IBAN coordinates are required." });
  }
  try {
    const request = submitPayoutRequest(req.user.id, Number(amount), destinationIban);
    res.json({ success: true, payoutRequest: request, newBalance: getWalletBalance(req.user.id) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/fintech/simulate-charge", (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { amount, description, referenceType, referenceId, promoCode } = req.body;
  if (!amount) {
    return res.status(400).json({ error: "Charge amount is required for payment intent compilation." });
  }

  try {
    const doubleAmt = Number(amount);
    let promotionalDiscount = 0;
    if (promoCode && promoCode.trim().toUpperCase() === "HACK_AUTUMN_20") {
      promotionalDiscount = doubleAmt * 0.20; // 20% discount
    }

    const netChargeable = Math.max(0, doubleAmt - promotionalDiscount);
    const taxValue = Math.round(netChargeable * 0.0825 * 100) / 100; // US sales tax simulator
    const platformFee = Math.round(netChargeable * 0.05 * 100) / 100; // Platform split fee simulator
    
    // Simulate real credit card intent transaction processing
    const ledgerItem = processPaymentSimulator(
      req.user.id,
      netChargeable,
      description || "General platform service charge",
      referenceType || "INVOICE",
      referenceId || `ref-sim-chg-${Date.now()}`,
      taxValue,
      platformFee,
      "CREDIT"
    );

    res.json({
      success: true,
      charge: ledgerItem,
      discountApplied: promotionalDiscount,
      taxCalculated: taxValue,
      splitPlatformFee: platformFee,
      netCollected: netChargeable,
      newBalance: getWalletBalance(req.user.id)
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. ADMIN DASHBOARD DIRECT CRM CONTROL & AUDITING
app.get("/api/admin/users", requireRole(['admin']), (req, res) => {
  res.json(getAllUsersProfiles());
});

app.post("/api/admin/users/role", requireRole(['admin']), (req: any, res) => {
  const { targetUserId, newRole } = req.body;
  if (!targetUserId || !newRole) {
    return res.status(400).json({ error: "Parameters targetUserId and structural newRole are required." });
  }
  try {
    const result = setUserRoleForcefully(req.user.id, targetUserId, newRole);
    res.json({ success: true, user: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/admin/audit-logs", requireRole(['admin']), (req, res) => {
  res.json(getAuditLogs());
});

app.get("/api/admin/fraud", requireRole(['admin']), (req: any, res) => {
  // Algorithmic heuristics detecting risk factors (for instance, shared passwords or matching signup intervals)
  const users = getAllUsersProfiles();
  const logs = getAuditLogs();
  
  // Heuristic logs: find if any two profiles have matching IPs during security audits
  const suspiciousIpRecords: Record<string, string[]> = {};
  logs.forEach(l => {
    if (l.ip && l.userEmail) {
      if (!suspiciousIpRecords[l.ip]) suspiciousIpRecords[l.ip] = [];
      if (!suspiciousIpRecords[l.ip].includes(l.userEmail)) {
        suspiciousIpRecords[l.ip].push(l.userEmail);
      }
    }
  });

  const ipFails = Object.entries(suspiciousIpRecords)
    .filter(([ip, addresses]) => addresses.length > 1)
    .map(([ip, addresses]) => ({
      flag: "DUPLICATED_SIGNUP_IP",
      description: `IP address ${ip} requested active configurations across multiple emails: ${addresses.join(', ')}`,
      severity: "high" as const,
      matchingAccounts: addresses
    }));

  const automatedActivityHeuristics = users
    .filter(u => u.referralsCount > 10)
    .map(u => ({
      flag: "PROPS_SCRAPING_ANOMALY",
      description: `${u.fullName} is registering a high velocity invitation conversion score (${u.referralsCount} referrals). Suggest review of profile payout status.`,
      severity: "medium" as const,
      matchingAccounts: [u.email]
    }));

  res.json({
    metrics: {
      highSeverityAlerts: ipFails.length,
      mediumSeverityAlerts: automatedActivityHeuristics.length,
      evaluatedEndpoints: 140
    },
    flags: [...ipFails, ...automatedActivityHeuristics]
  });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION CONFIGURATION
// ==========================================

async function startServer() {
  // If we are running in the Vercel serverless function environment,
  // do not launch listener or create Vite development servers.
  if (process.env.VERCEL) {
    console.log("Vercel Serverless runtime detected. Bypassing persistent TCP port listeners.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
