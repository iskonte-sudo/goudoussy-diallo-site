"use client";

import { useEffect, useState } from "react";
export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  size: number;
  altText: string | null;
  type: string; // IMAGE | VIDEO_LOCAL | VIDEO_EXTERNAL
  provider: string; // LOCAL | YOUTUBE | VIMEO | FACEBOOK
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
};

type Mode = "image" | "video" | "all";

type Props = {
  /** Mode "field" (comportement historique) : nom du champ caché du formulaire. */
  name?: string;
  label: string;
  defaultValue?: string | null;
  /** Type de médias proposés. Par défaut "image" (comportement historique inchangé). */
  mode?: Mode;
  /** Mode "callback" (utilisé par MediaGalleryManager) : reçoit le Media complet à la sélection. */
  onSelect?: (media: MediaItem) => void;
  triggerLabel?: string;
};

const ACCEPT_BY_MODE: Record<Mode, string> = {
  image: "image/jpeg,image/jpg,image/png,image/webp",
  video: "video/mp4,video/webm,video/quicktime",
  all: "image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
};

/**
 * Sélecteur de média réutilisable : parcourir la médiathèque ou uploader un
 * nouveau fichier. En mode "field" (name fourni), pilote un input caché pour
 * s'intégrer à n'importe quel <form action={serverAction}>. En mode
 * "callback" (onSelect fourni), délègue la sélection au composant parent —
 * utilisé pour construire les galeries multimédias.
 */
export default function MediaPicker({ name, label, defaultValue, mode = "image", onSelect, triggerLabel }: Props) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(defaultValue ?? null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload" | "external">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [submittingExternal, setSubmittingExternal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kindParam = mode === "image" ? "image" : mode === "video" ? "video" : "";

  useEffect(() => {
    if (!open) return;
    void loadMedia(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadMedia(q: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (kindParam) params.set("kind", kindParam);
      const res = await fetch(`/api/media?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      setItems(data.media ?? []);
    } finally {
      setLoading(false);
    }
  }

  function selectItem(item: MediaItem) {
    if (onSelect) {
      onSelect(item);
    } else {
      setSelectedUrl(item.url);
    }
    setOpen(false);
  }


  
  async function handleUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const maxSize = isVideo
    ? 100 * 1024 * 1024
    : 8 * 1024 * 1024;

  if (!isImage && !isVideo) {
    setError("Format de fichier non autorisé.");
    e.target.value = "";
    return;
  }

  if (file.size > maxSize) {
    setError(
      `Fichier trop volumineux (maximum ${
        isVideo ? "100" : "8"
      } Mo).`
    );
    e.target.value = "";
    return;
  }

  setUploading(true);
  setError(null);

  try {
    // 1. Demande d'une URL d'upload temporaire
    const tokenResponse = await fetch("/api/upload/token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(
        tokenData.error ??
          "Impossible de préparer l'upload."
      );
    }


console.log("Réponse API upload token:", tokenData);

    // 2. Upload direct du fichier vers Vercel Blob
    const uploadResponse = await fetch(
      tokenData.presignedUrl,
      {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      }
    );

  if (!uploadResponse.ok) {
  const responseText = await uploadResponse.text();

  console.error("Vercel Blob upload error:", {
    status: uploadResponse.status,
    statusText: uploadResponse.statusText,
    body: responseText,
  });

  throw new Error(
    `Échec de l'envoi vers Vercel Blob (${uploadResponse.status})${
      responseText ? ` : ${responseText}` : ""
    }`
  );
}

    // 3. Enregistrement du média dans Neon / Prisma
    const mediaResponse = await fetch("/api/media", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: tokenData.publicUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      }),
    });

    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      throw new Error(
        mediaData.error ??
          "Impossible d'enregistrer le média."
      );
    }

    // 4. Sélectionner immédiatement le média
    selectItem(mediaData.media);

    setItems((prev) => [
      mediaData.media,
      ...prev,
    ]);
  } catch (error) {
    console.error("Upload Blob:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Échec de l'upload."
    );
  } finally {
    setUploading(false);
    e.target.value = "";
  }
}

  async function handleExternalSubmit() {
    if (!externalUrl.trim()) return;
    setSubmittingExternal(true);
    setError(null);
    try {
      const res = await fetch("/api/media/external", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: externalUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'intégrer cette vidéo.");
        return;
      }
      selectItem(data.media);
      setExternalUrl("");
    } catch {
      setError("Impossible d'intégrer cette vidéo.");
    } finally {
      setSubmittingExternal(false);
    }
  }

  const showUploadTab = mode !== "video" || true; // upload dispo dans tous les modes
  const showExternalTab = mode === "video" || mode === "all";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {name && <input type="hidden" name={name} value={selectedUrl ?? ""} />}

      <div className="flex items-center gap-3">
        {!onSelect && (
          <div className="card-photo-placeholder h-20 w-20 flex-none overflow-hidden rounded-md text-[0.6rem]">
            {selectedUrl ? (
              mode === "video" ? (
                <span className="p-1 text-center">Vidéo sélectionnée</span>
              ) : (
               <img src={selectedUrl} alt="" width={80} height={80} className="h-full w-full object-cover" />
              )
            ) : (
              "Aucun média"
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn btn-outline w-fit text-xs">
            {triggerLabel ?? "Choisir un média"}
          </button>
          {!onSelect && selectedUrl && (
            <button type="button" onClick={() => setSelectedUrl(null)} className="w-fit text-xs font-semibold text-red">
              Retirer
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Médiathèque</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-ink-soft">✕</button>
            </div>

            <div className="mb-4 flex gap-2 border-b border-line">
              <TabButton active={tab === "library"} onClick={() => setTab("library")}>Bibliothèque</TabButton>
              {showUploadTab && (
                <TabButton active={tab === "upload"} onClick={() => setTab("upload")}>Uploader</TabButton>
              )}
              {showExternalTab && (
                <TabButton active={tab === "external"} onClick={() => setTab("external")}>Lien externe</TabButton>
              )}
            </div>

            {error && <p className="mb-3 text-sm text-red">{error}</p>}

            {tab === "library" && (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <input
                    type="search"
                    placeholder="Rechercher…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadMedia(query)}
                    className="input flex-1"
                  />
                  <button type="button" onClick={() => loadMedia(query)} className="btn btn-outline text-xs">
                    Rechercher
                  </button>
                </div>
                <div className="grid flex-1 grid-cols-4 gap-3 overflow-y-auto">
                  {loading ? (
                    <p className="col-span-4 py-8 text-center text-sm text-ink-soft">Chargement…</p>
                  ) : items.length === 0 ? (
                    <p className="col-span-4 py-8 text-center text-sm text-ink-soft">Aucun média.</p>
                  ) : (
                    items.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => selectItem(item)}
                        className={`group relative aspect-square overflow-hidden rounded-md border-2 ${
                          selectedUrl === item.url ? "border-red" : "border-transparent"
                        }`}
                      >
                        {item.type === "IMAGE" ? (
                          <img src={item.url} alt={item.altText ?? ""} width={150} height={150} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-navy text-white">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt="" width={150} height={150} className="h-full w-full object-cover opacity-70" />
                            ) : (
                              <span className="text-2xl">▶</span>
                            )}
                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[0.6rem]">
                              {item.provider}
                            </span>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {tab === "upload" && (
              <div className="flex flex-col items-start gap-3 py-6">
                <p className="text-sm text-ink-soft">
                  {mode === "video"
                    ? "MP4, WEBM ou MOV — 100 Mo maximum."
                    : mode === "all"
                    ? "Images (JPG, PNG, WEBP) ou vidéos (MP4, WEBM, MOV)."
                    : "JPG, PNG ou WEBP — 8 Mo maximum."}
                </p>
                <label className="btn btn-red cursor-pointer text-xs">
                  {uploading ? "Envoi…" : "Choisir un fichier"}
                  <input
                    type="file"
                    accept={ACCEPT_BY_MODE[mode]}
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}

            {tab === "external" && (
              <div className="flex flex-col gap-3 py-6">
                <p className="text-sm text-ink-soft">
                  Collez une URL YouTube, Vimeo ou Facebook (vidéo, Reel ou publication contenant une vidéo).
                </p>
                <input
                  type="url"
                  placeholder="https://…"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="input"
                />
                <button
                  type="button"
                  onClick={handleExternalSubmit}
                  disabled={submittingExternal || !externalUrl.trim()}
                  className="btn btn-red w-fit text-xs"
                >
                  {submittingExternal ? "Vérification…" : "Intégrer cette vidéo"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-xs font-semibold ${active ? "border-red text-ink" : "border-transparent text-ink-soft"}`}
    >
      {children}
    </button>
  );
}
