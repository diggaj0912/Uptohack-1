import React, { useState, useEffect } from "react";
import { Event, UserCareerState } from "../types";
import { 
  Calendar, MapPin, Users, Award, Tag, Sparkles, Plus, X, Search, 
  CheckCircle, FileText, ChevronDown, ChevronRight, Inbox, Clock, Video, 
  Bookmark, ShieldAlert, BadgeInfo, Terminal, ListFilter
} from "lucide-react";

interface EventsModuleProps {
  onRegisterUpdate: (updatedCareer: UserCareerState) => void;
  onAddXP: (amount: number) => void;
}

export default function EventsModule({ onRegisterUpdate, onAddXP }: EventsModuleProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Custom High-Fidelity Filters
  const [search, setSearch] = useState("");
  const [locationPill, setLocationPill] = useState<"All" | "Remote" | "In-Person">("All");
  const [dateFilter, setDateFilter] = useState<"all" | "October" | "November">("all");
  const [stackFilter, setStackFilter] = useState<"all" | "databases" | "agents" | "pipelines">("all");
  
  // Dropdown states
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStackDropdown, setShowStackDropdown] = useState(false);
  
  // Modals & Interactive States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Challenge Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState<Event["category"]>("hackathon");
  const [formImage, setFormImage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setRegisteringId(id);
    try {
      const response = await fetch(`/api/events/register/${id}`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setEvents(events.map(evt => evt.id === id ? data.event : evt));
        onRegisterUpdate(data.career);
        
        // Trigger clean temporary feedback notifications
        const currentEvent = events.find(item => item.id === id);
        const registeredText = data.event.isRegistered ? "Registered" : "Unregistered";
        setSuccessToast(`Successfully ${registeredText} for "${data.event.title}"! (+150 XP)`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegisteringId(null);
    }
  };

  const handleAISummarize = async (event: Event, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSummarizingId(event.id);
    try {
      const response = await fetch("/api/events/ai-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: event.title, description: event.description }),
      });
      const data = await response.json();
      if (data.summary) {
        const updatedEvents = events.map(evt => evt.id === event.id ? { ...evt, aiSummary: data.summary } : evt);
        setEvents(updatedEvents);
        
        // If the current viewed event is updated, refresh selection state
        if (selectedEvent && selectedEvent.id === event.id) {
          setSelectedEvent({ ...selectedEvent, aiSummary: data.summary });
        }
        
        onAddXP(50); // Get XP for exploring AI details
        setSuccessToast(`Gemini analyzed takeaways successfully! (+50 XP)`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc) return;
    setCreating(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          date: formDate,
          location: formLocation,
          category: formCategory,
          image: formImage
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEvents([data.event, ...events]);
        onRegisterUpdate(data.career);
        setFormTitle("");
        setFormDesc("");
        setFormDate("");
        setFormLocation("");
        setFormImage("");
        setShowCreateModal(false);
        setSuccessToast(`Successfully published "${formTitle}"! Received +200 XP Host Bonus.`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Perform multi-dimensional client filtering
  const filteredEvents = events.filter(evt => {
    // 1. Category Filter based on tech stack dropdown
    let matchesStack = true;
    if (stackFilter === "databases") {
      matchesStack = evt.description.toLowerCase().includes("rag") || evt.description.toLowerCase().includes("vector") || evt.title.toLowerCase().includes("rag");
    } else if (stackFilter === "agents") {
      matchesStack = evt.description.toLowerCase().includes("agent") || evt.title.toLowerCase().includes("agents");
    } else if (stackFilter === "pipelines") {
      matchesStack = evt.description.toLowerCase().includes("pipeline") || evt.description.toLowerCase().includes("sdk");
    }

    // 2. Date Filter
    let matchesDate = true;
    if (dateFilter === "October") {
      matchesDate = evt.date.toLowerCase().includes("oct");
    } else if (dateFilter === "November") {
      matchesDate = evt.date.toLowerCase().includes("nov");
    }

    // 3. Location filter Segment Selection
    let matchesLocation = true;
    if (locationPill === "Remote") {
      matchesLocation = evt.location.toLowerCase().includes("online") || evt.location.toLowerCase().includes("remote");
    } else if (locationPill === "In-Person") {
      matchesLocation = !evt.location.toLowerCase().includes("online");
    }

    // 4. Search bar Filter
    const matchesSearch = evt.title.toLowerCase().includes(search.toLowerCase()) || 
                          evt.description.toLowerCase().includes(search.toLowerCase()) ||
                          evt.location.toLowerCase().includes(search.toLowerCase());

    return matchesStack && matchesDate && matchesLocation && matchesSearch;
  });

  // Featured Flagship Event (represented on top)
  const featuredEvent = events.find(evt => evt.id === "evt-featured") || events[0];
  // Sub-items listed underneath excluding featured
  const gridEvents = filteredEvents.filter(evt => evt.id !== "evt-featured");

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen" id="events-center-page">
      
      {/* Toast Alert Indicator */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-neutral-950 border border-purple-500/30 text-purple-200 px-4 py-3 rounded-xl shadow-xl shadow-purple-950/20 max-w-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-semibold leading-relaxed">{successToast}</span>
        </div>
      )}

      {/* Header section with Host/Submit Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Explore Events
          </h1>
          <p className="text-xs text-neutral-400 tracking-wide mt-1">
            Discover high-signal conferences, hackathons, and workshops in the AI ecosystem.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-purple-300 hover:text-purple-200 font-bold text-xs rounded-xl border border-neutral-800 transition duration-200 shadow-md shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Host Technical Event
        </button>
      </div>

      {/* Multi-Dimensional Filters exactly matching the visual setup */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-1.5 bg-neutral-950/40 border border-neutral-900 rounded-2xl">
        
        {/* Left Side Filters group */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Virtual key shortcut query */}
          <div className="relative flex items-center bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-xl text-neutral-300 gap-2 focus-within:border-neutral-700 transition">
            <span className="text-[9px] font-mono border border-neutral-800 px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-500 font-bold uppercase flex items-center gap-0.5 select-none shrink-0">
              ⌘K
            </span>
            <input
              type="text"
              placeholder="Search target themes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-600 text-xs w-36 lg:w-44"
            />
            {search && (
              <X 
                onClick={() => setSearch("")} 
                className="w-3.5 h-3.5 text-neutral-550 hover:text-white cursor-pointer" 
              />
            )}
          </div>

          {/* Any Date Select Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowDateDropdown(!showDateDropdown);
                setShowStackDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-850 rounded-xl text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition font-medium"
            >
              <span>{dateFilter === "all" ? "Any Date" : `${dateFilter} 2024`}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            </button>
            {showDateDropdown && (
              <div className="absolute top-11 left-0 z-20 w-44 p-1.5 bg-neutral-950 border border-neutral-850 rounded-xl shadow-2xl space-y-0.5">
                <button
                  onClick={() => { setDateFilter("all"); setShowDateDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${dateFilter === "all" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  Any Date
                </button>
                <button
                  onClick={() => { setDateFilter("October"); setShowDateDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${dateFilter === "October" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  October 2024
                </button>
                <button
                  onClick={() => { setDateFilter("November"); setShowDateDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${dateFilter === "November" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  November 2024
                </button>
              </div>
            )}
          </div>

          {/* All Tech Stacks Select Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowStackDropdown(!showStackDropdown);
                setShowDateDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-850 rounded-xl text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition font-medium"
            >
              <span>
                {stackFilter === "all" ? "All Tech Stacks" : 
                 stackFilter === "databases" ? "RAG & Vector DBs" : 
                 stackFilter === "agents" ? "AI Autonomous Agents" : "Pipelines & SDKs"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            </button>
            {showStackDropdown && (
              <div className="absolute top-11 left-0 z-20 w-52 p-1.5 bg-neutral-950 border border-neutral-850 rounded-xl shadow-2xl space-y-0.5">
                <button
                  onClick={() => { setStackFilter("all"); setShowStackDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${stackFilter === "all" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  All Tech Stacks
                </button>
                <button
                  onClick={() => { setStackFilter("databases"); setShowStackDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${stackFilter === "databases" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  RAG & Vector Databases
                </button>
                <button
                  onClick={() => { setStackFilter("agents"); setShowStackDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${stackFilter === "agents" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  AI Autonomous Agents
                </button>
                <button
                  onClick={() => { setStackFilter("pipelines"); setShowStackDropdown(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${stackFilter === "pipelines" ? "bg-neutral-900 text-white font-bold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"}`}
                >
                  Custom Pipelines & SDKs
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Location toggle segments */}
        <div className="flex p-0.5 bg-neutral-950 border border-neutral-850 rounded-xl max-w-max self-end lg:self-auto">
          {(["All", "Remote", "In-Person"] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocationPill(loc);
                setShowDateDropdown(false);
                setShowStackDropdown(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                locationPill === loc
                  ? "bg-neutral-900 text-white border border-neutral-800 shadow-md"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

      </div>

      {/* Main Column Grid (8 col left, 4 col right schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Main Events Feed) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* FEATURED FLAGSHIP HERO CARD */}
          {featuredEvent && (
            <div 
              onClick={() => setSelectedEvent(featuredEvent)}
              className="relative rounded-2xl overflow-hidden border border-neutral-905 w-full min-h-[380px] bg-black group cursor-pointer hover:border-neutral-700 transition duration-300"
            >
              {/* Event Image Cover back layer with intense dark gradient overlays */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={featuredEvent.image} 
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
              </div>

              {/* Top featured label pill */}
              <div className="absolute top-5 left-5 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono tracking-wider font-bold text-violet-400 uppercase bg-violet-950/40 border border-violet-500/50 rounded-md">
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse fill-violet-400/30" />
                  Featured Flagship
                </span>
              </div>

              {/* Main Content Info Container */}
              <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                
                {/* Details side of hero card */}
                <div className="space-y-3.5 max-w-lg">
                  
                  {/* Category overlays */}
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase">
                      {featuredEvent.category}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-450 text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {featuredEvent.location}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none group-hover:text-purple-300 transition duration-350">
                    {featuredEvent.title}
                  </h2>

                  <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-md">
                    {featuredEvent.description}
                  </p>

                </div>

                {/* Date overlay panel exactly mimicking screenshot style */}
                <div className="bg-neutral-950/90 border border-neutral-850 p-4 rounded-xl shrink-0 w-full md:w-60 flex flex-col justify-between gap-4">
                  
                  {/* Event Starts information and date row */}
                  <div className="flex gap-3">
                    
                    {/* OCT 24 box */}
                    <div className="flex flex-col items-center justify-center border border-neutral-800 rounded bg-neutral-950 p-2 text-center w-11 h-11 shrink-0">
                      <span className="text-[10px] font-mono text-neutral-400 leading-none">OCT</span>
                      <span className="text-base font-mono font-black text-white leading-tight">24</span>
                    </div>

                    {/* Venue metadata */}
                    <div className="text-left font-mono">
                      <p className="text-[10px] text-neutral-350 font-bold">Starts 9:00 AM</p>
                      <p className="text-[9px] text-neutral-500">{featuredEvent.venue || "Moscone Center"}</p>
                    </div>

                  </div>

                  {/* Stateful Registration Button */}
                  <button
                    onClick={(e) => handleRegister(featuredEvent.id, e)}
                    disabled={registeringId === featuredEvent.id}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs transition duration-200 cursor-pointer ${
                      featuredEvent.isRegistered
                        ? "bg-neutral-900 border border-neutral-800 text-neutral-400 font-semibold"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/30"
                    }`}
                  >
                    {registeringId === featuredEvent.id ? "Securing Seat..." : (
                      featuredEvent.isRegistered ? "✓ Registered" : "Register Now"
                    )}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* UPCOMING NEAR YOU CONTAINER */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Inbox className="w-5 h-5 text-neutral-500 stroke-[2]" />
              <h3 className="text-base font-black text-white tracking-widest uppercase">
                Upcoming Near You
              </h3>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-44 rounded-xl bg-neutral-900/40 border border-neutral-850 animate-pulse" />
                <div className="h-44 rounded-xl bg-neutral-900/40 border border-neutral-850 animate-pulse" />
              </div>
            ) : gridEvents.length === 0 ? (
              <div className="py-12 p-8 rounded-xl bg-neutral-900/10 border border-dashed border-neutral-850 text-center text-neutral-500 text-xs font-mono">
                No matching near-by events found. Refine your query parameters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {gridEvents.map((evt) => {
                  
                  // Category badges style
                  const isHack = evt.category === "hackathon";
                  const isWork = evt.category === "workshop";
                  const isWeb = evt.category === "webinar";
                  
                  let badgeClass = "text-neutral-400 bg-neutral-900 border border-neutral-800";
                  if (isHack) badgeClass = "text-cyan-405 text-cyan-400 bg-cyan-950/30 border border-cyan-800/40";
                  if (isWork) badgeClass = "text-yellow-405 text-yellow-400 bg-yellow-950/30 border border-yellow-800/35";

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="group bg-neutral-900/35 border border-neutral-850 hover:border-neutral-700 rounded-xl p-5 flex flex-col justify-between min-h-[200px] cursor-pointer transition duration-300 select-none animate-fade-in"
                    >
                      {/* Top Header Row of grid cards */}
                      <div className="flex justify-between items-start gap-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold capitalize tracking-wide shrink-0 ${badgeClass}`}>
                          {evt.category}
                        </span>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-mono font-bold text-neutral-300 uppercase leading-none">{evt.date}</p>
                          <p className="text-[9px] font-mono text-neutral-500 mt-0.5 leading-none">{evt.location}</p>
                        </div>
                      </div>

                      {/* Content Body Row of grid cards */}
                      <div className="my-4">
                        <h4 className="text-sm font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-neutral-405 text-neutral-400 font-sans leading-relaxed mt-1 line-clamp-2">
                          {evt.description}
                        </p>
                      </div>

                      {/* Border separator path */}
                      <div className="border-t border-neutral-900/80 pt-3 flex items-center justify-between">
                        
                        {/* Dynamic Avatar indicators or Price lists */}
                        {isHack && (
                          <div className="flex items-center -space-x-1.5 shrink-0 select-none">
                            <div className="w-5 h-5 rounded-full border border-neutral-900 bg-purple-500 flex items-center justify-center font-mono text-[8px] font-black text-white">JD</div>
                            <div className="w-5 h-5 rounded-full border border-neutral-900 bg-emerald-500 flex items-center justify-center font-mono text-[8px] font-black text-white">AL</div>
                            <div className="w-5 h-5 rounded-full border border-neutral-900 bg-neutral-800 text-[8px] font-mono text-neutral-400 flex items-center justify-center font-bold">+{evt.attendeesCount - 2}</div>
                          </div>
                        )}

                        {isWork && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 shrink-0">
                            <Tag className="w-3.5 h-3.5 text-neutral-550 text-neutral-500 mb-0.5" />
                            <span>{evt.price || "$299"}</span>
                          </div>
                        )}

                        {isWeb && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 shrink-0">
                            <Video className="w-3.5 h-3.5 text-neutral-500 mb-0.5" />
                            <span>{evt.price || "Free"}</span>
                          </div>
                        )}

                        {/* Event Link or Register action */}
                        {evt.isRegistered ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            ✓ Registered
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white transition flex items-center gap-1">
                            {isWeb ? "Register" : "View Details"} <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Sidebar Section (Schedule Master & For You widget) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SIDE CARD 1: MY SCHEDULE */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5 space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-900/60">
              <CheckCircle className="w-4 h-4 text-purple-400 stroke-[2]" />
              <h3 className="text-xs font-black tracking-widest uppercase text-neutral-200">
                My Schedule
              </h3>
            </div>

            {/* Schedule list items */}
            <div className="space-y-4">
              
              {/* Item A */}
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-850 p-1 rounded-lg w-10 shrink-0 font-mono text-center">
                  <span className="text-[8px] text-neutral-500 font-bold leading-none uppercase">OCT</span>
                  <span className="text-xs font-black text-neutral-300 leading-tight">28</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 hover:text-purple-300 transition-colors cursor-pointer">
                    Intro to Nexus CLI
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 mt-1">
                    <Clock className="w-2.5 h-2.5 text-neutral-600 shrink-0" />
                    <span>10:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Item B */}
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center justify-center bg-neutral-900 border border-neutral-850 p-1 rounded-lg w-10 shrink-0 font-mono text-center">
                  <span className="text-[8px] text-neutral-500 font-bold leading-none uppercase">NOV</span>
                  <span className="text-xs font-black text-neutral-300 leading-tight">05</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 hover:text-purple-300 transition-colors cursor-pointer">
                    Founders Mixer
                  </h4>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 mt-1">
                    <MapPin className="w-2.5 h-2.5 text-neutral-600 shrink-0" />
                    <span>SF Office</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom link centered */}
            <div className="pt-2.5 border-t border-neutral-900/60 flex justify-center">
              <button 
                onClick={() => {
                  setSuccessToast("Calendar detail suite synced with portfolio dashboard.");
                  setTimeout(() => setSuccessToast(null), 2500);
                }}
                className="text-[10px] font-mono text-neutral-500 hover:text-white transition cursor-pointer"
              >
                View Full Calendar
              </button>
            </div>

          </div>

          {/* SIDE CARD 2: FOR YOU */}
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-5 space-y-4">
            
            {/* Header widgets */}
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-900/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/25" />
                <h3 className="text-xs font-black tracking-widest uppercase text-neutral-200">
                  For You
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[8px] font-mono font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 rounded select-none">
                AI Matched
              </span>
            </div>

            {/* Interest alignment statement */}
            <p className="text-[11px] text-neutral-400 leading-normal font-sans">
              Based on your recent interest in 'Data Engineering' and 'Vector Databases'.
            </p>

            {/* Highlight action block */}
            <div 
              onClick={() => {
                const vectorEvt = events.find(item => item.title.includes("RAG") || item.id === "evt-2");
                if (vectorEvt) {
                  setSelectedEvent(vectorEvt);
                } else {
                  setSuccessToast("Custom vector recommended details dispatched to panel.");
                  setTimeout(() => setSuccessToast(null), 2500);
                }
              }}
              className="p-3 bg-neutral-950 border border-neutral-850 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-3 text-left transition cursor-pointer select-none group"
            >
              <div>
                <h4 className="text-xs font-bold text-neutral-100 group-hover:text-purple-300 transition-colors">
                  Building Scalable Vector Stores
                </h4>
                <p className="text-[9px] font-mono text-purple-400 leading-none mt-1.5 uppercase tracking-wide">
                  Webinar • Next Week
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-550 group-hover:text-white transition shrink-0 mt-0.5" />
            </div>

          </div>

        </div>

      </div>

      {/* EVENT DETAIL SUMMARY DRAWER / POPUP */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          
          {/* Drawer container representing absolute premium layout */}
          <div className="w-full max-w-lg h-full md:h-[95vh] bg-neutral-950 border-l border-neutral-900 md:border md:rounded-2xl shadow-2xl p-6 relative overflow-y-auto space-y-6 flex flex-col justify-between">
            
            <div>
              {/* Back close trigger */}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute right-6 top-6 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-850 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tag / Category details */}
              <div className="pr-12">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono tracking-wider font-bold rounded-md bg-purple-950/40 text-purple-400 border border-purple-500/30 uppercase mb-4">
                  {selectedEvent.category} Info Sheet
                </span>
                
                <h3 className="text-2xl font-black text-white leading-tight">
                  {selectedEvent.title}
                </h3>

                <p className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1 mt-1">
                  Hosted by {selectedEvent.organizer || "Nexus AI Committee"}
                </p>
              </div>

              {/* Cover Unsplash preview */}
              <div className="w-full h-44 rounded-xl overflow-hidden bg-neutral-900 my-5 border border-neutral-850 relative">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                
                {selectedEvent.price && (
                  <span className="absolute bottom-3 left-3 bg-black/85 border border-neutral-800 px-3 py-1 rounded text-xs font-mono font-bold text-white shadow-lg">
                    Rate: {selectedEvent.price}
                  </span>
                )}
              </div>

              {/* Specs parameters */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-900/30 border border-neutral-900 rounded-xl text-xs font-mono mb-5">
                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase block text-[9px] tracking-wider">Date Timeline</span>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{selectedEvent.date}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase block text-[9px] tracking-wider">Geographic Map</span>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="truncate">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 pt-2 border-t border-neutral-900">
                  <span className="text-neutral-500 uppercase block text-[9px] tracking-wider">Ecosystem Active Attendees</span>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="font-bold text-purple-300">{selectedEvent.attendeesCount} professionals attending</span>
                  </div>
                </div>
              </div>

              {/* Abstract details */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">
                  Abstract Overview
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Live Gemini summaries takeaways */}
              <div className="mt-6 pt-5 border-t border-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Key Developer Takeaways
                  </div>
                  {!selectedEvent.aiSummary && (
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded animate-pulse">
                      Ready to parse
                    </span>
                  )}
                </div>

                {selectedEvent.aiSummary ? (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 leading-relaxed font-sans relative">
                    <p>{selectedEvent.aiSummary}</p>
                    <div className="absolute right-3 bottom-2 text-[8px] font-mono text-emerald-500 font-bold uppercase select-none">
                      Analyzed
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-900/30 border border-dashed border-neutral-850 text-center space-y-3">
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                      Request Gemini to synthesize critical developer goals, technical pipelines, and system architectures for this event.
                    </p>
                    
                    <button
                      onClick={() => handleAISummarize(selectedEvent)}
                      disabled={summarizingId === selectedEvent.id}
                      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 text-emerald-400 border border-emerald-900 hover:border-emerald-700 text-xs font-bold rounded-xl transition duration-200 flex items-center gap-2 mx-auto disabled:opacity-40"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${summarizingId === selectedEvent.id ? "animate-spin" : ""}`} />
                      {summarizingId === selectedEvent.id ? "Compiling details..." : "Generate AI Insights (+50 XP)"}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Registration action */}
            <div className="pt-6 border-t border-neutral-950 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-2.5 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-300 rounded-xl text-xs font-bold transition duration-200"
              >
                Close Specs
              </button>
              
              <button
                type="button"
                onClick={() => handleRegister(selectedEvent.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition duration-200 overflow-hidden ${
                  selectedEvent.isRegistered
                    ? "bg-neutral-900 text-neutral-400 border border-neutral-800"
                    : "bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/20"
                }`}
              >
                {selectedEvent.isRegistered ? "✓ Registered" : "Secure Seat (+150 XP)"}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Host Event / Challenge Submission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-850"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-purple-400">
              <Plus className="w-5 h-5" />
              <h3 className="text-base font-black tracking-widest uppercase text-white">
                Host a Challenge / Meetup
              </h3>
            </div>
            
            <p className="text-xs text-neutral-405 text-neutral-400 font-mono">
              Fill out the required parameters. Hosts are instantly rewarded with 200 XP.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Challenge Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. NextJS Hybrid Sandbox Hackathon"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-700 placeholder:text-neutral-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">Category Options</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-705 cursor-pointer font-bold"
                >
                  <option value="hackathon">Hackathon Challenge (Team Oriented)</option>
                  <option value="meetup">Developer Meetup (Social Networking)</option>
                  <option value="workshop">Technical Workshop (Interactive Masterclass)</option>
                  <option value="webinar">Webinar Talk (Design or Tool Systems)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Date/Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Nov 22"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-700 placeholder:text-neutral-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Geographic Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Austin, TX"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-700 placeholder:text-neutral-650"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Desc Abstract (Outline)</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Provide an overview of high-value developer subjects, schedule markers or panelists..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-700 resize-none placeholder:text-neutral-650 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">Cover Image Unsplash URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-1540575467063-..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:outline-none focus:border-neutral-700 placeholder:text-neutral-650 text-neutral-300"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-bold hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {creating ? "Launching event..." : "Publish Event (+200 XP)"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
