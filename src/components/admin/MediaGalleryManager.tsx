"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import MediaPicker, { MediaItem } from "./MediaPicker";

export type GalleryLink = {
  id: string; // id de la ligne de liaison (ArticleMedia, ProjectMedia...)
  order: number;
  caption: string | null;
  media: MediaItem;
};

type Props = {
  items: GalleryLink[];
  onAdd: (mediaId: string) => Promise<void>;
  onRemove: (linkId: string) => Promise<void>;
  onMove: (linkId: string, direction: "up" | "down") => Promise<void>;
  onUpdateCaption: (linkId: string, caption: string) => Promise<void>;
};

export default function MediaGalleryManager({ items, onAdd, onRemove, onMove, onUpdateCaption }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    });
  }

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-lg border border-line p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Médias</h3>
        {savedFlash && <span className="text-xs font-semibold text-green">Modifications enregistrées.</span>}
      </div>

      {sorted.length === 0 ? (
        <p className="mb-4 text-sm text-ink-soft">Aucun média associé pour le moment.</p>
      ) : (
        <div className="mb-5 grid grid-cols-3 gap-4 max-[600px]:grid-cols-2">
          {sorted.map((link, i) => (
            <div key={link.id} className="rounded-md border border-line p-2.5">
              <div className="mb-2 aspect-video overflow-hidden rounded bg-offwhite">
                {link.media.type === "IMAGE" ? (
                  <Image src={link.media.url} alt={link.media.altText ?? ""} width={220} height={140} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-navy text-white">
                    {link.media.thumbnailUrl ? (
                      <Image src={link.media.thumbnailUrl} alt="" width={220} height={140} className="h-full w-full object-cover opacity-70" />
                    ) : (
                      <span className="text-2xl">▶</span>
                    )}
                    <span className="absolute rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem]">{link.media.provider}</span>
                  </div>
                )}
              </div>
              <input
                defaultValue={link.caption ?? ""}
                placeholder="Légende"
                onBlur={(e) => run(() => onUpdateCaption(link.id, e.target.value))}
                className="input mb-2 text-xs"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <button type="button" disabled={i === 0 || isPending} onClick={() => run(() => onMove(link.id, "up"))} className="text-ink-soft disabled:opacity-30">▲</button>
                  <button type="button" disabled={i === sorted.length - 1 || isPending} onClick={() => run(() => onMove(link.id, "down"))} className="text-ink-soft disabled:opacity-30">▼</button>
                </div>
                <button type="button" disabled={isPending} onClick={() => run(() => onRemove(link.id))} className="font-semibold text-red">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <MediaPicker
          label=""
          mode="image"
          triggerLabel="+ Ajouter une image"
          onSelect={(media: MediaItem) => run(() => onAdd(media.id))}
        />
        <MediaPicker
          label=""
          mode="video"
          triggerLabel="+ Ajouter une vidéo"
          onSelect={(media: MediaItem) => run(() => onAdd(media.id))}
        />
      </div>
    </div>
  );
}
