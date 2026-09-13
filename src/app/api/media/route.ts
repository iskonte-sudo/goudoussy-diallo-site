import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("q")?.trim();
  const kind = req.nextUrl.searchParams.get("kind"); // "image" | "video" | null (tous)

  const typeFilter =
    kind === "image" ? { type: "IMAGE" } : kind === "video" ? { type: { in: ["VIDEO_LOCAL", "VIDEO_EXTERNAL"] } } : {};

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
      m._count.articleLinks + m._count.projectLinks + m._count.sportEventLinks + m._count.fieldActionLinks
  }));

  return NextResponse.json({ media: withUsage });
}
