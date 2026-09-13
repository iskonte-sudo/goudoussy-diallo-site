import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Storage abstraction for the media library.
 *
 * Dev/local: writes to /public/uploads/YYYY/MM/ so files are served
 * directly by Next.js as static assets.
 *
 * Production: swap the body of `saveFile` for an upload to S3 / Vercel Blob /
 * Cloudinary etc. and return the resulting public URL — nothing else in the
 * app needs to change, since every caller only ever handles a URL string.
 */
export async function saveFile(buffer: Buffer, originalName: string): Promise<{ url: string; filename: string }> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const ext = path.extname(originalName).toLowerCase();
  const safeBase = path
    .basename(originalName, ext)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const filename = `${Date.now()}-${safeBase || "fichier"}${ext}`;

  const dir = path.join(process.cwd(), "public", "uploads", String(yyyy), mm);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${yyyy}/${mm}/${filename}`, filename };
}

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 Mo
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 Mo — ajustable selon l'hébergement cible

// Rétrocompatibilité : conservés pour ne rien casser côté appelants existants.
export const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;
export const MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

/**
 * Vérifie la signature binaire réelle du fichier plutôt que de faire
 * confiance au seul MIME déclaré par le navigateur. Retourne le type détecté
 * ("image" | "video") ou null si aucune signature connue ne correspond.
 */
export function sniffFileKind(buffer: Buffer): "image" | "video" | null {
  const bytes = buffer.subarray(0, 16);

  // Images
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image"; // JPEG
  if (bytes.slice(0, 8).toString("hex") === "89504e470d0a1a0a") return "image"; // PNG
  if (bytes.slice(0, 4).toString("ascii") === "RIFF" && bytes.slice(8, 12).toString("ascii") === "WEBP") return "image"; // WEBP

  // Vidéos
  if (bytes.slice(4, 8).toString("ascii") === "ftyp") return "video"; // MP4 / MOV (ISO base media)
  if (bytes.slice(0, 4).toString("hex") === "1a45dfa3") return "video"; // WEBM/MKV (EBML)

  return null;
}
