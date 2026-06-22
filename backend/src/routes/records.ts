import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";
import { requireUser, AuthenticatedRequest } from "../middleware/auth.js";
import { saveUploadedFile } from "../lib/storage.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET / — list all medical records for logged-in user
router.get("/", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });

    const mapped = records.map((r) => ({
      ...r,
      _id: r.id,
    }));

    return res.json({ records: mapped });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST / — upload / create new medical record
router.post("/", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const body = req.body;

    // Save the base64 file data locally if it exists
    const { fileUrl, fileName } = saveUploadedFile(body.fileUrl, body.fileName);

    const record = await prisma.medicalRecord.create({
      data: {
        userId: req.user!.userId,
        type: body.type,
        title: body.title,
        doctor: body.doctor,
        hospital: body.hospital,
        date: body.date,
        notes: body.notes,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
    });

    return res.status(201).json({ record: { ...record, _id: record.id } });
  } catch (e: any) {
    console.error("[records POST]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /:id — delete medical record
router.delete("/:id", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Proactively delete the file from local filesystem if it's stored locally
    try {
      const record = await prisma.medicalRecord.findFirst({
        where: { id, userId: req.user!.userId },
      });
      if (record && record.fileUrl && record.fileUrl.startsWith("/uploads/")) {
        const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, "../../../frontend/public/uploads");
        const filePath = path.join(uploadDir, path.basename(record.fileUrl));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error("Failed to delete file from disk:", err);
    }

    await prisma.medicalRecord.deleteMany({
      where: { id, userId: req.user!.userId },
    });

    return res.json({ message: "Deleted" });
  } catch (e: any) {
    console.error("[records DELETE]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
