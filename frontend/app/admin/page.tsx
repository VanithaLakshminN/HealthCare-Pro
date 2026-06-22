"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-red-600 rounded-xl p-3"><Shield className="w-7 h-7 text-white" /></div>
          <span className="text-2xl font-bold text-white">Admin Panel</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {error && <p className="text-red-400 text-sm mb-4 bg-red-950 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
          <div className="space-y-4">
            <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Admin email" type="email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
            <div className="relative">
              <input value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Password" type={showPass ? "text" : "password"}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={login} disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors">
              {loading ? "Signing in..." : "Sign In as Admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
