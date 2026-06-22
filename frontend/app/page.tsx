"use client";
import { useState } from "react";
import { Heart, Calendar, Pill, Brain, FileText, Phone, Mail, MapPin, Star, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [contact, setContact] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submitContact = async () => {
    setSending(true);
    await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact) });
    setSending(false); setSent(true);
    setContact({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const services = [
    { icon: Calendar, title: "Appointment Booking", desc: "Book slots with top doctors across 6 partner hospitals instantly.", href: "/appointments", color: "bg-blue-600" },
    { icon: Pill, title: "Nearby Pharmacies", desc: "Find pharmacies near partner hospitals with real-time medicine availability.", href: "/pharmacy", color: "bg-green-600" },
    { icon: Brain, title: "AI Health Assistant", desc: "Chat or speak in Hindi, Kannada, or Telugu for instant health guidance.", href: "/ai", color: "bg-purple-600" },
    { icon: FileText, title: "Health Dashboard", desc: "Access prescriptions, X-rays, lab reports and appointment history.", href: "/dashboard", color: "bg-orange-600" },
  ];

  const stats = [
    { value: "6+", label: "Partner Hospitals" },
    { value: "50+", label: "Specialist Doctors" },
    { value: "3", label: "Indian Languages" },
    { value: "24/7", label: "AI Support" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav — hidden since global Navbar handles it, keeping anchor links only */}
      <div className="hidden">
        <nav></nav>
      </div>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-blue-400 text-sm font-medium bg-blue-950 border border-blue-800 px-3 py-1 rounded-full">Your Digital Health Partner</span>
          <h1 className="text-5xl md:text-6xl font-bold mt-6 mb-6 leading-tight">
            Healthcare at your <span className="text-blue-400">fingertips</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10">
            Book appointments, find pharmacies, manage health records, and get AI-powered health guidance — all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/appointments" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors">
              Book Appointment <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/ai" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors">
              <MessageCircle className="w-4 h-4" /> Talk to AI
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-y border-zinc-800 bg-zinc-900">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-400">{s.value}</p>
              <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => (
            <Link key={s.title} href={s.href} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all hover:shadow-xl">
              <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">{s.title}</h3>
              <p className="text-zinc-400 text-sm">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-20 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">About HealthCare Pro</h2>
            <p className="text-zinc-400 mb-4">We are a digital healthcare platform connecting patients with top hospitals and doctors in Bengaluru. Our mission is to make quality healthcare accessible to everyone.</p>
            <p className="text-zinc-400 mb-6">With AI-powered assistance in Hindi, Kannada, and Telugu, we ensure no language barrier stands between you and good health.</p>
            <div className="flex items-center gap-2 text-yellow-400">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400" />)}
              <span className="text-white ml-2">4.8 / 5 from 2000+ patients</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["NABH Accredited", "ISO 9001:2015", "HIPAA Compliant", "24/7 Support"].map((badge) => (
              <div key={badge} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center text-sm font-medium">{badge}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 rounded-xl p-3"><Phone className="w-5 h-5 text-white" /></div>
              <div><p className="font-semibold">Phone</p><p className="text-zinc-400 text-sm">+91 80-1234-5678</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-600 rounded-xl p-3"><Mail className="w-5 h-5 text-white" /></div>
              <div><p className="font-semibold">Email</p><p className="text-zinc-400 text-sm">support@healthcarepro.in</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-purple-600 rounded-xl p-3"><MapPin className="w-5 h-5 text-white" /></div>
              <div><p className="font-semibold">Address</p><p className="text-zinc-400 text-sm">123, MG Road, Bengaluru, Karnataka 560001</p></div>
            </div>
          </div>

          <div className="space-y-4">
            {sent ? (
              <div className="bg-green-950 border border-green-800 rounded-xl p-6 text-center text-green-400">
                ✓ Query submitted! We'll get back to you within 24 hours.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input value={contact.name} onChange={e => setContact(c => ({...c, name: e.target.value}))} placeholder="Your Name" className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                  <input value={contact.email} onChange={e => setContact(c => ({...c, email: e.target.value}))} placeholder="Email" type="email" className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                </div>
                <input value={contact.phone} onChange={e => setContact(c => ({...c, phone: e.target.value}))} placeholder="Phone (optional)" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                <input value={contact.subject} onChange={e => setContact(c => ({...c, subject: e.target.value}))} placeholder="Subject" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                <textarea value={contact.message} onChange={e => setContact(c => ({...c, message: e.target.value}))} placeholder="Your message..." rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none" />
                <button onClick={submitContact} disabled={sending || !contact.name || !contact.email || !contact.message} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition-colors">
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-zinc-500 text-sm">
        © 2026 HealthCare Pro. All rights reserved.
      </footer>
    </div>
  );
}
