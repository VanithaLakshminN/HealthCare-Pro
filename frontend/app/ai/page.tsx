"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Send } from "lucide-react";
import { motion } from "framer-motion";

type Message = { role: "user" | "agent"; text: string; type?: "voice" | "text" };

const LANGUAGES = [
  { code: "hi", label: "हिंदी", tts: "hi-IN" },
  { code: "kn", label: "ಕನ್ನಡ", tts: "kn-IN" },
  { code: "te", label: "తెలుగు", tts: "te-IN" },
];

export default function HealthAssistant() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: "Hi! I'm your health assistant. Select a language, then type or speak your health question.", type: "text" },
  ]);
  const [inputText, setInputText] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Text chat ──────────────────────────────────────────────
  const sendText = async () => {
    const msg = inputText.trim();
    if (!msg || loading) return;

    setInputText("");
    setMessages((m) => [...m, { role: "user", text: msg, type: "text" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, language: lang.code }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : `Error: ${data.error}`;
      setMessages((m) => [...m, { role: "agent", text: reply, type: "text" }]);
      if (res.ok) speak(reply, lang.code);
    } catch (e) {
      setMessages((m) => [...m, { role: "agent", text: `Failed: ${String(e)}`, type: "text" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // ── Speak using Sarvam AI TTS ─────────────────────────────
  const speak = async (text: string, langCode: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langCode }),
      });
      const data = await res.json();
      if (data.audio) {
        const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([audioBytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        new Audio(url).play();
      } else {
        // fallback to browser TTS if Sarvam fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang.tts;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang.tts;
      window.speechSynthesis.speak(utterance);
    }
  };
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);

    mediaRecorder.current.onstop = async () => {
      setLoading(true);
      try {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "voice.webm");
        formData.append("language", lang.code);

        const res = await fetch("/api/voice", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setMessages((m) => [...m, { role: "agent", text: `Error: ${data.error}`, type: "voice" }]);
          return;
        }

        setMessages((m) => [...m, { role: "user", text: `🎤 ${data.transcription}`, type: "voice" }]);
        setMessages((m) => [...m, { role: "agent", text: data.reply, type: "voice" }]);

        speak(data.reply, lang.code);
      } catch (e) {
        setMessages((m) => [...m, { role: "agent", text: `Failed: ${String(e)}`, type: "voice" }]);
      } finally {
        setLoading(false);
      }
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-lg h-full max-h-[700px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-lg">🩺</div>
            <div>
              <p className="font-semibold text-sm">Health Assistant</p>
              <p className="text-xs text-zinc-400">Powered by Groq · Text & Voice</p>
            </div>
          </div>

          {/* Language selector */}
          <div className="flex gap-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  lang.code === l.code
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 max-w-[80%] rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 border border-zinc-700 text-zinc-100"
                }`}
              >
                {m.text}
                {m.type === "voice" && (
                  <span className="block text-xs mt-1 opacity-50">
                    {m.role === "user" ? "🎤 voice" : "🔊 voice reply"}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3 flex gap-1">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <span key={i} className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || recording}
            placeholder={`Type in ${lang.label}...`}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 disabled:opacity-50"
          />

          <button
            onClick={sendText}
            disabled={!inputText.trim() || loading || recording}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>

          <motion.button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading && !recording}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-white transition-colors ${
              recording ? "bg-red-600 hover:bg-red-500" : "bg-zinc-700 hover:bg-zinc-600"
            } disabled:opacity-40`}
            animate={recording ? { scale: [1, 1.15, 1] } : {}}
            transition={recording ? { repeat: Infinity, duration: 1 } : {}}
          >
            {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
