/**
 * NexStart AI Platform Shared TypeScript Types
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: 'hackathon' | 'meetup' | 'workshop' | 'webinar';
  organizer: string;
  attendeesCount: number;
  isRegistered: boolean;
  image?: string;
  aiSummary?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface Resume {
  fullName: string;
  email: string;
  phone: string;
  website: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

export interface ATSFeedback {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  jdMatchScore?: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  role: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewFeedback {
  score: number;
  strength: string;
  weakness: string;
  suggestedAnswer: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  questions: InterviewQuestion[];
  answers: Record<string, string>; // questionId -> answer
  feedbacks: Record<string, InterviewFeedback>; // questionId -> feedback
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  channel: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  upvotes: number;
  commentsCount: number;
  sentiment?: 'positive' | 'neutral' | 'constructive' | 'curious';
}

export interface UserCareerState {
  fullName: string;
  xp: number;
  level: number;
  streak: number;
  skillsTracker: Record<string, number>; // e.g., 'React': 80, 'Node': 65
  recentRecommendations: string[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  category: string;
}

export type UserRole = 
  | 'student' 
  | 'organizer' 
  | 'recruiter' 
  | 'admin' 
  | 'sponsor' 
  | 'judge' 
  | 'mentor' 
  | 'community_manager';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  isOnboarded: boolean;
  interests: string[];
  referralCode: string;
  referredBy: string | null;
  referralsCount: number;
  balance: number;
  joinedAt: string;
  token?: string;
  careerState: UserCareerState;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
}

export interface EmailCampaign {
  id: string;
  eventId: string;
  eventTitle: string;
  subject: string;
  content: string;
  status: 'sent' | 'scheduled';
  sentCount: number;
  opens: number;
  clicks: number;
  timestamp: string;
}

export interface WhatsAppReminder {
  id: string;
  eventId: string;
  messageType: 'announcement' | 'rsvp-warning' | 'pre-event-reminder';
  copyText: string;
  sentCount: number;
  timestamp: string;
}

export interface HackathonTeam {
  id: string;
  eventId: string;
  teamName: string;
  inviteCode: string;
  leaderId: string;
  memberIds: string[];
  skillsWanted: string[];
  seekingTeammates: boolean;
}

export interface ProjectSubmission {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl: string;
  githubUrl: string;
  submittedBy: string;
  submitterName: string;
  grades: Record<string, {
    innovation: number;
    design: number;
    technical: number;
    score: number;
    feedback: string;
  }>; // judgeId -> grade
  averageScore?: number;
}

export interface SponsorshipBundle {
  id: string;
  eventId: string;
  eventTitle: string;
  sponsorId: string;
  sponsorName: string;
  status: 'pending' | 'approved' | 'rejected';
  tier: 'bronze' | 'silver' | 'gold' | 'custom';
  fundsOffered: number;
  swagGoodies: string;
  couponCodes: string[];
  clicksMetric: number;
}

export interface VolunteerRole {
  id: string;
  eventId: string;
  userEmail: string;
  roleType: 'volunteer' | 'moderator' | 'sub_admin';
  permissions: string[];
}

