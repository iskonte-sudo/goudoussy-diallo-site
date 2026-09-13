import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import NewsCard from "@/components/NewsCard";

export const metadata: Metadata = {
  title: "Sport & Jeunesse",
  description: "Le mini-football et l'accompagnement de la jeunesse guinéenne."
};

export default async function SportJeunessePage() {
  const [blogArticles, sportEvents] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLIE", category: { name: { in: ["Sport", "Mini-Football", "Afrique & International"] } } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: true }
    }),
    prisma.sportEvent.findMany({ where: { active: true, status: "PUBLIE" }, orderBy: { createdAt: "desc" }, take: 6 })
  ]);

  return (
    <div>
      <PageHero
        kicker="Sport & jeunesse"
        title="Le mini-football : une passion devenue une mission"
        description="Structuration de la discipline, détection des talents, préparation de la CAN 2027 et rayonnement africain via l'AMC."
      />

      <section className="bg-navy py-14 text-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-8 px-8 max-[800px]:grid-cols-2 max-[640px]:px-5">
          <Stat value="2027" label="Échéance CAN visée" />
          <Stat value="10 ans" label="Siège de l'AMC à Conakry" />
          <Stat value="24" label="Nations attendues, CAN 2027" />
          <Stat value="—" label="Jeunes talents suivis*" />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="kicker">Blog</p>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Le mini-football, au fil des articles</h2>
              <p className="mt-2.5 max-w-[56ch] text-ink-soft">
                Analyses, coulisses et actualités autour du développement du mini-football guinéen et africain.
              </p>
            </div>
            <Link href="/actualites" className="text-sm font-bold text-red">
              Voir tous les articles →
            </Link>
          </div>
          {blogArticles.length === 0 ? (
            <p className="text-ink-soft">Aucun article dans cette catégorie pour le moment.</p>
          ) : (
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {blogArticles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-offwhite py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          <p className="kicker">Pratique</p>
          <h2 className="mb-9 font-display text-2xl font-extrabold sm:text-3xl">Infos utiles</h2>
          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
            <InfoBlock label="Fédération" title="Fédération Guinéenne de Mini-Football (FGMF)">
              Siège à Conakry — coordonnées complètes à renseigner depuis l&apos;administration.
            </InfoBlock>
            <InfoBlock label="Calendrier" title="CAN de Mini-Football 2027">
              Guinée, groupe A — 24 nations attendues. Dates précises à confirmer.
            </InfoBlock>
            <InfoBlock label="Contact" title="Questions sur le mini-football ?">
              Pour toute demande relative à la fédération ou à la discipline, utilisez la page Contact.
              <div className="mt-3">
                <Link href="/contact" className="text-sm font-bold text-red">
                  Nous contacter →
                </Link>
              </div>
            </InfoBlock>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          <p className="kicker">En images</p>
          <h2 className="mb-8 font-display text-2xl font-extrabold sm:text-3xl">Galerie sportive</h2>
          <div className="columns-3 gap-3.5 max-[760px]:columns-2">
            {sportEvents.length > 0 ? (
              sportEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/sport-jeunesse/evenements/${e.id}`}
                  className="group relative mb-3.5 block break-inside-avoid overflow-hidden rounded-md"
                >
                  {e.imageUrl ? (
                    <Image src={e.imageUrl} alt={e.title} width={400} height={400} className="w-full object-cover" />
                  ) : (
                    <div className="card-photo-placeholder aspect-square">Photo à ajouter</div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {e.title}
                  </span>
                </Link>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-photo-placeholder mb-3.5 aspect-square break-inside-avoid rounded-md">
                  Photo
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-xl font-extrabold">{value}</div>
      <div className="text-sm text-[#B7C0DE]">{label}</div>
    </div>
  );
}

function InfoBlock({
  label,
  title,
  children
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t-2 border-line pt-5">
      <div className="mb-1.5 text-xs font-bold uppercase text-navy">{label}</div>
      <h3 className="mb-2.5 font-display text-lg font-bold">{title}</h3>
      <p className="text-sm text-ink-soft">{children}</p>
    </div>
  );
}
