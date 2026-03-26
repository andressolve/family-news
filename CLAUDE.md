# Family Context — Andres's Projects

This file provides background context for Claude Code projects built by Andres for his family. Read it before starting any task so you understand who you're building for.

---

## The Family

**Andres** — Dad. Vancouver, BC (UBC area). Investor and entrepreneur. Runs Sincerely Kitchen, a shared commercial kitchen incubator in Port Coquitlam. Comfortable with code, AI tools, and complex systems. Uses Claude Code extensively. Values: intellectual honesty, substance over style, high quality bars.

**Maria** — Mom. Andres's partner. Manages marketing for Sincerely Kitchen (Instagram, email, blog). Learning AI tools. Sometimes uses Claude Code for her own projects. If a project is tagged for Maria, adjust tone and context accordingly.

**Francisco** — Older son, ~10 years old (born ~2015). Grade 5 level.
- **Reading:** Advanced for his age. Reads One Piece manga, detective/mystery novels (Steve Brixton, Skulduggery Pleasant). Enjoys serious historical fiction.
- **Interests:** Strategy games (Polytopia, Age of Mythology, Total War Warhammer 3, Age of Empires IV), Greek/Roman history, graphic novels, action videos, anime/manga. Getting into combat robotics.
- **Personality:** Independent, strong opinions, takes pride in creative work. Responds well to being treated as capable. Will disengage from anything that feels babyish.
- **AI tools:** Has Claude Code + Nano Banana MCP configured. Can direct Claude Code for graphic novels and video prompts. Learning to delegate to AI rather than doing everything manually. Completed AI Studio activities (image generation, video shot briefs with Kling).
- **Education:** Geometry curriculum through Lesson 3 (vertical angles, parallel lines + transversal, corresponding angles). Next: alternate interior & co-interior angles, then triangle angle sum.

**Sebastian** — Younger son, ~8 years old (born ~2017). Grade 3 level (gifted — 99th percentile cognitive, was assessed and recommended for acceleration).
- **Reading:** Above grade level. Likes Murray and Bun, Wolves of Greycoat Hall, Chronicles of Lizard Nobody. Enjoys fantasy and quirky illustrated chapter books.
- **Interests:** Strategy games (Polytopia — very good at it, Age of Mythology with Dad), Beyblades, Lego, chess, Studio Ghibli films (loved Totoro and Spirited Away). Taught himself Latin and Japanese on Duolingo. Enjoys karate.
- **Personality:** Self-directed learner, high energy, advocates for himself (asked his principal to skip a grade at age 6). Enthusiastic and engaged when challenged. Needs shorter activity sessions than Francisco with built-in breaks.
- **AI tools:** Has Claude Code + Nano Banana MCP configured. Simpler activity track than Francisco — fewer steps, more scaffolding, naturally asks Claude for help (which is good).
- **Education:** Following Francisco's geometry curriculum but at an appropriate pace. Strong mathematical problem-solving (Beast Academy, Art of Problem Solving at home).

---

## Educational Philosophy

- **Treat them as capable.** These are smart kids. No condescension, no "wow isn't this FUN!" energy. Let the content be fascinating on its own merits.
- **Formal intellectual tone.** Educational content should feel like entering a tradition of serious thinking, not playing a game. Substance over flash.
- **Discovery-based.** Let them conjecture and explore before formalizing. Show the "why" before naming the theorem or concept.
- **Real vocabulary.** Don't simplify terminology — explain it. "This is called a transversal" is fine. "This is a special crossing line!" is not.
- **No gamification.** No badges, no "Great job!" popups. The work itself is the reward.

---

## Creative Projects — What's Been Built

### Graphic Novels (Claude Code + Nano Banana Pro)

- **"Salt and Stone"** — A serious historical graphic novel set in the ancient Mediterranean, ~480 BC. Protagonist is Nikos, a Greek boy whose island is destroyed by Persians. Three-part structure ("Three Lives"):
  - *Life One: The Boy* (age 9-10) — COMPLETE. 15 pages + cover. Island destroyed, father's sacrifice, shipwreck, taken in by Phoenician shipwright Hasdrubal in Sidon.
  - *Life Two: The Youth* (age 14-15) — COMPLETE. Battle of Salamis from the Persian/losing side, conscripted into Phoenician fleet, ship rammed, pulled from sea by Athenians.
  - *Life Three* — Planned. Athens golden age.
  - **Key characters:** Nikos (shell necklace, scar on left palm, carved wooden ship), Alexios (father), Hasdrubal (Phoenician shipwright).
  - **Tone:** Mature, cinematic, historically grounded. NOT children's book style.

- **"The House of Atreus"** — Greek mythology graphic novel.

- **Barbarian graphic novel** — Details TBD.

- **Illustrated philosophical stories** — Socrates, Plato, Aristotle, Epictetus/Stoicism. Created as educational content for both boys.

### AI Studio Activities

Multi-day structured activities teaching the boys to use AI tools through creative projects. Built as interactive HTML guides with progress tracking. Francisco's track is more advanced; Sebastian's is simplified with shorter sessions and built-in breaks.

Skills practiced: image generation prompting, video generation (Kling 2.6), directing Claude Code for complex multi-step projects, iterative refinement ("make it, watch it, fix it").

### Geometry Curriculum

Progressive lesson series building toward two-column proofs. Completed:
1. Language of Geometry (definitions, axioms)
2. Vertical Angles (first theorem proved)
3. Parallel Lines + Transversal — Corresponding Angles

Upcoming:
4. Alternate Interior & Co-Interior Angles (practice-heavy session planned)
5. Triangle Angle Sum (the payoff)

### D&D

Sebastian's 7th birthday party was D&D-themed. Complete package built: DM guide for beginners, three character sheets (Finn the Fighter, Luna the Cleric, Zara the Rogue), quest connected to Dragon of Icespire Peak (Essentials Kit). Family plays together at home.

---

## Technical Environment

- **Claude Code:** Installed and working on all family machines (Windows).
- **Nano Banana Pro MCP:** Configured on both boys' machines for AI image generation (Google Gemini).
- **Video generation:** Kling for short clips. Francisco has experience prompting it.
- **Graphic novel production:** Uses a 5-file prompt package system (project brief, style guide, characters, settings, script) that Claude Code executes autonomously.

---

## Project-Specific Sections

## Current Project: Daily Family News Briefing

Audio news briefings generated for the family. International news, markets, tech, and gaming news for the kids.

### How to Generate a Briefing

When the user asks to "generate today's news briefing" (or similar), follow these steps:

1. **Read the prompt template:** `prompts/briefing-prompt.md` — it has the full instructions for research, format, tone, and audience.
2. **Research today's news** using WebSearch (5-6 searches across categories).
3. **Write the script** to `scripts/YYYY-MM-DD.md` using today's date.
4. **Generate the audio** by running: `npx tsx src/tts.ts scripts/YYYY-MM-DD.md`
5. The MP3 will be saved to `output/YYYY-MM-DD.mp3`.

### Key Files
- `prompts/briefing-prompt.md` — The briefing template (edit to change format/tone)
- `src/tts.ts` — ElevenLabs TTS conversion utility
- `src/config.ts` — Voice ID, model, output format
- `.env` — API key and voice ID

### Learnings & Notes for Future Sessions

**ElevenLabs SDK (`@elevenlabs/elevenlabs-js` v2):**
- The old package name `elevenlabs` is deprecated. Use `@elevenlabs/elevenlabs-js`.
- `client.textToSpeech.convert(voiceId, { text, modelId, outputFormat })` returns a `ReadableStream` directly — not a response wrapper. Iterate with `for await (const chunk of stream)`.
- Model `eleven_flash_v2_5` is the cost-efficient choice for English-only spoken word. No chunking needed for scripts under 40K chars (~750 words is ~4,500 chars).
- The default voice "Will" (`bIHbv24MWmeRgasZH58o`) works well for news briefing tone — clear, natural, male news-anchor style.
- The API key provided has TTS permissions but NOT `voices_read` permission, so listing voices via API will fail. Pick voices from the ElevenLabs dashboard instead.

**Script writing:**
- Target ~750 words for a 5-minute briefing. The March 25 script was 719 words → 4.6 MB MP3.
- Write numbers as words for TTS ("fifteen percent" not "15%"). TTS handles numbers okay but spelled-out is more natural for audio.
- Strip markdown formatting before sending to TTS — headings, bold, links, bullets all become noise.
- Short sentences and natural speech patterns matter more than written prose quality. Avoid parenthetical asides.

**News research workflow:**
- Run 5-6 WebSearch queries, one per category. Use current month/year in queries for freshness.
- The Kids' Corner section should reference games the boys actually play (Polytopia, AoE IV, Age of Mythology, Total War Warhammer 3) — not generic gaming news.
- If a major story spans categories (e.g., Iran conflict affects markets AND geopolitics), lead with it in World & Politics and cross-reference briefly in Markets.
- **Verify temporal framing.** WebSearch results often surface stories from the past 3-5 days alongside today's news. Always check when a story actually happened and frame it correctly (e.g., "investigators are still working on Monday's crash" not "a plane crashed today").
- **Be skeptical of speculative financial articles.** Search summaries can present "stock split watch" or "could X happen?" articles as confirmed facts. If a financial event isn't reported by Reuters, Bloomberg, or the company itself, don't state it as fact.

**Project architecture:**
- Hybrid approach works well: Claude Code does research + writing (leverages WebSearch), Node.js script handles TTS (deterministic, repeatable).
- The `scripts/` directory as intermediate artifact is valuable — lets you review before spending ElevenLabs credits, and keeps an archive.
- Future automation path: replace Claude Code research step with Anthropic API + web search tool in a standalone `src/research.ts`. TTS code stays unchanged.

**Podcast feed (GitHub Pages):**
- Episodes are published via `src/publish.ts` which copies MP3s from `output/` to `docs/audio/` and regenerates `docs/feed.xml`.
- The `docs/` folder is served by GitHub Pages at `https://andressolve.github.io/family-news/`.
- RSS feed URL: `https://andressolve.github.io/family-news/feed.xml` — subscribe in any podcast app (Apple Podcasts, Pocket Casts, Spotify, etc.) or use on Alexa/Google speakers.
- `docs/index.html` is a simple web player fallback — bookmark on phone for quick access.
- The `/generatenews` command handles the full pipeline including publish + git push.
- GitHub repo: `andressolve/family-news` (public — anyone with the URL can access, but it's not discoverable).
