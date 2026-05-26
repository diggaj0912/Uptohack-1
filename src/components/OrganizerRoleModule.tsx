import React, { useState, useEffect } from "react";
import { 
  Trophy, Mail, MessageSquare, Megaphone, Share2, DollarSign, Gift, 
  Users, CheckCircle, XCircle, Send, Plus, RefreshCw, Calendar, ChevronRight, QrCode
} from "lucide-react";

interface OrganizerRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number, skill?: string) => void;
}

export default function OrganizerRoleModule({ sessionToken, onAddXP }: OrganizerRoleModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"crm" | "emails" | "whatsapp" | "referrals" | "sponsors">("crm");
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Email blast states
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // WhatsApp blast states
  const [waType, setWaType] = useState<"announcement" | "rsvp-warning" | "pre-event-reminder">("announcement");
  const [waText, setWaText] = useState("");
  const [waBulletins, setWaBulletins] = useState<any[]>([]);

  // Referrals state
  const [referrals, setReferrals] = useState<any[]>([]);

  // Sponsors bids states
  const [sponsorshipList, setSponsorshipList] = useState<any[]>([]);

  // New Event Publish form
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newCat, setNewCat] = useState("hackathon");

  // Certificate generator preview helper
  const [certAttendee, setCertAttendee] = useState("Alex Rivera");
  const [certEvent, setCertEvent] = useState("Nexus Global Summit");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventData = async () => {
    try {
      // Fetch Email Campaigns
      const eRes = await fetch(`/api/organizer/campaigns/${selectedEventId}`, {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const eData = await eRes.json();
      if (Array.isArray(eData)) setCampaigns(eData);

      // Fetch WhatsApp bulletins
      const wRes = await fetch(`/api/organizer/whatsapp/${selectedEventId}`, {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const wData = await wRes.json();
      if (Array.isArray(wData)) setWaBulletins(wData);

      // Fetch referrals
      const rRes = await fetch(`/api/organizer/referrals/${selectedEventId}`);
      const rData = await rRes.json();
      if (Array.isArray(rData)) setReferrals(rData);

      // Fetch sponsor bids
      const sRes = await fetch(`/api/sponsor/bundles/${selectedEventId}`);
      const sData = await sRes.json();
      if (Array.isArray(sData)) setSponsorshipList(sData);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          date: newDate,
          location: newLoc,
          category: newCat
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowPublishModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewDate("");
        setNewLoc("");
        onAddXP(200, "Full-Stack Web");
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmailBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailContent) return;
    try {
      const res = await fetch(`/api/organizer/campaigns/${selectedEventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ subject: emailSubject, content: emailContent })
      });
      if (res.ok) {
        setEmailSubject("");
        setEmailContent("");
        onAddXP(100, "ATS Alignment");
        fetchEventData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWhatsAppBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waText) return;
    try {
      const res = await fetch(`/api/organizer/whatsapp/${selectedEventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ messageType: waType, copyText: waText })
      });
      if (res.ok) {
        setWaText("");
        onAddXP(100, "System Design");
        fetchEventData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSponsorship = async (bidId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/sponsor/approve/${bidId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ approve })
      });
      if (res.ok) {
        onAddXP(100);
        fetchEventData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedEventInfo = myEvents.find(ev => ev.id === selectedEventId);

  return (
    <div className="space-y-6">
      
      {/* Header Selector bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950 p-4 border border-neutral-900 rounded-xl">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-neutral-550 block">Managed Program Context</label>
          <div className="flex gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-purple-500 transition font-sans"
            >
              {myEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowPublishModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-sans flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish Event
            </button>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="flex gap-6 text-right items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Registrar Total</span>
            <span className="text-md font-bold font-mono text-white">{selectedEventInfo?.attendeesCount || 0}</span>
          </div>
          <div className="w-[1px] h-6 bg-neutral-850" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Event Category</span>
            <span className="text-xs font-semibold uppercase text-purple-400 font-mono">{selectedEventInfo?.category || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex gap-1.5 border-b border-neutral-900 pb-px">
        {[
          { id: "crm" as const, name: "Event Registrations", icon: Users },
          { id: "emails" as const, name: "Email Blaster", icon: Mail },
          { id: "whatsapp" as const, name: "WhatsApp reminders", icon: MessageSquare },
          { id: "referrals" as const, name: "Referral program", icon: Share2 },
          { id: "sponsors" as const, name: "Sponsor approvals", icon: DollarSign }
        ].map(subTab => {
          const Icon = subTab.icon;
          const isSelected = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition outline-none cursor-pointer ${
                isSelected 
                  ? "border-purple-500 text-white" 
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {subTab.name}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}

      {/* 1. CRM SECTION */}
      {activeSubTab === "crm" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase text-neutral-300 font-mono tracking-wider">Live Attendees Register</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-neutral-300">
                  <thead className="bg-neutral-900 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                    <tr>
                      <th className="p-3">Identifier</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr>
                      <td className="p-3 font-semibold text-white">Alex Rivera</td>
                      <td className="p-3 font-mono text-neutral-400">student@nexus.io</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 rounded font-mono font-bold uppercase">rsvp approved</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Amara Vance</td>
                      <td className="p-3 font-mono text-neutral-400">cm@nexus.io</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 rounded font-mono font-bold uppercase">rsvp approved</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certificate Template Preview Generator */}
            <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Interactive Certificate Customizer</h3>
                <p className="text-xs text-neutral-400">Design QR-verified badges and certificate credentials for download.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Preview Candidate Name</label>
                    <input 
                      type="text" 
                      value={certAttendee}
                      onChange={(e) => setCertAttendee(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Ecosystem Event Title</label>
                    <input 
                      type="text" 
                      value={certEvent}
                      onChange={(e) => setCertEvent(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => onAddXP(150, "Full-Stack Web")}
                    className="p-2 w-full bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-sans font-bold transition"
                  >
                    Deploy Verification Schema (+150 XP)
                  </button>
                </div>

                {/* VISUAL CERTIFICATE PREVIEW */}
                <div className="border border-neutral-800 rounded-lg p-5 bg-gradient-to-tr from-neutral-950 to-neutral-900 relative overflow-hidden flex flex-col justify-between h-[180px] border-amber-950/40">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[7.5px] uppercase font-mono tracking-widest text-amber-500">CERTIFICATE OF MERIT</span>
                      <h4 className="text-[10px] font-bold text-white leading-tight mt-0.5">{certEvent}</h4>
                    </div>
                    <QrCode className="w-7 h-7 text-neutral-600 stroke-[1.5]" />
                  </div>
                  
                  <div className="py-2">
                    <span className="text-[7px] text-neutral-500">AWARDED TO</span>
                    <p className="text-xs font-semibold text-white tracking-wide font-mono uppercase">{certAttendee}</p>
                  </div>

                  <div className="flex justify-between items-end border-t border-neutral-800/60 pt-2 text-[6.5px] text-neutral-500 font-mono">
                    <span>Authorized by Nexus Team</span>
                    <span>ID: NXS-{Math.floor(100000+Math.random()*900000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-3 font-sans">
              <h4 className="text-xs font-mono uppercase text-neutral-500">Sub-Admin credentials</h4>
              <p className="text-[11px] text-neutral-400">Issue secure restricted moderator tokens for volunteers during checks.</p>
              
              <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-2">
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">active token</span>
                <p className="text-[10px] font-mono text-neutral-300">tok_mod_volant_9281a</p>
                <span className="text-[9px] text-neutral-500 leading-relaxed block">Restrictive Permissions: RSVP entry scans, user alignment tags review.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMAILS WEB BLASTER */}
      {activeSubTab === "emails" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Mail Blaster CRM Campaigner</h3>
              <p className="text-xs text-neutral-400">Deliver structured email updates dynamically to all active registrants.</p>
            </div>

            <form onSubmit={handleSendEmailBlast} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">Subject Headline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mandatory onboarding guidelines for tomorrow's hackathon"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">HTML Mail Body Content</label>
                <textarea 
                  rows={5}
                  placeholder="Hey team, welcome to the challenge! In order to set up your isolated compiler sandbox..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-purple-500 rounded px-3 py-2 text-xs text-white outline-none font-sans"
                />
              </div>

              <button 
                type="submit"
                className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-sans font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Send className="w-3.5 h-3.5" /> Deliver Campaign
              </button>
            </form>
          </div>

          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <h4 className="text-xs font-mono uppercase text-neutral-500">Previous Mail Dispatchers</h4>
            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <p className="text-xs text-neutral-600">No campaigns launched for this event tracking index.</p>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                      <span>{camp.timestamp.split('T')[0]}</span>
                      <span>{camp.sentCount} recipients</span>
                    </div>
                    <p className="font-bold text-white leading-snug">{camp.subject}</p>
                    <div className="flex gap-4 text-[9px] font-mono text-neutral-400 pt-1">
                      <span>Opens: <strong className="text-emerald-400">{camp.opens}</strong> ({Math.round(camp.opens / (camp.sentCount || 1) * 100)}%)</span>
                      <span>Clicks: <strong className="text-purple-400">{camp.clicks}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. WHATSAPP BOLLETINS */}
      {activeSubTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans">
          <div className="lg:col-span-2 bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Bulk WhatsApp Bulletin</h3>
              <p className="text-xs text-neutral-400">Broadcast automated chat alerts. Higher read rate than emails.</p>
            </div>

            <form onSubmit={handleSendWhatsAppBlast} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">Reminder trigger level</label>
                <div className="flex gap-3">
                  {[
                    { id: "announcement" as const, name: "General Broad" },
                    { id: "rsvp-warning" as const, name: "RSVP Warning" },
                    { id: "pre-event-reminder" as const, name: "1 Hour Warning" }
                  ].map(waBtn => (
                    <button
                      key={waBtn.id}
                      type="button"
                      onClick={() => setWaType(waBtn.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border outline-none transition ${
                        waType === waBtn.id ? "bg-purple-900/10 border-purple-500 text-purple-300" : "bg-neutral-900 border-neutral-850 text-neutral-400"
                      }`}
                    >
                      {waBtn.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">Copy Message (Deliver via Twilio Gateway)</label>
                <textarea 
                  rows={4}
                  placeholder="Hey {fullName}, the submission matrix closes in exactly 45 minutes!"
                  value={waText}
                  onChange={(e) => setWaText(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-white font-sans outline-none focus:border-purple-500"
                />
              </div>

              <button 
                type="submit"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-sans text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                Trigger Twilio Dispatcher
              </button>
            </form>
          </div>

          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <h4 className="text-xs font-mono uppercase text-neutral-500">SMS Outbox Trace</h4>
            <div className="space-y-3">
              {waBulletins.length === 0 ? (
                <p className="text-xs text-neutral-600 font-sans">No SMS bulletins dispatched recently.</p>
              ) : (
                waBulletins.map((wa) => (
                  <div key={wa.id} className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 uppercase">
                      <span>{wa.messageType}</span>
                      <span>{wa.sentCount} targets queued</span>
                    </div>
                    <p className="text-neutral-300 line-clamp-2">{wa.copyText}</p>
                    <span className="text-[8px] font-mono text-emerald-400 block pt-1">✔ DISPATCHED SUCCESSFULLY</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. REFERRALS PROGRAM */}
      {activeSubTab === "referrals" && (
        <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4 animate-fade-in font-sans">
          <div>
            <h3 className="text-sm font-bold text-white">Referrals & Campus Ambassador Board</h3>
            <p className="text-xs text-neutral-400">Track dynamic viral loops. Users share invitation links to register in summits.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 font-mono text-[9px] uppercase text-neutral-500 tracking-wider">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Ambassador Profile</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3 text-right">Successful Sign-ups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-neutral-600">No referral ambassadors recorded yet.</td>
                  </tr>
                ) : (
                  referrals.map((ref, idx) => (
                    <tr key={ref.id} className="hover:bg-neutral-900/20">
                      <td className="p-3 font-mono font-bold text-neutral-400">#{idx + 1}</td>
                      <td className="p-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800 border border-neutral-850">
                          <img src={ref.avatar} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-white">{ref.fullName}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-neutral-400">{ref.referralCode}</td>
                      <td className="p-3 text-right font-bold text-emerald-400 font-mono">{ref.referralsCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SPONSORSHIPS INBOX */}
      {activeSubTab === "sponsors" && (
        <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4 animate-fade-in font-sans">
          <div>
            <h3 className="text-sm font-bold text-white">Incoming Sponsorship Bids</h3>
            <p className="text-xs text-neutral-400">Review financial offers. Accept bids to claim immediate wallet balance.</p>
          </div>

          <div className="space-y-3">
            {sponsorshipList.length === 0 ? (
              <p className="text-xs text-neutral-600 py-4 text-center">No sponsor bids pending appraisal for this summit.</p>
            ) : (
              sponsorshipList.map((spons) => (
                <div key={spons.id} className="p-4 bg-neutral-900/60 border border-neutral-850 hover:border-neutral-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition">
                  <div className="space-y-1.5">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-black text-white">{spons.sponsorName}</span>
                      <span className={`px-2 py-0.2 rounded text-[8px] font-mono uppercase font-bold border ${
                        spons.tier === 'gold' ? 'bg-amber-500/15 border-amber-500/20 text-amber-500' :
                        spons.tier === 'silver' ? 'bg-neutral-300/15 border-neutral-300/20 text-neutral-300' :
                        'bg-yellow-800/15 border-yellow-800/20 text-yellow-600'
                      }`}>
                        {spons.tier} sponsor tier
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                      Bid: <strong className="text-white">${spons.fundsOffered}</strong>. Swag loots promised: "{spons.swagGoodies || 'N/A'}"
                    </p>
                  </div>

                  {spons.status === "pending" ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveSponsorship(spons.id, true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-sans text-xs font-bold rounded px-3 py-1.5 cursor-pointer"
                      >
                        Accept Bid
                      </button>
                      <button
                        onClick={() => handleResolveSponsorship(spons.id, false)}
                        className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 font-sans text-xs font-medium rounded px-3 py-1.5 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                      spons.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}>
                      {spons.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EVENT PUBLISH OVERLAY */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 animate-slide-up relative z-10">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Draft New Summit
              </h3>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="text-neutral-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">Summit Label</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nexus FinTech Hackathon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-neutral-500">Core Brief Description</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Design algorithmic vectors with smart RAG architectures."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-neutral-500">Target Date</label>
                  <input 
                    type="text" 
                    placeholder="Nov 15, 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-neutral-500">Category Type</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                    <option value="meetup">Meetup</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold rounded-lg transition"
              >
                Publish Campaign Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
