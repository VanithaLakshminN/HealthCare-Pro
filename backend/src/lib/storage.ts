import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get standard __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Saves a base64 encoded file (Data URL) to local storage.
 * If the input is not base64, returns it as is.
 * @param fileUrl Base64 data URL (e.g. data:image/png;base64,...)
 * @param originalName The original name of the file
 * @returns Object with the updated fileUrl (relative public path) and fileName
 */
export function saveUploadedFile(fileUrl: string | undefined, originalName: string | undefined): { fileUrl?: string; fileName?: string } {
  if (!fileUrl || !originalName) {
    return { fileUrl, fileName: originalName };
  }

  // If it's already a saved URL or does not start with data:, return it as is
  if (!fileUrl.startsWith("data:")) {
    return { fileUrl, fileName: originalName };
  }

  try {
    const matches = fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { fileUrl, fileName: originalName };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine extension
    let extension = "";
    if (mimeType.includes("pdf")) {
      extension = ".pdf";
    } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = ".jpg";
    } else if (mimeType.includes("png")) {
      extension = ".png";
    } else {
      const extMatch = originalName.match(/\.[0-9a-z]+$/i);
      extension = extMatch ? extMatch[0] : "";
    }

    // Generate safe unique filename
    const uniqueId = Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    const cleanBaseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${cleanBaseName}_${uniqueId}${extension}`;

    // Target the frontend/public/uploads folder relative to the backend workspace
    const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, "../../../frontend/public/uploads");
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      fileUrl: `/uploads/${filename}`,
      fileName: originalName,
    };
  } catch (error) {
    console.error("[saveUploadedFile] Error saving file:", error);
    return { fileUrl, fileName: originalName };
  }
}
