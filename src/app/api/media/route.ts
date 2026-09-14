import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Non authentifié." },
      { status: 401 }
    );
  }

  const search = req.nextUrl.searchParams.get("q")?.trim();
  const kind = req.nextUrl.searchParams.get("kind");

  const typeFilter =
    kind === "image"
      ? { type: "IMAGE" }
      : kind === "video"
      ? { type: { in: ["VIDEO_LOCAL", "VIDEO_EXTERNAL"] } }
      : {};

  const media = await prisma.media.findMany({
    where: {
      ...typeFilter,
      ...(search
        ? {
            OR: [
              { filename: { contains: search } },
              { altText: { contains: search } },
              { caption: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      _count: {
        select: {
          articleLinks: true,
          projectLinks: true,
          sportEventLinks: true,
          fieldActionLinks: true
        }
      }
    }
  });

  const withUsage = media.map((m) => ({
    ...m,
    usageCount:
      m._count.articleLinks +
      m._count.projectLinks +
      m._count.sportEventLinks +
      m._count.fieldActionLinks
  }));

  return NextResponse.json({ media: withUsage });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Non authentifié." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const url = String(body.url ?? "").trim();
    const filename = String(body.filename ?? "").trim();
    const mimeType = String(body.mimeType ?? "").trim();
    const size = Number(body.size ?? 0);

    if (
      !url ||
      !filename ||
      !mimeType ||
      !Number.isFinite(size)
    ) {
      return NextResponse.json(
        { error: "Informations du média incomplètes." },
        { status: 400 }
      );
    }

    const blobStoreId = process.env.BLOB_STORE_ID;

    if (!blobStoreId) {
      return NextResponse.json(
        { error: "Configuration du stockage manquante." },
        { status: 500 }
      );
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime"
    ];

    const isImage = allowedImageTypes.includes(mimeType);
    const isVideo = allowedVideoTypes.includes(mimeType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Type de média non autorisé." },
        { status: 415 }
      );
    }

    const maxSize = isVideo
      ? 100 * 1024 * 1024
      : 8 * 1024 * 1024;

    if (size <= 0 || size > maxSize) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux (maximum ${
            isVideo ? "100" : "8"
          } Mo).`
        },
        { status: 413 }
      );
    }

    const media = await prisma.media.create({
      data: {
        url,
        filename,
        mimeType,
        size,
        type: isVideo ? "VIDEO_LOCAL" : "IMAGE",
        provider: "LOCAL"
      }
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Erreur enregistrement média:", error);

    return NextResponse.json(
      { error: "Impossible d'enregistrer le média." },
      { status: 500 }
    );
  }
}
