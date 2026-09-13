import { put } from "@vercel/blob";

import path from "path";

/**
 * Storage abstraction for the media library.
 *
 * Production / Vercel:
 * uploads files to Vercel Blob and returns a permanent public URL.
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<{ url: string; filename: string }> {
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

  const filename = `${yyyy}/${mm}/${Date.now()}-${safeBase || "fichier"}${ext}`;

const blob = await put(filename, buffer, {
  access: "public",
  addRandomSuffix: false,
  storeId: process.env.BLOB_STORE_ID,
});

  return {
    url: blob.url,
    filename,
  };
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

// Rétrocompatibilité
export const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;
export const MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

/**
 * Vérifie la signature binaire réelle du fichier.
 */
export function sniffFileKind(
  buffer: Buffer
): "image" | "video" | null {
  const bytes = buffer.subarray(0, 16);

  // Images
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image";
  }

  if (
    bytes.slice(0, 8).toString("hex") ===
    "89504e470d0a1a0a"
  ) {
    return "image";
  }

  if (
    bytes.slice(0, 4).toString("ascii") === "RIFF" &&
    bytes.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image";
  }

  // Vidéos
  if (bytes.slice(4, 8).toString("ascii") === "ftyp") {
    return "video";
  }

  if (
    bytes.slice(0, 4).toString("hex") ===
    "1a45dfa3"
  ) {
    return "video";
  }

  return null;
}