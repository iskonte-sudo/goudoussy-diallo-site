import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { imageSize } from "image-size";
import { prisma } from "@/lib/prisma";
import {
  saveFile,
  sniffFileKind,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES
} from "@/lib/storage";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const declaredIsImage = ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
  const declaredIsVideo = ALLOWED_VIDEO_MIME_TYPES.includes(file.type);

  if (!declaredIsImage && !declaredIsVideo) {
    return NextResponse.json(
      { error: "Format non autorisé. Images : JPG, PNG, WEBP. Vidéos : MP4, WEBM, MOV." },
      { status: 415 }
    );
  }

  const maxSize = declaredIsVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `Fichier trop volumineux (max ${Math.round(maxSize / (1024 * 1024))} Mo).` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Ne jamais faire confiance uniquement au nom/MIME envoyé par le navigateur :
  // on vérifie la signature binaire réelle du fichier.
  const sniffed = sniffFileKind(buffer);
  if (!sniffed) {
    return NextResponse.json(
      { error: "Le contenu du fichier ne correspond à aucun format image/vidéo reconnu." },
      { status: 415 }
    );
  }
  if ((declaredIsImage && sniffed !== "image") || (declaredIsVideo && sniffed !== "video")) {
    return NextResponse.json(
      { error: "Le contenu du fichier ne correspond pas au type annoncé." },
      { status: 415 }
    );
  }

  let width: number | undefined;
  let height: number | undefined;
  if (sniffed === "image") {
    try {
      const dimensions = imageSize(buffer);
      width = dimensions.width;
      height = dimensions.height;
    } catch {
      // Dimensions indisponibles — pas bloquant.
    }
  }

  const { url, filename } = await saveFile(buffer, file.name);

  const media = await prisma.media.create({
    data: {
      url,
      filename,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      type: sniffed === "video" ? "VIDEO_LOCAL" : "IMAGE",
      provider: "LOCAL",
      altText: String(formData.get("altText") ?? "") || null,
      caption: String(formData.get("caption") ?? "") || null
    }
  });

  return NextResponse.json({ media });
}
