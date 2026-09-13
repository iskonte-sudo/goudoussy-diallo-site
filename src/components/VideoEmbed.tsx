type VideoLike = {
  type: string; // VIDEO_LOCAL | VIDEO_EXTERNAL
  provider: string; // LOCAL | YOUTUBE | VIMEO | FACEBOOK
  url: string;
  externalUrl?: string | null;
  caption?: string | null;
};

/**
 * Lecteur vidéo universel pour le site public : vidéo locale (élément
 * <video>), YouTube/Vimeo (iframe), Facebook (plugin vidéo officiel, avec
 * un bouton "Voir sur Facebook" toujours affiché en secours puisque
 * l'intégration peut être bloquée selon la confidentialité du contenu).
 */
export default function VideoEmbed({ video }: { video: VideoLike }) {
  if (video.type === "VIDEO_LOCAL") {
    return (
      <div className="overflow-hidden rounded-md bg-black">
        <video src={video.url} controls className="aspect-video w-full" />
        {video.caption && <p className="mt-2 text-sm text-ink-soft">{video.caption}</p>}
      </div>
    );
  }

  if (video.provider === "FACEBOOK") {
    return (
      <div>
        <div className="aspect-video w-full overflow-hidden rounded-md bg-offwhite">
          <iframe
            src={video.url}
            className="h-full w-full"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          {video.caption && <p className="text-sm text-ink-soft">{video.caption}</p>}
          {video.externalUrl && (
            <a href={video.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red">
              Voir sur Facebook →
            </a>
          )}
        </div>
      </div>
    );
  }

  // YouTube / Vimeo
  return (
    <div>
      <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
        <iframe
          src={video.url}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {video.caption && <p className="mt-2 text-sm text-ink-soft">{video.caption}</p>}
    </div>
  );
}
