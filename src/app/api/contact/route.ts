import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().max(160).optional().or(z.literal("")),
  message: z.string().min(10).max(5000)
});

// Naive in-memory rate limit (per server instance) — swap for Upstash/Redis in production.
const recentSubmissions = new Map<string, number>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const count = recentSubmissions.get(ip) ?? 0;
  if (count >= MAX_PER_WINDOW) {
    return NextResponse.json({ error: "Trop de messages envoyés, réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: parsed.data });

  recentSubmissions.set(ip, count + 1);
  setTimeout(() => recentSubmissions.delete(ip), WINDOW_MS);

  return NextResponse.json({ ok: true });
}
