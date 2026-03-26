import { readdir, readFile, copyFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { OUTPUT_DIR, SCRIPTS_DIR, DOCS_DIR, SITE_URL } from "./config.js";

interface Episode {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  filename: string; // e.g. 2026-03-26.mp3
  sizeBytes: number;
}

/** Extract a short description from the script markdown */
function extractDescription(markdown: string): string {
  const lines = markdown.split("\n").filter((l) => l.trim() !== "");
  // Skip the opening "It's Thursday..." line and the first heading, grab the first real paragraph
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.match(/^It's \w+day,/)) continue;
    // Return first substantive line, truncated
    const clean = line.replace(/\*\*/g, "").trim();
    if (clean.length > 20) {
      return clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
    }
  }
  return "Daily family news briefing";
}

/** Format date for RSS pubDate (RFC 2822) */
function toRFC2822(dateStr: string): string {
  const d = new Date(dateStr + "T08:00:00-07:00"); // Pacific time morning
  return d.toUTCString();
}

/** Format date for display */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function gatherEpisodes(): Promise<Episode[]> {
  const audioDir = join(DOCS_DIR, "audio");
  await mkdir(audioDir, { recursive: true });

  // Find all MP3 files in output/
  const outputFiles = await readdir(OUTPUT_DIR);
  const mp3Files = outputFiles.filter(
    (f) => f.endsWith(".mp3") && f.match(/^\d{4}-\d{2}-\d{2}\.mp3$/)
  );

  const episodes: Episode[] = [];

  for (const mp3 of mp3Files) {
    const date = basename(mp3, ".mp3");
    const srcPath = join(OUTPUT_DIR, mp3);
    const destPath = join(audioDir, mp3);

    // Copy MP3 to docs/audio/
    await copyFile(srcPath, destPath);

    // Get file size
    const info = await stat(destPath);

    // Try to read matching script for description
    let description = "Daily family news briefing";
    try {
      const scriptPath = join(SCRIPTS_DIR, `${date}.md`);
      const scriptContent = await readFile(scriptPath, "utf-8");
      description = extractDescription(scriptContent);
    } catch {
      // No matching script, use default
    }

    episodes.push({
      date,
      title: `Family News — ${formatDate(date)}`,
      description,
      filename: mp3,
      sizeBytes: info.size,
    });
  }

  // Sort newest first
  episodes.sort((a, b) => b.date.localeCompare(a.date));
  return episodes;
}

function generateRSS(episodes: Episode[]): string {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const now = new Date().toUTCString();

  const items = episodes
    .map(
      (ep) => `    <item>
      <title>${escapeXml(ep.title)}</title>
      <description>${escapeXml(ep.description)}</description>
      <pubDate>${toRFC2822(ep.date)}</pubDate>
      <guid isPermaLink="true">${baseUrl}/audio/${ep.filename}</guid>
      <enclosure url="${baseUrl}/audio/${ep.filename}" length="${ep.sizeBytes}" type="audio/mpeg" />
      <itunes:duration>300</itunes:duration>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Family News Briefing</title>
    <link>${baseUrl}</link>
    <description>Daily five-minute news briefing for the family. International news, markets, tech, and gaming.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <itunes:author>Andres</itunes:author>
    <itunes:summary>Daily five-minute news briefing for the family. International news, markets, tech, and gaming.</itunes:summary>
    <itunes:category text="News" />
    <itunes:explicit>false</itunes:explicit>
${items}
  </channel>
</rss>`;
}

async function main() {
  console.log("Publishing episodes...");

  const episodes = await gatherEpisodes();
  console.log(`Found ${episodes.length} episode(s)`);

  if (episodes.length === 0) {
    console.log("No episodes to publish. Run TTS first.");
    return;
  }

  // Write RSS feed
  const feedPath = join(DOCS_DIR, "feed.xml");
  const rss = generateRSS(episodes);
  await writeFile(feedPath, rss, "utf-8");
  console.log(`Feed written: ${feedPath} (${episodes.length} episodes)`);

  // List published episodes
  for (const ep of episodes) {
    const sizeMB = (ep.sizeBytes / 1024 / 1024).toFixed(1);
    console.log(`  ${ep.date} — ${sizeMB} MB`);
  }

  console.log(`\nFeed URL: ${SITE_URL}/feed.xml`);
}

main().catch((err) => {
  console.error("Publish failed:", err.message ?? err);
  process.exit(1);
});
