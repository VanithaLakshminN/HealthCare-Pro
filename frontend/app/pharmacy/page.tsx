"use client";
import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, Star, Search, CheckCircle, XCircle } from "lucide-react";

type Medicine = { name: string; category: string; inStock: boolean; price: number };
type Pharmacy = { _id: string; name: string; address: string; phone: string; nearbyHospital: string; isOpen: boolean; openHours: string; rating: number; medicines: Medicine[]; location: { lat: number; lng: number } };

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState("");
  const [filterHospital, setFilterHospital] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pharmacies").then(r => r.json()).then(d => setPharmacies(d.pharmacies || []));
  }, []);

  const hospitals = [...new Set(pharmacies.map(p => p.nearbyHospital))];

  const filtered = pharmacies.filter(p => {
    const matchHospital = !filterHospital || p.nearbyHospital === filterHospital;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medicines.some(m => m.name.toLowerCase().includes(search.toLowerCase()));
    return matchHospital && matchSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Nearby Pharmacies</h1>
        <p className="text-zinc-400 text-sm mb-6">Pharmacies near our partner hospitals with medicine availability.</p>

        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pharmacy or medicine..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500" />
          </div>
          <select value={filterHospital} onChange={e => setFilterHospital(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
            <option value="">All Hospitals</option>
            {hospitals.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map(pharmacy => (
            <div key={pharmacy._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === pharmacy._id ? null : pharmacy._id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-bold text-lg">{pharmacy.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${pharmacy.isOpen ? "bg-green-900 text-green-400 border-green-800" : "bg-red-900 text-red-400 border-red-800"}`}>
                        {pharmacy.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pharmacy.address}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                      <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3.5 h-3.5 fill-yellow-400" />{pharmacy.rating}</span>
                      <span className="text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pharmacy.openHours}</span>
                      <span className="text-zinc-500 text-xs">Near: {pharmacy.nearbyHospital}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <a href={`tel:${pharmacy.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs transition-colors">
                      <Phone className="w-3.5 h-3.5" /> {pharmacy.phone}
                    </a>
                    <a href={`https://www.openstreetmap.org/?mlat=${pharmacy.location?.lat}&mlon=${pharmacy.location?.lng}#map=17/${pharmacy.location?.lat}/${pharmacy.location?.lng}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded-xl text-xs transition-colors">
                      <MapPin className="w-3.5 h-3.5" /> Directions
                    </a>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              {expanded === pharmacy._id && (
                <div className="border-t border-zinc-800 p-5">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">Medicine Availability</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pharmacy.medicines.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-zinc-500">{m.category} · ₹{m.price}</p>
                        </div>
                        {m.inStock
                          ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" />In Stock</span>
                          : <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" />Out of Stock</span>}
                      </div>
                    ))}
                  </div>

                  {/* OpenStreetMap Embed */}
                  {pharmacy.location && (
                    <div className="mt-5 border-t border-zinc-800 pt-5">
                      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Location Map</h3>
                      <div className="w-full h-48 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <iframe
                          title={`Map showing ${pharmacy.name}`}
                          width="100%"
                          height="100%"
                          className="border-0 opacity-80 hover:opacity-100 transition-opacity"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${pharmacy.location.lng - 0.003}%2C${pharmacy.location.lat - 0.002}%2C${pharmacy.location.lng + 0.003}%2C${pharmacy.location.lat + 0.002}&layer=mapnik&marker=${pharmacy.location.lat}%2C${pharmacy.location.lng}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
