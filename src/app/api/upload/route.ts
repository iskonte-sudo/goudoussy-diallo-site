import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { issueSignedToken, presignUrl } from "@vercel/blob";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const ALLOWED_IMAGES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEOS = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const ALLOWED_TYPES = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS];

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const filename = String(body.filename ?? "").trim();
    const mimeType = String(body.mimeType ?? "").trim().toLowerCase();
    const size = Number(body.size ?? 0);

    if (!filename || !mimeType || !Number.isFinite(size) || size <= 0) {
      return NextResponse.json(
        { error: "Informations de fichier invalides" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      );
    }

    const isVideo = ALLOWED_VIDEOS.includes(mimeType);
    const maximumSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (size > maximumSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "La vidéo dépasse la taille maximale de 100 Mo"
            : "L'image dépasse la taille maximale de 8 Mo",
        },
        { status: 400 }
      );
    }

    const storeId = process.env.BLOB_STORE_ID;


    const safeName = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const pathname = `media/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const validUntil = Date.now() + 15 * 60 * 1000;

    const signedToken = await issueSignedToken({
      pathname,
      operations: ["put"],
      validUntil,
      allowedContentTypes: [mimeType],
      maximumSizeInBytes: maximumSize,
      storeId,
    });

  const presigned = await presignUrl(signedToken, {
      pathname,
      operation: "put",
      validUntil,
      access: "public",
      allowedContentTypes: [mimeType],
      maximumSizeInBytes: maximumSize,
      allowOverwrite: false,
      addRandomSuffix: false,
    });

    const publicUrl =
      `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;

  return NextResponse.json({
  presignedUrl: presigned.presignedUrl,
  publicUrl,
  pathname,
  mimeType,
  maximumSize,
});
  } catch (error) {
    console.error("Erreur génération URL signée:", error);

    return NextResponse.json(
      {
        error: "Impossible de préparer l'upload",
      },
      { status: 500 }
    );
  }
}