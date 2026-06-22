import { prisma } from "./prisma.js";

/**
 * Scans the database and automatically updates expired or current appointments
 * based on the current system time.
 */
export async function updateExpiredAppointments() {
  try {
    const now = new Date();

    // 1. Update upcoming -> ongoing (startTime <= now && endTime >= now)
    await prisma.appointment.updateMany({
      where: {
        status: "upcoming",
        startTime: { lte: now },
        endTime: { gte: now },
      },
      data: { status: "ongoing" },
    });

    // 2. Update upcoming/ongoing -> completed (endTime < now)
    await prisma.appointment.updateMany({
      where: {
        status: { in: ["upcoming", "ongoing"] },
        endTime: { lt: now },
      },
      data: { status: "completed" },
    });
  } catch (error) {
    console.error("Error updating expired appointments:", error);
  }
}

// Background scheduler initialization
export function startAppointmentScheduler() {
  console.log("[Appointment Status Scheduler] Initializing background worker...");
  const timer = setInterval(async () => {
    try {
      await updateExpiredAppointments();
    } catch (err) {
      console.error("[Appointment Status Scheduler] Error:", err);
    }
  }, 60 * 1000);
  
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
  return timer;
}
