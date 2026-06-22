import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Helper to format pharmacy for frontend compatibility
function formatPharmacy(p: any) {
  return {
    ...p,
    _id: p.id,
    location: { lat: p.lat, lng: p.lng },
    medicines: (p.medicines || []).map((m: any) => ({
      ...m,
      _id: m.id,
    })),
  };
}

// GET / — list all pharmacies
router.get("/", async (req, res) => {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      include: { medicines: true },
    });
    return res.json({ pharmacies: pharmacies.map(formatPharmacy) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST / — admin adds a new pharmacy
router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        nearbyHospital: body.nearbyHospital,
        isOpen: body.isOpen ?? true,
        openHours: body.openHours ?? "08:00 - 22:00",
        rating: body.rating ?? 0,
        lat: body.location?.lat,
        lng: body.location?.lng,
        medicines:
          body.medicines && body.medicines.length > 0
            ? {
                create: body.medicines.map((m: any) => ({
                  name: m.name,
                  category: m.category,
                  inStock: m.inStock ?? true,
                  price: m.price,
                })),
              }
            : undefined,
      },
      include: { medicines: true },
    });

    return res.status(201).json({ pharmacy: formatPharmacy(pharmacy) });
  } catch (e: any) {
    console.error("[pharmacies POST]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// GET /:id — get pharmacy by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: { medicines: true },
    });
    if (!pharmacy) return res.status(404).json({ error: "Not found" });
    return res.json({ pharmacy: formatPharmacy(pharmacy) });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /:id — update pharmacy (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const pharmacy = await prisma.pharmacy.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        phone: body.phone,
        nearbyHospital: body.nearbyHospital,
        isOpen: body.isOpen,
        openHours: body.openHours,
        rating: body.rating,
        lat: body.location?.lat,
        lng: body.location?.lng,
      },
      include: { medicines: true },
    });

    return res.json({ pharmacy: formatPharmacy(pharmacy) });
  } catch (e: any) {
    console.error("[pharmacies PUT]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /:id — delete pharmacy (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pharmacy.delete({
      where: { id },
    });
    return res.json({ message: "Deleted" });
  } catch (e: any) {
    console.error("[pharmacies DELETE]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
