import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MobileNav from "./MobileNav";

export default async function Header() {
  const [menuItems, settings] = await Promise.all([
    prisma.menuItem.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.siteSetting.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } })
  ]);

  // Repli propre si le menu n'a pas encore été configuré en administration.
  const links = menuItems.length > 0
    ? menuItems
    : [
        { id: "accueil", label: "Accueil", url: "/", newTab: false },
        { id: "biographie", label: "Biographie", url: "/biographie", newTab: false },
        { id: "actualites", label: "Actualités", url: "/actualites", newTab: false },
        { id: "projets", label: "Projets", url: "/projets", newTab: false },
        { id: "sport", label: "Sport & Jeunesse", url: "/sport-jeunesse", newTab: false },
        { id: "galerie", label: "Galerie", url: "/galerie", newTab: false },
        { id: "contact", label: "Contact", url: "/contact", newTab: false }
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-8 py-4 max-[640px]:px-5">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            {(settings.displayName || settings.siteName).toUpperCase()}
          </span>
          {settings.slogan && (
            <span className="mt-0.5 text-[0.68rem] font-semibold tracking-widest text-red">
              {settings.slogan.toUpperCase()}
            </span>
          )}
        </Link>

        <nav className="hidden gap-7 text-sm font-medium text-ink-soft md:flex">
          {links.map((l) => (
            <Link key={l.id} href={l.url} target={l.newTab ? "_blank" : undefined} className="py-1 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-dark"
          >
            Suivre
          </Link>
        </div>

        <MobileNav links={links} />
      </div>
    </header>
  );
}
