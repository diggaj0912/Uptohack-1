import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { 
  TrendingUp, Users, DollarSign, Calendar, Cpu, ShieldAlert, Activity, 
  Target, Ticket, Share2, MessageSquare, AlertCircle, RefreshCw, Sparkles, 
  PieChart as ChartIcon, Eye, Zap, ArrowDownRight, Layers, HelpCircle, Trophy
} from "lucide-react";

interface SaaSAnalyticsModuleProps {
  sessionToken: string;
}

// Static mockup data mapped to the 6 persona perspectives
const ADMIN_KPI_DATA = [
  { name: "Monthly Active Users", val: "148,290", change: "+12.4%", desc: "Unique active user handles", trend: "up", icon: Users },
  { name: "Gross Transacted Vol.", val: "$1,489,200", change: "+24.8%", desc: "Direct ticket + sponsor capital", trend: "up", icon: DollarSign },
  { name: "Server API Requests", val: "48.2M", change: "99.98% SLA", desc: "Edge router intercept volume", trend: "stable", icon: Activity },
  { name: "Fraud Risk Scoring", val: "0.02%", change: "-0.08%", desc: "Flagged multi-IP credential activity", trend: "down", icon: ShieldAlert }
];

const ORGANIZER_KPI_DATA = [
  { name: "Total Tickets Sold", val: "12,492", change: "+18.2%", desc: "Dynamic seat booking total", trend: "up", icon: Ticket },
  { name: "Checkout Funnel Conv.", val: "68.2%", change: "+4.1%", desc: "Conversion from details view", trend: "up", icon: Target },
  { name: "SaaS Campaign CTR", val: "22.4%", change: "+5.1%", desc: "Email reminder clicks response", trend: "up", icon: Share2 },
  { name: "Organizer Net Revenue", val: "$248,500", change: "+16.8%", desc: "Post-commissions balance", trend: "up", icon: DollarSign }
];

const RECRUITER_KPI_DATA = [
  { name: "Candidate CV Views", val: "48,910", change: "+35.2%", desc: "Profile audit read actions", trend: "up", icon: Eye },
  { name: "Top Skills Match Index", val: "88.4%", change: "High Fit", desc: "Correlation to job descriptions", trend: "stable", icon: Cpu },
  { name: "ATS Automated Scans", val: "8,490", change: "+44.1%", desc: "Automated candidate comparisons", trend: "up", icon: Layers },
  { name: "Avg Recruitment Speed", val: "4.2 days", change: "-1.8 days", desc: "Time taken to schedule prep mock", trend: "up", icon: Zap }
];

const SPONSOR_KPI_DATA = [
  { name: "Active Sponsorships", val: "18 events", change: "Max Tier", desc: "Upcoming hackathons backed", trend: "stable", icon: Calendar },
  { name: "Coupon Redemptions", val: "1,249", change: "78% CTR", desc: "Promo vouchers claimed by hackers", trend: "up", icon: Ticket },
  { name: "Corporate Hub Leads", val: "4,190", change: "+28.4%", desc: "CV access permissions granted", trend: "up", icon: Users },
  { name: "Total Dollars Committed", val: "$450,000", change: "Completed", desc: "Sponsor tier payment settlements", trend: "stable", icon: DollarSign }
];

const USER_KPI_DATA = [
  { name: "User Career XP", val: "18,490", change: "Level 14", desc: "Synthesizer + Prep preparation XP", trend: "up", icon: Target },
  { name: "Registered Hackathons", val: "6 Challenges", change: "2 Active", desc: "Competitions currently enrolled", trend: "stable", icon: Trophy },
  { name: "Completed CV ATS Score", val: "84/100", change: "Optimal", desc: "CV structural scanner accuracy", trend: "up", icon: Eye },
  { name: "Total Referrals Credited", val: "14 signups", change: "K = 1.34", desc: "Organic growth loop referrals", trend: "up", icon: Share2 }
];

const COMMUNITY_KPI_DATA = [
  { name: "Active Chat Messages", val: "142,900", change: "+22.4%", desc: "Discord bridge channel traffic", trend: "up", icon: MessageSquare },
  { name: "Aesthetic Post Index", val: "94.2%", change: "Positive Sentiment", desc: "Negative spam filter clearances", trend: "stable", icon: Sparkles },
  { name: "Spam Removals", val: "18 flags", change: "-42.1%", desc: "AI automated moderation wipes", trend: "down", icon: ShieldAlert },
  { name: "Channel Subscriptions", val: "18,400", change: "+15.6%", desc: "Community notification subscribers", trend: "up", icon: Users }
];

// Recharts Datasets mapped to roles
const GROWTH_TIMELINE_DATA = [
  { date: "May 20", DAU: 45000, MAU: 110000, GTV: 800000 },
  { date: "May 21", DAU: 48000, MAU: 115000, GTV: 910000 },
  { date: "May 22", DAU: 55000, MAU: 122000, GTV: 1050000 },
  { date: "May 23", DAU: 68000, MAU: 130000, GTV: 1180000 },
  { date: "May 24", DAU: 72000, MAU: 138000, GTV: 1290000 },
  { date: "May 25", DAU: 81000, MAU: 144000, GTV: 1400000 },
  { date: "May 26", DAU: 89000, MAU: 148290, GTV: 1489200 }
];

const FUNNEL_CONVERSION_DATA = [
  { step: "1. Landing Hits", count: 18400, percent: 100 },
  { step: "2. Challenge Read", count: 12400, percent: 67 },
  { step: "3. CV Upload Check", count: 8100, percent: 44 },
  { step: "4. Ticket Settled", count: 5520, percent: 30 }
];

const SKILLSET_DISTRIBUTION = [
  { skill: "TypeScript / Node.js", studentCount: 78, recruiterSearches: 90 },
  { skill: "React / Frontend", studentCount: 85, recruiterSearches: 75 },
  { skill: "Python / PyTorch / ML", studentCount: 52, recruiterSearches: 85 },
  { skill: "Rust / WASM", studentCount: 30, recruiterSearches: 45 },
  { skill: "Docker / K8s / DevOps", studentCount: 40, recruiterSearches: 60 }
];

const AI_USAGE_PIE = [
  { name: "Semantic Redis Hits", value: 68 },
  { name: "Cold LLM API Requests", value: 32 }
];

const SPONSOR_COUPON_CTR = [
  { date: "May 20", clicks: 120, redemptions: 45 },
  { date: "May 21", clicks: 150, redemptions: 60 },
  { date: "May 22", clicks: 180, redemptions: 95 },
  { date: "May 23", clicks: 230, redemptions: 140 },
  { date: "May 24", clicks: 310, redemptions: 210 },
  { date: "May 25", clicks: 380, redemptions: 290 },
  { date: "May 26", clicks: 450, redemptions: 390 }
];

const COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

// Simulated ClickHouse / Kafka event logs
const INSTANT_AUDIT_LOGS = [
  { id: "e1", topic: "user-tracking", entity: "STUDENT", action: "PAGE_VIEW_ATS_AUDIT", raw: '{"ip": "13.44.110.15", "duration_ms": 1420}', status: "INFO" },
  { id: "e2", topic: "payment-alerts", entity: "SPONSOR", action: "CHECKOUTS_COMPLETED", raw: '{"amount": 10000, "idem_key": "idem-init-3"}', status: "SECURE" },
  { id: "e3", topic: "ai-usage", entity: "AI_COPILOT", action: "RESUME_ANALYZED_HITS", raw: '{"tokens": 845, "cache_hit": true}', status: "CACHE" },
  { id: "e4", topic: "community-sentiment", entity: "FORUM", action: "MODERATE_SPAN_FILTER", raw: '{"flag": "CLEAR", "vibe": "POSITIVE"}', status: "INFO" },
  { id: "e5", topic: "payment-alerts", entity: "ORGANIZER", action: "PAYOUT_INITIATED", raw: '{"amount": 150.00, "iban": "DE8937..."}', status: "DISPATCH" }
];

export default function SaaSAnalyticsModule({ sessionToken }: SaaSAnalyticsModuleProps) {
  const [activePerspective, setActivePerspective] = useState<"admin" | "organizer" | "recruiter" | "sponsor" | "user" | "community">("admin");
  const [aiInsightResult, setAiInsightResult] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [liveStreamLogs, setLiveStreamLogs] = useState<typeof INSTANT_AUDIT_LOGS>(INSTANT_AUDIT_LOGS);

  // Auto scroll logs simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const actions = ["ATS_CV_SCANNED", "TICKET_CARD_CHARGE_STARTED", "REDIS_CACHE_READ_HIT", "DISCORD_POST_EMARK_MODERATED", "STRIPE_CONNECT_BANK_TRANSFER"];
      const entities = ["STUDENT", "SPONSOR", "ORGANIZER", "ADMIN", "FORUM"];
      const topics = ["user-tracking", "payment-alerts", "ai-usage", "community-sentiment", "user-tracking"];
      const statuses = ["INFO", "SECURE", "CACHE", "INFO", "DISPATCH"];
      
      const newLog = {
        id: `e-${Date.now()}`,
        topic: topics[Math.floor(Math.random() * topics.length)],
        entity: entities[Math.floor(Math.random() * entities.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        raw: JSON.stringify({
          pid: Math.floor(Math.random() * 5000),
          region: "ASIA-PACIFIC",
          latency_ms: Math.floor(Math.random() * 50) + 1,
          time_utc: new Date().toISOString()
        }),
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };

      setLiveStreamLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const getKPIs = () => {
    switch (activePerspective) {
      case "admin": return ADMIN_KPI_DATA;
      case "organizer": return ORGANIZER_KPI_DATA;
      case "recruiter": return RECRUITER_KPI_DATA;
      case "sponsor": return SPONSOR_KPI_DATA;
      case "user": return USER_KPI_DATA;
      case "community": return COMMUNITY_KPI_DATA;
    }
  };

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    setAiInsightResult("");
    
    try {
      // Trigger API insights proxy or simulate robust AI response locally if Gemini isn't initialized
      const promptContext = {
        role: activePerspective,
        kpis: getKPIs(),
        met: GROWTH_TIMELINE_DATA[GROWTH_TIMELINE_DATA.length - 1]
      };

      // Let's call the API if needed or compile a high-fidelity output instantaneously
      setTimeout(() => {
        let text = "";
        if (activePerspective === "admin") {
          text = `### 🧠 Enterprise BI AI Advisory (CISO & CTO Alignment)

- **Redis Cache Acceleration**: Cache hit ratios are optimized at **68%**. High-priority recommendation: preheat common ATS evaluation keywords to bump hit bounds to **75%**, reducing cold database hosting expenditures by **$550/month**.
- **Security & Fraud Scrapes**: Fraud anomalies are extremely low (**0.02%**). However, we detected localized vertical bursts of card checking tests out of IP aggregates. Recommendation: Maintain current rate-limit throttling bounds on the ticket checkout checkout routes.
- **Infrastructure Performance**: Database indexes calculated for \`user_interaction_events\` are functioning optimally. Time to First Byte (TTFB) is stabilized at **32ms**.`;
        } else if (activePerspective === "organizer") {
          text = `### 🎯 Marketing & Event Optimization Insights

- **Registration Funnel Leakage**: We detected a registration conversion leakage between the *Challenge Read* and the *CV Upload Check* step (slipping from **67%** to **44%**). Recommended intervention: Offer automated instant-fill fields leveraging prior credentials to bypass document requirements.
- **Dynamic Vouchers**: Campaign responses are high (**22.4%** CTR). Vouchers tagged with coupon **HACK_AUTUMN_20** accounted for **35%** of ticket checkouts completed yesterday.`;
        } else if (activePerspective === "recruiter") {
          text = `### 👥 Recruitment Pipeline Talent Insights

- **Skill Search Trends**: Corporate searches on Rust and Python modules are outstripping student candidate inventories, making candidates matching these skills premium acquisitions. Urge organizers to host designated sub-challenges.
- **ATS Filter Parameters**: Average CV scans are high (**8,490** checks). Recruiter engagement benchmarks reveal that CV profiles which register an ATS score of **80+** are **4x** more likely to convert into booked mentor prep preparation slots.`;
        } else if (activePerspective === "sponsor") {
          text = `### ⭐ Sponsor ROI & Conversion Insights

- **Voucher Campaign Index**: Sponsor redemptions are scaling linearly, showcasing maximum brand exposure. Gold sponsorships for targeted student tech hackathons show a high click-through rate of **78%**.
- **Talent Recruitment Lead Acquisition**: Out of **4,190** corporate profile views, **65%** have successfully requested direct career outreach permissions. Dynamic brand positioning with high-tier prizes maximizes conversions.`;
        } else {
          text = `### 💡 Personalized Career Growth Diagnostics

- **Viral Loop Growth Metrics**: The referral multiplier is currently at **K = 1.34**. Since the virality score is above 1.00, your invite loops are generating organic traction! 
- **ATS Career Roadmaps**: Your CV ATS layout scoring of **84/100** puts you inside the 85th percentile of matching applicants. For an optimized booster trail, finish the remaining ML prep preparation modules to gather an extra +150 XP.`;
        }
        
        setAiInsightResult(text);
        setLoadingInsights(false);
      }, 1200);
    } catch (err) {
      setAiInsightResult("Telemetry analyzer reported system errors. Check connection parameters.");
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-neutral-200">
      
      {/* Page Title & Insight Selection Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950 via-neutral-950 to-neutral-950 border border-indigo-950/40 flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#06b6d4] flex items-center gap-1.5">
            <ChartIcon className="w-3.5 h-3.5" /> Product Intelligence
          </span>
          <h2 className="text-md font-bold text-white">SaaS Product Intelligence & Real-time Telemetry</h2>
          <p className="text-xs text-neutral-400">
            Monitor real-time event pipelines, cohort funnel conversions, AI prompt budgets, and community forum sentiment.
          </p>
        </div>

        {/* Dynamic perspective selectors */}
        <div className="flex flex-wrap gap-1.5 self-center shrink-0">
          {([
            { id: "admin", label: "Super Admin", color: "text-[#8b5cf6]" },
            { id: "organizer", label: "Event Organizer", color: "text-[#10b981]" },
            { id: "recruiter", label: "Recruiter Hub", color: "text-[#ec4899]" },
            { id: "sponsor", label: "Sponsor Lounge", color: "text-[#f59e0b]" },
            { id: "user", label: "Student Hub", color: "text-[#06b6d4]" },
            { id: "community", label: "Community", color: "text-white" }
          ] as const).map(pers => {
            const isActive = activePerspective === pers.id;
            return (
              <button
                key={pers.id}
                onClick={() => {
                  setActivePerspective(pers.id);
                  setAiInsightResult("");
                }}
                className={`px-3 py-1.5 text-[11px] font-bold font-mono rounded cursor-pointer transition border ${
                  isActive 
                    ? "bg-neutral-900 border-[#06b6d4] text-[#06b6d4] shadow-sm transform scale-102" 
                    : "bg-neutral-950 border-neutral-900 hover:bg-neutral-900/60 text-neutral-400"
                }`}
              >
                {pers.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Scoreboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getKPIs().map((kpi, idx) => {
          const Icon = kpi.icon || TrendingUp;
          return (
            <div 
              key={idx} 
              className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 flex flex-col justify-between hover:border-neutral-800 transition group relative overflow-hidden h-28"
            >
              <div className="absolute right-0 top-0 w-16 h-16 bg-[#06b6d4]/3 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition" />
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider font-semibold">{kpi.name}</span>
                <span className={`p-1 rounded-md bg-neutral-900 border border-neutral-850 text-[#06b6d4]`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-black text-white">{kpi.val}</span>
                <span className={`text-[10px] font-mono ${kpi.trend === "up" ? "text-emerald-400" : kpi.trend === "down" ? "text-red-400" : "text-neutral-400"}`}>
                  {kpi.change}
                </span>
              </div>
              <span className="text-[9.5px] text-neutral-500 font-mono italic block truncate mt-1">{kpi.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Core Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Left Context Panel (Varies dynamically) */}
        <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Active Platform Momentum
            </h3>
            <p className="text-[11px] text-neutral-400">
              Live measurement of metrics scaling curves and general engagement velocity.
            </p>
          </div>

          <div className="h-64 font-sans text-neutral-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_TIMELINE_DATA}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGtv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px' }}
                  labelClassName="text-white font-bold"
                />
                <Area type="monotone" dataKey="DAU" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDau)" strokeWidth={2} name="Daily Active Users" />
                <Area type="monotone" dataKey="MAU" stroke="#8b5cf6" fillOpacity={0} name="Monthly Active Users" strokeDasharray="5 5" />
                <Legend style={{ fontSize: '11px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Right Context Panel (Customized according to selected perspective tab) */}
        <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-normal flex items-center gap-1.5 font-mono text-cyan-400">
              <Layers className="w-3.5 h-3.5" /> High-Utility Focus Breakdown
            </h3>
            <p className="text-[11px] text-neutral-400">
              {activePerspective === "admin" && "AI query caching efficiency and Redis memory statistics."}
              {activePerspective === "organizer" && "Conversion rates inside the checkout funnel."}
              {activePerspective === "recruiter" && "Comparative matching between candidates and talent seeks."}
              {activePerspective === "sponsor" && "Corporate voucher claims response velocity."}
              {activePerspective === "user" && "Candidate index scores mapping core tech stacks."}
              {activePerspective === "community" && "AI evaluation cache models vs raw networks."}
            </p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {activePerspective === "organizer" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FUNNEL_CONVERSION_DATA} layout="vertical">
                  <CartesianGrid stroke="#262626" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <YAxis dataKey="step" type="category" stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Users Converted">
                    {FUNNEL_CONVERSION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : activePerspective === "recruiter" || activePerspective === "user" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLSET_DISTRIBUTION}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis dataKey="skill" stroke="#9ca3af" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '8px' }} />
                  <Radar name="Active Candidate Profiles" dataKey="studentCount" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                  <Radar name="Recruiter Query Seeks" dataKey="recruiterSearches" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Legend style={{ fontSize: '10px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : activePerspective === "sponsor" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPONSOR_COUPON_CTR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} name="Total Code Clicks" />
                  <Line type="monotone" dataKey="redemptions" stroke="#ef4444" strokeWidth={2} name="Conversions Claimed" />
                  <Legend style={{ fontSize: '10px' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              // Default admin / community / fallback layout (AI semantic Redis savings)
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={AI_USAGE_PIE}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {AI_USAGE_PIE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Third Row Split: Live Kafka Logging Streams + AI Analyzer Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Kafka stream column */}
        <div className="lg:col-span-1 bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 text-[9px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /> Kafka Stream Ingestion
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Live ClickHouse Events logger</h3>
            <p className="text-[11px] text-neutral-500">
              Streaming platform user behaviors tracked to Kafka and recorded to columnar indices.
            </p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {liveStreamLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 bg-neutral-900/40 border border-neutral-900 rounded-lg text-[10px] font-mono space-y-1 hover:border-neutral-800 transition"
              >
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-neutral-400">Topic: <strong className="text-cyan-400">{log.topic}</strong></span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                    log.status === "SECURE" ? "bg-emerald-500/10 text-emerald-400" :
                    log.status === "CACHE" ? "bg-blue-400/10 text-blue-400" : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-white font-bold leading-relaxed">{log.entity} &rarr; {log.action}</div>
                <div className="text-neutral-500 text-[8.5px] truncate max-w-full italic">{log.raw}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight generator column */}
        <div className="lg:col-span-2 bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#f59e0b] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI LLM Insights
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-350 font-mono">NexStart Analytics Advisor</h3>
                <p className="text-[11px] text-neutral-400">
                  Analyze current data parameters to yield optimization parameters, referral growth loops, and cost reductions.
                </p>
              </div>

              <button
                onClick={generateAIInsights}
                disabled={loadingInsights}
                className="p-2 px-3 bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-[#090d16] font-bold rounded text-xs transition cursor-pointer flex items-center gap-1"
              >
                {loadingInsights ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Ask AI Analyst
              </button>
            </div>

            {aiInsightResult ? (
              <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-lg text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap font-sans">
                {aiInsightResult}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-600 border border-dashed border-neutral-90 *00 rounded-lg flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-neutral-750" />
                <span>Select a perspective and click "Ask AI Analyst" to compute target SaaS optimization advice.</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-neutral-900/50 border border-neutral-900 rounded-lg flex items-center gap-2.5 text-[10px] text-neutral-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>ClickHouse queries compiled on $25,000$ index rows are cached inside optimized memory states.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
