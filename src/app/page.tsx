import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import IconStrip from "@/components/IconStrip";
import ResponsibilityCards from "@/components/ResponsibilityCards";
import NewsCard from "@/components/NewsCard";
import ProjectCard from "@/components/ProjectCard";
import FieldActionCard from "@/components/FieldActionCard";

export default async function HomePage() {
  const [slides, settings, homepageSections, responsibilities, articles, projects, fieldActions, socialLinks] =
    await Promise.all([
      prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.siteSetting.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
      prisma.homepageSection.findMany({ orderBy: { order: "asc" } }),
      prisma.responsibility.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.article.findMany({
        where: { status: "PUBLIE" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { category: true }
      }),
      prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
      prisma.fieldAction.findMany({ where: { status: "PUBLIE" }, orderBy: { createdAt: "desc" }, take: 3 }),
      prisma.socialLink.findMany({ where: { visible: true, url: { not: "" } } })
    ]);

  const facebookUrl = socialLinks.find((s) => s.platform === "facebook")?.url ?? "#";

  // Section activée par défaut si l'administrateur n'a pas encore de réglage
  // pour elle (aucune ligne trouvée) — le site ne doit jamais paraître "cassé"
  // simplement parce qu'une section n'a pas encore été configurée.
  const sectionMap = new Map(homepageSections.map((s) => [s.key, s]));
  const isEnabled = (key: string) => sectionMap.get(key)?.enabled ?? true;
  const sectionTitle = (key: string, fallback: string) => sectionMap.get(key)?.title || fallback;
  const sectionSubtitle = (key: string, fallback: string) => sectionMap.get(key)?.subtitle || fallback;

  return (
    <div>
      {isEnabled("hero") && <HeroSlider slides={slides} fallbackTagline={settings.heroTagline} />}

      <div className="mx-auto max-w-[1240px]">
        <IconStrip />
      </div>

      {isEnabled("responsabilites") && (
        <section className="bg-offwhite py-20">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="kicker">{sectionSubtitle("responsabilites", "Ses fonctions")}</p>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {sectionTitle("responsabilites", "Ses principales responsabilités")}
                </h2>
              </div>
              <Link href="/biographie" className="text-sm font-bold text-red">
                Voir toutes les responsabilités →
              </Link>
            </div>
            <ResponsibilityCards items={responsibilities} />
          </div>
        </section>
      )}

      {isEnabled("actualites") && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="kicker">{sectionSubtitle("actualites", "Actualités")}</p>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {sectionTitle("actualites", "Dernières actualités")}
                </h2>
              </div>
              <Link href="/actualites" className="text-sm font-bold text-red">
                Voir toutes les actualités →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-6 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
              {articles.slice(0, settings.homepageArticlesCount).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isEnabled("projets") && (
        <section className="bg-offwhite py-20">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="kicker">{sectionSubtitle("projets", "À la une")}</p>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {sectionTitle("projets", "Projets & initiatives")}
                </h2>
              </div>
              <Link href="/projets" className="text-sm font-bold text-red">
                Voir tous les projets →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {projects.slice(0, settings.homepageProjectsCount).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isEnabled("terrain") && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="kicker">{sectionSubtitle("terrain", "Sur le terrain")}</p>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {sectionTitle("terrain", "Activités & actions de terrain")}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {fieldActions.map((a) => (
                <FieldActionCard key={a.id} action={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isEnabled("reseaux") && (
        <section className="relative overflow-hidden bg-gradient-to-r from-navy to-navy-light py-16 text-white">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-8 max-[640px]:px-5">
            <div>
              <h2 className="mb-2.5 text-2xl font-extrabold sm:text-3xl">{sectionTitle("reseaux", "Restons connectés")}</h2>
              <p className="max-w-[44ch] text-[#C4CBE0]">
                Suivez les dernières actualités, projets et initiatives de Goudoussy Diallo sur les réseaux sociaux.
              </p>
            </div>
            <Link href={facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-white px-5 py-3 text-sm font-bold text-navy">
              Voir sa page Facebook →
            </Link>
          </div>
        </section>
      )}

      {isEnabled("contact") && (
        <section className="py-20">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg bg-offwhite p-11">
              <div>
                <p className="kicker">{sectionSubtitle("contact", "Contact")}</p>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {sectionTitle("contact", "Une question, une demande institutionnelle ou de partenariat ?")}
                </h2>
              </div>
              <Link href="/contact" className="btn btn-red">
                Nous contacter →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
