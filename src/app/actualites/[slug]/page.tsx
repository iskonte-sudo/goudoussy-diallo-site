import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImageGalleryGrid from "@/components/ImageGalleryGrid";
import VideoEmbed from "@/components/VideoEmbed";

type Props = { params: { slug: string } };

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
      images: article.ogImageUrl ? [article.ogImageUrl] : undefined
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const siteUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const articleUrl = `${siteUrl}/actualites/${params.slug}`;
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: true, galleryImages: true, media: { include: { media: true }, orderBy: { order: "asc" } } }
  });
  if (!article || article.status !== "PUBLIE") notFound();

  const images = article.media
    .filter((m) => m.media.type === "IMAGE")
    .map((m) => ({ id: m.id, url: m.media.url, altText: m.media.altText, caption: m.caption ?? m.media.caption }));
  const videos = article.media.filter((m) => m.media.type !== "IMAGE");

  const related = await prisma.article.findMany({
    where: {
      status: "PUBLIE",
      slug: { not: article.slug },
      categoryId: article.categoryId ?? undefined
    },
    take: 3
  });

  return (
    <article>
      <div className="card-photo-placeholder aspect-[16/8] w-full">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt ?? article.title}
            width={1600}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        ) : (
          "Image à ajouter"
        )}
      </div>

      <div className="mx-auto max-w-[720px] px-8 py-14 max-[640px]:px-5">
        {article.category && (
          <span className="mb-4 inline-block rounded bg-navy px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-wide text-white">
            {article.category.name}
          </span>
        )}
        <h1 className="mb-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{article.title}</h1>
        <div className="mb-8 flex gap-4 text-sm text-ink-soft">
          <span>{article.author}</span>
          {article.publishedAt && <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>}
        </div>

        {article.isDemoContent && (
          <div className="demo-flag mb-6">Contenu de démonstration — à remplacer par la publication réelle</div>
        )}

        <div
          className="prose max-w-none text-[1.05rem] leading-relaxed text-ink [&_blockquote]:border-l-2 [&_blockquote]:border-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-red [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
          <span className="text-sm font-semibold text-ink-soft">Partager :</span>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-red">Facebook</a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-red">WhatsApp</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-red">LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-red">X</a>
        </div>

        {images.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 font-display text-xl font-bold">Galerie photos</h2>
            <ImageGalleryGrid images={images} />
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-12 flex flex-col gap-8">
            <h2 className="font-display text-xl font-bold">Vidéos</h2>
            {videos.map((v) => (
              <VideoEmbed
                key={v.id}
                video={{
                  type: v.media.type,
                  provider: v.media.provider,
                  url: v.media.url,
                  externalUrl: v.media.externalUrl,
                  caption: v.caption ?? v.media.caption
                }}
              />
            ))}
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="bg-offwhite py-14">
          <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
            <h2 className="mb-8 font-display text-xl font-extrabold">Articles associés</h2>
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {related.map((r) => (
                <Link key={r.id} href={`/actualites/${r.slug}`} className="block">
                  <div className="card-photo-placeholder mb-3 aspect-[4/3] rounded-md">Image à ajouter</div>
                  <h3 className="text-sm font-bold">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
