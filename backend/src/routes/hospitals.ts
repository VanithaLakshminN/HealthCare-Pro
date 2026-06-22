import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Helper to format hospital for frontend compatibility
function formatHospital(h: any) {
  return {
    ...h,
    _id: h.id,
    location: { lat: h.lat, lng: h.lng },
    doctors: (h.doctors || []).map((d: any) => ({
      ...d,
      _id: d.id,
    })),
  };
}

// GET / — list all hospitals
router.get("/", async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: { doctors: true },
    });
    return res.json({ hospitals: hospitals.map(formatHospital) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST / — admin adds a new hospital
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;

    const hospital = await prisma.hospital.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        ambulanceNumber: body.ambulanceNumber,
        rating: body.rating ?? 0,
        totalBeds: body.totalBeds ?? 0,
        availableBeds: body.availableBeds ?? 0,
        isOpen: body.isOpen ?? true,
        openHours: body.openHours ?? "24/7",
        specializations: body.specializations || [],
        image: body.image,
        lat: body.location?.lat,
        lng: body.location?.lng,
        doctors:
          body.doctors && body.doctors.length > 0
            ? {
                create: body.doctors.map((d: any) => ({
                  name: d.name,
                  specialty: d.specialty,
                  experience: d.experience,
                  rating: d.rating,
                  consultationFee: d.consultationFee,
                  image: d.image,
                  availableSlots: d.availableSlots || [],
                })),
              }
            : undefined,
      },
      include: { doctors: true },
    });

    return res.status(201).json({ hospital: formatHospital(hospital) });
  } catch (e: any) {
    console.error("[hospitals POST]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// GET /:id — get hospital by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: { doctors: true },
    });
    if (!hospital) return res.status(404).json({ error: "Not found" });
    return res.json({ hospital: formatHospital(hospital) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /:id — update hospital by id (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        ambulanceNumber: body.ambulanceNumber,
        rating: body.rating,
        totalBeds: body.totalBeds,
        availableBeds: body.availableBeds,
        isOpen: body.isOpen,
        openHours: body.openHours,
        specializations: body.specializations,
        image: body.image,
        lat: body.location?.lat,
        lng: body.location?.lng,
      },
      include: { doctors: true },
    });

    return res.json({ hospital: formatHospital(hospital) });
  } catch (e: any) {
    console.error("[hospitals PUT]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /:id — delete hospital (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.hospital.delete({
      where: { id },
    });
    return res.json({ message: "Deleted" });
  } catch (e: any) {
    console.error("[hospitals DELETE]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
