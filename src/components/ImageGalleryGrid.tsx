"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
};

export default function ImageGalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="aspect-square overflow-hidden rounded-md"
          >
            <Image
              src={img.url}
              alt={img.altText ?? ""}
              width={300}
              height={300}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            aria-label="Fermer"
            onClick={() => setOpenIndex(null)}
            className="absolute right-6 top-6 text-2xl text-white"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              aria-label="Précédent"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-white"
            >
              ←
            </button>
          )}

          <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex].url}
              alt={images[openIndex].altText ?? ""}
              width={1200}
              height={900}
              className="max-h-[80vh] w-auto object-contain"
            />
            {images[openIndex].caption && (
              <p className="mt-3 text-center text-sm text-white/80">{images[openIndex].caption}</p>
            )}
          </div>

          {images.length > 1 && (
            <button
              aria-label="Suivant"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex((i) => (i === null ? 0 : (i + 1) % images.length));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-white"
            >
              →
            </button>
          )}
        </div>
      )}
    </>
  );
}
