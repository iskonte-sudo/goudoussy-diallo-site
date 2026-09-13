import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import ProjectFilterGrid from "@/components/ProjectFilterGrid";

export const metadata: Metadata = {
  title: "Projets & initiatives",
  description: "Les projets et initiatives portés par Goudoussy Diallo."
};

export default async function ProjetsPage() {
  const [projects, categories] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div>
      <PageHero
        kicker="Projets & initiatives"
        title="Des actions concrètes, sur plusieurs fronts"
        description="Sport, jeunesse, développement, institutionnel, international — un aperçu des initiatives."
      />

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          {projects.length === 0 ? (
            <p className="text-ink-soft">Aucun projet publié pour le moment.</p>
          ) : (
            <ProjectFilterGrid projects={projects} categories={categories} />
          )}
        </div>
      </section>
    </div>
  );
}
