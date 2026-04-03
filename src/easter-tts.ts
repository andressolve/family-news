import { GoogleGenAI } from "@google/genai";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";
import { GEMINI_API_KEY, GEMINI_TTS_MODEL, FFMPEG_PATH } from "./config.js";

const EASTER_VOICE = "Algenib"; // Gravelly — deep, older, inspirational
const EASTER_OUTPUT_DIR = "./output/easter";

const PACING_INSTRUCTION =
  "Read the following at a calm, steady pace. Do not speed up toward the end.\n\n";

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/---+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Split text into chunks on paragraph boundaries, merging small ones
 *  so each chunk has at least MIN_WORDS words. */
const MIN_WORDS = 80;

function splitIntoChunks(text: string): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current) {
      current += "\n\n" + para;
    } else {
      current = para;
    }

    if (current.split(/\s+/).length >= MIN_WORDS) {
      chunks.push(current);
      current = "";
    }
  }

  // Append remainder to last chunk or push as final chunk
  if (current) {
    if (chunks.length > 0 && current.split(/\s+/).length < MIN_WORDS) {
      chunks[chunks.length - 1] += "\n\n" + current;
    } else {
      chunks.push(current);
    }
  }

  return chunks;
}

async function generateChunkAudio(
  ai: GoogleGenAI,
  text: string
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: GEMINI_TTS_MODEL,
    contents: [{ parts: [{ text: PACING_INSTRUCTION + text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: EASTER_VOICE,
          },
        },
      },
    },
  });

  const audioData =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioData) {
    throw new Error("No audio data in response for chunk");
  }

  return Buffer.from(audioData, "base64");
}

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error("Usage: npx tsx src/easter-tts.ts <script-file>");
    process.exit(1);
  }

  if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY not set in .env");
    process.exit(1);
  }

  const raw = await readFile(scriptPath, "utf-8");
  const text = stripMarkdown(raw);
  const wordCount = text.split(/\s+/).length;
  console.log(`Script: ${scriptPath} (${wordCount} words, ${text.length} chars)`);

  const name = basename(scriptPath, ".md");
  await mkdir(EASTER_OUTPUT_DIR, { recursive: true });
  const outputPath = join(EASTER_OUTPUT_DIR, `${name}.mp3`);

  // Split into paragraph chunks to prevent pacing drift
  const chunks = splitIntoChunks(text);
  console.log(`Split into ${chunks.length} chunks for even pacing`);
  console.log(`Generating audio with voice=${EASTER_VOICE}, model=${GEMINI_TTS_MODEL}...`);

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Generate audio for each chunk
  const pcmBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Chunk ${i + 1}/${chunks.length} (${chunks[i].split(/\s+/).length} words)...`);
    const pcm = await generateChunkAudio(ai, chunks[i]);
    pcmBuffers.push(pcm);
  }

  // Crossfade: apply short fade-out/fade-in at chunk boundaries and insert silence gap
  // PCM format: 16-bit signed LE, 24kHz mono → 2 bytes/sample, 24000 samples/sec
  const SAMPLE_RATE = 24000;
  const FADE_DURATION = 0.12; // seconds
  const GAP_DURATION = 0.5; // silence between chunks
  const fadeSamples = Math.floor(SAMPLE_RATE * FADE_DURATION);
  const gapBytes = Math.floor(SAMPLE_RATE * GAP_DURATION) * 2;
  const silenceGap = Buffer.alloc(gapBytes, 0);

  function applyFades(pcm: Buffer): Buffer {
    const buf = Buffer.from(pcm); // copy to avoid mutating original
    const totalSamples = buf.length / 2;

    // Fade in
    for (let i = 0; i < fadeSamples && i < totalSamples; i++) {
      const gain = i / fadeSamples;
      const sample = buf.readInt16LE(i * 2);
      buf.writeInt16LE(Math.round(sample * gain), i * 2);
    }

    // Fade out
    for (let i = 0; i < fadeSamples && i < totalSamples; i++) {
      const pos = totalSamples - 1 - i;
      const gain = i / fadeSamples;
      const sample = buf.readInt16LE(pos * 2);
      buf.writeInt16LE(Math.round(sample * gain), pos * 2);
    }

    return buf;
  }

  // Apply fades and join with silence gaps
  const parts: Buffer[] = [];
  for (let i = 0; i < pcmBuffers.length; i++) {
    parts.push(applyFades(pcmBuffers[i]));
    if (i < pcmBuffers.length - 1) {
      parts.push(silenceGap);
    }
  }
  const fullPcm = Buffer.concat(parts);
  console.log(`Applied ${FADE_DURATION}s fades + ${GAP_DURATION}s gaps between ${pcmBuffers.length} chunks`);

  const pcmPath = join(EASTER_OUTPUT_DIR, `${name}.pcm`);
  await writeFile(pcmPath, fullPcm);

  // Convert PCM to MP3 using ffmpeg
  execSync(
    `"${FFMPEG_PATH}" -y -f s16le -ar 24000 -ac 1 -i "${pcmPath}" -codec:a libmp3lame -qscale:a 2 "${outputPath}"`,
    { stdio: "pipe" }
  );

  await unlink(pcmPath);

  const mp3Buffer = await readFile(outputPath);
  const sizeMB = (mp3Buffer.length / 1024 / 1024).toFixed(1);
  console.log(`Done! Saved ${outputPath} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error("TTS failed:", err.message ?? err);
  process.exit(1);
});
