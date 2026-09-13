"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
  category: string;
};

export default function GalleryFilterGrid({ images }: { images: GalleryImage[] }) {
  const filters = ["Toutes", "Portraits", "Institutions", "Mini-Football", "Jeunesse", "Terrain", "Afrique"];
  const [active, setActive] = useState("Toutes");

  const filtered = useMemo(() => {
    if (active === "Toutes") return images;
    return images.filter((img) => normalize(img.category) === normalize(active));
  }, [active, images]);

  return (
    <>
      <div className="mb-9 flex flex-wrap gap-2.5">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              active === filter ? "bg-navy text-white" : "border border-line text-ink-soft hover:border-navy hover:text-navy"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="columns-3 gap-3.5 max-[760px]:columns-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucune image dans cette catégorie pour le moment.</p>
        ) : (
          filtered.map((img) => (
            <div key={img.id} className="mb-3.5 break-inside-avoid overflow-hidden rounded-md">
              <Image
                src={img.url}
                alt={img.altText ?? ""}
                width={400}
                height={400}
                className="w-full object-cover"
              />
            </div>
          ))
        )}
      </div>
    </>
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .trim();
}
