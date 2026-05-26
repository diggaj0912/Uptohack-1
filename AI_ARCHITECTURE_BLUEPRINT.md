# Core Platform AI Systems Architecture Blueprint
### Document ID: NXST-AIP-ARCH-2026-v1.0.0
### Scope: Unified Multi-Tenant Event, Hackathon, Community, and Career AI Platforms
### Role: Chief Technology Officer (CTO) & Staff AI Systems Architect

---

## SECTION 1: SYSTEM TOPOLOGY & GLOBAL INFRATRUST

This blueprint details the production-grade artificial intelligence infrastructure powering the **NexStart Ecosystem**. It enforces isolation barriers across roles (Students, Organizers, Recruiters, Sponsors, Judges, Mentors, Community Managers, and Admins), and ensures latency-optimized, secure, and cost-efficient execution.

```
                                      [ NGINX Reverse Proxy @ Port 3000 ]
                                                       |
                                            [ Express API Controller ]
                                                       |
                             +-------------------------+-------------------------+
                             |                         |                         |
                    [ AI Agents Core ]        [ Embeddings Router ]      [ TTS & Media Core ]
                    - Gemini-3.5-pro          - gemini-embedding-2       - gemini-3.1-flash-tts
                    - Claude-3.7-sonnet                                  - Veo Video Engine
                             |                         |                         |
              +--------------+--------------+          |                         |
              |                             |          v                         v
       [ Redis Cache ]               [ Memory Store ] [ Pinecone Vector DB ] [ Web Browser audioCtx ]
       - Transient Prompt Sessions   - Long-Term Graph-RAG  - Cosine Distance
       - Token-bucket Rate-limits    - JSON DB Fallback     - Metadata Shard Partitioning
```

---

## SECTION 2: THE 10 AI MODULE SYSTEM SPECIFICATIONS

### MODULE 1: AI ATS Resume Builder
**Role Alignment:** Student (Create & Refine) | Recruiter (Audit & Search Match)

1. **Architecture:** Multi-stage parsing and embedding matching pipeline. Raw text is captured via front-end typography editors, passed into a PDF compiler, and sharded by section before vector encoding and prompt parsing are invoked.
2. **Model Selection:** `gemini-3.1-pro-preview` for deep-reasoning structural parsing; `gemini-3.5-flash` for high-speed line-by-line grammar refinement.
3. **Prompt Engineering:**
   ```json
   {
     "system_instruction": "You are a senior ATS algorithms expert and technical hiring bar raiser. Analyze the provided resume JSON against industry standards. Extract and score exact skills, impact metrics, and alignment metrics.",
     "output_schema": "Strictly conform to JSON format containing 'score', 'summary', 'strengths', 'weaknesses', 'recommendations', and 'jdMatchScore'."
   }
   ```
4. **API Structure:** `POST /api/resume/analyze`
5. **Vector DB Schema (Pinecone / Weaviate):**
   ```yaml
   Index: resume-embeddings
   Dimensions: 1536 (or 768 for gemini-embedding-2-preview)
   Metric: Cosine
   Metadata:
     userId: string
     roleCategory: string
     scoreRank: integer
     primaryLang: string
   ```
6. **Streaming Setup:** SSE connection pushing token streams during generation of critical resume summaries.
7. **Scalability:** Scale horizontally with stateless Node.js workers pooling OpenAI/Gemini requests through an upstream connection manager.
8. **Cost Optimization:** Pre-evaluate resume segments locally; trigger Gemini parsing only upon structural model changes. Use `ThinkingLevel.LOW` for fast structural checks.
9. **Security:** Automatic stripping of PII (phone number, home address, social security records) in the server gateway before external LLM dispatch.
10. **Rate Limiting:** Sliding-window rate limiting of 5 resume-audits per user hour, persisted in Redis.
11. **AI Caching:** MD5 hashing on input resume text. Cache successful parsed outputs in Redis with an eviction time-to-live (TTL) of 24 hours.
12. **AI Memory System:** Short-term chat history of specific resume session revisions stored in a single thread array and saved into `database.json`.

---

### MODULE 2: AI Interviewer
**Role Alignment:** Student (Mock Simulation) | Mentor / Instructor (Review feedback)

1. **Architecture:** Dynamic conversation system with stateful WebSockets handling multi-modal single/two-speaker audio loops.
2. **Model Selection:** `gemini-3.1-flash-tts-preview` for native video/audio, low-latency text-to-speech feedback; `gemini-3.1-pro-preview` for scoring technical accuracy.
3. **Prompt Engineering:**
   ```
   Prompt: Score this developer's answer to the technical question. Check tech concepts (closures, state purity, caching algorithms) and provide perfect suggeted answers.
   ```
4. **API Structure:** `POST /api/interview/score-answer`
5. **Vector DB Schema:** Embed index representing 1,000+ top technical interview question arrays, queried via semantic cosine likeness.
6. **Streaming Setup:** SSE or websocket audio chunks scheduled directly into browser `AudioContext` timeline to ensure gapless voice playback.
7. **Scalability:** Use WebSocket broker pods (Kubernetes-autoscaled Node deployments) dynamically balancing audio streams.
8. **Cost Optimization:** Cache the most commonly fetched interview suggestions and prompt schemas.
9. **Security:** Restrict media permissions. Ensure transient audio streams are processed in-memory and never cached persistently.
10. **Rate Limiting:** IP-level rate restriction on voice synthesis: maximum 60 voice queries per user hour.
11. **AI Caching:** Pre-rendered TTS audio assets for static platform-provided system questions.
12. **AI Memory System:** Stateful dialogue context persisted on server-side during the duration of the interview session.

---

### MODULE 3: AI Event Recommendations
**Role Alignment:** Student (Discover) | Organizer (Traffic Optimizer)

1. **Architecture:** Collaborative filtering combined with cognitive semantic routing matching professional skills and historical hackathon participation.
2. **Model Selection:** `gemini-3.5-flash` utilizing JSON formatted schemas for lightning-speed parsing.
3. **Prompt Engineering:** Formulate query inputs based on user portfolio skills, level rating, XP, and previous hackathon categories.
4. **API Structure:** `POST /api/ai/recommendations`
5. **Vector DB Schema:** Sharded event vectors; filtered by geohash, virtual tag, and price category metadata.
6. **Streaming Setup:** Instant lazy loading on recommendation cards inside client dashboard.
7. **Scalability:** Offload recommendation calculations into a batch worker cron schedule, publishing fresh recommendations directly to Redis cache daily.
8. **Cost Optimization:** Match candidates sequentially through embeddings first; call generative model recommendations only to enrich final results.
9. **Security:** Role isolation prevents unauthorized candidate registration listings leaking to exterior event tracking targets.
10. **Rate Limiting:** Standard 100 API recommendation queries per API key hour.
11. **AI Caching:** User-assigned recommendation arrays cached for 12 hours.
12. **AI Memory System:** Student interest vectors automatically drift and adapt when student solves challenges and gains new skills XP ratings.

---

### MODULE 4: AI Community Recommendations
**Role Alignment:** Student (Onboard) | Community Manager (Forum engagement)

1. **Architecture:** Profile matching that pairs user skills arrays with active Discord #channel sentiment graphs and topics.
2. **Model Selection:** `gemini-3.5-flash` for high-throughput topic extraction.
3. **Prompt Engineering:**
   ```
   Topic: Suggest relevant technical forum #channels based on candidate technology index and recent sentiment posts.
   ```
4. **API Structure:** Integrated into unified Recommendations Controller `/api/ai/recommendations`
5. **Vector DB Schema:** Channel descriptions and channel pins mapped into custom vector namespace boards.
6. **Streaming Setup:** Static pre-load; results displayed on channel switcher.
7. **Scalability:** Fully decoupled background worker analyzing public posts sentiment, classifying them by primary programming keyword.
8. **Cost Optimization:** Cache community index structures on memory boundaries.
9. **Security:** Channels marked `#private` or `#organizers-only` are strictly filtered out in standard vector lookup queries.
10. **Rate Limiting:** Standard security thresholds (120 operations per minute).
11. **AI Caching:** Match matrices updated in background buffers to optimize computational cycles.
12. **AI Memory System:** Store channel visit telemetry to suppress duplicate Recommendations boards.

---

### MODULE 5: AI Sponsor Matching
**Role Alignment:** Sponsor (Bidding & Marketplace) | Organizer / Student (Traction Pipeline)

1. **Architecture:** Automated scoring metrics matching Sponsor tech budgets and swag tiers directly to eligible technical hackathon teams and events.
2. **Model Selection:** `gemini-3.1-pro-preview` for high-fidelity compliance reasoning and ROI modeling.
3. **Prompt Engineering:** Crafting personalized sponsorship templates based on sponsor criteria vector matches.
4. **API Structure:** `GET /api/sponsor/bundles` and `POST /api/sponsor/apply`
5. **Vector DB Schema:** Vectorizing sponsor briefs and target tech demographics to align with student project blueprints.
6. **Streaming Setup:** Real-time push for high-value sponsorship application approvals on organizer screens.
7. **Scalability:** Horizontal replication of Node.js clusters processing candidate telemetry logs.
8. **Cost Optimization:** Pre-filter matches with local criteria queries prior to spinning generative description matching prompts.
9. **Security:** Encapsulate corporate telemetry to prevent leak of proprietary sponsor-lead email lists.
10. **Rate Limiting:** High-security tiers for financial/partner operations: 15 matching evaluations per minute.
11. **AI Caching:** Match rankings saved on event namespaces.
12. **AI Memory System:** Persistence of sponsor criteria preferences through multiple hackathon seasons.

---

### MODULE 6: AI Team Matching for Hackathons
**Role Alignment:** Student / Hacker (Team Builder) | Organizer (Assigner Admin)

1. **Architecture:** Dynamic matrix matchmaking mapping technology gaps. If Hacker A has 90% Frontend skills but 30% Backend skills, the system performs a vector radius lookup search for Hacker B with matching complement profiles.
2. **Model Selection:** `gemini-3.5-flash` with optimized mathematical scoring constraints.
3. **Prompt Engineering:** Pair candidate profiles into structured team blueprints emphasizing high-efficiency synergy, diversity, and capability coverage.
4. **API Structure:** `POST /api/ai/hackathon-copilot`
5. **Vector DB Schema:** Combined multi-variant candidate profile arrays representing developer vectors.
6. **Streaming Setup:** Instant candidate discovery matching logs.
7. **Scalability:** Run complex matching loops asynchronously; return matched candidates on lazy-loaded scroll grids.
8. **Cost Optimization:** Leverage local client-side memory states and SQLite index mappings where feasible.
9. **Security:** Restrict candidate matching exposures to registered hackathon participants only.
10. **Rate Limiting:** 60 matching executions per user hour.
11. **AI Caching:** Synergistic score hashes stored directly inside the active user session context.
12. **AI Memory System:** Keeps record of historical team accomplishments to prevent bad pairings.

---

### MODULE 7: AI Moderation System
**Role Alignment:** Community Manager / Admin (Audit Dashboard)

1. **Architecture:** Multi-modal analysis parsing Discord and public post chats for sentiment and inappropriate keywords.
2. **Model Selection:** `gemini-3.5-flash` configured with a deterministic low temperature of 0.0 to guarantee reliable classification audits.
3. **Prompt Engineering:**
   ```
   Determine if the content contains abusive, toxic, or highly inappropriate code formatting, or spam. Output exactly a categorization structure.
   ```
4. **API Structure:** `POST /api/community/posts/ai-moderate` and `DELETE /api/community/posts/delete/:id`
5. **Vector DB Schema:** Embedding index vector of toxic post records representing bad behavior, checked via rapid distance lookup.
6. **Streaming Setup:** High-concurrency logs channel tracking posts, streaming moderation flags straight to Moderator role dashboards.
7. **Scalability:** Parallel execution on Edge clusters to moderate content prior to storage writing processes.
8. **Cost Optimization:** Pre-screen lines with regular expressions and blacklist tables; launch Gemini moderation checks only on suspicious flagged triggers.
9. **Security:** Enforced encryption and token authentication on deletion protocols.
10. **Rate Limiting:** Real-time analysis of up to 1,000 requests per CPU minute.
11. **AI Caching:** Hash checks on previous posts to skip checking identical duplication posts.
12. **AI Memory System:** Tracks user-level safety reputation scores inside `database.json`. Multiple flags automatically suspend user role triggers.

---

### MODULE 8: AI Analytics & Insights
**Role Alignment:** Admin (Fraud & Analytics) | Recruiter (Talent Metrics)

1. **Architecture:** Advanced analytics engine scanning system logs, identifying usage trends, XP distribution patterns, and candidate level metrics.
2. **Model Selection:** `gemini-3.1-pro-preview` for complex statistical calculations and trend analysis.
3. **Prompt Engineering:** Review log metrics patterns and detect anomalies or fraud clusters (IP duplication, referral loop bypass attempts).
4. **API Structure:** `GET /api/admin/fraud`
5. **Vector DB Schema:** Multi-dimensional logs mapped with temporal metrics inside log vector namespaces.
6. **Streaming Setup:** SSE dynamic metrics charts.
7. **Scalability:** Run statistical models on isolated background threads, storing processed metrics trends in `database.json`.
8. **Cost Optimization:** Streamline reporting. Run calculations at midnight cron schedules.
9. **Security:** Admin role protection is strictly enforced with JWT bearer checking protocols.
10. **Rate Limiting:** Restricted to 10 analytics reports per Admin hour.
11. **AI Caching:** Processed trends cached with 1 hour TTL.
12. **AI Memory System:** Historical system benchmarks are cataloged over monthly epochs.

---

### MODULE 9: AI Organizer Assistant
**Role Alignment:** Organizer (Manage events)

1. **Architecture:** Co-pilot engine generating custom schedules, tracks, announcements, marketing email campaigns, and SMS bulletins.
2. **Model Selection:** `gemini-3.5-flash` for template creation; `gemini-3.1-pro-preview` for deep logic scheduler designs.
3. **Prompt Engineering:** Produce highly personalized schedules and outreach copies.
4. **API Structure:** `POST /api/ai/generate-campaign` and `POST /api/ai/generate-event-page`
5. **Vector DB Schema:** Embed and search successful email copy strategies to match custom sponsor briefs.
6. **Streaming Setup:** Real-time generation of custom markdown event summaries on-the-fly.
7. **Scalability:** Distribute workload asynchronously; push drafted campaigns to Redis queue pipelines.
8. **Cost Optimization:** Optimize prompt sizing by inserting only essential candidate metrics into LLM frameworks.
9. **Security:** Restrict organizers to their own event contexts. No unauthorized global dataset leakage.
10. **Rate Limiting:** 50 campaign drafts per Organizer hour.
11. **AI Caching:** Drafted layout templates persisted inside browser cache systems.
12. **AI Memory System:** Saves organizers' stylistic brand patterns and voice preferences in historical configurations.

---

### MODULE 10: AI Recruiter Assistant
**Role Alignment:** Recruiter / Staffing Partner (Talent Finder)

1. **Architecture:** RAG search system indexing candidate resumes, matching candidates to Job Descriptions via semantic vector search queries, and generating warm email pitch drafts.
2. **Model Selection:** `gemini-3.1-pro-preview` for critical ATS qualification match modeling.
3. **Prompt Engineering:** Summarize candidate suitability scoring, highlight tech skills, and drafts custom pitch.
4. **API Structure:** Proxy to integrated ATS scanner API `/api/resume/analyze`
5. **Vector DB Schema:** Vector embeddings containing talent resume summaries.
6. **Streaming Setup:** Real-time streaming lists of candidates matching criteria as recruiter adjusts search tags.
7. **Scalability:** Horizontal Pinecone namespaces allocated per recruiter client accounts.
8. **Cost Optimization:** Pre-filter with DB SQL queries (e.g. `role: "Web Frontend"`) to reduce vector retrieval computation limits.
9. **Security:** Candidates can toggled "Opt-out of Recruiter Directory search" to mask their profile vectors recursively.
10. **Rate Limiting:** 120 talent matches scans per recruiter hour.
11. **AI Caching:** Match scoring matrices cached for rapid session paging.
12. **AI Memory System:** Remembers recruiter candidate ignore-lists to never recommend previously rejected talent.

---

## SECTION 3: COST CONSTRAINTS & CLOUD INGRESS ROUTING

### Global Optimization Matrix
| Resource Metric | Dev Tier | Production Tier (Unicorn Scale) |
| --- | --- | --- |
| **Model API Routing** | Free / Fallback locally | High-availability Fallback Pools |
| **Upstream Fallback** | Local Mock Generator | Multi-region OpenAI & Gemini fallback |
| **Cache Stratum** | Local runtime node buffers | Redis cluster with persistent storage |
| **In-Memory Db** | `database.json` & `backendDb.ts` | Scaled PostgreSQL + Weaviate Clusters |
| **Rate-limit Rules** | Low (Development) | Dynamic token-bucket with AWS WAF protection |

### Production Network Topology
1. All client commands leverage `https://ais-dev-...` endpoints routing through port 3000 nginx.
2. All AI API processes are processed fully serverside, hiding API keys and secrets securely.
3. Audio capture utilizes browser native `navigator.mediaDevices` stream capture nodes, feeding PCM 16kHz audio buffers to `/api/ai/tts` endpoints.

---
**Approved & Signed:**
**NexStart Chief Technology Officer & Principal AI Architect**
