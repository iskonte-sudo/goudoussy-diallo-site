import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://goudoussydiallo.gn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLIE" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ select: { slug: true, updatedAt: true } })
  ]);

  const staticRoutes = [
    "",
    "/biographie",
    "/actualites",
    "/projets",
    "/sport-jeunesse",
    "/actions-terrain",
    "/galerie",
    "/contact"
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date()
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${BASE_URL}/actualites/${a.slug}`,
    lastModified: a.updatedAt
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${BASE_URL}/projets/${p.slug}`,
    lastModified: p.updatedAt
  }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes];
}
