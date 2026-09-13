import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImageGalleryGrid from "@/components/ImageGalleryGrid";
import VideoEmbed from "@/components/VideoEmbed";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function ProjectPage({ params }: Props) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: { galleryImages: true, media: { include: { media: true }, orderBy: { order: "asc" } } }
  });
  if (!project) notFound();

  const images = project.media
    .filter((m) => m.media.type === "IMAGE")
    .map((m) => ({ id: m.id, url: m.media.url, altText: m.media.altText, caption: m.caption ?? m.media.caption }));
  const videos = project.media.filter((m) => m.media.type !== "IMAGE");

  return (
    <article>
      <div className="card-photo-placeholder aspect-[16/8] w-full">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            width={1600}
            height={800}
            className="h-full w-full object-cover"
          />
        ) : (
          "Image à ajouter"
        )}
      </div>

      <div className="mx-auto max-w-[720px] px-8 py-14 max-[640px]:px-5">
        {project.isDemoContent && <div className="demo-flag mb-4">Contenu de démonstration</div>}
        <h1 className="mb-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{project.title}</h1>
        <dl className="mb-8 grid grid-cols-2 gap-4 text-sm">
          {project.location && (
            <div>
              <dt className="text-ink-soft">Lieu</dt>
              <dd className="font-semibold">{project.location}</dd>
            </div>
          )}
          {project.date && (
            <div>
              <dt className="text-ink-soft">Date</dt>
              <dd className="font-semibold">{new Date(project.date).toLocaleDateString("fr-FR")}</dd>
            </div>
          )}
        </dl>
        <p className="mb-6 text-[1.05rem] leading-relaxed text-ink">{project.description}</p>
        {project.objective && (
          <>
            <h2 className="mb-2 font-display text-lg font-bold">Objectif</h2>
            <p className="mb-6 text-ink-soft">{project.objective}</p>
          </>
        )}
        {project.results && (
          <>
            <h2 className="mb-2 font-display text-lg font-bold">Résultats</h2>
            <p className="text-ink-soft">{project.results}</p>
          </>
        )}

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
    </article>
  );
}
