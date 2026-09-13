import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { issueSignedToken, presignUrl } from "@vercel/blob";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return cleaned || "media";
}

export async function POST(req: NextRequest) {
  try {
    const sessionToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const filename = String(body.filename ?? "").trim();
    const mimeType = String(body.mimeType ?? "")
      .trim()
      .toLowerCase();
    const size = Number(body.size ?? 0);

    if (
      !filename ||
      !mimeType ||
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return NextResponse.json(
        { error: "Informations du fichier incomplètes." },
        { status: 400 }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Format de fichier non autorisé." },
        { status: 415 }
      );
    }

    const maximumSize = isVideo
      ? MAX_VIDEO_SIZE
      : MAX_IMAGE_SIZE;

    if (size > maximumSize) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux (maximum ${
            isVideo ? "100" : "8"
          } Mo).`,
        },
        { status: 413 }
      );
    }

    const storeId =
      process.env.BLOB_STORE_ID ||
      process.env.GOUDOUSSY_BLOB_STORE_ID;

    const oidcToken = process.env.VERCEL_OIDC_TOKEN;

    if (!storeId) {
      return NextResponse.json(
        { error: "BLOB_STORE_ID est manquant." },
        { status: 500 }
      );
    }

    if (!oidcToken) {
      return NextResponse.json(
        { error: "VERCEL_OIDC_TOKEN est manquant." },
        { status: 500 }
      );
    }

    const safeFilename = sanitizeFilename(filename);

    const pathname =
      `media/${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;

    const validUntil =
      Date.now() + 15 * 60 * 1000;

    const signedToken = await issueSignedToken({
      pathname,
      operations: ["put"],
      validUntil,
      allowedContentTypes: [mimeType],
      maximumSizeInBytes: maximumSize,
      storeId,
      oidcToken,
    });

    const presigned = await presignUrl(
      signedToken,
      {
        pathname,
        operation: "put",
        validUntil,
        access: "public",
        allowedContentTypes: [mimeType],
        maximumSizeInBytes: maximumSize,
        allowOverwrite: false,
        addRandomSuffix: false,
      }
    );
const publicHost = storeId
  .replace(/^store_/i, "")
  .toLowerCase();

const publicUrl = `https://${publicHost}.public.blob.vercel-storage.com/${pathname}`;

    console.log("Upload token généré:", {
      pathname,
      storeId,
      mimeType,
      maximumSize,
    });

    return NextResponse.json({
      presignedUrl: presigned.presignedUrl,
      publicUrl,
      pathname,
      mimeType,
      maximumSize,
    });
  } catch (error) {
    console.error(
      "Erreur génération URL signée:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de préparer l'upload.",
      },
      { status: 500 }
    );
  }
}