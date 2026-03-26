import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  ELEVENLABS_API_KEY,
  VOICE_ID,
  MODEL_ID,
  OUTPUT_FORMAT,
  OUTPUT_DIR,
} from "./config.js";

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links → text only
    .replace(/^[-*]\s+/gm, "") // list bullets
    .replace(/^\d+\.\s+/gm, "") // numbered lists
    .replace(/^>\s+/gm, "") // blockquotes
    .replace(/`(.+?)`/g, "$1") // inline code
    .replace(/---+/g, "") // horizontal rules
    .replace(/\n{3,}/g, "\n\n") // collapse extra blank lines
    .trim();
}

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error("Usage: npx tsx src/tts.ts <script-file>");
    console.error("  e.g. npx tsx src/tts.ts scripts/2026-03-25.md");
    process.exit(1);
  }

  if (!ELEVENLABS_API_KEY) {
    console.error("Error: ELEVENLABS_API_KEY not set in .env");
    process.exit(1);
  }

  // Read and clean the script
  const raw = await readFile(scriptPath, "utf-8");
  const text = stripMarkdown(raw);
  const wordCount = text.split(/\s+/).length;
  console.log(`Script: ${scriptPath} (${wordCount} words, ${text.length} chars)`);

  // Derive output filename from script filename
  const name = basename(scriptPath, ".md");
  await mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = join(OUTPUT_DIR, `${name}.mp3`);

  // Call ElevenLabs TTS
  console.log(`Generating audio with voice=${VOICE_ID}, model=${MODEL_ID}...`);
  const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

  const stream = await client.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: MODEL_ID,
    outputFormat: OUTPUT_FORMAT,
  });

  // Collect stream into buffer and write to file
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  await writeFile(outputPath, buffer);

  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`Done! Saved ${outputPath} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error("TTS failed:", err.message ?? err);
  process.exit(1);
});
