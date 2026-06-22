import { Router } from "express";
import OpenAI, { toFile } from "openai";
import multer from "multer";
import { requireUser, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi. Write your entire response using only Devanagari script (हिंदी). Do not use any English words or Roman script.",
  kn: "Kannada. Write your entire response using only Kannada script (ಕನ್ನಡ). Do not use any English words or Roman script.",
  te: "Telugu. Write your entire response using only Telugu script (తెలుగు). Do not use any English words or Roman script.",
};

const LANG_MAP: Record<string, { code: string; speaker: string }> = {
  hi: { code: "hi-IN", speaker: "anand" },
  kn: { code: "kn-IN", speaker: "kavitha" },
  te: { code: "te-IN", speaker: "roopa" },
};

// POST /chat — AI chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, language = "hi" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const langName = LANGUAGE_NAMES[language] ?? "Hindi";

    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful health advice assistant. Always reply in ${langName}. Provide safe, practical guidance on common health issues. Always remind users you are not a doctor and to seek professional help for serious concerns. Give home remedies where appropriate.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = chat.choices[0].message?.content ?? "Sorry, I could not process that.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("[chat] Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// POST /tts — Sarvam AI TTS endpoint
router.post("/tts", async (req, res) => {
  try {
    const { text, language = "hi" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    const lang = LANG_MAP[language] ?? LANG_MAP["hi"];

    const payload: Record<string, unknown> = {
      inputs: [text],
      target_language_code: lang.code,
      speaker: lang.speaker,
      model: "bulbul:v3",
    };

    const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!sarvamRes.ok) {
      const err = await sarvamRes.text();
      console.error("[tts] Sarvam error:", err);
      return res.status(sarvamRes.status).json({ error: err, fallback: true });
    }

    const data = await sarvamRes.json() as any;
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      return res.status(500).json({ error: "No audio returned", fallback: true });
    }

    return res.json({ audio: audioBase64 });
  } catch (error: any) {
    console.error("[tts] Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Internal server error", fallback: true });
  }
});

// GET /session — OpenAI Realtime Session configuration
router.get("/session", requireUser, async (req: AuthenticatedRequest, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error("[session] OpenAI error:", err);
      return res.status(r.status).json({ error: "Failed to create session" });
    }

    const data = await r.json();
    return res.json(data);
  } catch (e: any) {
    console.error("[session] Error:", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// POST /voice — Speech to Text and AI Chat response
router.post("/voice", upload.single("file"), async (req, res) => {
  try {
    const language = (req.body.language as string) ?? "hi";
    const langName = LANGUAGE_NAMES[language] ?? "Hindi";

    if (!req.file) {
      console.error("[voice] No file received");
      return res.status(400).send("No audio file received");
    }

    console.log("[voice] File received:", req.file.originalname, req.file.size, "bytes");

    // Convert multer file buffer to OpenAI compatible File object
    const file = await toFile(req.file.buffer, req.file.originalname, { type: req.file.mimetype });

    // 1. Transcribe
    console.log("[voice] Starting transcription...");
    const transcriptionRes = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
    });
    const text = transcriptionRes.text;
    console.log("[voice] Transcribed:", text);

    if (!text) {
      return res.status(400).json({ error: "Empty transcription" });
    }

    // 2. Chat response in selected language
    console.log("[voice] Getting chat response in", langName);
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Reply shortly in ${langName}. You are a health advice assistant who provides safe, practical, easy-to-follow guidance on common health issues, always reminding users you are not a doctor and to seek professional help for serious concerns, try to give some home remedies.`,
        },
        { role: "user", content: text },
      ],
    });
    const reply = chat.choices[0].message?.content ?? "समझ नहीं आया।";
    console.log("[voice] Reply:", reply);

    // Set custom header for the reply text for compatibility
    res.setHeader("X-Reply", encodeURIComponent(reply));
    return res.json({ reply, transcription: text });
  } catch (error: any) {
    console.error("[voice] Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
