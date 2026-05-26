import React, { useState, useEffect } from "react";
import { MessageSquare, Shield, Smile, AlertTriangle, Trash2, Users, Database, Sparkles, Filter, CheckCircle } from "lucide-react";

interface CmRoleModuleProps {
  sessionToken: string;
  onAddXP: (amt: number) => void;
}

export default function CmRoleModule({ sessionToken, onAddXP }: CmRoleModuleProps) {
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTagCategory, setSelectedTagCategory] = useState("all");

  useEffect(() => {
    fetchForumPosts();
  }, []);

  const fetchForumPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forums", {
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setForumPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePost = async (postId: string, action: "flag" | "delete" | "approve") => {
    try {
      const res = await fetch(`/api/community/moderate/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        onAddXP(60);
        fetchForumPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mock segment statistics
  const segments = [
    { name: "Frontend Builders", count: 1840, tagId: "React 19", color: "text-purple-400 border-purple-500/20" },
    { name: "Systems Pioneers", count: 910, tagId: "TypeScript", color: "text-blue-400 border-blue-500/20" },
    { name: "AI Hackers", count: 1240, tagId: "RAG Pipeline", color: "text-emerald-400 border-emerald-500/20" },
    { name: "Cloud Strategists", count: 650, tagId: "System Design", color: "text-amber-400 border-amber-500/20" }
  ];

  const filteredPosts = selectedTagCategory === "all" 
    ? forumPosts 
    : forumPosts.filter(p => p.tags?.includes(selectedTagCategory));

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* Overview */}
      <div className="p-4 bg-gradient-to-tr from-violet-500/15 to-neutral-950 border border-violet-500/10 rounded-xl">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-violet-400">community moderator workspace</span>
        <h2 className="text-md font-bold text-white mt-1">CRM follower segmenter & moderator desk</h2>
        <p className="text-xs text-neutral-450 text-neutral-400 font-sans">Moderate Discord-like chat posts, examine dynamic sentiment diagnostics, and review active segmented subgroups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CRM Segments bar */}
        <div className="space-y-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase text-neutral-300 font-mono flex items-center gap-2"><Database className="w-4 h-4 text-purple-400" /> Member Segment classification</h3>
            
            <div className="space-y-2">
              {segments.map((seg) => (
                <button
                  key={seg.name}
                  onClick={() => setSelectedTagCategory(seg.tagId)}
                  className={`w-full text-left p-3 rounded-lg border transition text-xs flex justify-between items-center ${
                    selectedTagCategory === seg.tagId 
                      ? "bg-neutral-900 border-purple-500/40 text-white" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:border-neutral-850"
                  }`}
                >
                  <div>
                    <span className="font-bold block text-white">{seg.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5">Filter: tag={seg.tagId}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-neutral-300">{seg.count} members</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedTagCategory("all")}
                className={`w-full text-[10px] font-mono uppercase text-center p-2 rounded border border-neutral-900 text-neutral-500 hover:text-white ${
                  selectedTagCategory === "all" ? "bg-purple-900/10 text-purple-400 border-purple-500/20" : ""
                }`}
              >
                Clear Filters (Browse all)
              </button>
            </div>
          </div>
        </div>

        {/* Forums sentiment reviewer */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Sentiment Moderation Desk</h3>
              <p className="text-xs text-neutral-450 text-neutral-400">Security triggers automatically pre-tag posts according to neural sentiment thresholds.</p>
            </div>
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse shrink-0" />
          </div>

          <div className="space-y-3.5">
            {filteredPosts.length === 0 ? (
              <p className="text-xs text-neutral-600 py-6 text-center">No community chatter detected for selected tag classification.</p>
            ) : (
              filteredPosts.map((post) => {
                const sentimentClass = post.sentiment > 0.6 ? "emerald" : post.sentiment < 0.25 ? "red" : "amber";
                return (
                  <div key={post.id} className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-xl space-y-2.5 text-xs text-neutral-350">
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                      <span className="font-bold text-white">@{post.authorName}</span>
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${
                        sentimentClass === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        sentimentClass === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        sentiment index: {(post.sentiment * 100).toFixed(0)}% ({sentimentClass})
                      </span>
                    </div>

                    <p className="text-neutral-300 font-sans leading-relaxed">"{post.content}"</p>

                    <div className="flex justify-between items-center pt-2 border-t border-neutral-850 text-[10px]">
                      <div className="flex gap-1">
                        {post.tags?.map((t: string) => (
                          <span key={t} className="px-1 py-0.2 bg-neutral-950 text-neutral-500 rounded text-[8px] font-mono border border-neutral-900">&#35;{t}</span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {post.isFlagged ? (
                          <span className="text-[9px] uppercase font-mono text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" /> FLAG TRIAGED</span>
                        ) : (
                          <button
                            onClick={() => handleModeratePost(post.id, "flag")}
                            className="p-1 px-2.5 border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 rounded font-semibold font-mono text-[9px] cursor-pointer"
                          >
                            Flag content
                          </button>
                        )}
                        <button
                          onClick={() => handleModeratePost(post.id, "delete")}
                          className="p-1 px-2 border border-red-500/20 text-rose-400 hover:bg-red-500/10 rounded font-semibold flex items-center gap-1 font-mono text-[9px] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400 shrink-0" /> delete post
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
