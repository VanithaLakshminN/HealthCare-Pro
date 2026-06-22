"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Hospital, Pill, MessageSquare, Plus, Trash2, Edit, LogOut, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";

type Tab = "hospitals" | "pharmacies" | "queries";
type Query = { _id: string; name: string; email: string; phone?: string; subject: string; message: string; status: string; adminReply?: string; createdAt: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hospitals");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showAddPharmacy, setShowAddPharmacy] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  const [newHospital, setNewHospital] = useState({ name: "", address: "", city: "", phone: "", ambulanceNumber: "", totalBeds: 0, availableBeds: 0, openHours: "24/7", specializations: "" });
  const [newPharmacy, setNewPharmacy] = useState({ name: "", address: "", city: "", phone: "", nearbyHospital: "", openHours: "08:00-22:00" });

  useEffect(() => {
    fetch("/api/hospitals").then(r => r.json()).then(d => setHospitals(d.hospitals || []));
    fetch("/api/pharmacies").then(r => r.json()).then(d => setPharmacies(d.pharmacies || []));
    fetch("/api/contact").then(r => r.json()).then(d => setQueries(d.queries || []));
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const addHospital = async () => {
    const body = { ...newHospital, specializations: newHospital.specializations.split(",").map(s => s.trim()), isOpen: true, rating: 4.5, doctors: [] };
    const res = await fetch("/api/hospitals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setHospitals(h => [...h, data.hospital]);
    setShowAddHospital(false);
    setNewHospital({ name: "", address: "", city: "", phone: "", ambulanceNumber: "", totalBeds: 0, availableBeds: 0, openHours: "24/7", specializations: "" });
  };

  const deleteHospital = async (id: string) => {
    await fetch(`/api/hospitals/${id}`, { method: "DELETE" });
    setHospitals(h => h.filter(x => x._id !== id));
  };

  const addPharmacy = async () => {
    const res = await fetch("/api/pharmacies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newPharmacy, isOpen: true, rating: 4.5, medicines: [] }) });
    const data = await res.json();
    setPharmacies(p => [...p, data.pharmacy]);
    setShowAddPharmacy(false);
    setNewPharmacy({ name: "", address: "", city: "", phone: "", nearbyHospital: "", openHours: "08:00-22:00" });
  };

  const deletePharmacy = async (id: string) => {
    await fetch(`/api/pharmacies/${id}`, { method: "DELETE" });
    setPharmacies(p => p.filter(x => x._id !== id));
  };

  const replyToQuery = async (id: string) => {
    await fetch(`/api/contact/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminReply: replyText, status: "addressed" }) });
    setQueries(q => q.map(x => x._id === id ? { ...x, adminReply: replyText, status: "addressed" } : x));
    setReplyId(null); setReplyText("");
  };

  const tabs = [
    { key: "hospitals" as Tab, label: "Hospitals", icon: Hospital },
    { key: "pharmacies" as Tab, label: "Pharmacies", icon: Pill },
    { key: "queries" as Tab, label: "Queries", icon: MessageSquare, badge: queries.filter(q => q.status === "pending").length },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 rounded-lg p-1.5"><Shield className="w-5 h-5 text-white" /></div>
          <span className="font-bold">Admin Dashboard</span>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${tab === t.key ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {t.badge ? <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* Hospitals */}
        {tab === "hospitals" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Hospitals ({hospitals.length})</h2>
              <button onClick={() => setShowAddHospital(!showAddHospital)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Hospital
              </button>
            </div>

            {showAddHospital && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4 space-y-3">
                <h3 className="font-semibold">New Hospital</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["name","Name *"],["address","Address *"],["city","City *"],["phone","Phone"],["ambulanceNumber","Ambulance No."],["openHours","Open Hours"]].map(([k,p]) => (
                    <input key={k} value={(newHospital as any)[k]} onChange={e => setNewHospital(h => ({...h, [k]: e.target.value}))} placeholder={p}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
                  ))}
                  <input type="number" value={newHospital.totalBeds} onChange={e => setNewHospital(h => ({...h, totalBeds: +e.target.value}))} placeholder="Total Beds"
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
                  <input type="number" value={newHospital.availableBeds} onChange={e => setNewHospital(h => ({...h, availableBeds: +e.target.value}))} placeholder="Available Beds"
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
                </div>
                <input value={newHospital.specializations} onChange={e => setNewHospital(h => ({...h, specializations: e.target.value}))} placeholder="Specializations (comma separated)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
                <div className="flex gap-2">
                  <button onClick={addHospital} disabled={!newHospital.name} className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors">Save</button>
                  <button onClick={() => setShowAddHospital(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {hospitals.map(h => (
                <div key={h._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{h.name}</p>
                    <p className="text-zinc-400 text-sm">{h.address} · {h.phone}</p>
                    <p className="text-zinc-500 text-xs mt-1">Beds: {h.availableBeds}/{h.totalBeds} · Doctors: {h.doctors?.length || 0}</p>
                  </div>
                  <button onClick={() => deleteHospital(h._id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pharmacies */}
        {tab === "pharmacies" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pharmacies ({pharmacies.length})</h2>
              <button onClick={() => setShowAddPharmacy(!showAddPharmacy)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Pharmacy
              </button>
            </div>

            {showAddPharmacy && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4 space-y-3">
                <h3 className="font-semibold">New Pharmacy</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[["name","Name *"],["address","Address *"],["city","City *"],["phone","Phone"],["nearbyHospital","Nearby Hospital"],["openHours","Open Hours"]].map(([k,p]) => (
                    <input key={k} value={(newPharmacy as any)[k]} onChange={e => setNewPharmacy(ph => ({...ph, [k]: e.target.value}))} placeholder={p}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addPharmacy} disabled={!newPharmacy.name} className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors">Save</button>
                  <button onClick={() => setShowAddPharmacy(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {pharmacies.map(p => (
                <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-zinc-400 text-sm">{p.address} · {p.phone}</p>
                    <p className="text-zinc-500 text-xs mt-1">Near: {p.nearbyHospital} · {p.openHours}</p>
                  </div>
                  <button onClick={() => deletePharmacy(p._id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queries */}
        {tab === "queries" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Contact Queries ({queries.length})</h2>
            <div className="space-y-3">
              {queries.map(q => (
                <div key={q._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 cursor-pointer flex items-start justify-between gap-4" onClick={() => setExpandedQuery(expandedQuery === q._id ? null : q._id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold">{q.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${q.status === "pending" ? "bg-yellow-900 text-yellow-400 border-yellow-800" : "bg-green-900 text-green-400 border-green-800"}`}>{q.status}</span>
                      </div>
                      <p className="text-zinc-400 text-sm">{q.email}{q.phone && ` · ${q.phone}`}</p>
                      <p className="text-zinc-300 text-sm font-medium mt-1">{q.subject}</p>
                    </div>
                    {expandedQuery === q._id ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                  </div>

                  {expandedQuery === q._id && (
                    <div className="border-t border-zinc-800 p-4 space-y-3">
                      <p className="text-zinc-300 text-sm">{q.message}</p>
                      {q.adminReply && (
                        <div className="bg-green-950 border border-green-800 rounded-xl p-3">
                          <p className="text-xs text-green-400 font-medium mb-1">Admin Reply:</p>
                          <p className="text-sm text-green-300">{q.adminReply}</p>
                        </div>
                      )}
                      {q.status === "pending" && (
                        replyId === q._id ? (
                          <div className="space-y-2">
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => replyToQuery(q._id)} disabled={!replyText} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors">
                                <CheckCircle className="w-4 h-4" /> Send Reply
                              </button>
                              <button onClick={() => { setReplyId(null); setReplyText(""); }} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm transition-colors">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyId(q._id)} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm transition-colors">
                            <MessageSquare className="w-4 h-4" /> Reply
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
