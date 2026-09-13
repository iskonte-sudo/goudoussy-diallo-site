import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    articlesTotal,
    articlesPublished,
    articlesDraft,
    projects,
    fieldActions,
    galleries,
    images,
    videos,
    messages,
    unreadMessages,
    recentArticles
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLIE" } }),
    prisma.article.count({ where: { status: "BROUILLON" } }),
    prisma.project.count(),
    prisma.fieldAction.count(),
    prisma.gallery.count(),
    prisma.media.count(),
    prisma.video.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  const stats = [
    { label: "Articles", value: articlesTotal, href: "/admin/actualites", extra: `${articlesPublished} publiés · ${articlesDraft} brouillons` },
    { label: "Projets", value: projects, href: "/admin/projets" },
    { label: "Actions de terrain", value: fieldActions, href: "/admin/actions-terrain" },
    { label: "Galeries", value: galleries, href: "/admin/galeries" },
    { label: "Photos (médiathèque)", value: images, href: "/admin/medias" },
    { label: "Vidéos", value: videos, href: "/admin/videos" },
    {
      label: "Messages reçus",
      value: messages,
      href: "/admin",
      extra: unreadMessages > 0 ? `${unreadMessages} non lus` : undefined
    }
  ];

  const shortcuts = [
    { label: "+ Nouvelle actualité", href: "/admin/actualites/nouveau" },
    { label: "+ Nouveau projet", href: "/admin/projets" },
    { label: "+ Nouvelle galerie", href: "/admin/galeries" },
    { label: "+ Nouvelle action", href: "/admin/actions-terrain" },
    { label: "+ Nouveau slide", href: "/admin/slider" }
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-extrabold">Dashboard</h1>

      <div className="mb-8 flex flex-wrap gap-3">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="btn btn-outline text-xs">
            {s.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg border border-line p-5 hover:border-navy">
            <div className="font-display text-2xl font-extrabold text-navy">{s.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
            {s.extra && <div className="mt-1 text-xs font-semibold text-red">{s.extra}</div>}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
        <Link href="/admin/reseaux-sociaux" className="rounded-lg border border-line p-5 text-sm hover:border-navy">
          <strong className="block font-display text-base">Réseaux sociaux →</strong>
          <span className="text-ink-soft">Gérer les liens Facebook, Instagram, YouTube, LinkedIn, TikTok</span>
        </Link>
        <Link href="/admin/parametres" className="rounded-lg border border-line p-5 text-sm hover:border-navy">
          <strong className="block font-display text-base">Paramètres du site →</strong>
          <span className="text-ink-soft">Identité, contact, SEO, footer</span>
        </Link>
      </div>

      {recentArticles.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold">Derniers contenus créés</h2>
          <div className="flex flex-col gap-2">
            {recentArticles.map((a) => (
              <Link
                key={a.id}
                href={`/admin/actualites/${a.id}`}
                className="flex items-center justify-between rounded-md border border-line px-4 py-3 text-sm hover:border-navy"
              >
                <span className="font-semibold">{a.title}</span>
                <span className="text-xs text-ink-soft">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
