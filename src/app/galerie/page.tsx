import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import GalleryFilterGrid from "@/components/GalleryFilterGrid";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Portraits, institutions, mini-football, jeunesse, terrain, rencontres, Afrique, international."
};

export default async function GaleriePage() {
  const images = await prisma.galleryImage.findMany({
    where: { gallery: { visible: true } },
    orderBy: [{ gallery: { order: "asc" } }, { order: "asc" }],
    take: 120,
    include: { gallery: { select: { category: true } } }
  });

  return (
    <div>
      <PageHero
        kicker="Galerie"
        title="En images"
        description="Portraits, institutions, mini-football, jeunesse, terrain, rencontres, Afrique, international."
      />
      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
          <GalleryFilterGrid
            images={images.map((image) => ({
              id: image.id,
              url: image.url,
              altText: image.altText,
              category: image.gallery?.category ?? ""
            }))}
          />
        </div>
      </section>
    </div>
  );
}
