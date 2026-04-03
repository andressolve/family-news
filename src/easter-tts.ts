import { GoogleGenAI } from "@google/genai";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";
import { GEMINI_API_KEY, GEMINI_TTS_MODEL, FFMPEG_PATH } from "./config.js";

const EASTER_VOICE = "Gacrux"; // Mature — deep, steady, wisdom tone
const EASTER_OUTPUT_DIR = "./output/easter";

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
  const pcmPath = join(EASTER_OUTPUT_DIR, `${name}.pcm`);

  console.log(`Generating audio with voice=${EASTER_VOICE}, model=${GEMINI_TTS_MODEL}...`);
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: GEMINI_TTS_MODEL,
    contents: [{ parts: [{ text }] }],
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
    throw new Error("No audio data in response");
  }

  const pcmBuffer = Buffer.from(audioData, "base64");
  await writeFile(pcmPath, pcmBuffer);

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
