import "dotenv/config";

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";
// Set ELEVENLABS_VOICE_ID in .env — or leave blank to use the default "Will" voice
export const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "bIHbv24MWmeRgasZH58o"; // "Will" — young American male, news presenter style
export const MODEL_ID = "eleven_flash_v2_5"; // low-cost, low-latency, English
export const OUTPUT_FORMAT = "mp3_44100_128" as const;
export const SCRIPTS_DIR = "./scripts";
export const OUTPUT_DIR = "./output";
export const DOCS_DIR = "./docs";
export const SITE_URL = "https://andressolve.github.io/family-news";
