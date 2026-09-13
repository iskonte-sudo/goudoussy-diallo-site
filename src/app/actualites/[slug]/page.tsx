import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImageGalleryGrid from "@/components/ImageGalleryGrid";
import VideoEmbed from "@/components/VideoEmbed";

type Props = { params: { slug: string } };

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getReadingTime(content: string) {
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return {};

  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    keywords: article.seoKeywords ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.ogImageUrl
        ? [article.ogImageUrl]
        : article.coverImageUrl
          ? [article.coverImageUrl]
          : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const siteUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/actualites/${params.slug}`;

  const [article, latest, categories, biography] = await Promise.all([
    prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        galleryImages: true,
        media: {
          include: { media: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLIE", slug: { not: params.slug } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { articles: true } },
      },
    }),
    prisma.biography.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!article || article.status !== "PUBLIE") notFound();

  const images = article.media
    .filter((m) => m.media.type === "IMAGE")
    .map((m) => ({
      id: m.id,
      url: m.media.url,
      altText: m.media.altText,
      caption: m.caption ?? m.media.caption,
    }));

  const videos = article.media.filter((m) => m.media.type !== "IMAGE");

  // Navigation chronologique entre les articles publiés.
  const publishedArticles = await prisma.article.findMany({
    where: { status: "PUBLIE" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true, slug: true, title: true },
  });

  const currentIndex = publishedArticles.findIndex((item) => item.id === article.id);
  const nextArticle =
    currentIndex > 0 ? publishedArticles[currentIndex - 1] : null;
  const previousArticle =
    currentIndex >= 0 && currentIndex < publishedArticles.length - 1
      ? publishedArticles[currentIndex + 1]
      : null;

  const readingTime = getReadingTime(article.content);
  const shareLinks = [
    {
      label: "Facebook",
      short: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
    },
    {
      label: "X",
      short: "𝕏",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`,
    },
    {
      label: "LinkedIn",
      short: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    },
    {
      label: "WhatsApp",
      short: "wa",
      href: `https://wa.me/?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`,
    },
  ];

  return (
    <article className="bg-white">
      {/* Fil d'Ariane */}
      <div className="border-b border-line bg-offwhite">
        <div className="mx-auto max-w-[1240px] px-8 py-4 text-xs font-semibold text-ink-soft max-[640px]:px-5">
          <Link href="/" className="hover:text-red">
            Accueil
          </Link>
          <span className="mx-2 text-[#A5AAB4]">›</span>
          <Link href="/actualites" className="hover:text-red">
            Actualités
          </Link>
          <span className="mx-2 text-[#A5AAB4]">›</span>
          <span className="text-ink">Article</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-8 pb-16 pt-10 max-[640px]:px-5 max-[640px]:pt-7">
        {/* En-tête éditorial */}
        <header className="mx-auto max-w-[980px]">
          {article.category && (
            <Link
              href={`/actualites?category=${encodeURIComponent(article.category.slug)}`}
              className="mb-4 inline-flex rounded-full bg-red/10 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-red"
            >
              {article.category.name}
            </Link>
          )}

          <h1 className="max-w-[920px] font-display text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-navy sm:text-4xl lg:text-[3.15rem]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <span className="font-semibold text-ink">{article.author}</span>
            {article.publishedAt && (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-[#B9BDC5] sm:block" />
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDate(article.publishedAt)}
                </time>
              </>
            )}
            <span className="hidden h-1 w-1 rounded-full bg-[#B9BDC5] sm:block" />
            <span>{readingTime} min de lecture</span>
          </div>

          {article.excerpt && (
            <p className="mt-6 max-w-[850px] text-lg leading-8 text-ink-soft sm:text-xl">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Image principale : volontairement plus compacte que l'ancien hero */}
        <div className="mx-auto mt-9 max-w-[980px] overflow-hidden rounded-xl bg-offwhite shadow-sm ring-1 ring-black/5">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt ?? article.title}
              width={1600}
              height={900}
              className="h-auto max-h-[540px] w-full object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex aspect-[16/8] items-center justify-center text-sm text-ink-soft">
              Image à ajouter
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,760px)_300px] lg:items-start lg:justify-center">
          {/* Article */}
          <div className="min-w-0">
            {article.isDemoContent && (
              <div className="demo-flag mb-7">
                Contenu de démonstration — à remplacer par la publication réelle
              </div>
            )}

            <div
              className="article-content text-[1.06rem] leading-[1.9] text-[#343942]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {images.length > 0 && (
              <section className="mt-12 border-t border-line pt-9">
                <h2 className="mb-5 font-display text-xl font-extrabold text-navy">
                  Galerie photos
                </h2>
                <ImageGalleryGrid images={images} />
              </section>
            )}

            {videos.length > 0 && (
              <section className="mt-12 border-t border-line pt-9">
                <h2 className="mb-6 font-display text-xl font-extrabold text-navy">
                  Vidéos
                </h2>
                <div className="flex flex-col gap-8">
                  {videos.map((v) => (
                    <VideoEmbed
                      key={v.id}
                      video={{
                        type: v.media.type,
                        provider: v.media.provider,
                        url: v.media.url,
                        externalUrl: v.media.externalUrl,
                        caption: v.caption ?? v.media.caption,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Partage */}
            <div className="mt-12 flex flex-wrap items-center gap-3 border-y border-line py-5">
              <span className="mr-2 text-sm font-bold text-navy">Partager</span>
              {shareLinks.map((share) => (
                <a
                  key={share.label}
                  href={share.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Partager sur ${share.label}`}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-xs font-bold text-ink transition hover:border-red hover:text-red"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[0.62rem] font-extrabold text-white">
                    {share.short}
                  </span>
                  {share.label}
                </a>
              ))}
            </div>

            {/* Article précédent / suivant */}
            {(previousArticle || nextArticle) && (
              <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Navigation entre les articles">
                {previousArticle ? (
                  <Link
                    href={`/actualites/${previousArticle.slug}`}
                    className="group rounded-xl border border-line p-5 transition hover:border-red/40 hover:shadow-sm"
                  >
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-ink-soft">
                      ← Article précédent
                    </span>
                    <span className="mt-2 block font-display text-sm font-bold leading-6 text-navy group-hover:text-red">
                      {previousArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextArticle && (
                  <Link
                    href={`/actualites/${nextArticle.slug}`}
                    className="group rounded-xl border border-line p-5 text-left transition hover:border-red/40 hover:shadow-sm sm:text-right"
                  >
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-ink-soft">
                      Article suivant →
                    </span>
                    <span className="mt-2 block font-display text-sm font-bold leading-6 text-navy group-hover:text-red">
                      {nextArticle.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Sidebar éditorial */}
          <aside className="space-y-7 lg:sticky lg:top-24">
            <section className="rounded-xl border border-line bg-offwhite p-5">
              <h2 className="border-b border-line pb-3 font-display text-base font-extrabold text-navy">
                Dernières actualités
              </h2>
              <div className="divide-y divide-line">
                {latest.map((item) => (
                  <Link
                    key={item.id}
                    href={`/actualites/${item.slug}`}
                    className="group block py-4 first:pt-4"
                  >
                    {item.category && (
                      <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-red">
                        {item.category.name}
                      </span>
                    )}
                    <span className="mt-1 block text-sm font-bold leading-5 text-navy group-hover:text-red">
                      {item.title}
                    </span>
                    {item.publishedAt && (
                      <time className="mt-1.5 block text-[0.68rem] text-ink-soft">
                        {formatDate(item.publishedAt)}
                      </time>
                    )}
                  </Link>
                ))}
                {latest.length === 0 && (
                  <p className="py-4 text-sm text-ink-soft">
                    Aucune autre actualité publiée.
                  </p>
                )}
              </div>
              <Link
                href="/actualites"
                className="mt-2 inline-flex text-xs font-extrabold uppercase tracking-wider text-red hover:underline"
              >
                Voir toutes les actualités →
              </Link>
            </section>

            <section className="rounded-xl border border-line p-5">
              <h2 className="mb-4 font-display text-base font-extrabold text-navy">
                Catégories
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((category) => category._count.articles > 0)
                  .map((category) => (
                    <Link
                      key={category.id}
                      href={`/actualites?category=${encodeURIComponent(category.slug)}`}
                      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-red hover:text-red"
                    >
                      {category.name} ({category._count.articles})
                    </Link>
                  ))}
              </div>
            </section>

            {biography?.citation && (
              <section className="rounded-xl bg-navy p-6 text-white">
                <div className="mb-3 text-2xl leading-none text-gold">“</div>
                <blockquote className="font-display text-base font-semibold leading-7">
                  {biography.citation}
                </blockquote>
                <div className="mt-4 text-xs font-bold uppercase tracking-widest text-white/60">
                  Goudoussy Diallo
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
