import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const generateSlots = (start: string, end: string) => {
  const slots: string[] = [];
  let [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  while (sh < eh || (sh === eh && sm <= em)) {
    slots.push(`${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`);
    sm += 15;
    if (sm >= 60) {
      sm = 0;
      sh++;
    }
  }
  return slots;
};

const HOSPITALS = [
  {
    name: "Apollo Hospital",
    address: "Bannerghatta Road, Bengaluru",
    city: "Bengaluru",
    phone: "08026304050",
    ambulanceNumber: "1066",
    rating: 4.5,
    totalBeds: 500,
    availableBeds: 35,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics"],
    doctors: [
      {
        name: "Dr. Ramesh Kumar",
        specialty: "Cardiologist",
        experience: 18,
        rating: 4.9,
        consultationFee: 800,
        availableSlots: generateSlots("09:00", "12:00").concat(generateSlots("14:00", "17:00")),
      },
      {
        name: "Dr. Sunita Rao",
        specialty: "Neurologist",
        experience: 14,
        rating: 4.8,
        consultationFee: 900,
        availableSlots: generateSlots("10:00", "13:00"),
      },
      {
        name: "Dr. Anil Sharma",
        specialty: "Orthopedic",
        experience: 12,
        rating: 4.7,
        consultationFee: 700,
        availableSlots: generateSlots("09:00", "12:00"),
      },
      {
        name: "Dr. Priya Nair",
        specialty: "Oncologist",
        experience: 15,
        rating: 4.8,
        consultationFee: 1000,
        availableSlots: generateSlots("14:00", "17:00"),
      },
    ],
  },
  {
    name: "Fortis Hospital",
    address: "Nagarbhavi, Bengaluru",
    city: "Bengaluru",
    phone: "08023004444",
    ambulanceNumber: "08023004400",
    rating: 4.3,
    totalBeds: 400,
    availableBeds: 28,
    isOpen: true,
    openHours: "24/7",
    specializations: ["General Surgery", "Dermatology", "Gynecology", "ENT"],
    doctors: [
      {
        name: "Dr. Kavitha Menon",
        specialty: "Dermatologist",
        experience: 10,
        rating: 4.9,
        consultationFee: 600,
        availableSlots: generateSlots("09:00", "12:00").concat(generateSlots("15:00", "17:00")),
      },
      {
        name: "Dr. Rekha Shetty",
        specialty: "Gynecologist",
        experience: 13,
        rating: 4.7,
        consultationFee: 700,
        availableSlots: generateSlots("10:00", "13:00"),
      },
      {
        name: "Dr. Mohan Das",
        specialty: "ENT Specialist",
        experience: 11,
        rating: 4.6,
        consultationFee: 500,
        availableSlots: generateSlots("09:00", "11:00"),
      },
    ],
  },
  {
    name: "Manipal Hospital",
    address: "Old Airport Road, Bengaluru",
    city: "Bengaluru",
    phone: "08025024444",
    ambulanceNumber: "08025024400",
    rating: 4.6,
    totalBeds: 600,
    availableBeds: 42,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Cardiology", "Neurosurgery", "Transplant", "Nephrology", "Pediatrics"],
    doctors: [
      {
        name: "Dr. Basavaraj M",
        specialty: "Neurosurgeon",
        experience: 17,
        rating: 4.9,
        consultationFee: 1300,
        availableSlots: generateSlots("08:00", "11:00"),
      },
      {
        name: "Dr. Venkat Reddy",
        specialty: "Nephrologist",
        experience: 16,
        rating: 4.8,
        consultationFee: 1000,
        availableSlots: generateSlots("09:00", "12:00"),
      },
      {
        name: "Dr. Meena Iyer",
        specialty: "Pediatrician",
        experience: 11,
        rating: 4.7,
        consultationFee: 600,
        availableSlots: generateSlots("10:00", "13:00"),
      },
    ],
  },
  {
    name: "Columbia Asia Hospital",
    address: "Hebbal, Bengaluru",
    city: "Bengaluru",
    phone: "08061656222",
    ambulanceNumber: "08061656200",
    rating: 4.2,
    totalBeds: 300,
    availableBeds: 20,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Gastroenterology", "Pulmonology", "Diabetology", "Rheumatology"],
    doctors: [
      {
        name: "Dr. Anand Krishnan",
        specialty: "Gastroenterologist",
        experience: 14,
        rating: 4.8,
        consultationFee: 850,
        availableSlots: generateSlots("09:00", "12:00").concat(generateSlots("14:00", "16:00")),
      },
      {
        name: "Dr. Nisha Verma",
        specialty: "Pulmonologist",
        experience: 10,
        rating: 4.7,
        consultationFee: 750,
        availableSlots: generateSlots("10:00", "13:00"),
      },
      {
        name: "Dr. Suresh Babu",
        specialty: "Diabetologist",
        experience: 12,
        rating: 4.6,
        consultationFee: 700,
        availableSlots: generateSlots("15:00", "17:00"),
      },
    ],
  },
  {
    name: "Sakra World Hospital",
    address: "Marathahalli, Bengaluru",
    city: "Bengaluru",
    phone: "08049694969",
    ambulanceNumber: "08049694900",
    rating: 4.4,
    totalBeds: 350,
    availableBeds: 25,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Spine", "Orthopedics", "Physiotherapy", "Sports Medicine"],
    doctors: [
      {
        name: "Dr. Sarah Patil",
        specialty: "Spine Surgeon",
        experience: 15,
        rating: 4.8,
        consultationFee: 1100,
        availableSlots: generateSlots("09:00", "12:00"),
      },
      {
        name: "Dr. Deepa Kulkarni",
        specialty: "Physiotherapist",
        experience: 8,
        rating: 4.7,
        consultationFee: 400,
        availableSlots: generateSlots("10:00", "13:00").concat(generateSlots("15:00", "17:00")),
      },
    ],
  },
  {
    name: "Aster CMI Hospital",
    address: "Hebbal, Bengaluru",
    city: "Bengaluru",
    phone: "08043420100",
    ambulanceNumber: "08043420101",
    rating: 4.5,
    totalBeds: 450,
    availableBeds: 30,
    isOpen: true,
    openHours: "24/7",
    specializations: ["Urology", "Endocrinology", "Psychiatry", "General Medicine"],
    doctors: [
      {
        name: "Dr. Rahul Joshi",
        specialty: "Urologist",
        experience: 9,
        rating: 4.6,
        consultationFee: 750,
        availableSlots: generateSlots("09:00", "12:00"),
      },
      {
        name: "Dr. Deepa Kulkarni",
        specialty: "Endocrinologist",
        experience: 12,
        rating: 4.7,
        consultationFee: 800,
        availableSlots: generateSlots("10:00", "13:00").concat(generateSlots("14:00", "16:00")),
      },
      {
        name: "Dr. Arjun Mehta",
        specialty: "Psychiatrist",
        experience: 10,
        rating: 4.5,
        consultationFee: 900,
        availableSlots: generateSlots("15:00", "17:00"),
      },
    ],
  },
];

const PHARMACIES = [
  {
    name: "Apollo Pharmacy",
    address: "Bannerghatta Road, Bengaluru",
    city: "Bengaluru",
    phone: "08011112222",
    nearbyHospital: "Apollo Hospital",
    isOpen: true,
    openHours: "24/7",
    rating: 4.6,
    location: { lat: 12.8956, lng: 77.5966 },
    medicines: [
      { name: "Paracetamol", category: "OTC", inStock: true, price: 12 },
      { name: "Dolo 650", category: "OTC", inStock: true, price: 30 },
      { name: "Crocin", category: "OTC", inStock: true, price: 25 },
      { name: "Amoxicillin", category: "Antibiotic", inStock: true, price: 45 },
    ],
  },
  {
    name: "MedPlus Pharmacy",
    address: "BTM Layout, Bengaluru",
    city: "Bengaluru",
    phone: "08022223333",
    nearbyHospital: "Fortis Hospital",
    isOpen: false,
    openHours: "08:00 - 22:00",
    rating: 4.3,
    location: { lat: 12.9165, lng: 77.6101 },
    medicines: [
      { name: "Paracetamol", category: "OTC", inStock: true, price: 12 },
      { name: "Azithromycin", category: "Antibiotic", inStock: true, price: 40 },
      { name: "Vitamin C", category: "Supplement", inStock: true, price: 15 },
      { name: "Ibuprofen", category: "OTC", inStock: false, price: 18 },
    ],
  },
  {
    name: "Netmeds Store",
    address: "Marathahalli, Bengaluru",
    city: "Bengaluru",
    phone: "08033334444",
    nearbyHospital: "Sakra World Hospital",
    isOpen: true,
    openHours: "24/7",
    rating: 4.5,
    location: { lat: 12.9591, lng: 77.6974 },
    medicines: [
      { name: "Dolo 650", category: "OTC", inStock: true, price: 30 },
      { name: "Cetirizine", category: "Antihistamine", inStock: true, price: 9 },
      { name: "ORS", category: "OTC", inStock: true, price: 10 },
      { name: "Insulin", category: "Diabetes", inStock: true, price: 250 },
    ],
  },
  {
    name: "Guardian Pharmacy",
    address: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    phone: "08044445555",
    nearbyHospital: "Manipal Hospital",
    isOpen: false,
    openHours: "09:00 - 21:00",
    rating: 4.4,
    location: { lat: 12.9784, lng: 77.6408 },
    medicines: [
      { name: "Paracetamol", category: "OTC", inStock: true, price: 12 },
      { name: "Antacid", category: "Digestive", inStock: true, price: 20 },
      { name: "Pain Relief Gel", category: "OTC", inStock: true, price: 85 },
      { name: "Calcium Tablets", category: "Supplement", inStock: false, price: 16 },
    ],
  },
  {
    name: "Wellness Forever",
    address: "Hebbal, Bengaluru",
    city: "Bengaluru",
    phone: "08055556666",
    nearbyHospital: "Aster CMI Hospital",
    isOpen: true,
    openHours: "24/7",
    rating: 4.5,
    location: { lat: 13.0358, lng: 77.5970 },
    medicines: [
      { name: "Insulin", category: "Diabetes", inStock: true, price: 250 },
      { name: "BP Tablets", category: "Hypertension", inStock: true, price: 28 },
      { name: "Thyroid Medicine", category: "Thyroid", inStock: true, price: 18 },
      { name: "Vitamin D", category: "Supplement", inStock: true, price: 22 },
    ],
  },
  {
    name: "Trust Chemist",
    address: "Whitefield, Bengaluru",
    city: "Bengaluru",
    phone: "08066667777",
    nearbyHospital: "Columbia Asia Hospital",
    isOpen: false,
    openHours: "08:00 - 21:00",
    rating: 4.2,
    location: { lat: 12.9698, lng: 77.7499 },
    medicines: [
      { name: "Crocin", category: "OTC", inStock: true, price: 25 },
      { name: "Dolo 650", category: "OTC", inStock: true, price: 30 },
      { name: "Cough Syrup", category: "OTC", inStock: false, price: 55 },
      { name: "Antibiotics", category: "Antibiotic", inStock: true, price: 40 },
    ],
  },
];

// GET / — Seed Database (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    // Block in production entirely
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Not allowed in production" });
    }

    // Clear existing
    await prisma.hospital.deleteMany({});
    await prisma.pharmacy.deleteMany({});

    // Seed Hospitals & Doctors
    for (const h of HOSPITALS) {
      await prisma.hospital.create({
        data: {
          name: h.name,
          address: h.address,
          city: h.city,
          phone: h.phone,
          ambulanceNumber: h.ambulanceNumber,
          rating: h.rating,
          totalBeds: h.totalBeds,
          availableBeds: h.availableBeds,
          isOpen: h.isOpen,
          openHours: h.openHours,
          specializations: h.specializations,
          image: null,
          lat: null,
          lng: null,
          doctors: {
            create: h.doctors.map((d) => ({
              name: d.name,
              specialty: d.specialty,
              experience: d.experience,
              rating: d.rating,
              consultationFee: d.consultationFee,
              image: null,
              availableSlots: d.availableSlots,
            })),
          },
        },
      });
    }

    // Seed Pharmacies & Medicines
    for (const p of PHARMACIES) {
      await prisma.pharmacy.create({
        data: {
          name: p.name,
          address: p.address,
          city: p.city,
          phone: p.phone,
          nearbyHospital: p.nearbyHospital,
          isOpen: p.isOpen,
          openHours: p.openHours,
          rating: p.rating,
          lat: p.location.lat,
          lng: p.location.lng,
          medicines: {
            create: p.medicines.map((m) => ({
              name: m.name,
              category: m.category,
              inStock: m.inStock,
              price: m.price,
            })),
          },
        },
      });
    }

    // Seed Admin if not exists
    const existing = await prisma.admin.findUnique({
      where: { email: "admin@healthcare.com" },
    });
    if (!existing) {
      const hashed = await bcrypt.hash("Admin@123", 10);
      await prisma.admin.create({
        data: {
          name: "Super Admin",
          email: "admin@healthcare.com",
          password: hashed,
          role: "superadmin",
        },
      });
    }

    return res.json({
      message: "Seeded successfully",
      hospitals: HOSPITALS.length,
      pharmacies: PHARMACIES.length,
    });
  } catch (error: any) {
    console.error("[seed GET] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
