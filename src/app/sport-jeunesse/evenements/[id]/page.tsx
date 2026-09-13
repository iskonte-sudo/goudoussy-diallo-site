import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImageGalleryGrid from "@/components/ImageGalleryGrid";
import VideoEmbed from "@/components/VideoEmbed";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await prisma.sportEvent.findUnique({ where: { id: params.id } });
  if (!event) return {};
  return { title: event.title, description: event.description };
}

export default async function SportEventDetailPage({ params }: Props) {
  const event = await prisma.sportEvent.findUnique({
    where: { id: params.id },
    include: { media: { include: { media: true }, orderBy: { order: "asc" } } }
  });
  if (!event || event.status !== "PUBLIE") notFound();

  const images = event.media
    .filter((m) => m.media.type === "IMAGE")
    .map((m) => ({ id: m.id, url: m.media.url, altText: m.media.altText, caption: m.caption ?? m.media.caption }));
  const videos = event.media.filter((m) => m.media.type !== "IMAGE");

  return (
    <article>
      <div className="card-photo-placeholder aspect-[16/8] w-full">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt={event.title} width={1600} height={800} className="h-full w-full object-cover" />
        ) : (
          "Image à ajouter"
        )}
      </div>

      <div className="mx-auto max-w-[720px] px-8 py-14 max-[640px]:px-5">
        <p className="kicker">{event.type || "Sport & jeunesse"}</p>
        <h1 className="mb-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{event.title}</h1>
        <div className="mb-8 flex gap-4 text-sm text-ink-soft">
          {event.location && <span>{event.location}</span>}
          {event.date && <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>}
        </div>
        <p className="text-[1.05rem] leading-relaxed text-ink">{event.description}</p>

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
