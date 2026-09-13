import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import ResponsibilityCards from "@/components/ResponsibilityCards";

export const metadata: Metadata = {
  title: "Biographie",
  description: "Le parcours, les responsabilités et les engagements de Goudoussy Diallo."
};

export default async function BiographiePage() {
  const [bio, responsibilities, timeline] = await Promise.all([
    prisma.biography.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
    prisma.responsibility.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.timelineItem.findMany({ where: { active: true }, orderBy: { order: "asc" } })
  ]);

  return (
    <div>
      <PageHero
        kicker="Biographie"
        title="Une trajectoire, des engagements, une vision"
        description="Parcours à enrichir progressivement depuis l'administration."
        imageUrl={bio.secondaryImageUrl}
      />

      <section className="py-16">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[0.8fr_1.2fr] items-center gap-14 px-8 max-[900px]:grid-cols-1 max-[640px]:px-5">
          <div className="aspect-[3/4] overflow-hidden rounded-md">
            {bio.portraitUrl ? (
              <Image src={bio.portraitUrl} alt="Goudoussy Diallo" width={600} height={800} className="h-full w-full object-cover" />
            ) : (
              <div className="card-photo-placeholder h-full w-full">Portrait à ajouter</div>
            )}
          </div>
          <div>
            {bio.presentation ? (
              <p className="text-[1.05rem] leading-relaxed">{bio.presentation}</p>
            ) : (
              <p>
                Goudoussy Diallo est Attaché de Cabinet du Premier ministre de la République de Guinée, Président de
                la Fédération Guinéenne de Mini-Football et Premier vice-président de la Confédération Africaine de
                Mini-Football.
              </p>
            )}
            {bio.citation && (
              <p className="mt-5 font-display text-lg font-semibold italic text-navy">« {bio.citation} »</p>
            )}
            {!bio.presentation && (
              <p className="mt-3 text-sm text-ink-soft">
                — Introduction détaillée, formation, expériences et distinctions : champs à compléter depuis
                l&apos;administration.
              </p>
            )}
          </div>
        </div>

        {(bio.parcours || bio.formation || bio.experiences || bio.engagements || bio.vision || bio.valeurs) && (
          <div className="mx-auto mt-14 grid max-w-[1240px] grid-cols-2 gap-x-14 gap-y-10 px-8 max-[900px]:grid-cols-1 max-[640px]:px-5">
            <BioBlock title="Parcours" text={bio.parcours} />
            <BioBlock title="Formation" text={bio.formation} />
            <BioBlock title="Expériences" text={bio.experiences} />
            <BioBlock title="Engagements" text={bio.engagements} />
            <BioBlock title="Vision" text={bio.vision} />
            <BioBlock title="Valeurs" text={bio.valeurs} />
          </div>
        )}
      </section>

      <section className="bg-offwhite py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          <p className="kicker">Ses fonctions</p>
          <h2 className="mb-8 font-display text-2xl font-extrabold sm:text-3xl">Ses responsabilités</h2>
          <ResponsibilityCards items={responsibilities} />
        </div>
      </section>

      {timeline.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <p className="kicker">Parcours</p>
            <h2 className="mb-8 font-display text-2xl font-extrabold sm:text-3xl">Étapes clés</h2>
            <div className="ml-1.5 border-l-2 border-line pl-8">
              {timeline.map((item) => (
                <div key={item.id} className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[37px] top-1 h-2.5 w-2.5 rounded-full bg-red" />
                  <div className="mb-1.5 text-sm font-semibold text-ink-soft">{item.date}</div>
                  <h4 className="mb-2 font-display text-lg font-bold">{item.title}</h4>
                  <p className="max-w-[60ch] text-sm text-ink-soft">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function BioBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="mb-2 font-display text-base font-bold text-navy">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
