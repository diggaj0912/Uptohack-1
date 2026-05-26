import fs from 'fs';
import path from 'path';
import { 
  UserProfile, Event, Resume, CommunityPost, AuditLog, EmailCampaign, 
  WhatsAppReminder, ProjectSubmission, SponsorshipBundle, UserRole
} from './types';

// Let's create the file-based persistence layer
const DB_PATH = path.join(process.cwd(), 'database.json');

interface DbSchema {
  users: Record<string, UserProfile & { passwordHash: string }>;
  resumes: Record<string, Resume>; // userId -> Resume
  events: Event[];
  communityPosts: CommunityPost[];
  auditLogs: AuditLog[];
  emailCampaigns: EmailCampaign[];
  whatsAppReminders: WhatsAppReminder[];
  projectSubmissions: ProjectSubmission[];
  sponsorshipBundles: SponsorshipBundle[];
}

// Default Presets to populate the DB initially
const defaultCareerState = (name: string) => ({
  fullName: name,
  xp: 1200,
  level: 3,
  streak: 5,
  skillsTracker: {
    "Full-Stack Web": 65,
    "TypeScript & Refactoring": 70,
    "System Design": 55,
    "AI Integration": 40,
    "ATS Alignment": 60
  },
  recentRecommendations: [
    "Practice AI Technical Interviews on System Design to boost your score to 85%+",
    "Apply your technical skills in the Global FinTech Hackathon starting June 15",
    "Complete the Missing Skills section in your Resume: Add 'REST APIs', 'SQL Database'"
  ]
});

const defaultResumes: Record<string, Resume> = {
  "usr-student": {
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

const defaultUsers: Record<string, UserProfile & { passwordHash: string }> = {
  "usr-student": {
    id: "usr-student",
    email: "student@nexus.io",
    fullName: "Alex Rivera",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["React", "AI Routing", "System Design"],
    referralCode: "REF-STUDENT",
    referredBy: null,
    referralsCount: 4,
    balance: 50,
    joinedAt: "2026-05-15T12:00:00Z",
    passwordHash: "password123", // Simulated pass hash
    careerState: defaultResumes["usr-student"] ? {
      ...defaultCareerState("Alex Rivera"),
      fullName: "Alex Rivera"
    } : defaultCareerState("Alex Rivera")
  },
  "usr-organizer": {
    id: "usr-organizer",
    email: "organizer@nexus.io",
    fullName: "Elena Rostova",
    role: "organizer",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Sponsoring", "Dev Relationships", "Hackathons"],
    referralCode: "REF-ORGANIZER",
    referredBy: null,
    referralsCount: 12,
    balance: 1450,
    joinedAt: "2026-04-10T11:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Elena Rostova")
  },
  "usr-recruiter": {
    id: "usr-recruiter",
    email: "recruiter@nexus.io",
    fullName: "Marcus Holloway",
    role: "recruiter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["React Developers", "Core RAG Architecture", "Staffing"],
    referralCode: "REF-MARCUS",
    referredBy: null,
    referralsCount: 0,
    balance: 0,
    joinedAt: "2026-05-01T09:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Marcus Holloway")
  },
  "usr-admin": {
    id: "usr-admin",
    email: "admin@nexus.io",
    fullName: "Zephyr Storm",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Security auditing", "Anti-Fraud metrics", "Core server scale"],
    referralCode: "REF-ADMIN",
    referredBy: null,
    referralsCount: 2,
    balance: 0,
    joinedAt: "2026-01-01T00:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Zephyr Storm")
  },
  "usr-sponsor": {
    id: "usr-sponsor",
    email: "sponsor@nexus.io",
    fullName: "Venture Goldswag",
    role: "sponsor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Brand promotion", "Developer giveaways", "AI hackathons"],
    referralCode: "REF-SPONSOR",
    referredBy: null,
    referralsCount: 0,
    balance: 10000,
    joinedAt: "2026-05-10T14:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Venture Goldswag")
  },
  "usr-judge": {
    id: "usr-judge",
    email: "judge@nexus.io",
    fullName: "Dr. Kenji Sato",
    role: "judge",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Reranking algorithms", "Scientific precision", "RAG stores"],
    referralCode: "REF-JUDGE",
    referredBy: null,
    referralsCount: 1,
    balance: 0,
    joinedAt: "2026-05-18T08:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Dr. Kenji Sato")
  },
  "usr-mentor": {
    id: "usr-mentor",
    email: "mentor@nexus.io",
    fullName: "Sarah Jenkins",
    role: "mentor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Web performance", "Vite middleware", "Mentorship"],
    referralCode: "REF-MENTOR",
    referredBy: null,
    referralsCount: 8,
    balance: 450,
    joinedAt: "2016-05-20T08:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Sarah Jenkins")
  },
  "usr-cm": {
    id: "usr-cm",
    email: "cm@nexus.io",
    fullName: "Amara Vance",
    role: "community_manager",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    isOnboarded: true,
    interests: ["Community Moderation", "Sentiment analytics", "CRM reach"],
    referralCode: "REF-COMMUNITY",
    referredBy: null,
    referralsCount: 43,
    balance: 200,
    joinedAt: "2026-05-22T08:00:00Z",
    passwordHash: "password123",
    careerState: defaultCareerState("Amara Vance")
  }
};

const defaultEvents: Event[] = [
  {
    id: "evt-featured",
    title: "Nexus Global Summit 2024",
    description: "The premier gathering for AI-native builders, researchers, and enterprise leaders. Join us for 3 days of intensive keynotes and deep-dive technical sessions.",
    date: "Oct 24",
    location: "San Francisco, CA",
    category: "meetup" as const,
    organizer: "usr-organizer", // Set back to Elena Rostova's user-id
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
    organizer: "usr-organizer",
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
    organizer: "usr-organizer",
    attendeesCount: 180,
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
    organizer: "usr-organizer",
    attendeesCount: 950,
    isRegistered: false,
    image: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80",
    aiSummary: "Critical review of real-life API token pricing, open weights benchmarks, and serverless runtime limits for scaling microservices."
  }
];

const defaultPosts: CommunityPost[] = [
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
    sentiment: "constructive"
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
    sentiment: "positive"
  }
];

// Helper to load up initial database
function loadDatabase(): DbSchema {
  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      // Merge with default properties to avoid missing arrays
      return {
        users: parsed.users || defaultUsers,
        resumes: parsed.resumes || defaultResumes,
        events: parsed.events || defaultEvents,
        communityPosts: parsed.communityPosts || defaultPosts,
        auditLogs: parsed.auditLogs || [],
        emailCampaigns: parsed.emailCampaigns || [],
        whatsAppReminders: parsed.whatsAppReminders || [],
        projectSubmissions: parsed.projectSubmissions || [],
        sponsorshipBundles: parsed.sponsorshipBundles || []
      };
    } catch (e) {
      console.error("Failed to parse database.json, rebuilding.", e);
    }
  }
  
  // Re-save fresh structure if not exists
  const freshDb: DbSchema = {
    users: defaultUsers,
    resumes: defaultResumes,
    events: defaultEvents,
    communityPosts: defaultPosts,
    auditLogs: [
      {
        id: "audit-init",
        userId: "usr-admin",
        userEmail: "admin@nexus.io",
        userRole: "admin",
        action: "DATABASE_INITIALIZED",
        details: "Created multi-role schema structures with persistent isolation metrics.",
        ip: "127.0.0.1",
        timestamp: new Date().toISOString()
      }
    ],
    emailCampaigns: [],
    whatsAppReminders: [],
    projectSubmissions: [],
    sponsorshipBundles: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(freshDb, null, 2));
  return freshDb;
}

// In-Memory operational database
let db = loadDatabase();

// Sync in-memory changes out to disk
export function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to persist backend db schema:", err);
  }
}

// ==============================================
// AUTHENTICATION AND DISPATCH FUNCTIONS
// ==============================================

export function getProfileByToken(token: string): UserProfile | null {
  if (!token) return null;
  // Simulated token is just our userId or wrapped inside "session-<userId>"
  const userId = token.startsWith("session-") ? token.replace("session-", "") : token;
  const user = db.users[userId];
  if (user) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      interests: user.interests,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralsCount: user.referralsCount,
      balance: user.balance,
      joinedAt: user.joinedAt,
      careerState: user.careerState
    };
  }
  return null;
}

export function registerUser(email: string, passwordHash: string, fullName: string, role: UserRole, referralCode?: string): { user: UserProfile, token: string } {
  // Check if user already exists
  const exists = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error("A user with this email address already exists.");
  }

  const userId = `usr-${Date.now()}`;
  const refCode = `REF-${fullName.split(' ')[0]?.toUpperCase() || 'USER'}-${Math.floor(Math.random() * 8999 + 1000)}`;
  
  let referredByUserId: string | null = null;
  if (referralCode) {
    const referrer = Object.values(db.users).find(u => u.referralCode === referralCode);
    if (referrer) {
      referredByUserId = referrer.id;
      // Increment referrer referral metrics
      referrer.referralsCount += 1;
      referrer.balance += 25; // Give $25 affiliate credit
      referrer.careerState.xp += 150; // Give +150 Host/Affiliate XP
      
      addAuditLog(referrer.id, "REFERRAL_REWARD_CLAIMED", `Referral bonus successfully accounted for inviting ${fullName}. Generated +150 XP and $25 wallet payout.`, "System System");
    }
  }

  const freshUser: UserProfile & { passwordHash: string } = {
    id: userId,
    email,
    fullName,
    role,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=150&q=80`,
    isOnboarded: false,
    interests: [],
    referralCode: refCode,
    referredBy: referredByUserId,
    referralsCount: 0,
    balance: 0,
    joinedAt: new Date().toISOString(),
    passwordHash,
    careerState: defaultCareerState(fullName)
  };

  db.users[userId] = freshUser;
  // Initialize default resume
  db.resumes[userId] = {
    fullName: fullName,
    email: email,
    phone: "+1 (555) 000-0000",
    website: "",
    skills: ["TypeScript", "React"],
    experience: [],
    education: [],
    projects: []
  };

  addAuditLog(userId, "USER_SIGNED_UP", `Account established with Role: ${role}. Generated unique Referral code ${refCode}`, "Client Sign-up");
  saveDatabase();

  return {
    user: getProfileByToken(userId)!,
    token: `session-${userId}`
  };
}

export function loginUserAndGenerateToken(email: string, passwordHash: string): { user: UserProfile, token: string } {
  const user = Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== passwordHash) {
    throw new Error("Invalid credentials provided. Please double-check password.");
  }

  addAuditLog(user.id, "USER_LOGGED_IN", `Session initialized securely for role: ${user.role}`, "Identity Handler");
  saveDatabase();

  return {
    user: getProfileByToken(user.id)!,
    token: `session-${user.id}`
  };
}

export function updateOnboarding(userId: string, updates: { role: UserRole; interests: string[]; fullName?: string }): UserProfile {
  const user = db.users[userId];
  if (!user) throw new Error("Target user profile not found.");

  user.role = updates.role;
  user.interests = updates.interests;
  if (updates.fullName) {
    user.fullName = updates.fullName;
    user.careerState.fullName = updates.fullName;
  }
  user.isOnboarded = true;

  addAuditLog(userId, "ONBOARDING_COMPLETED", `Updated interests with values [${updates.interests.join(", ")}] and committed role choice ${updates.role}`, "Client Interface");
  saveDatabase();

  return getProfileByToken(userId)!;
}

// ==============================================
// AUDIT LOGS
// ==============================================

export function addAuditLog(userId: string | null, action: string, details: string, ip: string) {
  const user = userId ? db.users[userId] : null;
  const newLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userEmail: user ? user.email : null,
    userRole: user ? user.role : null,
    action,
    details,
    ip: ip || "127.0.0.1",
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  // Cap standard audit pool at 300 to reduce overhead
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }
  saveDatabase();
}

export function getAuditLogs(): AuditLog[] {
  return db.auditLogs;
}

// ==============================================
// EVENT SYSTEMS
// ==============================================

export interface EventWithRef extends Event {
  organizerId: string;
  registeredUserIds: string[];
}

export function getEvents(userId?: string): Event[] {
  return db.events.map(evt => {
    // Look up if that event has an in-memory or persisted tracker
    const ext = evt as any;
    const registeredUserIds = ext.registeredUserIds || [];
    return {
      ...evt,
      isRegistered: userId ? registeredUserIds.includes(userId) : false
    };
  });
}

export function getOrganizerEvents(organizerId: string): Event[] {
  return db.events.filter(evt => {
    const ext = evt as any;
    return ext.organizerId === organizerId || evt.organizer === organizerId;
  });
}

export function toggleEventRegistration(eventId: string, userId: string): { success: boolean, event: Event } {
  const event = db.events.find(e => e.id === eventId) as any;
  if (!event) throw new Error("Event not found");

  if (!event.registeredUserIds) {
    event.registeredUserIds = [];
  }

  const alreadyJoined = event.registeredUserIds.includes(userId);
  if (alreadyJoined) {
    event.registeredUserIds = event.registeredUserIds.filter((id: string) => id !== userId);
    event.attendeesCount = Math.max(0, event.attendeesCount - 1);
  } else {
    event.registeredUserIds.push(userId);
    event.attendeesCount += 1;
    // Award standard XP to registerer
    const userProfile = db.users[userId];
    if (userProfile) {
      userProfile.careerState.xp += 150;
      if (userProfile.careerState.xp >= userProfile.careerState.level * 1000) {
        userProfile.careerState.level += 1;
      }
    }
  }

  addAuditLog(userId, alreadyJoined ? "EVENT_UNREGISTERED" : "EVENT_REGISTERED", `Seat adjusted for event ${event.title}`, "Registration Router");
  saveDatabase();

  return {
    success: true,
    event: {
      ...event,
      isRegistered: !alreadyJoined
    }
  };
}

export function publishEvent(organizerId: string, form: Partial<Event>): Event {
  const id = `evt-${Date.now()}`;
  const freshEvent = {
    id,
    title: form.title || "Custom Technology Summit",
    description: form.description || "Interactive masterclass centering edge workflows.",
    date: form.date || "Next Week",
    location: form.location || "Online",
    category: form.category || "hackathon",
    organizer: organizerId, // Stored as Elena Rostova / active user choice
    attendeesCount: 1,
    isRegistered: true,
    image: form.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    aiSummary: "AI diagnostics queued on publish.",
    registeredUserIds: [organizerId],
    organizerId: organizerId
  } as any;

  db.events.unshift(freshEvent);

  // Boost organizer XP for contribution
  const organizer = db.users[organizerId];
  if (organizer) {
    organizer.careerState.xp += 200;
    if (organizer.careerState.xp >= organizer.careerState.level * 1000) {
      organizer.careerState.level += 1;
    }
  }

  addAuditLog(organizerId, "EVENT_PUBLISHED", `Successfully launched technical event: ${form.title}`, "Host Hub");
  saveDatabase();

  return freshEvent;
}

// ==============================================
// RESUME STORAGE
// ==============================================

export function getResumeForUser(userId: string): Resume {
  const res = db.resumes[userId];
  if (res) return res;

  // Fallback default structure
  const blank = {
    fullName: db.users[userId]?.fullName || "Candidate",
    email: db.users[userId]?.email || "candidate@nexus.io",
    phone: "+1 (555) 000-0000",
    website: "",
    skills: ["Engineering", "SaaS Solutions"],
    experience: [],
    education: [],
    projects: []
  };
  db.resumes[userId] = blank;
  saveDatabase();
  return blank;
}

export function saveResume(userId: string, data: Resume) {
  db.resumes[userId] = data;
  
  // Award simple audit alignment XP increments
  const user = db.users[userId];
  if (user) {
    user.careerState.xp += 75;
    if (user.careerState.xp >= user.careerState.level * 1000) {
      user.careerState.level += 1;
    }
  }

  addAuditLog(userId, "RESUME_UPDATED", `Metadata saved. Updated primary skills to [${data.skills.join(", ")}]`, "ATS CV module");
  saveDatabase();
}

// ==============================================
// EMAIL BLASTS & WHATSAPP BULLETINS (Luma CRM)
// ==============================================

export function sendEmailCampaign(organizerId: string, eventId: string, subject: string, content: string): EmailCampaign {
  const event = db.events.find(e => e.id === eventId);
  const ext = event as any;
  const registeredCount = ext?.registeredUserIds?.length || 12; // Fallback simulation

  const campaign: EmailCampaign = {
    id: `email-${Date.now()}`,
    eventId,
    eventTitle: event?.title || "Technology Webinar",
    subject,
    content,
    status: 'sent',
    sentCount: registeredCount,
    opens: Math.floor(registeredCount * (0.4 + Math.random() * 0.3)), // 40% - 70% open rate simulation
    clicks: Math.floor(registeredCount * (0.1 + Math.random() * 0.15)),
    timestamp: new Date().toISOString()
  };

  db.emailCampaigns.unshift(campaign);
  addAuditLog(organizerId, "EMAIL_BLAST_SENT", `Mailed campaign "${subject}" to ${registeredCount} registered event contacts.`, "Luma Blaster API");
  saveDatabase();

  return campaign;
}

export function getCampaignsForEvent(eventId: string): EmailCampaign[] {
  return db.emailCampaigns.filter(c => c.eventId === eventId);
}

export function triggerWhatsAppBulletin(organizerId: string, eventId: string, messageType: WhatsAppReminder["messageType"], copyText: string): WhatsAppReminder {
  const event = db.events.find(e => e.id === eventId);
  const ext = event as any;
  const recipientCount = ext?.registeredUserIds?.length || 8;

  const bulletin: WhatsAppReminder = {
    id: `wa-${Date.now()}`,
    eventId,
    messageType,
    copyText,
    sentCount: recipientCount,
    timestamp: new Date().toISOString()
  };

  db.whatsAppReminders.unshift(bulletin);
  addAuditLog(organizerId, "WHATSAPP_BULLETIN_DISPATCHED", `Triggered bulk WhatsApp reminder logs [${messageType}] to ${recipientCount} participants`, "Meta API Tunnel");
  saveDatabase();

  return bulletin;
}

export function getWhatsAppReminders(eventId: string): WhatsAppReminder[] {
  return db.whatsAppReminders.filter(w => w.eventId === eventId);
}

// ==============================================
// SPONSOR MARKETPLACE & COUPOUN SYSTEMS
// ==============================================

export function getSponsorships(): SponsorshipBundle[] {
  return db.sponsorshipBundles;
}

export function getEventSponsorships(eventId: string): SponsorshipBundle[] {
  return db.sponsorshipBundles.filter(s => s.eventId === eventId);
}

export function applyForSponsorship(sponsorId: string, form: { eventId: string, tier: SponsorshipBundle["tier"], fundsOffered: number, swagGoodies: string }): SponsorshipBundle {
  const event = db.events.find(e => e.id === form.eventId);
  const sponsor = db.users[sponsorId];

  const bundle: SponsorshipBundle = {
    id: `spons-${Date.now()}`,
    eventId: form.eventId,
    eventTitle: event?.title || "AI Hackathon",
    sponsorId,
    sponsorName: sponsor?.fullName || "Unregistered Sponsor Inc.",
    status: 'pending',
    tier: form.tier,
    fundsOffered: form.fundsOffered,
    swagGoodies: form.swagGoodies,
    couponCodes: [`COUPON-${sponsor?.fullName?.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*900+100)}`],
    clicksMetric: 0
  };

  db.sponsorshipBundles.unshift(bundle);
  addAuditLog(sponsorId, "SPONSORSHIP_APPLICATION_SUBMITTED", `Offered tier [${form.tier}] worth $${form.fundsOffered} and loot: "${form.swagGoodies}" to event "${event?.title}"`, "Opskill Marketplace");
  saveDatabase();

  return bundle;
}

export function approveSponsorship(organizerId: string, bundleId: string, approve: boolean): SponsorshipBundle {
  const bundle = db.sponsorshipBundles.find(s => s.id === bundleId);
  if (!bundle) throw new Error("Sponsorship package is not available");

  bundle.status = approve ? 'approved' : 'rejected';
  
  if (approve) {
    // If approved, transfer funds index or allocate XP
    const organizer = db.users[organizerId];
    if (organizer) {
      organizer.balance += bundle.fundsOffered;
      organizer.careerState.xp += 100;
    }
  }

  addAuditLog(organizerId, approve ? "SPONSORSHIP_APPROVED" : "SPONSORSHIP_REJECTED", `Package resolved for ${bundle.sponsorName} offering $${bundle.fundsOffered}`, "CRM Finance Core");
  saveDatabase();

  return bundle;
}

// ==============================================
// HACKATHON TEAMS & PROJECT SUBMISSIONS
// ==============================================

export function getProjectSubmissions(eventId?: string): ProjectSubmission[] {
  if (eventId) {
    return db.projectSubmissions.filter(p => p.eventId === eventId);
  }
  return db.projectSubmissions;
}

export function getMyProjectSubmissions(userId: string): ProjectSubmission[] {
  return db.projectSubmissions.filter(p => p.submittedBy === userId);
}

export function submitProject(userId: string, form: { eventId: string, title: string, tagline: string, description: string, demoUrl: string, githubUrl: string }): ProjectSubmission {
  const event = db.events.find(e => e.id === form.eventId);
  const user = db.users[userId];

  const submission: ProjectSubmission = {
    id: `subj-${Date.now()}`,
    eventId: form.eventId,
    eventTitle: event?.title || "Hackathon Challenge",
    title: form.title,
    tagline: form.tagline,
    description: form.description,
    demoUrl: form.demoUrl,
    githubUrl: form.githubUrl,
    submittedBy: userId,
    submitterName: user?.fullName || "Pioneer Hacker",
    grades: {}
  };

  db.projectSubmissions.unshift(submission);
  
  if (user) {
    user.careerState.xp += 300; // Major premium submission XP reward
    if (user.careerState.xp >= user.careerState.level * 1000) {
      user.careerState.level += 1;
    }
  }

  addAuditLog(userId, "PROJECT_SUBMISSION_PUBLISHED", `Submitted hackathon build: "${form.title}" for review trackers.`, "Devfolio pipeline");
  saveDatabase();

  return submission;
}

export function gradeSubmission(judgeId: string, submissionId: string, grades: { innovation: number, design: number, technical: number, feedback: string }): ProjectSubmission {
  const submission = db.projectSubmissions.find(s => s.id === submissionId);
  const judge = db.users[judgeId];
  if (!submission) throw new Error("Project submission target not found");
  
  const totalScore = Math.round((grades.innovation + grades.design + grades.technical) / 3 * 10) / 10;
  
  submission.grades[judgeId] = {
    innovation: grades.innovation,
    design: grades.design,
    technical: grades.technical,
    score: totalScore * 10, // normalized to 100
    feedback: grades.feedback
  };

  // Compute averageScore
  const allGrades = Object.values(submission.grades);
  if (allGrades.length > 0) {
    const sum = allGrades.reduce((acc, curr) => acc + curr.score, 0);
    submission.averageScore = Math.round(sum / allGrades.length);
  }

  addAuditLog(judgeId, "PROJECT_GRADED", `Judged project "${submission.title}" scoring a composite: ${totalScore}/10`, "Judging Dashboard");
  saveDatabase();

  return submission;
}

// ==============================================
// COMMUNITY & CRM FOLLOWERS
// ==============================================

export function getMailingCRMContacts(organizerUserId: string): any[] {
  // Return all users that have expressed interest or signed up to events. This mimics a CRM.
  return Object.values(db.users).map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    joinedAt: u.joinedAt,
    interests: u.interests,
    careerXp: u.careerState?.xp || 0
  }));
}

// ==============================================
// ADMIN SYSTEM USER MANIPULATION
// ==============================================

export function getAllUsersProfiles(): UserProfile[] {
  return Object.values(db.users).map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    avatar: u.avatar,
    isOnboarded: u.isOnboarded,
    interests: u.interests,
    referralCode: u.referralCode,
    referredBy: u.referredBy,
    referralsCount: u.referralsCount,
    balance: u.balance,
    joinedAt: u.joinedAt,
    careerState: u.careerState
  }));
}

export function setUserRoleForcefully(adminUserId: string, targetUserId: string, newRole: UserRole): UserProfile {
  const target = db.users[targetUserId];
  if (!target) throw new Error("User does not exist");

  const oldRole = target.role;
  target.role = newRole;

  addAuditLog(adminUserId, "USER_ROLE_OVERRIDDEN", `Superuser manually overrode ${target.fullName}'s role from [${oldRole}] to [${newRole}]`, "Admin Portal");
  saveDatabase();

  return getProfileByToken(targetUserId)!;
}

export function deletePostByModerator(cmUserId: string, postId: string) {
  db.communityPosts = db.communityPosts.filter(p => p.id !== postId);
  addAuditLog(cmUserId, "POST_DELETED_MODERATION", `Deleted post id ${postId} due to safety constraints.`, "Communities Hub Moderation");
  saveDatabase();
}

export function getCommunityPosts(): CommunityPost[] {
  return db.communityPosts;
}

export function saveCommunityPost(userId: string, content: string, channel: string): CommunityPost {
  const user = db.users[userId];
  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    channel: channel || "general",
    authorName: user?.fullName || "Anonymous Member",
    authorRole: user ? `${user.role.toUpperCase()} @ Expert` : "Member",
    authorAvatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    content,
    timestamp: "Just now",
    upvotes: 1,
    commentsCount: 0,
    sentiment: "neutral"
  };

  db.communityPosts.unshift(newPost);
  
  if (user) {
    user.careerState.xp += 50;
    if (user.careerState.xp >= user.careerState.level * 1000) {
      user.careerState.level += 1;
    }
  }

  addAuditLog(userId, "COMMUNITY_POST_CREATED", `Added statement within channel #${channel}`, "Express Chat core");
  saveDatabase();

  return newPost;
}

export function upvotePost(postId: string): CommunityPost | null {
  const post = db.communityPosts.find(p => p.id === postId);
  if (post) {
    post.upvotes += 1;
    saveDatabase();
    return post;
  }
  return null;
}
