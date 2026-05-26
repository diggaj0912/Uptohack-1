import React, { useState, useEffect } from "react";
import { CommunityPost } from "../types";
import { 
  Hash, MessageSquare, Send, ThumbsUp, AlertCircle, 
  Sparkles, CheckCircle2, RefreshCw, UserCheck, ShieldAlert 
} from "lucide-react";

interface CommunitiesModuleProps {
  onAddXP: (amount: number) => void;
}

export default function CommunitiesModule({ onAddXP }: CommunitiesModuleProps) {
  const [activeChannel, setActiveChannel] = useState("general");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [moderating, setModerating] = useState(false);

  // Channels metadata
  const channels = [
    { id: "general", name: "general", desc: "Corporate career news, VC updates", category: "core" },
    { id: "dev-chat", name: "dev-chat", desc: "Express routing and hydration", category: "engineering" },
    { id: "ai-talks", name: "ai-talks", desc: "Generative AI, local embed matrices", category: "engineering" }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/community/posts");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setModerating(true);

    try {
      // 1. Moderate content via AI first (Sentiment checks)
      const modRes = await fetch("/api/community/posts/ai-moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newContent }),
      });
      const modData = await modRes.json();
      const detectedSentiment = modData.sentiment || "neutral";

      // 2. Publish to backend database
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent, channel: activeChannel }),
      });
      const data = await response.json();
      if (data.success) {
        // Enforce the checked feeling tag on client layout
        const finishedPost: CommunityPost = {
          ...data.post,
          sentiment: detectedSentiment
        };
        setPosts([finishedPost, ...posts]);
        setNewContent("");
        onAddXP(50); // Get XP for active contribution
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModerating(false);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const response = await fetch(`/api/community/posts/upvote/${id}`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(p => p.id === id ? { ...p, upvotes: data.post.upvotes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSentimentTag = (sent: CommunityPost["sentiment"]) => {
    switch (sent) {
      case "positive":
        return {
          label: "Inspirational",
          cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        };
      case "constructive":
        return {
          label: "Engineering Core",
          cls: "bg-blue-500/10 border-blue-500/20 text-blue-400"
        };
      case "curious":
        return {
          label: "Technical Inquiry",
          cls: "bg-purple-500/10 border-purple-500/20 text-purple-400"
        };
      default:
        return {
          label: "Verified Statement",
          cls: "bg-neutral-800 border-neutral-700 text-neutral-400"
        };
    }
  };

  const filteredPosts = posts.filter(p => p.channel === activeChannel);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="communities-channels-viewport">
      {/* Forum Channels List Sidebar Column */}
      <div className="md:col-span-4 space-y-4">
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/80">
            <span className="text-xs uppercase font-mono text-neutral-400 font-bold">NexStart Forum</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Connected</span>
          </div>

          <p className="text-[11px] text-neutral-500 mb-4 tracking-normal">
            Browse through categorized chat channels to discuss tech architecture parameters or form hackathon teams on-the-fly.
          </p>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider block mb-2">Workspace Channels</span>
              <div className="space-y-1">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannel(chan.id)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      activeChannel === chan.id
                        ? "bg-neutral-800 border-neutral-700 text-white"
                        : "bg-transparent border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <div className="truncate">
                      <span>{chan.name}</span>
                      <span className="block text-[9px] font-normal text-neutral-500 truncate">{chan.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Networking Board */}
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono mb-3">
            Simulated Network Metrics
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Platform Active Profiles</span>
              <span className="font-mono text-white font-bold">4,120</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Your Networking Score</span>
              <span className="font-mono text-emerald-400 font-bold">Excellent (Level 4)</span>
            </div>
            <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 leading-normal flex items-start gap-1.5">
              <UserCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>We match your post keyword matrices with investors. Get upvotes to optimize exposure tags!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream Column */}
      <div className="md:col-span-8 flex flex-col gap-6">
        {/* Posting input form wrapper */}
        <div className="p-5 rounded-xl bg-neutral-900/45 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Share with #{activeChannel} Community
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              required
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`Share technical takeaways, team formation ideas, or VC updates for the #${activeChannel} stream...`}
              className="w-full p-3 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-lg placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 resize-none"
            />

            <div className="flex justify-between items-center pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Dual Sentiment Checker Enabled
              </div>

              <button
                type="submit"
                disabled={moderating || !newContent.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-lg transition disabled:opacity-40"
              >
                {moderating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-neutral-950" />
                    Checking Sentiment...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 text-neutral-950" />
                    Publish Message (+50 XP)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Messaging Logs List */}
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="h-20 w-full rounded-lg bg-neutral-900/50 border border-neutral-800/60 animate-pulse" />
            <div className="h-20 w-full rounded-lg bg-neutral-900/50 border border-neutral-800/60 animate-pulse" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-xl bg-neutral-900/20 border border-neutral-800 text-neutral-500">
            <Hash className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
            <span className="block text-sm mb-1 text-neutral-400">Stream empty</span>
            <span className="text-xs">Be the first to share your questions or ideas with the workspace channel!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const tag = getSentimentTag(post.sentiment);
              return (
                <div 
                  key={post.id} 
                  className="p-5 rounded-xl bg-neutral-900/30 border border-neutral-850 hover:border-neutral-800 hover:bg-neutral-900/40 transition-all duration-300 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <img 
                        src={post.authorAvatar} 
                        alt={post.authorName} 
                        className="w-9 h-9 rounded-full object-cover border border-neutral-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{post.authorName}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">{post.timestamp}</span>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-emerald-400 block">{post.authorRole}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wide font-bold rounded border uppercase ${tag.cls}`}>
                      {tag.label}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed font-sans pl-1.5 pr-2 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 pl-1.5 pt-2 border-t border-neutral-800/60">
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-neutral-400 hover:text-white transition group"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <div className="text-[10px] font-mono text-neutral-600">
                      Channel Focus: <span className="text-neutral-400 font-medium">#{post.channel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
