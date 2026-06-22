"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, Pill, Upload, Trash2, Heart, Plus, X, Eye, User, Phone, MapPin, Droplets, Edit3, Check, AlertCircle, MessageSquare, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Tab = "overview" | "records" | "prescriptions" | "appointments" | "profile" | "queries";
type MedRecord = { _id: string; type: string; title: string; doctor: string; hospital: string; date: string; notes: string; fileUrl?: string; fileName?: string };
type Appointment = { _id: string; hospitalName: string; doctorName: string; doctorSpecialty: string; date: string; slot: string; status: string; type: string };
type UserProfile = { id: string; name: string; email: string; phone?: string; dob?: string; bloodGroup?: string; address?: string; avatar?: string; isVerified: boolean; createdAt: string };

const RECORD_TYPES = ["prescription", "xray", "scan", "lab", "discharge", "other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [newRecord, setNewRecord] = useState({ type: "prescription", title: "", doctor: "", hospital: "", date: "", notes: "", fileUrl: "", fileName: "" });
  const [saving, setSaving] = useState(false);
  const [recordError, setRecordError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Queries state
  const [queries, setQueries] = useState<any[]>([]);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", dob: "", bloodGroup: "", address: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Profile is complete only when ALL required fields are filled
  function checkProfileComplete(u: UserProfile | null): boolean {
    return !!(u?.name && u?.phone && u?.dob && u?.bloodGroup && u?.address);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/records").then(r => r.json()),
      fetch("/api/appointments").then(r => r.json()),
      fetch("/api/contact").then(r => r.json()),
    ]).then(([u, rec, appt, qry]) => {
      if (cancelled) return;
      if (!u.user) { router.push("/login"); return; }
      setUser(u.user);
      setProfileForm({
        name: u.user.name || "",
        phone: u.user.phone || "",
        dob: u.user.dob || "",
        bloodGroup: u.user.bloodGroup || "",
        address: u.user.address || "",
      });
      // Check if profile is incomplete — ALL fields required
      setProfileIncomplete(!checkProfileComplete(u.user));
      setRecords(rec.records || []);
      setAppointments(appt.appointments || []);
      setQueries(qry.queries || []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [router]);

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { setProfileError("Full name is required"); return; }
    setProfileSaving(true); setProfileError(""); setProfileSuccess("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) { setProfileError(data.error || "Failed to update profile"); return; }
      setUser(data.user);
      setProfileIncomplete(!checkProfileComplete(data.user));
      setProfileSuccess("Profile updated successfully!");
      setEditingProfile(false);
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (e: any) {
      setProfileError(e.message || "Something went wrong");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewRecord(r => ({ ...r, fileUrl: reader.result as string, fileName: file.name }));
    reader.readAsDataURL(file);
  };

  const addRecord = async () => {
    if (!newRecord.title) return;
    setSaving(true); setRecordError("");
    try {
      const res = await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRecord) });
      const data = await res.json();
      if (!res.ok) { setRecordError(data.error || "Failed to save record"); return; }
      setRecords(r => [data.record, ...r]);
      setShowAddRecord(false);
      setNewRecord({ type: "prescription", title: "", doctor: "", hospital: "", date: "", notes: "", fileUrl: "", fileName: "" });
    } catch (e: any) {
      setRecordError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id: string) => {
    await fetch(`/api/records/${id}`, { method: "DELETE" });
    setRecords(r => r.filter(x => x._id !== id));
  };

  const upcoming = appointments.filter(a => a.status === "upcoming");
  const prescriptions = records.filter(r => r.type === "prescription");
  const filteredRecords = filterType === "all" ? records : records.filter(r => r.type === filterType);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile incomplete banner */}
        {profileIncomplete && (
          <div className="mb-6 bg-amber-950 border border-amber-700 rounded-2xl overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-900 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-300 mb-1">⚠️ Profile Incomplete — Appointments Blocked</h3>
                <p className="text-amber-500 text-sm mb-3">
                  You cannot book appointments until your profile is complete. Please fill in all the required details below.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: "Full Name", done: !!user?.name },
                    { label: "Phone", done: !!user?.phone },
                    { label: "Date of Birth", done: !!user?.dob },
                    { label: "Blood Group", done: !!user?.bloodGroup },
                    { label: "Address", done: !!user?.address },
                  ].map(f => (
                    <span key={f.label} className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      f.done
                        ? "bg-green-900/40 text-green-400 border-green-800"
                        : "bg-red-900/40 text-red-400 border-red-800"
                    }`}>
                      {f.done ? "✓" : "✗"} {f.label}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setTab("profile")}
                className="text-sm bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors shrink-0">
                Complete Now
              </button>
            </div>
          </div>
        )}

        {/* Profile banner */}
        <div className="bg-gradient-to-r from-blue-900/40 to-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{user?.name}</h1>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {user?.bloodGroup && <span className="text-xs bg-red-900/50 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">🩸 {user.bloodGroup}</span>}
              {user?.phone && <span className="text-xs text-zinc-400">📞 {user.phone}</span>}
              {user?.dob && <span className="text-xs text-zinc-400">🎂 {user.dob}</span>}
            </div>
          </div>
          <div className="hidden md:flex gap-3 shrink-0">
            <button onClick={() => setTab("profile")}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            {profileIncomplete ? (
              <button onClick={() => setTab("profile")}
                className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-xl text-sm font-medium transition-colors">
                <AlertCircle className="w-4 h-4" /> Complete Profile to Book
              </button>
            ) : (
              <Link href="/appointments" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <Calendar className="w-4 h-4" /> Book Appointment
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2 overflow-x-auto">
          {([
            { key: "overview", label: "Overview", icon: Heart },
            { key: "profile", label: "Profile", icon: User },
            { key: "records", label: "Records", icon: FileText },
            { key: "prescriptions", label: "Prescriptions", icon: Pill },
            { key: "appointments", label: "Appointments", icon: Calendar },
            { key: "queries", label: "My Queries", icon: MessageSquare },
          ] as { key: Tab; label: string; icon: any }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.key === "profile" && profileIncomplete && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ────────────────────────────────────────────────────── */}
        {tab === "profile" && (
          <div className="max-w-2xl">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold">Personal Information</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">Keep your health profile up to date</p>
                </div>
                {!editingProfile && (
                  <button onClick={() => { setEditingProfile(true); setProfileError(""); setProfileSuccess(""); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                )}
              </div>

              {profileSuccess && (
                <div className="mb-4 bg-green-950 border border-green-800 rounded-xl px-4 py-3 flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="mb-4 bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">{profileError}</div>
              )}

              {editingProfile ? (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))}
                        placeholder="Your full name"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input value={profileForm.phone} onChange={e => setProfileForm(f => ({...f, phone: e.target.value}))}
                        placeholder="+91 98765 43210" type="tel"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  {/* DOB + Blood Group side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                      <input value={profileForm.dob} onChange={e => setProfileForm(f => ({...f, dob: e.target.value}))}
                        type="date" max={new Date().toISOString().split("T")[0]}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Blood Group</label>
                      <div className="relative">
                        <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select value={profileForm.bloodGroup} onChange={e => setProfileForm(f => ({...f, bloodGroup: e.target.value}))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 appearance-none">
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                      <textarea value={profileForm.address} onChange={e => setProfileForm(f => ({...f, address: e.target.value}))}
                        placeholder="Your full address" rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none" />
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address (cannot be changed)</label>
                    <input value={user?.email || ""} disabled
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={saveProfile} disabled={profileSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold text-sm transition-colors">
                      <Check className="w-4 h-4" /> {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => { setEditingProfile(false); setProfileError(""); setProfileForm({ name: user?.name||"", phone: user?.phone||"", dob: user?.dob||"", bloodGroup: user?.bloodGroup||"", address: user?.address||"" }); }}
                      className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="space-y-4">
                  {[
                    { icon: User, label: "Full Name", value: user?.name },
                    { icon: Phone, label: "Phone Number", value: user?.phone },
                    { icon: Calendar, label: "Date of Birth", value: user?.dob },
                    { icon: Droplets, label: "Blood Group", value: user?.bloodGroup },
                    { icon: MapPin, label: "Address", value: user?.address },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
                      <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
                        <p className={`text-sm mt-0.5 ${value ? "text-white" : "text-zinc-600 italic"}`}>
                          {value || "Not provided"}
                        </p>
                      </div>
                      {!value && (
                        <span className="text-xs bg-yellow-900/50 text-yellow-500 border border-yellow-800/50 px-2 py-0.5 rounded-full shrink-0">Missing</span>
                      )}
                    </div>
                  ))}
                  {/* Email row */}
                  <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
                    <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email Address</p>
                      <p className="text-sm text-white mt-0.5">{user?.email}</p>
                    </div>
                    <span className="text-xs bg-green-900/50 text-green-400 border border-green-800/50 px-2 py-0.5 rounded-full shrink-0">Verified</span>
                  </div>
                  <p className="text-zinc-600 text-xs pt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Medical Records", value: records.length, color: "text-blue-400", icon: FileText },
                { label: "Prescriptions", value: prescriptions.length, color: "text-purple-400", icon: Pill },
                { label: "Upcoming Appts", value: upcoming.length, color: "text-green-400", icon: Calendar },
                { label: "Total Visits", value: appointments.filter(a => a.status === "completed").length, color: "text-orange-400", icon: Heart },
              ].map(s => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-zinc-400 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upcoming Appointments</h3>
                <Link href="/appointments" className="text-blue-400 text-sm hover:underline">Book new →</Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-zinc-500 text-sm">No upcoming appointments. <Link href="/appointments" className="text-blue-400 hover:underline">Book one now</Link></p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <div key={a._id} className="flex items-center justify-between bg-zinc-800 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-sm">{a.doctorName}</p>
                        <p className="text-zinc-400 text-xs">{a.hospitalName} · {a.doctorSpecialty}</p>
                        <p className="text-blue-400 text-xs mt-1">{a.date} at {a.slot}</p>
                      </div>
                      <span className="text-xs bg-green-900 text-green-400 border border-green-800 px-2 py-1 rounded-full">Upcoming</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Medical Records</h3>
                <button onClick={() => setTab("records")} className="text-blue-400 text-sm hover:underline">View all →</button>
              </div>
              {records.length === 0 ? (
                <p className="text-zinc-500 text-sm">No records yet. <button onClick={() => setShowAddRecord(true)} className="text-blue-400 hover:underline">Add your first record</button></p>
              ) : (
                <div className="space-y-2">
                  {records.slice(0, 3).map(r => (
                    <div key={r._id} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                      <span className="text-xs bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full capitalize shrink-0">{r.type}</span>
                      <p className="text-sm font-medium flex-1 truncate">{r.title}</p>
                      <p className="text-zinc-500 text-xs shrink-0">{r.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RECORDS TAB ───────────────────────────────────────────────────── */}
        {tab === "records" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType("all")} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterType === "all" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>All</button>
                {RECORD_TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${filterType === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{t}</button>
                ))}
              </div>
              <button onClick={() => setShowAddRecord(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 text-zinc-500"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No records found.</p></div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map(r => (
                  <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-blue-900 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full capitalize shrink-0">{r.type}</span>
                        <h3 className="font-semibold truncate">{r.title}</h3>
                      </div>
                      {(r.doctor || r.hospital) && <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>}
                      <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                      {r.notes && <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{r.notes}</p>}
                      {r.fileUrl && (
                        <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                          <Eye className="w-3 h-3" /> {r.fileName || "View file"}
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteRecord(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRESCRIPTIONS TAB ─────────────────────────────────────────────── */}
        {tab === "prescriptions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-zinc-400 text-sm">Prescriptions from all hospitals including external ones you've uploaded.</p>
              <button onClick={() => { setNewRecord(r => ({...r, type: "prescription"})); setShowAddRecord(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" /> Upload Prescription
              </button>
            </div>
            {prescriptions.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No prescriptions yet.</p>
                <button onClick={() => { setNewRecord(r => ({...r, type: "prescription"})); setShowAddRecord(true); }} className="mt-3 text-blue-400 text-sm hover:underline">Upload your first prescription</button>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map(r => (
                  <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{r.title}</h3>
                      {(r.doctor || r.hospital) && <p className="text-zinc-400 text-sm">{r.doctor && `Dr. ${r.doctor}`}{r.hospital && ` · ${r.hospital}`}</p>}
                      <p className="text-zinc-500 text-xs mt-1">{r.date}</p>
                      {r.notes && <p className="text-zinc-400 text-sm mt-2">{r.notes}</p>}
                      {r.fileUrl && (
                        <a href={r.fileUrl} download={r.fileName} className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                          <Eye className="w-3 h-3" /> {r.fileName || "View prescription"}
                        </a>
                      )}
                    </div>
                    <button onClick={() => deleteRecord(r._id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPOINTMENTS TAB ──────────────────────────────────────────────── */}
        {tab === "appointments" && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Active & Upcoming Appointments</h3>
              {appointments.filter(a => ["upcoming", "ongoing"].includes(a.status)).length === 0 ? (
                <p className="text-zinc-500 text-sm">No active or upcoming appointments.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.filter(a => ["upcoming", "ongoing"].includes(a.status)).map(a => (
                    <div key={a._id} className="flex items-center justify-between bg-zinc-800 rounded-xl p-4">
                      <div>
                        <p className="font-semibold text-sm">{a.doctorName}</p>
                        <p className="text-zinc-400 text-xs">{a.hospitalName} · {a.doctorSpecialty}</p>
                        <p className="text-blue-400 text-xs mt-1">{a.date} at {a.slot}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${a.status === "ongoing" ? "bg-purple-900 text-purple-300 border-purple-800 animate-pulse" : "bg-green-900 text-green-300 border-green-800"}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Appointment History</h3>
              {appointments.filter(a => ["completed", "cancelled"].includes(a.status)).length === 0 ? (
                <p className="text-zinc-500 text-sm">No past appointments in history.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.filter(a => ["completed", "cancelled"].includes(a.status)).map(a => (
                    <div key={a._id} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                      <div>
                        <p className="font-semibold text-sm text-zinc-300">{a.doctorName}</p>
                        <p className="text-zinc-500 text-xs">{a.hospitalName} · {a.doctorSpecialty}</p>
                        <p className="text-zinc-500 text-xs mt-1">{a.date} at {a.slot}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${a.status === "completed" ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-red-950 text-red-400 border-red-900"}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MY QUERIES TAB ────────────────────────────────────────────────── */}
        {tab === "queries" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold">My Support Queries</h2>
                <p className="text-zinc-500 text-sm mt-0.5">Queries you submitted via the Contact form and admin replies</p>
              </div>
              <a href="/#contact" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors">
                <MessageSquare className="w-4 h-4" /> New Query
              </a>
            </div>

            {queries.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No queries submitted yet</p>
                <p className="text-sm mt-1">Use the Contact form on the home page to submit a query</p>
                <a href="/#contact" className="mt-4 inline-block text-blue-400 text-sm hover:underline">Go to Contact Form →</a>
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map((q: any) => (
                  <div key={q._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Query header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold">{q.subject}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                              q.status === "pending"
                                ? "bg-yellow-900 text-yellow-400 border-yellow-800"
                                : q.status === "addressed"
                                ? "bg-green-900 text-green-400 border-green-800"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              {q.status === "pending" ? "⏳ Pending" : q.status === "addressed" ? "✅ Answered" : q.status}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>

                      {/* User message */}
                      <div className="bg-zinc-800 rounded-xl p-4 mb-3">
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Your Message</p>
                        <p className="text-zinc-300 text-sm whitespace-pre-wrap">{q.message}</p>
                      </div>

                      {/* Admin reply */}
                      {q.adminReply ? (
                        <div className="bg-green-950 border border-green-800 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">Admin Reply</p>
                            {q.repliedAt && (
                              <p className="text-xs text-green-700 ml-auto">
                                {new Date(q.repliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                          <p className="text-green-300 text-sm whitespace-pre-wrap">{q.adminReply}</p>
                          <p className="text-green-700 text-xs mt-3">📧 This reply was also sent to your email: <span className="text-green-600">{q.email}</span></p>
                        </div>
                      ) : (
                        <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4">
                          <p className="text-yellow-600 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Your query is pending. Our team will respond within 24 hours and also send a reply to your email.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD RECORD MODAL ────────────────────────────────────────────────── */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add Medical Record</h3>
              <button onClick={() => setShowAddRecord(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <select value={newRecord.type} onChange={e => setNewRecord(r => ({...r, type: e.target.value}))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
                {RECORD_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
              <input value={newRecord.title} onChange={e => setNewRecord(r => ({...r, title: e.target.value}))} placeholder="Title *"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input value={newRecord.doctor} onChange={e => setNewRecord(r => ({...r, doctor: e.target.value}))} placeholder="Doctor name"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
                <input value={newRecord.hospital} onChange={e => setNewRecord(r => ({...r, hospital: e.target.value}))} placeholder="Hospital name"
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
              </div>
              <input value={newRecord.date} onChange={e => setNewRecord(r => ({...r, date: e.target.value}))} type="date"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500" />
              <textarea value={newRecord.notes} onChange={e => setNewRecord(r => ({...r, notes: e.target.value}))} placeholder="Notes / details" rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none" />
              <div>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-2.5 w-full transition-colors">
                  <Upload className="w-4 h-4" />
                  {newRecord.fileName ? `✓ ${newRecord.fileName}` : "Upload file (PDF / Image / X-ray / Scan)"}
                </button>
              </div>
              <button onClick={addRecord} disabled={!newRecord.title || saving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition-colors">
                {saving ? "Saving..." : "Save Record"}
              </button>
              {recordError && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-xl px-3 py-2">{recordError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
