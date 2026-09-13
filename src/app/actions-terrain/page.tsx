import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import FieldActionCard from "@/components/FieldActionCard";

export const metadata: Metadata = {
  title: "Actions de terrain",
  description: "Le journal des déplacements, visites et rencontres de Goudoussy Diallo."
};

export default async function ActionsTerrainPage() {
  const actions = await prisma.fieldAction.findMany({
    where: { status: "PUBLIE" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <PageHero
        kicker="Sur le terrain"
        title="Activités & actions de terrain"
        description="Journal des déplacements, visites et rencontres."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          {actions.length === 0 ? (
            <p className="text-ink-soft">Aucune action publiée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {actions.map((a) => (
                <FieldActionCard key={a.id} action={a} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
