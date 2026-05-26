import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Users, Server, FileText, Settings, ShieldCheck, 
  RefreshCw, CheckCircle, AlertTriangle, Shield, HardDrive, Key 
} from "lucide-react";
import { UserProfile, UserRole } from "../types";

interface AdminRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
  onRoleChanged: () => void;
}

export default function AdminRoleModule({ sessionToken, onAddXP, onRoleChanged }: AdminRoleModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "antifraud" | "audits">("catalog");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [overrideRole, setOverrideRole] = useState<UserRole>("student");

  const [overrideSuccess, setOverrideSuccess] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeSubTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === "catalog") {
        const pRes = await fetch("/api/admin/profiles", {
          headers: { "Authorization": `Bearer ${sessionToken}` }
        });
        const pData = await pRes.json();
        if (Array.isArray(pData)) {
          setProfiles(pData);
          if (pData.length > 0) setSelectedProfileId(pData[0].id);
        }
      } else if (activeSubTab === "audits") {
        const aRes = await fetch("/api/admin/audits", {
          headers: { "Authorization": `Bearer ${sessionToken}` }
        });
        const aData = await aRes.json();
        if (Array.isArray(aData)) {
          setAuditLogs(aData);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    setLoading(true);
    setOverrideSuccess(false);
    try {
      const res = await fetch("/api/admin/override-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ userId: selectedProfileId, role: overrideRole })
      });
      if (res.ok) {
        setOverrideSuccess(true);
        onAddXP(100);
        setTimeout(() => setOverrideSuccess(false), 3000);
        fetchAdminData();
        onRoleChanged(); // Trigger reload of dynamic self role
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured mock anti-fraud metrics representing strict validation and diagnostic audits
  const antiFraudHeuristics = [
    { id: "heur-1", name: "Multi-Registration RSVP IP Audit", desc: "Flag profiles registering for same event with identical browser contexts.", status: "CLEAN", count: 0, severity: "low" },
    { id: "heur-2", name: "ATS Scraper Bot Heuristic", desc: "Monitors candidate downloads exceeding 15 resumestitle indices per 60s.", status: "WARNING", count: 2, severity: "high" },
    { id: "heur-3", name: "AI Interviewer Bypass Pattern", desc: "Suspect copy-paste coding answers injected inside mock text transcript boxes.", status: "MONITOR", count: 5, severity: "med" },
    { id: "heur-4", name: "Disruptive Community Sentiment Flags", desc: "Automated trigger for negative comments exceeding 75% toxicity thresholds.", status: "CLEAN", count: 0, severity: "low" }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Overview Block */}
      <div className="p-4 bg-gradient-to-tr from-amber-600/10 via-neutral-950 to-neutral-950 border border-amber-600/20 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">administrative control room</span>
          <h2 className="text-md font-bold text-white mt-1">Super Administrative Suite</h2>
          <p className="text-xs text-neutral-450 text-neutral-400">Review system diagnostics, manage credential overrides, audit security triggers, and monitor real-time audit logs of critical actions.</p>
        </div>
      </div>

      {/* Admin navigation hubs */}
      <div className="flex gap-2 border-b border-neutral-900 pb-px">
        {[
          { id: "catalog" as const, name: "Core Profiles catalog", icon: Users },
          { id: "antifraud" as const, name: "Anti-Fraud heuristics", icon: ShieldAlert },
          { id: "audits" as const, name: "System Audit folder", icon: FileText }
        ].map(hub => {
          const IconComponent = hub.icon;
          const isSelected = activeSubTab === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => setActiveSubTab(hub.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition outline-none cursor-pointer ${
                isSelected 
                  ? "border-amber-500 text-white" 
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" /> {hub.name}
            </button>
          );
        })}
      </div>

      {/* CONTENTS */}

      {/* 1. CATALOGUE PROFILES MODIFIER & OVERRIDES */}
      {activeSubTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* User modifier form */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Role Overrides panel</h3>
              <p className="text-[11px] text-neutral-500">Mutate user permissions on the fly. Isolations automatically update.</p>
            </div>

            {overrideSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-[10px] text-emerald-400 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Override updated! Profiles re-isolated securely.</span>
              </div>
            )}

            <form onSubmit={handleOverrideRole} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-550 block text-neutral-400">Target profile</label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => {
                    setSelectedProfileId(e.target.value);
                    const prof = profiles.find(p => p.id === e.target.value);
                    if (prof) setOverrideRole(prof.role);
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-amber-500 transition"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-550 block text-neutral-400">New Isolation override Role</label>
                <select
                  value={overrideRole}
                  onChange={(e) => setOverrideRole(e.target.value as UserRole)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white rounded px-2.5 py-1.5 outline-none focus:border-amber-500 transition"
                >
                  <option value="student">Student</option>
                  <option value="organizer">Organizer</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="judge">Judge</option>
                  <option value="mentor">Mentor</option>
                  <option value="community_manager">Community Manager</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold font-sans flex items-center justify-center gap-1 cursor-pointer transition"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />} Force Lock Role Override
              </button>
            </form>
          </div>

          {/* List catalog folder */}
          <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Platform profile repository</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-neutral-300">
                <thead className="bg-neutral-900 font-mono text-[9px] uppercase tracking-wider text-neutral-550 text-neutral-500">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Isolation Group</th>
                    <th className="p-3 text-right">XP Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {profiles.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-900/10">
                      <td className="p-3 font-semibold text-white">{p.fullName}</td>
                      <td className="p-3 font-mono text-neutral-400">{p.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 text-[9px] font-mono rounded text-purple-400 uppercase font-black">
                          {p.role}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-neutral-100">{p.xp || 0} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANTI-FRAUD DIAGNOSTICS */}
      {activeSubTab === "antifraud" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in font-sans">
          
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Heuristics Engine diagnostics</h3>
              <p className="text-xs text-neutral-400">Heuristic triggers analyze bypass vectors and double sign-ups across events.</p>
            </div>

            <div className="space-y-3">
              {antiFraudHeuristics.map((h) => (
                <div key={h.id} className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-xl flex justify-between items-start text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-white block">{h.name}</span>
                    <span className="text-[10px] text-neutral-500 block leading-relaxed">{h.desc}</span>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                      h.status === "CLEAN" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                      h.status === "WARNING" ? "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse" :
                      "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    }`}>
                      {h.status}
                    </span>
                    {h.count > 0 && (
                      <span className="text-[10px] font-mono text-neutral-400 block mt-1.5">{h.count} suspicious logs</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser scrape vectors folder */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-sans">Scraper Bot Warn rules triggers: 2 suspect automated tokens detected.</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-850 font-mono text-[10px] leading-relaxed text-neutral-300">
                  <span className="text-neutral-500 block">[UTC 14:10] SUSPECT USER AGENT PATHWAY</span>
                  <span className="text-red-400 font-bold block">IP: 198.51.100.42</span>
                  <span>Bypassed sandbox authentication metrics and queried `/api/career`. System issued rejection code.</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-850 font-mono text-[10px] leading-relaxed text-neutral-300">
                  <span className="text-neutral-500 block">[UTC 13:05] MULTIPLE FORM ACTIONS</span>
                  <span className="text-red-400 font-bold block">IP: 203.0.113.19</span>
                  <span>Re-rendered login submissions 9 times in 10 seconds under target student@nexus.io. Locking security barrier.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-900 space-y-2">
              <span className="text-[8px] font-mono text-neutral-500 block">DANGER ENVIRONMENT OVERRIDES</span>
              <button
                type="button"
                onClick={() => onAddXP(100)}
                className="w-full text-rose-400 hover:text-rose-300 border border-red-500/15 hover:border-red-500/30 p-2 bg-red-500/5 rounded text-xs font-semibold cursor-pointer"
              >
                Trigger Global Recalibration Lockdown Mode
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. SECURITY AUDITS FOLDER */}
      {activeSubTab === "audits" && (
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4 animate-fade-in font-sans">
          <div>
            <h3 className="text-sm font-bold text-white">System Audit Trace folder</h3>
            <p className="text-xs text-neutral-400">Chronological trail of critical security permission adjustments and server overrides.</p>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-neutral-600 py-4 text-center">No audit trail logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg flex justify-between items-center text-xs font-mono">
                  <div className="space-y-1 text-left">
                    <div className="flex gap-2">
                      <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded uppercase">
                        {log.action}
                      </span>
                      <span className="text-white font-bold leading-none">{log.description}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 leading-normal block">Actor Context: user_id={log.userId} x role={log.role}</span>
                  </div>
                  <span className="text-neutral-550 text-neutral-500 ml-4 shrink-0 text-right text-[10px]">
                    {log.timestamp.split('T')[1].substring(0,8)} UTC
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
