"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Star, Clock, ChevronDown, ChevronUp, Calendar, Ambulance, CheckCircle, AlertTriangle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Doctor = { name: string; specialty: string; experience: number; rating: number; consultationFee: number; availableSlots: string[]; _id: string };
type Hospital = { _id: string; name: string; address: string; phone: string; ambulanceNumber: string; rating: number; totalBeds: number; availableBeds: number; isOpen: boolean; openHours: string; specializations: string[]; doctors: Doctor[] };

function isProfileComplete(user: any): boolean {
  return !!(user?.name && user?.phone && user?.dob && user?.bloodGroup && user?.address);
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ hospitalId: string; doctor: Doctor } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"in-person" | "video">("in-person");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [filterSpec, setFilterSpec] = useState("");
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null); // null = loading

  // Set local date format safely on mounting to prevent Next.js hydration mismatches
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    setDate(todayStr);
    setMinDate(todayStr);
  }, []);

  // Check if user profile is complete
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.push("/login"); return; }
        setProfileComplete(isProfileComplete(d.user));
      })
      .catch(() => setProfileComplete(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/hospitals")
      .then(r => r.json())
      .then(d => {
        console.log("hospitals response:", JSON.stringify(d).slice(0, 200));
        setHospitals(d.hospitals || []);
        setLoadingHospitals(false);
      })
      .catch(e => {
        console.error("hospitals fetch error:", e);
        setLoadingHospitals(false);
      });
  }, []);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && date) {
      fetch(`/api/appointments?hospitalId=${selectedDoctor.hospitalId}&doctorName=${encodeURIComponent(selectedDoctor.doctor.name)}&date=${date}`)
        .then(r => r.json())
        .then(d => {
          setBookedSlots(d.bookedSlots || []);
        })
        .catch(e => {
          console.error("booked slots fetch error:", e);
          setBookedSlots([]);
        });
    } else {
      setBookedSlots([]);
    }
  }, [selectedDoctor, date]);

  const allSpecs = [...new Set(hospitals.flatMap(h => h.specializations))].sort();

  const filtered = filterSpec
    ? hospitals.filter(h => h.specializations.includes(filterSpec) || h.doctors.some(d => d.specialty === filterSpec))
    : hospitals;

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBooking(true);
    setError(null);
    const hospital = hospitals.find(h => h._id === selectedDoctor.hospitalId)!;
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selectedDoctor.hospitalId,
          hospitalName: hospital.name,
          doctorName: selectedDoctor.doctor.name,
          doctorSpecialty: selectedDoctor.doctor.specialty,
          date, slot: selectedSlot, type,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }
      setBooked(true);
      // Immediately mark this slot as booked locally
      setBookedSlots(prev => [...prev, selectedSlot]);
      setTimeout(() => { 
        setBooked(false); 
        setSelectedDoctor(null); 
        setSelectedSlot(null); 
      }, 3000);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to book appointment. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Book Appointment</h1>
        <p className="text-zinc-400 text-sm mb-6">Choose from our 6 partner hospitals and book a slot with your preferred doctor.</p>

        {/* ── PROFILE INCOMPLETE GATE ─────────────────────────────────────── */}
        {profileComplete === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-950 border border-amber-700 rounded-2xl overflow-hidden"
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-900 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-300 text-base mb-1">Complete Your Profile First</h3>
                <p className="text-amber-500 text-sm mb-3">
                  You need to fill in all your personal details before booking an appointment. This helps doctors provide better care.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Full Name", "Phone Number", "Date of Birth", "Blood Group", "Address"].map(field => (
                    <span key={field} className="text-xs bg-amber-900/60 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full">
                      {field}
                    </span>
                  ))}
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <User className="w-4 h-4" /> Complete Profile on Dashboard
                </Link>
              </div>
            </div>
            <div className="bg-amber-900/30 border-t border-amber-800 px-5 py-3">
              <p className="text-amber-600 text-xs">⚕️ Complete profile is required to ensure accurate medical records and doctor communication.</p>
            </div>
          </motion.div>
        )}

        {/* Date and Specialty Filter Panel */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="shrink-0">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">1. Select Appointment Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={minDate}
                className="bg-zinc-850 border border-zinc-700 rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">2. Filter by Specialty</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterSpec("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !filterSpec
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750"
                }`}
              >
                All
              </button>
              {allSpecs.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSpec(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterSpec === s
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital list */}
        <div className="space-y-4">
          {loadingHospitals ? (
            <div className="text-center py-16 text-zinc-400">Loading hospitals...</div>
          ) : filtered.length === 0 && hospitals.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">No hospitals found. Please try again.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">No hospitals match this filter.</div>
          ) : filtered.map(hospital => (
            <div key={hospital._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Hospital header */}
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === hospital._id ? null : hospital._id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-bold text-lg">{hospital.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${hospital.isOpen ? "bg-green-900 text-green-400 border-green-800" : "bg-red-900 text-red-400 border-red-800"}`}>
                        {hospital.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hospital.address}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap text-sm">
                      <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3.5 h-3.5 fill-yellow-400" />{hospital.rating}</span>
                      <span className="text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{hospital.openHours}</span>
                      <span className="text-zinc-400">🛏 {hospital.availableBeds}/{hospital.totalBeds} beds</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(hospital.specializations || []).map(s => <span key={s} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <a href={`tel:${hospital.ambulanceNumber}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-xl text-xs font-medium transition-colors">
                      <Ambulance className="w-3.5 h-3.5" /> Ambulance
                    </a>
                    <a href={`tel:${hospital.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {hospital.phone}
                    </a>
                    {expanded === hospital._id ? <ChevronUp className="w-4 h-4 text-zinc-500 mt-1" /> : <ChevronDown className="w-4 h-4 text-zinc-500 mt-1" />}
                  </div>
                </div>
              </div>

              {/* Doctors */}
              <AnimatePresence>
                {expanded === hospital._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-800 overflow-hidden">
                    <div className="p-5 space-y-4">
                      <h3 className="font-semibold text-zinc-300 text-sm">Available Doctors</h3>
                      {(hospital.doctors || []).map((doc, i) => (
                        <div key={i} className={`border rounded-xl p-4 transition-colors cursor-pointer ${selectedDoctor?.doctor.name === doc.name && selectedDoctor.hospitalId === hospital._id ? "border-blue-500 bg-blue-950/30" : "border-zinc-700 hover:border-zinc-500"}`}
                          onClick={() => { setSelectedDoctor({ hospitalId: hospital._id, doctor: doc }); setSelectedSlot(null); }}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold">{doc.name}</p>
                              <p className="text-zinc-400 text-sm">{doc.specialty} · {doc.experience} yrs exp</p>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{doc.rating}</span>
                                <span className="text-green-400">₹{doc.consultationFee}</span>
                              </div>
                            </div>
                          </div>

                          {/* Slots */}
                          {selectedDoctor?.doctor.name === doc.name && selectedDoctor.hospitalId === hospital._id && (
                            <div className="mt-4">
                              <p className="text-xs text-zinc-400 mb-2">Select a slot:</p>
                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {(() => {
                                  const filteredSlots = (doc.availableSlots || []).filter((slot) => {
                                    const isFuture = new Date(`${date}T${slot}:00+05:30`).getTime() > Date.now();
                                    const isBooked = bookedSlots.includes(slot);
                                    return isFuture && !isBooked;
                                  });
                                  if (filteredSlots.length === 0) {
                                    return (
                                      <p className="text-xs text-zinc-500 py-1 font-medium">
                                        No slots available for this date. Please select a future date.
                                      </p>
                                    );
                                  }
                                  return filteredSlots.map((slot) => (
                                    <button
                                      key={slot}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSlot(slot);
                                      }}
                                      className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                                        selectedSlot === slot
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : "border-zinc-600 text-zinc-300 hover:border-blue-500"
                                      }`}
                                    >
                                      {slot}
                                    </button>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Booking panel */}
      <AnimatePresence>
        {selectedDoctor && selectedSlot && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-5 z-50 shadow-2xl">
            <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-5 justify-between">
              <div>
                <p className="font-bold text-lg text-white">{selectedDoctor.doctor.name} · {selectedSlot}</p>
                <p className="text-zinc-400 text-sm flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="bg-zinc-800 px-2.5 py-0.5 rounded-md text-xs font-semibold text-zinc-300">{date}</span>
                  <span className="text-zinc-700">|</span>
                  <span>{hospitals.find(h => h._id === selectedDoctor.hospitalId)?.name}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex bg-zinc-850 rounded-xl p-1 border border-zinc-700">
                  {(["in-person", "video"] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${type === t ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}>{t}</button>
                  ))}
                </div>
                <button onClick={confirmBooking} disabled={booking || !profileComplete}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                  <Calendar className="w-4 h-4" /> {booking ? "Booking..." : profileComplete === false ? "Complete Profile First" : "Confirm Booking"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {booked && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 bg-green-950 border border-green-800 text-green-400 px-5 py-3.5 rounded-xl flex items-center gap-2 z-50 shadow-2xl font-medium">
            <CheckCircle className="w-5 h-5 text-green-400" /> Appointment booked successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 bg-red-950 border border-red-800 text-red-400 px-5 py-3.5 rounded-xl flex items-center gap-2 z-50 shadow-2xl font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-1" />
            <span className="font-bold">Error:</span> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
