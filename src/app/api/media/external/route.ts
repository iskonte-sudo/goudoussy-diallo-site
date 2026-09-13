import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { analyzeExternalVideoUrl } from "@/lib/videoProviders";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rawUrl = String(body?.url ?? "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "URL manquante." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }

  const analysis = analyzeExternalVideoUrl(rawUrl);

  if (analysis.provider === "UNKNOWN") {
    return NextResponse.json(
      { error: "Cette URL ne provient pas d'un fournisseur reconnu (YouTube, Vimeo, Facebook)." },
      { status: 422 }
    );
  }
  if ((analysis.provider === "YOUTUBE" || analysis.provider === "VIMEO") && !analysis.externalId) {
    return NextResponse.json(
      { error: "Impossible d'identifier la vidéo dans cette URL." },
      { status: 422 }
    );
  }

  const media = await prisma.media.create({
    data: {
      url: analysis.embedUrl ?? rawUrl,
      filename: rawUrl,
      mimeType: "video/external",
      size: 0,
      type: "VIDEO_EXTERNAL",
      provider: analysis.provider,
      externalUrl: rawUrl,
      externalId: analysis.externalId,
      thumbnailUrl: analysis.thumbnailUrl,
      caption: String(body?.caption ?? "") || null
    }
  });

  return NextResponse.json({ media });
}
