import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser, optionalUser, AuthenticatedRequest } from "../middleware/auth.js";
import { updateExpiredAppointments } from "../lib/appointmentStatus.js";

const router = Router();

// GET / - fetch appointments or check booked slots
// Uses optionalUser so that checking booked slots is public but listing personal appointments is protected
router.get("/", optionalUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { doctorName, hospitalId, date } = req.query;

    // Public endpoint check: return booked slots for a doctor/date
    if (doctorName && hospitalId && date) {
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          hospitalId: hospitalId as string,
          doctorName: doctorName as string,
          date: date as string,
          status: { not: "cancelled" },
        },
        select: { slot: true },
      });
      return res.json({ bookedSlots: bookedAppointments.map((a) => a.slot) });
    }

    // Otherwise, protect the route
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Access Denied" });
    }

    // Refresh statuses before returning
    await updateExpiredAppointments();

    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      appointments: appointments.map((a) => ({ ...a, _id: a.id })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST / - book appointment
router.post("/", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const body = req.body;

    // Validate required fields
    if (!body.hospitalId || !body.hospitalName || !body.doctorName || !body.date || !body.slot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allowedTypes = ["in-person", "video"];
    if (body.type && !allowedTypes.includes(body.type)) {
      return res.status(400).json({ error: "Invalid appointment type" });
    }

    // Validate date format
    const startTime = new Date(`${body.date}T${body.slot}:00+05:30`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    if (isNaN(startTime.getTime())) {
      return res.status(400).json({ error: "Invalid date or slot format" });
    }

    // Block past bookings
    if (startTime < new Date()) {
      return res.status(400).json({ error: "Cannot book appointments in the past. Please select an upcoming slot." });
    }

    // Determine initial status
    const now = new Date();
    let status = "upcoming";
    if (now >= startTime && now <= endTime) status = "ongoing";
    else if (now > endTime) status = "completed";

    // Atomic transaction for conflict checking and insertion
    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            hospitalId: body.hospitalId,
            doctorName: body.doctorName,
            date: body.date,
            slot: body.slot,
            status: { not: "cancelled" },
          },
        });

        if (conflict) {
          throw new Error("SLOT_TAKEN");
        }

        return tx.appointment.create({
          data: {
            userId: req.user!.userId,
            hospitalId: body.hospitalId,
            hospitalName: body.hospitalName,
            doctorName: body.doctorName,
            doctorSpecialty: body.doctorSpecialty || null,
            date: body.date,
            slot: body.slot,
            startTime,
            endTime,
            status,
            type: body.type || "in-person",
            notes: body.notes || null,
          },
        });
      });

      return res.status(201).json({ appointment: { ...appointment, _id: appointment.id } });
    } catch (e: any) {
      if (e.message === "SLOT_TAKEN") {
        return res.status(409).json({ error: "This slot has already been booked by another patient. Please select a different slot." });
      }
      throw e;
    }
  } catch (e: any) {
    console.error("[appointments POST]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
