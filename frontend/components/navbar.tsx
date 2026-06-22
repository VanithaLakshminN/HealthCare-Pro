"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Home, Calendar, Pill, Brain, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/pharmacy", label: "Pharmacy", icon: Pill },
    { href: "/ai", label: "AI Assistant", icon: Brain },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-1.5"><Heart className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-white">HealthCare Pro</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              {l.icon && <l.icon className="w-4 h-4" />}{l.label}
            </Link>
          ))}
        </div>

        {/* Logout + mobile toggle */}
        <div className="flex items-center gap-2">
          <button onClick={logout} className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-zinc-400 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 pb-2 space-y-1 border-t border-zinc-800 pt-2">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
              {l.icon && <l.icon className="w-4 h-4" />}{l.label}
            </Link>
          ))}
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
