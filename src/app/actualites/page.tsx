import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import NewsFilterGrid from "@/components/NewsFilterGrid";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Toutes les actualités et actions de Goudoussy Diallo."
};

export default async function ActualitesPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLIE" },
      orderBy: { publishedAt: "desc" },
      include: { category: true }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <PageHero
        kicker="Actualités & actions"
        title="Suivre l'actualité"
        description="Les dernières informations, transformées en articles depuis les publications et rencontres de terrain."
      />

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          {articles.length === 0 ? (
            <p className="text-ink-soft">
              Aucun article publié pour le moment — ajoutez-en depuis l&apos;administration.
            </p>
          ) : (
            <NewsFilterGrid articles={articles} categories={categories} />
          )}
        </div>
      </section>
    </div>
  );
}
