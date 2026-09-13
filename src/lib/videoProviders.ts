export type VideoProvider = "YOUTUBE" | "VIMEO" | "FACEBOOK" | "UNKNOWN";

export function detectVideoProvider(url: string): VideoProvider {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") return "YOUTUBE";
    if (host === "vimeo.com" || host === "player.vimeo.com") return "VIMEO";
    if (host === "facebook.com" || host === "m.facebook.com" || host === "fb.watch") return "FACEBOOK";
    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function getYoutubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function getYoutubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function getVimeoEmbedUrl(id: string): string {
  return `https://player.vimeo.com/video/${id}`;
}

/**
 * Facebook n'a pas d'ID vidéo public exploitable sans l'API Graph (qui
 * nécessite une App Facebook approuvée). L'intégration officielle "sans
 * clé" pour du contenu public est le plugin vidéo Facebook, qui prend
 * simplement l'URL d'origine encodée en paramètre.
 * Fonctionne pour les vidéos, Reels et publications contenant une vidéo,
 * tant que le contenu est public — sinon Facebook affichera une erreur
 * dans l'iframe, d'où le bouton "Voir sur Facebook" toujours affiché en
 * secours à côté de l'intégration.
 */
export function getFacebookEmbedUrl(originalUrl: string): string {
  const encoded = encodeURIComponent(originalUrl);
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false`;
}

/**
 * Analyse une URL vidéo externe collée par l'administrateur et retourne
 * tout ce qu'il faut pour créer le Media correspondant.
 */
export function analyzeExternalVideoUrl(rawUrl: string): {
  provider: VideoProvider;
  externalId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
} {
  const provider = detectVideoProvider(rawUrl);

  if (provider === "YOUTUBE") {
    const id = extractYoutubeId(rawUrl);
    return {
      provider,
      externalId: id,
      embedUrl: id ? getYoutubeEmbedUrl(id) : null,
      thumbnailUrl: id ? getYoutubeThumbnail(id) : null
    };
  }

  if (provider === "VIMEO") {
    const id = extractVimeoId(rawUrl);
    return {
      provider,
      externalId: id,
      embedUrl: id ? getVimeoEmbedUrl(id) : null,
      thumbnailUrl: null // nécessiterait l'API oEmbed Vimeo (réseau non garanti à l'exécution)
    };
  }

  if (provider === "FACEBOOK") {
    return {
      provider,
      externalId: null,
      embedUrl: getFacebookEmbedUrl(rawUrl),
      thumbnailUrl: null // Facebook ne fournit pas de miniature sans l'API Graph authentifiée
    };
  }

  return { provider: "UNKNOWN", externalId: null, embedUrl: null, thumbnailUrl: null };
}
