"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Loader2 } from "lucide-react";

type Status = "idle" | "connecting" | "connected" | "error";

export default function VoiceAgent() {
  const router = useRouter();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Verify user is authenticated before attempting WebRTC
    fetch("/api/auth/me").then((r) => {
      if (!r.ok) {
        router.push("/login?callbackUrl=/aichat");
      }
    });
  }, [router]);

  const connect = async () => {
    setStatus("connecting");
    setError("");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Create audio element and attach to DOM so autoplay works in all browsers
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
      audioRef.current = audioEl;

      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("connected");
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setStatus("error");
          setError("Connection lost. Please try again.");
        }
      };

      // Request mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Get ephemeral session token (requires auth)
      const tokenRes = await fetch("/api/session");
      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get session token");
      }
      const data = await tokenRes.json();

      if (!data.client_secret?.value) {
        throw new Error("Invalid session response from server");
      }

      // Connect to OpenAI Realtime API
      const resp = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${data.client_secret.value}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!resp.ok) {
        throw new Error(`OpenAI Realtime error: ${resp.status}`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await resp.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (e: any) {
      console.error("[aichat]", e.message);
      setStatus("error");
      setError(e.message || "Failed to connect. Please try again.");
      // Cleanup on failure
      pcRef.current?.close();
      pcRef.current = null;
      if (audioRef.current) {
        document.body.removeChild(audioRef.current);
        audioRef.current = null;
      }
    }
  };

  const disconnect = () => {
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) {
      document.body.removeChild(audioRef.current);
      audioRef.current = null;
    }
    setStatus("idle");
    setError("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pcRef.current?.close();
      if (audioRef.current) {
        try { document.body.removeChild(audioRef.current); } catch {}
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl">
          🎙️
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1">Voice Health Agent</h1>
          <p className="text-zinc-400 text-sm">Powered by OpenAI Realtime API</p>
        </div>

        {/* Status indicator */}
        <div className={`text-sm font-medium px-4 py-2 rounded-xl border ${
          status === "connected"
            ? "bg-green-900/50 border-green-700 text-green-300"
            : status === "connecting"
            ? "bg-blue-900/50 border-blue-700 text-blue-300"
            : status === "error"
            ? "bg-red-900/50 border-red-700 text-red-300"
            : "bg-zinc-800 border-zinc-700 text-zinc-400"
        }`}>
          {status === "idle" && "Ready to connect"}
          {status === "connecting" && "Connecting..."}
          {status === "connected" && "🟢 Connected — speak now"}
          {status === "error" && `❌ ${error}`}
        </div>

        {/* Action button */}
        {status === "idle" || status === "error" ? (
          <button
            onClick={connect}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
          >
            <Mic className="w-5 h-5" /> Start Voice Session
          </button>
        ) : status === "connecting" ? (
          <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600/50 rounded-xl font-semibold opacity-70 cursor-not-allowed">
            <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition-colors"
          >
            <MicOff className="w-5 h-5" /> End Session
          </button>
        )}

        <p className="text-zinc-600 text-xs">
          Requires microphone access and an active internet connection.
        </p>
      </div>
    </div>
  );
}
