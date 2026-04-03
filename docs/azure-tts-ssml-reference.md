# Azure Neural TTS — Comprehensive SSML Reference & Prompting Guide

> Researched April 2026. Based on official Microsoft Learn docs, Azure samples, and community guides.

---

## 1. Azure Speech Service Setup

### Signup & Resource Creation

1. Go to the **Azure Portal**: https://portal.azure.com
2. Create a resource: **Azure AI services > Speech** (or search "Speech" in the marketplace)
3. Choose pricing tier:
   - **F0 (Free)**: 0.5 million characters/month for neural TTS. Non-adjustable quota.
   - **S0 (Standard)**: Pay-as-you-go. Neural voices ~$16/million chars. HD voices priced higher.
4. After creation, find your **Key** and **Region** in the resource's "Keys and Endpoint" blade.

### Region Selection

**For HD voices**, choose one of these regions (the only ones that support them):
- `eastus`, `eastus2`, `westus2`, `westeurope`, `swedencentral`, `southeastasia`, `canadacentral`, `centralindia`, `francecentral`

**Best general-purpose US region**: `eastus` — supports HD voices, batch synthesis, custom voice training, personal voice, voice conversion, and preview voices/styles.

**For Canada (Vancouver proximity)**: `canadacentral` supports HD voices and batch synthesis.

### Environment Variables

```bash
export SPEECH_KEY="your-key-here"
export SPEECH_REGION="eastus"   # or whichever region you chose
```

---

## 2. SSML Document Structure

### Required Skeleton

Every SSML document needs this structure:

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts"
       xml:lang="en-US">
    <voice name="en-US-GuyNeural">
        Your text here.
    </voice>
</speak>
```

**Required attributes on `<speak>`:**
- `version="1.0"` — always 1.0
- `xmlns="http://www.w3.org/2001/10/synthesis"` — W3C SSML namespace
- `xmlns:mstts="https://www.w3.org/2001/mstts"` — needed for any `mstts:` elements
- `xml:lang="en-US"` — default language (required even if set elsewhere)

**Special characters** must be XML-escaped:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- Quotes in attributes: use `&quot;` or alternate quote styles

---

## 3. All SSML Tags — Complete Reference

### 3.1 `<voice>` — Select Voice

```xml
<voice name="en-US-GuyNeural">Text here.</voice>
```

| Attribute | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Voice identifier (e.g., `en-US-GuyNeural`, `en-US-Davis:DragonHDLatestNeural`) |
| `effect` | No | Audio optimization: `eq_car` (car speakers), `eq_telecomhp8k` (telephone at 8kHz) |

Multiple voices in one document:
```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="en-US-GuyNeural">Hello, I'm Guy.</voice>
    <voice name="en-US-JennyNeural">And I'm Jenny!</voice>
</speak>
```

HD voice with temperature control:
```xml
<voice name="en-US-Andrew:DragonHDLatestNeural" parameters="temperature=0.8">
    Here is some text with controlled variation.
</voice>
```

### 3.2 `<prosody>` — Rate, Pitch, Volume, Contour

**Not supported on HD voices (DragonHD or DragonHDOmni).** Works on standard neural voices only.

```xml
<prosody rate="+20%" pitch="+10%" volume="loud">
    This text is faster, higher-pitched, and louder.
</prosody>
```

#### Rate

Controls speaking speed. Range: 0.5x to 2x original.

| Value | Effect |
|-------|--------|
| `x-slow` | 0.5x (half speed) |
| `slow` | 0.64x |
| `medium` | 1x (default) |
| `fast` | 1.55x |
| `x-fast` | 2x (double speed) |
| `+30%` | 30% faster than default |
| `-20%` | 20% slower than default |
| `0.8` | Multiplier (80% of normal speed) |
| `1.5` | Multiplier (150% of normal speed) |

```xml
<prosody rate="slow">Take your time with this passage.</prosody>
<prosody rate="0.75">Even slower, contemplative reading.</prosody>
<prosody rate="+40%">Quick, urgent delivery.</prosody>
```

#### Pitch

Controls baseline pitch. Changes should stay within 0.5x to 1.5x original.

| Value | Effect |
|-------|--------|
| `x-low` | ~0.55x (-45%) |
| `low` | ~0.8x (-20%) |
| `medium` | 1x (default) |
| `high` | ~1.2x (+20%) |
| `x-high` | ~1.45x (+45%) |
| `+80Hz` | Raise by 80 Hz |
| `-2st` | Lower by 2 semitones |
| `+15%` | Raise by 15% |
| `600Hz` | Absolute pitch |

```xml
<prosody pitch="low">A deeper, more serious tone.</prosody>
<prosody pitch="+2st">Slightly raised pitch for emphasis.</prosody>
```

#### Volume

| Value | Numeric Equivalent |
|-------|-------------------|
| `silent` | 0 |
| `x-soft` | 0.2 |
| `soft` | 0.4 |
| `medium` | 0.6 |
| `loud` | 0.8 |
| `x-loud` | 1.0 (default) |
| `75` | Absolute (0.0-100.0) |
| `+10` / `-5.5` | Relative adjustment |
| `+20%` | Percentage change |

```xml
<prosody volume="soft">A quiet, intimate aside.</prosody>
<prosody volume="+20%">Slightly louder for emphasis.</prosody>
```

#### Contour (Pitch Variation Over Time)

Defines pitch changes at specific time points within the text. Format: `(time%, pitch_change)`.

```xml
<prosody contour="(0%,+20Hz) (10%,-2st) (40%,+10Hz)">
    Were you the only person in the room?
</prosody>
```

- First value: percentage of text duration (0-100%)
- Second value: pitch adjustment (Hz, semitones, or percentage)
- Does NOT work on single words or short phrases — use on full sentences

#### Combining Prosody Attributes

```xml
<prosody rate="slow" pitch="low" volume="soft">
    A quiet, slow, deep passage — like a whispered reflection.
</prosody>
```

### 3.3 `<break>` — Pauses

```xml
Welcome <break time="750ms"/> to the program.
```

#### By Time (absolute)

| Value | Duration |
|-------|----------|
| `200ms` | 200 milliseconds |
| `500ms` | Half second |
| `750ms` | Three-quarter second |
| `1s` | One second |
| `2s` | Two seconds |
| Max: `20000ms` (20 seconds) | |

#### By Strength (relative)

| Strength | Duration |
|----------|----------|
| `x-weak` | 250ms |
| `weak` | 500ms |
| `medium` | 750ms (default if no attributes) |
| `strong` | 1000ms (1 second) |
| `x-strong` | 1250ms (1.25 seconds) |

```xml
<break/> <!-- 750ms default -->
<break strength="strong"/> <!-- 1 second -->
<break time="1500ms"/> <!-- 1.5 seconds, time overrides strength -->
```

**Supported on DragonHD voices but NOT DragonHDOmni voices.**

### 3.4 `<emphasis>` — Word-Level Stress

**Only works on three voices**: `en-US-GuyNeural`, `en-US-DavisNeural`, `en-US-JaneNeural`.

| Level | Effect |
|-------|--------|
| `reduced` | De-emphasized, less prominent |
| `none` | No emphasis applied |
| `moderate` | Default if level omitted |
| `strong` | Maximum emphasis |

```xml
I can help you join your <emphasis level="strong">meetings</emphasis> fast.
```

**Gotcha**: For words with naturally low pitch and short duration, even `strong` emphasis may not produce a noticeable difference.

### 3.5 `<mstts:express-as>` — Emotion Styles

The core tool for emotional expression. **Works on specific voices only** — check the voice/style matrix below.

```xml
<mstts:express-as style="sad" styledegree="1.5">
    I'm sorry to hear about your loss.
</mstts:express-as>
```

#### Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `style` | Yes | The emotion/context style. If invalid, entire element is ignored. |
| `styledegree` | No | Intensity: `0.01` (barely there) to `2` (double intensity). Default: `1`. |
| `role` | No | Age/gender role-play (only Chinese voices support this). |

#### All Available Styles (Standard Neural Voices)

| Style | Description | Best For |
|-------|-------------|----------|
| `advertisement_upbeat` | Excited, high-energy promotional tone | Ads, promos |
| `affectionate` | Warm, endearing tone with higher pitch | Love, care |
| `angry` | Angry and annoyed | Conflict scenes |
| `assistant` | Warm, relaxed digital assistant | Voice UI |
| `calm` | Cool, collected, composed; uniform prosody | Meditation, authority |
| `chat` | Casual, relaxed conversational | Podcasts, dialogue |
| `cheerful` | Positive, happy | Celebrations |
| `customerservice` | Friendly, helpful | Support scripts |
| `depressed` | Melancholic, low pitch/energy | Emotional content |
| `disgruntled` | Disdainful, complaining | Character voice |
| `documentary-narration` | Relaxed, informative, interested | Documentaries |
| `embarrassed` | Uncertain, hesitant | Character voice |
| `empathetic` | Caring, understanding | Counseling, support |
| `envious` | Tone of admiration/desire | Character voice |
| `excited` | Upbeat, hopeful | Announcements |
| `fearful` | Scared, nervous, high pitch, fast | Thriller content |
| `friendly` | Pleasant, inviting, warm | Welcoming |
| `gentle` | Mild, polite, low pitch/energy | Calming content |
| `hopeful` | Warm, yearning | Inspirational |
| `lyrical` | Melodic, sentimental | Poetry, emotional |
| `narration-professional` | Professional, objective | Audiobooks, corporate |
| `narration-relaxed` | Soothing, melodious | Bedtime stories, ASMR |
| `newscast` | Formal, professional news tone | News |
| `newscast-casual` | Versatile, casual news delivery | Informal news |
| `newscast-formal` | Formal, confident, authoritative | Formal news |
| `poetry-reading` | Emotional, rhythmic | Poetry |
| `sad` | Sorrowful | Emotional content |
| `serious` | Strict, commanding, firm cadence | Warnings, authority |
| `shouting` | As if distant, making effort to be heard | Drama |
| `sports_commentary` | Relaxed, interested | Sports narration |
| `sports_commentary_excited` | Intensive, energetic | Exciting moments |
| `whispering` | Soft, quiet, gentle | Intimate, secrets |
| `terrified` | Scared, faster pace, shaky voice | Horror, thriller |
| `unfriendly` | Cold, indifferent | Villain, antagonist |

#### HD Voice Styles (DragonHD and DragonHDOmni)

HD voices support a much broader set of natural-language-like styles. These are content-aware — the model adapts based on text semantics:

`amazed`, `amused`, `angry`, `annoyed`, `anxious`, `appreciative`, `calm`, `cautious`, `concerned`, `confident`, `confused`, `curious`, `defeated`, `defensive`, `defiant`, `determined`, `disappointed`, `disgusted`, `doubtful`, `ecstatic`, `encouraging`, `excited`, `fast`, `fearful`, `frustrated`, `happy`, `hesitant`, `hurt`, `impatient`, `impressed`, `intrigued`, `joking`, `laughing`, `optimistic`, `painful`, `panicked`, `panting`, `pleading`, `proud`, `quiet`, `reassuring`, `reflective`, `relieved`, `remorseful`, `resigned`, `sad`, `sarcastic`, `secretive`, `serious`, `shocked`, `shouting`, `shy`, `skeptical`, `slow`, `struggling`, `surprised`, `suspicious`, `sympathetic`, `terrified`, `upset`, `urgent`, `whispering`

**Paralinguistic effects** (HD voices, all languages): `laughter`, `coughing`, `throat_clearing`, `breathing`, `sighing`, `yawning`

#### Style Degree Examples

```xml
<!-- Subtle sadness -->
<mstts:express-as style="sad" styledegree="0.5">
    It was a difficult time for everyone.
</mstts:express-as>

<!-- Full intensity sadness -->
<mstts:express-as style="sad" styledegree="2">
    I cannot believe they are gone.
</mstts:express-as>

<!-- Switching styles mid-passage -->
<mstts:express-as style="calm" styledegree="1">
    Take a deep breath.
</mstts:express-as>
<break time="800ms"/>
<mstts:express-as style="excited" styledegree="1.5">
    Now let us begin the adventure!
</mstts:express-as>
```

#### Roles (Chinese Voices Only)

| Role | Description |
|------|-------------|
| `Girl` | Imitates a girl |
| `Boy` | Imitates a boy |
| `YoungAdultFemale` | Young adult female |
| `YoungAdultMale` | Young adult male |
| `OlderAdultFemale` | Older adult female |
| `OlderAdultMale` | Older adult male |
| `SeniorFemale` | Senior female |
| `SeniorMale` | Senior male |

### 3.6 `<mstts:silence>` — Structured Silence

Unlike `<break>`, this controls silence at boundaries rather than inline.

**Not supported on HD voices.**

| Type | Description |
|------|-------------|
| `Leading` | Extra silence before text (added to natural silence) |
| `Leading-exact` | Absolute silence before text (replaces natural) |
| `Tailing` | Extra silence after text (added to natural silence) |
| `Tailing-exact` | Absolute silence after text (replaces natural) |
| `Sentenceboundary` | Extra silence between adjacent sentences |
| `Sentenceboundary-exact` | Absolute silence between sentences |
| `Comma-exact` | Absolute silence at commas |
| `Semicolon-exact` | Absolute silence at semicolons |
| `Enumerationcomma-exact` | Absolute silence at enumeration commas (full-width) |

```xml
<voice name="en-US-GuyNeural">
    <mstts:silence type="Sentenceboundary" value="400ms"/>
    <mstts:silence type="Leading" value="200ms"/>
    First sentence with extra pauses between sentences.
    Second sentence follows with a longer gap.
</voice>
```

**Gotcha**: `-exact` types take precedence over non-exact types. The silence setting applies to ALL text within its enclosing `<voice>` element. To change it, you need a new `<voice>` element.

### 3.7 `<say-as>` — Pronunciation Control

Tells the engine how to interpret and speak specific content types.

| interpret-as | format | Example |
|-------------|--------|---------|
| `characters` / `spell-out` | `casesensitive` (optional) | `<say-as interpret-as="characters">FBI</say-as>` → "F B I" |
| `cardinal` / `number` | — | `<say-as interpret-as="cardinal">42</say-as>` → "forty-two" |
| `ordinal` | — | `<say-as interpret-as="ordinal">3rd</say-as>` → "third" |
| `number_digit` | — | `<say-as interpret-as="number_digit">123</say-as>` → "one two three" |
| `fraction` | — | `<say-as interpret-as="fraction">3/8</say-as>` → "three eighths" |
| `date` | `dmy`, `mdy`, `ymd`, `ym`, `my`, `md`, `dm`, `d`, `m`, `y` | `<say-as interpret-as="date" format="mdy">10/19/2010</say-as>` → "October nineteenth twenty ten" |
| `time` | `hms12`, `hms24` | `<say-as interpret-as="time" format="hms12">4:00am</say-as>` → "four A M" |
| `duration` | `hms`, `hm`, `ms` | `<say-as interpret-as="duration" format="ms">01:18</say-as>` → "one minute and eighteen seconds" |
| `telephone` | — | `<say-as interpret-as="telephone">(888) 555-1212</say-as>` |
| `currency` | — | `<say-as interpret-as="currency">99.9 USD</say-as>` → "ninety-nine US dollars and ninety cents" |
| `address` | — | `<say-as interpret-as="address">150th CT NE, Redmond, WA</say-as>` |
| `name` | — | `<say-as interpret-as="name">ED</say-as>` → pronounced as a name, not spelled |
| `unit` | — | `<say-as interpret-as="unit">10 m</say-as>` → "ten meters" |
| `alphanumeric` | `spell` | `<say-as interpret-as="alphanumeric" format="spell">AB-CD</say-as>` → "A B pause C D" |

**Note**: `characters` and `spell-out` work on all locales. Other values support: Arabic, Catalan, Chinese, Danish, Dutch, English, French, Finnish, German, Hindi, Italian, Japanese, Korean, Norwegian, Polish, Portuguese, Russian, Spanish, Swedish.

**Supported on both standard and HD voices.**

### 3.8 `<p>` and `<s>` — Paragraphs and Sentences

Explicitly mark paragraph and sentence boundaries for better pacing:

```xml
<p>
    <s>This is the first sentence of the first paragraph.</s>
    <s>And this is the second sentence.</s>
</p>
<p>
    This is the second paragraph. The engine auto-detects sentences here.
</p>
```

The engine handles punctuation-based pauses automatically, but explicit `<p>` and `<s>` tags give you more control over pacing.

**Supported on both standard and HD voices.**

### 3.9 `<sub>` — Substitution

Replace displayed text with spoken text:

```xml
<sub alias="World Wide Web Consortium">W3C</sub>
<sub alias="sodium chloride">NaCl</sub>
```

### 3.10 `<phoneme>` — Custom Pronunciation

```xml
<phoneme alphabet="ipa" ph="tə.ˈmeɪ.toʊ">tomato</phoneme>
```

Supported alphabets: `ipa`, `sapi`, `ups`, `x-sampa`.

**Supported on DragonHD but NOT DragonHDOmni.**

### 3.11 `<audio>` — Insert Prerecorded Audio

```xml
<audio src="https://contoso.com/beep.wav">
    Fallback text if audio cannot play.
</audio>
```

Requirements: HTTPS URL, valid audio format (mp3/wav/opus/ogg/flac/wma), total audio + TTS under 600 seconds.

**Not supported on HD voices.**

### 3.12 `<mstts:backgroundaudio>` — Background Music

```xml
<speak version="1.0" xml:lang="en-US" xmlns:mstts="http://www.w3.org/2001/mstts">
    <mstts:backgroundaudio src="https://example.com/ambient.wav"
                           volume="0.3"
                           fadein="3000"
                           fadeout="4000"/>
    <voice name="en-US-GuyNeural">
        The text is spoken over the background audio.
    </voice>
</speak>
```

Must be the FIRST child of `<speak>`. Only one per document. Audio loops if shorter than speech.

**Not supported on HD voices.**

---

## 4. Voice Selection Guide

### Best Male Voices for Storytelling/Narration

#### Standard Neural Voices (Full SSML Support)

| Voice | Character | Styles Supported | Best For |
|-------|-----------|-----------------|----------|
| **`en-US-GuyNeural`** | Deep, mature male | angry, cheerful, excited, friendly, hopeful, newscast, sad, shouting, terrified, unfriendly, whispering + **emphasis support** | News, narration, storytelling |
| **`en-US-DavisNeural`** | Warm, versatile male | angry, chat, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering + **emphasis support** | Conversational storytelling, podcasts |
| **`en-US-JasonNeural`** | Clear male | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering | Audiobooks, narration |
| **`en-US-TonyNeural`** | Strong male | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering | Drama, character work |

#### HD Voices (Premium Quality, Limited SSML)

| Voice | Type | Notes |
|-------|------|-------|
| **`en-US-Andrew:DragonHDLatestNeural`** | Male HD | Professional quality. Also has Andrew2 (conversational) and Andrew3 (podcast). |
| **`en-US-Davis:DragonHDLatestNeural`** | Male HD | Same Davis persona, HD quality |
| **`en-US-Brian:DragonHDLatestNeural`** | Male HD | Clear, professional |
| **`en-US-Adam:DragonHDLatestNeural`** | Male HD | Newer voice |
| **`en-US-Steffan:DragonHDLatestNeural`** | Male HD | Professional tone |

#### HD Omni Voices (700+ voices, style control)

Format: `en-US-VoiceName:DragonHDOmniLatestNeural`

These support `mstts:express-as` with 60+ styles and automatic emotion detection. Best for diverse content creation.

### Recommendation for Spiritual/Emotional Content

**For maximum SSML control**: Use `en-US-GuyNeural` or `en-US-DavisNeural`. These support:
- Full prosody control (rate, pitch, volume, contour)
- Emphasis (word-level stress)
- All emotion styles (11 styles each)
- Break and silence elements
- Style degree (0.01-2.0)

**For highest audio quality**: Use `en-US-Andrew:DragonHDLatestNeural` or `en-US-Davis:DragonHDLatestNeural`. Trade-off: no prosody/emphasis/break control, but automatic emotion detection from text.

### Complete en-US Voice-to-Style Matrix

| Voice | Supported Styles |
|-------|-----------------|
| `en-US-AriaNeural` (F) | angry, chat, cheerful, customerservice, empathetic, excited, friendly, hopeful, narration-professional, newscast-casual, newscast-formal, sad, shouting, terrified, unfriendly, whispering |
| `en-US-JennyNeural` (F) | angry, assistant, chat, cheerful, customerservice, excited, friendly, hopeful, newscast, sad, shouting, terrified, unfriendly, whispering |
| `en-US-GuyNeural` (M) | angry, cheerful, excited, friendly, hopeful, newscast, sad, shouting, terrified, unfriendly, whispering |
| `en-US-DavisNeural` (M) | angry, chat, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |
| `en-US-JasonNeural` (M) | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |
| `en-US-TonyNeural` (M) | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |
| `en-US-JaneNeural` (F) | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |
| `en-US-NancyNeural` (F) | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |
| `en-US-SaraNeural` (F) | angry, cheerful, excited, friendly, hopeful, sad, shouting, terrified, unfriendly, whispering |

---

## 5. Best Practices for Emotional/Spiritual Content

### Pacing Dramatic Pauses

Natural pause durations for different contexts:

| Context | Recommended Break | Technique |
|---------|------------------|-----------|
| Breath pause (within sentence) | 200-400ms | `<break time="300ms"/>` |
| End of a normal sentence | 500-750ms | `<break strength="medium"/>` or natural punctuation |
| Dramatic pause (tension) | 800-1200ms | `<break time="1000ms"/>` |
| Scene transition / section break | 1500-2500ms | `<break time="2000ms"/>` |
| Deep contemplative pause | 2000-3000ms | `<break time="2500ms"/>` |
| Chapter/segment boundary | 3000-5000ms | `<mstts:silence type="Sentenceboundary" value="4000ms"/>` |

### Tone Shifting Within a Piece

Pattern: calm opening → build intensity → climax → resolution.

```xml
<voice name="en-US-DavisNeural">
    <!-- Opening: calm, slow -->
    <mstts:express-as style="calm" styledegree="1">
        <prosody rate="slow" pitch="-5%">
            In the stillness of the morning, before the world wakes...
        </prosody>
    </mstts:express-as>

    <break time="1500ms"/>

    <!-- Building: normal pace, warmer -->
    <mstts:express-as style="hopeful" styledegree="1.2">
        <prosody rate="medium">
            Something stirs in the heart. A quiet knowing. A voice that says: you are not alone.
        </prosody>
    </mstts:express-as>

    <break time="800ms"/>

    <!-- Climax: stronger emotion, slightly faster -->
    <mstts:express-as style="excited" styledegree="1.5">
        <prosody rate="+10%" pitch="+5%">
            This is the moment. This is where everything changes.
        </prosody>
    </mstts:express-as>

    <break time="2000ms"/>

    <!-- Resolution: return to calm -->
    <mstts:express-as style="gentle" styledegree="0.8">
        <prosody rate="slow" volume="soft">
            And so it was. Peace returned, like water finding its level.
        </prosody>
    </mstts:express-as>
</voice>
```

### Prosody Tips for Natural Sound

1. **Small adjustments**: Stay within +/- 20% for rate and pitch. Larger values sound robotic.
2. **Use rate more than pitch**: Rate changes are more natural-sounding than pitch changes.
3. **Combine style + prosody**: Use `express-as` for the emotional flavor, then fine-tune with `prosody`.
4. **Avoid styledegree=2 on everything**: Reserve max intensity for true climactic moments. Default (1.0) is already expressive.
5. **Let punctuation work**: The engine already pauses for periods, commas, and question marks. Don't add breaks after every sentence.
6. **Use `<p>` and `<s>` tags**: These give the engine better context for pacing than unstructured text.
7. **Contour for questions**: Use pitch contour for natural question intonation:
   ```xml
   <prosody contour="(80%,+15%) (100%,+30%)">
       Do you understand what I'm saying?
   </prosody>
   ```

### Writing Text for TTS

- **Short sentences** work better than long, complex ones.
- **Avoid parenthetical asides** — they confuse the pacing model.
- **Write numbers as words** for critical content: "fifteen percent" not "15%".
- **Use em-dashes instead of parentheses** for natural pauses.
- **Ellipsis (...)** creates a natural trailing pause — use it for dramatic effect.
- **Exclamation marks** naturally raise energy — don't combine with high styledegree.

---

## 6. Node.js SDK Reference

### Installation

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

### Basic SSML-to-MP3 Synthesis

```javascript
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";

async function synthesizeSSMLtoMP3(ssml, outputPath) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION
    );

    // Set MP3 output format
    speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;

    // Output to file
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
            ssml,
            (result) => {
                synthesizer.close();
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    console.log(`Audio saved to ${outputPath}`);
                    resolve(result);
                } else {
                    reject(new Error(
                        `Synthesis failed: ${result.errorDetails}`
                    ));
                }
            },
            (error) => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

// Usage
const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-GuyNeural">
        <mstts:express-as style="calm">
            <prosody rate="slow">
                Welcome to today's reflection.
            </prosody>
        </mstts:express-as>
    </voice>
</speak>`;

await synthesizeSSMLtoMP3(ssml, "output.mp3");
```

### Available MP3 Output Formats

```javascript
// Lower quality, smaller files
sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3   // 16kHz, 32kbps
sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3  // 16kHz, 128kbps

// Higher quality, larger files
sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3   // 24kHz, 48kbps
sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3   // 24kHz, 96kbps (recommended)
```

Other formats available:
```javascript
// WAV/PCM
sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm
sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm
sdk.SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm

// OGG
sdk.SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus
```

### In-Memory Synthesis (No File)

```javascript
async function synthesizeToBuffer(ssml) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION
    );
    speechConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;

    // Pass null for audioConfig to get data in memory
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
            ssml,
            (result) => {
                synthesizer.close();
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    // result.audioData is an ArrayBuffer
                    const buffer = Buffer.from(result.audioData);
                    resolve(buffer);
                } else {
                    reject(new Error(result.errorDetails));
                }
            },
            (error) => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

// Save buffer to file manually
const audioBuffer = await synthesizeToBuffer(ssml);
fs.writeFileSync("output.mp3", audioBuffer);
```

### Event Handling (Word Boundaries, Bookmarks)

```javascript
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

// Track word timing for subtitles/karaoke
synthesizer.wordBoundary = (s, e) => {
    console.log(`Word: "${e.text}" at ${(e.audioOffset + 5000) / 10000}ms`);
};

// Track SSML bookmarks
synthesizer.bookmarkReached = (s, e) => {
    console.log(`Bookmark "${e.text}" at ${(e.audioOffset + 5000) / 10000}ms`);
};

// Track synthesis progress
synthesizer.synthesizing = (s, e) => {
    console.log(`Chunk received: ${e.result.audioData.byteLength} bytes`);
};

synthesizer.synthesisCompleted = (s, e) => {
    console.log(`Done! Total: ${e.result.audioData.byteLength} bytes`);
};

synthesizer.synthesisCanceled = (s, e) => {
    console.error("Synthesis canceled");
};
```

### Authentication Options

```javascript
// Option 1: Subscription key + region
const config = sdk.SpeechConfig.fromSubscription(key, region);

// Option 2: Endpoint URL + key (for private endpoints)
const config = sdk.SpeechConfig.fromEndpoint(new URL(endpoint), key);

// The key + region approach is simplest for standard use
```

---

## 7. HD Voices — What You Need to Know

### DragonHD vs Standard Neural

| Feature | Standard Neural | DragonHD | DragonHDOmni |
|---------|----------------|----------|--------------|
| Prosody control | Full | None | None |
| Break/pause | Full | Yes (break only) | None |
| Emphasis | 3 voices | None | None |
| express-as styles | Varies by voice | None | Yes (60+ styles) |
| Silence control | Full | None | None |
| Phoneme | Full | Yes | None |
| say-as | Full | Yes | Yes |
| Background audio | Yes | None | None |
| Audio insert | Yes | None | None |
| Auto emotion detection | No | Yes | Yes |
| Temperature control | No | Yes | Yes |
| top_p / top_k / cfg_scale | No | No | Yes |
| Voice count | 500+ | 30+ | 700+ |
| Latency | < 300ms | < 300ms | < 300ms |

### HD Voice Naming Convention

```
en-US-Ava:DragonHDLatestNeural       # DragonHD, latest model
en-US-Ava:DragonHDOmniLatestNeural   # DragonHDOmni, latest model
en-US-Ava:DragonHDFlashLatestNeural  # DragonHDFlash (limited locales)
```

### DragonHDOmni Parameter Tuning

```xml
<voice name="en-US-Andrew:DragonHDOmniLatestNeural"
       parameters="temperature=0.8;top_p=0.8;top_k=30;cfg_scale=1.4">
    Your text here.
</voice>
```

| Parameter | Default | Range | Purpose |
|-----------|---------|-------|---------|
| `temperature` | 0.7 | 0.3-1.0 | Creativity vs stability |
| `top_p` | 0.7 | 0.3-1.0 | Output diversity filtering |
| `top_k` | 22 | 1-50 | Options considered |
| `cfg_scale` | 1.4 | 1.0-2.0 | Contextual relevance & speed |

**Tip**: Keep `top_p` equal to `temperature` for best results.

### Multi-Talker HD Voices (Podcast/Dialogue)

```xml
<voice name="en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural">
    <mstts:dialog>
        <mstts:turn speaker="ava">Hello, Andrew! How are you?</mstts:turn>
        <mstts:turn speaker="andrew">Great, thanks! Let me tell you about this.</mstts:turn>
    </mstts:dialog>
</voice>
```

---

## 8. Gotchas, Tips & Tricks

### Common Mistakes

1. **Forgetting `xmlns:mstts`**: If you use ANY `mstts:` element without the namespace declaration, the entire document fails silently.

2. **Using prosody on HD voices**: HD voices ignore `<prosody>`, `<emphasis>`, `<mstts:silence>`, `<audio>`, and `<mstts:backgroundaudio>`. Your SSML won't error — those elements are just silently ignored.

3. **Invalid style name**: If you use a style not supported by the chosen voice, the entire `<mstts:express-as>` element is ignored (falls back to neutral). No error is thrown.

4. **Break time maximum**: Values above 20,000ms are silently capped to 20,000ms.

5. **Silence scope**: `<mstts:silence>` applies to ALL text in the enclosing `<voice>` element. To change silence settings mid-document, you must use a new `<voice>` element (can be the same voice name).

6. **Character billing**: You are billed for all characters converted to speech, including punctuation. SSML tags themselves are not billed, but elements like `<phoneme>` and `<sub>` that affect pronunciation ARE counted.

7. **Lexicon caching**: Custom lexicons are cached for 15 minutes. Changes to a lexicon at the same URL won't take effect immediately.

### Performance Tips

- **Region matters**: Choose a region close to your users for lower latency. HD voices have < 300ms latency.
- **Reuse SpeechConfig**: Don't create a new config for every synthesis call.
- **Close the synthesizer**: Always call `synthesizer.close()` in Node.js callbacks.
- **Use Audio24Khz96KBitRateMonoMp3** for production — best quality-to-size ratio.

### Quality Tips

- **Test in Speech Studio first**: Use https://speech.microsoft.com/portal/voicegallery to audition voices and test SSML before coding.
- **HD voices auto-detect emotion**: If using DragonHD/DragonHDOmni, well-written emotional text produces natural emotional delivery without SSML style tags.
- **Standard voices need explicit styles**: Unlike HD voices, standard neural voices are neutral by default and need `express-as` for any emotional coloring.
- **Combine styles with prosody on standard voices**: Use `express-as` for the base emotion, then layer `prosody` for fine-tuning rate/pitch/volume within that emotion.

### Pricing Notes (as of 2025)

- **F0 (Free)**: 0.5 million characters/month. Non-adjustable.
- **S0 (Standard Neural)**: ~$16 per 1 million characters
- **HD voices**: Priced higher than standard neural (check Azure pricing page for current rates)
- **All tiers**: Billed per character, including punctuation. SSML markup tags are not billed.
- Characters in `<say-as>`, `<phoneme>`, `<sub>` ARE counted.

---

## 9. Complete Example — Emotional Narration Script

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="en-US-DavisNeural">

        <!-- Title / Opening -->
        <mstts:silence type="Leading" value="500ms"/>
        <mstts:express-as style="calm" styledegree="1">
            <prosody rate="0.85" pitch="-3%">
                <p>
                    <s>There is a place beyond the noise.</s>
                    <s>A stillness that has always been there, waiting.</s>
                </p>
            </prosody>
        </mstts:express-as>

        <break time="2000ms"/>

        <!-- Building emotion -->
        <mstts:express-as style="hopeful" styledegree="1.3">
            <prosody rate="medium">
                <p>
                    <s>You have felt it before.</s>
                    <s>In the quiet of early morning.</s>
                    <s>In the last light of a long day.</s>
                </p>
            </prosody>
        </mstts:express-as>

        <break time="1500ms"/>

        <!-- Climax -->
        <mstts:express-as style="empathetic" styledegree="1.6">
            <prosody rate="0.9" pitch="+3%">
                <p>
                    <s>It whispers your name.</s>
                    <break time="800ms"/>
                    <s>Not the name others call you.</s>
                    <break time="500ms"/>
                    <s>The one you have always known.</s>
                </p>
            </prosody>
        </mstts:express-as>

        <break time="2500ms"/>

        <!-- Resolution -->
        <mstts:express-as style="calm" styledegree="0.8">
            <prosody rate="slow" volume="soft">
                <p>
                    <s>Rest here.</s>
                    <break time="1000ms"/>
                    <s>You are home.</s>
                </p>
            </prosody>
        </mstts:express-as>

        <mstts:silence type="Tailing" value="1000ms"/>
    </voice>
</speak>
```

---

## Sources

- [SSML Overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
- [SSML Document Structure & Events](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-structure)
- [Voice & Sound SSML Reference](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)
- [Pronunciation SSML Reference](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation)
- [HD Voices Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- [Voice Styles & Roles](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts#voice-styles-and-roles)
- [TTS Quickstart (Node.js)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech)
- [How to Synthesize Speech (SDK)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis)
- [SpeechSynthesizer API](https://learn.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/speechsynthesizer)
- [Supported Regions](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions)
- [Azure Speech Pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- [Azure Samples: Cognitive-Speech-TTS](https://github.com/Azure-Samples/Cognitive-Speech-TTS)
- [SSML Wiki (Azure Samples)](https://github.com/Azure-Samples/Cognitive-Speech-TTS/wiki/How-to-use-SSML)
