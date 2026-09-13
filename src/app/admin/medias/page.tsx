import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteMedia, updateMediaMeta } from "@/lib/actions";

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const PROVIDER_LABEL: Record<string, string> = {
  LOCAL: "Local",
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  FACEBOOK: "Facebook"
};

export default async function AdminMediasPage({
  searchParams
}: {
  searchParams: { q?: string; kind?: string };
}) {
  const q = searchParams.q?.trim();
  const kind = searchParams.kind ?? "all";

  const typeFilter =
    kind === "image" ? { type: "IMAGE" } : kind === "video" ? { type: { in: ["VIDEO_LOCAL", "VIDEO_EXTERNAL"] } } : {};

  const media = await prisma.media.findMany({
    where: {
      ...typeFilter,
      ...(q ? { OR: [{ filename: { contains: q } }, { altText: { contains: q } }] } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { articleLinks: true, projectLinks: true, sportEventLinks: true, fieldActionLinks: true }
      }
    }
  });

  const tabs = [
    { key: "all", label: "Tous" },
    { key: "image", label: "Images" },
    { key: "video", label: "Vidéos" }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">Médiathèque</h1>
        <form action="/admin/medias" className="flex gap-2">
          <input type="hidden" name="kind" value={kind} />
          <input type="search" name="q" defaultValue={q} placeholder="Rechercher…" className="input" />
          <button type="submit" className="btn btn-outline text-xs">Rechercher</button>
        </form>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/medias?kind=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              kind === t.key ? "bg-navy text-white" : "border border-line text-ink-soft"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <p className="mb-6 text-sm text-ink-soft">
        {media.length} média{media.length > 1 ? "s" : ""}. Un média peut être réutilisé sur plusieurs contenus sans
        être re-uploadé — utilisez le sélecteur de média depuis n&apos;importe quel formulaire.
      </p>

      {media.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun média pour le moment.</p>
      ) : (
        <div className="grid grid-cols-4 gap-5 max-[900px]:grid-cols-2">
          {media.map((m) => {
            const usage = m._count.articleLinks + m._count.projectLinks + m._count.sportEventLinks + m._count.fieldActionLinks;
            return (
              <div key={m.id} className="rounded-lg border border-line p-3">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-offwhite">
                  {m.type === "IMAGE" ? (
                    <Image src={m.url} alt={m.altText ?? ""} width={220} height={220} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-navy text-white">
                      {m.thumbnailUrl ? (
                        <Image src={m.thumbnailUrl} alt="" width={220} height={220} className="h-full w-full object-cover opacity-70" />
                      ) : (
                        <span className="text-3xl">▶</span>
                      )}
                    </div>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                    {PROVIDER_LABEL[m.provider] ?? m.provider}
                  </span>
                </div>
                <p className="mb-1 truncate text-xs font-semibold" title={m.filename}>{m.filename}</p>
                <p className="mb-1 text-[0.7rem] text-ink-soft">
                  {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                  {formatSize(m.size)}
                </p>
                <p className="mb-3 text-[0.7rem] text-ink-soft">
                  {usage > 0 ? `Utilisé dans ${usage} contenu${usage > 1 ? "s" : ""}` : "Non utilisé"}
                </p>
                {m.type === "IMAGE" && (
                  <form action={updateMediaMeta.bind(null, m.id)} className="mb-2 flex flex-col gap-1.5">
                    <input name="altText" defaultValue={m.altText ?? ""} placeholder="Texte alternatif (ALT)" className="input text-xs" />
                    <input name="caption" defaultValue={m.caption ?? ""} placeholder="Légende" className="input text-xs" />
                    <button type="submit" className="btn btn-outline w-fit text-[0.7rem]">Enregistrer</button>
                  </form>
                )}
                <form action={deleteMedia.bind(null, m.id)}>
                  <button className="text-[0.7rem] font-semibold text-red">Supprimer</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
