import React, { useState, useEffect } from "react";
import { DollarSign, Tag, Award, Sparkles, Send, CheckCircle, RefreshCw, Eye, MousePointer } from "lucide-react";

interface SponsorRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
}

export default function SponsorRoleModule({ sessionToken, onAddXP }: SponsorRoleModuleProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  
  // Apply state
  const [selectedEventId, setSelectedEventId] = useState("");
  const [tier, setTier] = useState<"bronze" | "silver" | "gold">("silver");
  const [funds, setFunds] = useState("2000");
  const [swag, setSwag] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [biddingSuccess, setBiddingSuccess] = useState(false);

  useEffect(() => {
    fetchSponsorData();
  }, []);

  const fetchSponsorData = async () => {
    setLoading(true);
    try {
      const eRes = await fetch("/api/events", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const eData = await eRes.json();
      if (Array.isArray(eData)) {
        setEvents(eData);
        if (eData.length > 0) setSelectedEventId(eData[0].id);
      }

      const bRes = await fetch("/api/sponsor/bundles");
      const bData = await bRes.json();
      if (Array.isArray(bData)) {
        setMyBids(bData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !funds) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sponsor/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          tier,
          fundsOffered: Number(funds),
          swagGoodies: swag
        })
      });
      if (res.ok) {
        setBiddingSuccess(true);
        setSwag("");
        onAddXP(100);
        setTimeout(() => setBiddingSuccess(false), 3000);
        fetchSponsorData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Intro Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/20 flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-amber-500" /> Opskill Sponsor Lounge
          </span>
          <h2 className="text-md font-bold text-white">Brand & Developer Sponsoring</h2>
          <p className="text-xs text-neutral-400">Back upcoming summits, allocate promotional coupons, and evaluate marketing click metrics.</p>
        </div>

        <div className="flex gap-4 shrink-0 font-mono">
          <div className="bg-neutral-900 border border-neutral-850 px-4 py-2 rounded-xl text-right">
            <span className="text-[8px] text-neutral-500 block">Backing Budget allocated</span>
            <span className="text-md font-black text-amber-500">$8,550</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bid Proposer form */}
        <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Back active challenge</h3>
            <p className="text-[11px] text-neutral-500">Pick an event in the marketplace and submit your package bid.</p>
          </div>

          {biddingSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-[10px] text-emerald-400 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Sponsorship proposal delivered successfully! Host reviewed.</span>
            </div>
          )}

          <form onSubmit={handleApplySponsorship} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-neutral-500">Target Summit</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs rounded px-2.5 py-1.5 text-white outline-none"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-neutral-500">Sponsor Tier Class</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "gold" as const, name: "Gold" },
                  { id: "silver" as const, name: "Silver" },
                  { id: "bronze" as const, name: "Bronze" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTier(item.id)}
                    className={`p-2 rounded font-semibold text-[10px] border outline-none transition uppercase ${
                      tier === item.id ? "bg-amber-500/10 border-amber-500 text-amber-300" : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-neutral-500">Cash Funding Proferred ($)</label>
              <input 
                type="number"
                value={funds}
                onChange={(e) => setFunds(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono uppercase text-neutral-500">Swag Bags & Loot Goodies</label>
              <input 
                type="string"
                placeholder="Giveaway stickers, 10 hoodies, 1 month premium license"
                value={swag}
                onChange={(e) => setSwag(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="p-2 w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Propose Partnership
            </button>
          </form>
        </div>

        {/* Bids status trackers & Coupon Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Bids tracking</h3>
            <div className="space-y-2.5">
              {myBids.length === 0 ? (
                <p className="text-xs text-neutral-600 font-sans">No partnership proposal history discovered.</p>
              ) : (
                myBids.map((b) => (
                  <div key={b.id} className="p-3 bg-neutral-904 bg-neutral-900 border border-neutral-850 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="flex gap-2">
                        <span className="font-bold text-white uppercase">{b.eventTitle}</span>
                        <span className="px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono text-purple-400 uppercase rounded">{b.tier} tier</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">Bid allocation: <strong className="text-amber-500">${b.fundsOffered}</strong>. Swag promised: {b.swagGoodies}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase font-bold shrink-0 ${
                      b.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : b.status === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coupon telemetry KPI */}
          <div className="bg-neutral-950 p-5 border border-neutral-900 rounded-xl space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">Coupon Telemetry Marketing performance</h3>
              <p className="text-[11px] text-neutral-400">Examine how community and registered members engage with your sponsorship discount codes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900 p-4 border border-neutral-850 rounded-xl space-y-2 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono uppercase text-neutral-550 block">Coupon Code Impressions</span>
                  <p className="text-lg font-black font-mono text-white">41,200</p>
                  <span className="text-[8px] text-emerald-400 block font-mono font-bold font-sans">▲ +12% this week</span>
                </div>
                <Eye className="w-8 h-8 text-neutral-700 stroke-[1.25]" />
              </div>

              <div className="bg-neutral-900 p-4 border border-neutral-850 rounded-xl space-y-2 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-mono uppercase text-neutral-550 block">Assigned Clicks</span>
                  <p className="text-lg font-black font-mono text-white">1,540</p>
                  <span className="text-[8px] text-purple-400 block font-mono font-bold font-sans">3.73% clickthrough rat</span>
                </div>
                <MousePointer className="w-8 h-8 text-neutral-700 stroke-[1.25]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
