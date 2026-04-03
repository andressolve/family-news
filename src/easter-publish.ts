import { readdir, readFile, copyFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { DOCS_DIR, SITE_URL } from "./config.js";

const EASTER_OUTPUT_DIR = "./output/easter";
const EASTER_SCRIPTS_DIR = "./scripts/easter";
const EASTER_DOCS_DIR = join(DOCS_DIR, "easter");

interface Episode {
  slug: string; // friday, saturday, sunday
  title: string;
  description: string;
  filename: string;
  sizeBytes: number;
  pubDate: string; // RFC 2822
  order: number;
}

const EPISODE_META: Record<string, { title: string; date: string; order: number }> = {
  friday: {
    title: "Good Friday — The Passion",
    date: "2026-04-03T08:00:00-07:00",
    order: 1,
  },
  saturday: {
    title: "Holy Saturday — The Silence",
    date: "2026-04-04T08:00:00-07:00",
    order: 2,
  },
  sunday: {
    title: "Easter Sunday — The Resurrection",
    date: "2026-04-05T08:00:00-07:00",
    order: 3,
  },
};

function extractDescription(markdown: string): string {
  const lines = markdown.split("\n").filter((l) => l.trim() !== "");
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    const clean = line.replace(/\*\*/g, "").trim();
    if (clean.length > 20) {
      return clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
    }
  }
  return "Easter Triduum reflection for the family";
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
  const audioDir = join(EASTER_DOCS_DIR, "audio");
  await mkdir(audioDir, { recursive: true });

  const outputFiles = await readdir(EASTER_OUTPUT_DIR);
  const mp3Files = outputFiles.filter((f) => f.endsWith(".mp3"));

  const episodes: Episode[] = [];

  for (const mp3 of mp3Files) {
    const slug = basename(mp3, ".mp3");
    const meta = EPISODE_META[slug];
    if (!meta) continue;

    const srcPath = join(EASTER_OUTPUT_DIR, mp3);
    const destPath = join(audioDir, mp3);
    await copyFile(srcPath, destPath);

    const info = await stat(destPath);

    let description = "Easter Triduum reflection for the family";
    try {
      const scriptPath = join(EASTER_SCRIPTS_DIR, `${slug}.md`);
      const scriptContent = await readFile(scriptPath, "utf-8");
      description = extractDescription(scriptContent);
    } catch {}

    episodes.push({
      slug,
      title: meta.title,
      description,
      filename: mp3,
      sizeBytes: info.size,
      pubDate: new Date(meta.date).toUTCString(),
      order: meta.order,
    });
  }

  episodes.sort((a, b) => a.order - b.order);
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
      <pubDate>${ep.pubDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/easter/audio/${ep.filename}</guid>
      <enclosure url="${baseUrl}/easter/audio/${ep.filename}" length="${ep.sizeBytes}" type="audio/mpeg" />
      <itunes:duration>300</itunes:duration>
      <itunes:episode>${ep.order}</itunes:episode>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Easter Triduum</title>
    <link>${baseUrl}/easter</link>
    <description>A three-day Easter series for the family. Good Friday, Holy Saturday, Easter Sunday — the story told simply and seriously.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/easter/feed.xml" rel="self" type="application/rss+xml" />
    <itunes:author>Andres</itunes:author>
    <itunes:summary>A three-day Easter series for the family. Good Friday, Holy Saturday, Easter Sunday — the story told simply and seriously.</itunes:summary>
    <itunes:category text="Religion &amp; Spirituality" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>serial</itunes:type>
${items}
  </channel>
</rss>`;
}

async function main() {
  console.log("Publishing Easter episodes...");

  const episodes = await gatherEpisodes();
  console.log(`Found ${episodes.length} episode(s)`);

  if (episodes.length === 0) {
    console.log("No episodes to publish. Run easter-tts first.");
    return;
  }

  await mkdir(EASTER_DOCS_DIR, { recursive: true });

  const feedPath = join(EASTER_DOCS_DIR, "feed.xml");
  const rss = generateRSS(episodes);
  await writeFile(feedPath, rss, "utf-8");
  console.log(`RSS feed written: ${feedPath} (${episodes.length} episodes)`);

  for (const ep of episodes) {
    const sizeMB = (ep.sizeBytes / 1024 / 1024).toFixed(1);
    console.log(`  ${ep.slug} — ${ep.title} (${sizeMB} MB)`);
  }

  const feedUrl = SITE_URL.replace(/\/$/, "");
  console.log(`\nPodcast feed: ${feedUrl}/easter/feed.xml`);
}

main().catch((err) => {
  console.error("Publish failed:", err.message ?? err);
  process.exit(1);
});
