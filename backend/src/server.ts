// Load environment variables first (avoids ESM import hoisting issues)
import "./lib/env.js";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routers
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import appointmentsRouter from "./routes/appointments.js";
import contactRouter from "./routes/contact.js";
import hospitalsRouter from "./routes/hospitals.js";
import pharmaciesRouter from "./routes/pharmacies.js";
import recordsRouter from "./routes/records.js";
import servicesRouter from "./routes/services.js";
import seedRouter from "./routes/seed.js";

// Import appointment scheduler
import { startAppointmentScheduler } from "./lib/appointmentStatus.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: [frontendUrl, "http://localhost:3000"],
    credentials: true,
  })
);

// General middleware
app.use(express.json({ limit: "50mb" })); // Increased limit to support base64 medical record file uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/hospitals", hospitalsRouter);
app.use("/api/pharmacies", pharmaciesRouter);
app.use("/api/records", recordsRouter);
app.use("/api/seed", seedRouter);
app.use("/api", servicesRouter); // maps /api/chat, /api/tts, /api/session, /api/voice

// Initialize background worker for appointments status updates
startAppointmentScheduler();

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Healthcare backend server is running on http://localhost:${PORT}`);
});
