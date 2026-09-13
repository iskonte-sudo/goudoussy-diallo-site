"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Articles -----------------------------------------------------------

export async function createArticle(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "BROUILLON") as
    | "BROUILLON"
    | "A_VALIDER"
    | "PUBLIE"
    | "ARCHIVE";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  await prisma.article.create({
    data: {
      title,
      slug: providedSlug ? slugify(providedSlug) : slugify(title),
      excerpt: String(formData.get("excerpt") ?? ""),
      content: String(formData.get("content") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
      coverImageAlt: String(formData.get("coverImageAlt") ?? "") || null,
      author: String(formData.get("author") ?? "") || "Goudoussy Diallo",
      status,
      featured: formData.get("featured") === "on",
      categoryId: String(formData.get("categoryId") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
      seoKeywords: String(formData.get("seoKeywords") ?? "") || null,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : status === "PUBLIE" ? new Date() : null
    }
  });

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath("/");
  redirect("/admin/actualites");
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "BROUILLON") as
    | "BROUILLON"
    | "A_VALIDER"
    | "PUBLIE"
    | "ARCHIVE";
  const publishedAtRaw = String(formData.get("publishedAt") ?? "");

  await prisma.article.update({
    where: { id },
    data: {
      title,
      slug: providedSlug ? slugify(providedSlug) : slugify(title),
      excerpt: String(formData.get("excerpt") ?? ""),
      content: String(formData.get("content") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
      coverImageAlt: String(formData.get("coverImageAlt") ?? "") || null,
      author: String(formData.get("author") ?? "") || "Goudoussy Diallo",
      status,
      featured: formData.get("featured") === "on",
      categoryId: String(formData.get("categoryId") ?? "") || null,
      seoTitle: String(formData.get("seoTitle") ?? "") || null,
      seoDescription: String(formData.get("seoDescription") ?? "") || null,
      seoKeywords: String(formData.get("seoKeywords") ?? "") || null,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : status === "PUBLIE" ? new Date() : null
    }
  });

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath(`/actualites/${providedSlug ? slugify(providedSlug) : slugify(title)}`);
  revalidatePath("/");
  redirect("/admin/actualites");
}

export async function updateArticleStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.article.update({
    where: { id },
    data: {
      status: status as "BROUILLON" | "A_VALIDER" | "PUBLIE" | "ARCHIVE",
      publishedAt: status === "PUBLIE" ? new Date() : undefined
    }
  });
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
}

// --- Projects -------------------------------------------------------------

export async function createProject(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");

  await prisma.project.create({
    data: {
      title,
      slug: providedSlug ? slugify(providedSlug) : slugify(title),
      description: String(formData.get("description") ?? ""),
      objective: String(formData.get("objective") ?? "") || null,
      results: String(formData.get("results") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      date: dateRaw ? new Date(dateRaw) : null,
      status: String(formData.get("status") ?? "EN_PREPARATION"),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
      videoUrl: String(formData.get("videoUrl") ?? "") || null,
      externalLink: String(formData.get("externalLink") ?? "") || null,
      categoryId: String(formData.get("categoryId") ?? "") || null
    }
  });

  revalidatePath("/admin/projets");
  revalidatePath("/projets");
  revalidatePath("/");
  redirect("/admin/projets");
}

export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "");
  const providedSlug = String(formData.get("slug") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");

  await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: providedSlug ? slugify(providedSlug) : slugify(title),
      description: String(formData.get("description") ?? ""),
      objective: String(formData.get("objective") ?? "") || null,
      results: String(formData.get("results") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      date: dateRaw ? new Date(dateRaw) : null,
      status: String(formData.get("status") ?? "EN_PREPARATION"),
      coverImageUrl: String(formData.get("coverImageUrl") ?? "") || null,
      videoUrl: String(formData.get("videoUrl") ?? "") || null,
      externalLink: String(formData.get("externalLink") ?? "") || null,
      categoryId: String(formData.get("categoryId") ?? "") || null
    }
  });

  revalidatePath("/admin/projets");
  revalidatePath("/projets");
  revalidatePath("/");
  redirect("/admin/projets");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projets");
  revalidatePath("/projets");
}

// --- Biography & responsibilities -----------------------------------------

export async function updateBiography(formData: FormData) {
  await requireAdmin();

  const data = {
    presentation: String(formData.get("presentation") ?? ""),
    parcours: String(formData.get("parcours") ?? ""),
    formation: String(formData.get("formation") ?? ""),
    experiences: String(formData.get("experiences") ?? ""),
    engagements: String(formData.get("engagements") ?? ""),
    vision: String(formData.get("vision") ?? ""),
    valeurs: String(formData.get("valeurs") ?? ""),
    citation: String(formData.get("citation") ?? "") || null,
    portraitUrl: String(formData.get("portraitUrl") ?? "") || null,
    secondaryImageUrl: String(formData.get("secondaryImageUrl") ?? "") || null,
    internalNameNote: String(formData.get("internalNameNote") ?? "")
  };

  await prisma.biography.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data }
  });

  revalidatePath("/admin/biographie");
  revalidatePath("/biographie");
}

export async function updateResponsibility(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.responsibility.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      confidence: String(formData.get("confidence") ?? "A_CONFIRMER")
    }
  });

  revalidatePath("/admin/biographie");
  revalidatePath("/biographie");
  revalidatePath("/");
}

// --- Contact messages -------------------------------------------------

export async function markMessageRead(id: string) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/messages");
}

export async function markMessageUnread(id: string) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read: false } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

// --- Main menu ----------------------------------------------------------

export async function createMenuItem(formData: FormData) {
  await requireAdmin();

  const count = await prisma.menuItem.count();
  await prisma.menuItem.create({
    data: {
      label: String(formData.get("label") ?? ""),
      url: String(formData.get("url") ?? ""),
      order: count,
      newTab: formData.get("newTab") === "on",
      active: formData.get("active") === "on"
    }
  });

  revalidatePath("/admin/menu");
  revalidatePath("/");
  redirect("/admin/menu");
}

export async function updateMenuItem(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.menuItem.update({
    where: { id },
    data: {
      label: String(formData.get("label") ?? ""),
      url: String(formData.get("url") ?? ""),
      newTab: formData.get("newTab") === "on",
      active: formData.get("active") === "on"
    }
  });
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

export async function moveMenuItem(id: string, direction: "up" | "down") {
  await requireAdmin();

  const items = await prisma.menuItem.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= items.length) return;

  const a = items[index];
  const b = items[swapWith];

  await prisma.$transaction([
    prisma.menuItem.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.menuItem.update({ where: { id: b.id }, data: { order: a.order } })
  ]);

  revalidatePath("/admin/menu");
  revalidatePath("/");
}

// --- Sport events -------------------------------------------------------

export async function createSportEvent(formData: FormData) {
  await requireAdmin();

  const dateRaw = String(formData.get("date") ?? "");
  await prisma.sportEvent.create({
    data: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
      type: String(formData.get("type") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      date: dateRaw ? new Date(dateRaw) : null,
      status: String(formData.get("status") ?? "BROUILLON"),
      active: formData.get("active") === "on"
    }
  });

  revalidatePath("/admin/evenements-sportifs");
  revalidatePath("/sport-jeunesse");
  redirect("/admin/evenements-sportifs");
}

export async function deleteSportEvent(id: string) {
  await requireAdmin();
  await prisma.sportEvent.delete({ where: { id } });
  revalidatePath("/admin/evenements-sportifs");
  revalidatePath("/sport-jeunesse");
}

export async function updateSportEvent(id: string, formData: FormData) {
  await requireAdmin();

  const dateRaw = String(formData.get("date") ?? "");
  await prisma.sportEvent.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
      type: String(formData.get("type") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      date: dateRaw ? new Date(dateRaw) : null,
      status: String(formData.get("status") ?? "BROUILLON"),
      active: formData.get("active") === "on"
    }
  });

  revalidatePath("/admin/evenements-sportifs");
  revalidatePath("/sport-jeunesse");
  redirect("/admin/evenements-sportifs");
}

// --- Homepage sections (enable / order / titles) ---------------------

export async function updateHomepageSection(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.homepageSection.update({
    where: { id },
    data: {
      enabled: formData.get("enabled") === "on",
      title: String(formData.get("title") ?? "") || null,
      subtitle: String(formData.get("subtitle") ?? "") || null
    }
  });
  revalidatePath("/admin/accueil");
  revalidatePath("/");
}

export async function moveHomepageSection(id: string, direction: "up" | "down") {
  await requireAdmin();

  const sections = await prisma.homepageSection.findMany({ orderBy: { order: "asc" } });
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sections.length) return;

  const a = sections[index];
  const b = sections[swapWith];

  await prisma.$transaction([
    prisma.homepageSection.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.homepageSection.update({ where: { id: b.id }, data: { order: a.order } })
  ]);

  revalidatePath("/admin/accueil");
  revalidatePath("/");
}

// --- Field actions (Actions de terrain) -----------------------------------

export async function createFieldAction(formData: FormData) {
  await requireAdmin();

  await prisma.fieldAction.create({
    data: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      location: String(formData.get("location") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
      status: String(formData.get("status") ?? "BROUILLON") as
        | "BROUILLON"
        | "A_VALIDER"
        | "PUBLIE"
        | "ARCHIVE"
    }
  });

  revalidatePath("/admin/actions-terrain");
  revalidatePath("/actions-terrain");
  revalidatePath("/");
  redirect("/admin/actions-terrain");
}

export async function updateFieldActionStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.fieldAction.update({
    where: { id },
    data: { status: status as "BROUILLON" | "A_VALIDER" | "PUBLIE" | "ARCHIVE" }
  });
  revalidatePath("/admin/actions-terrain");
  revalidatePath("/actions-terrain");
  revalidatePath("/");
}

export async function deleteFieldAction(id: string) {
  await requireAdmin();
  await prisma.fieldAction.delete({ where: { id } });
  revalidatePath("/admin/actions-terrain");
  revalidatePath("/actions-terrain");
  revalidatePath("/");
}

export async function updateFieldAction(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.fieldAction.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      location: String(formData.get("location") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "") || null,
      status: String(formData.get("status") ?? "BROUILLON") as
        | "BROUILLON"
        | "A_VALIDER"
        | "PUBLIE"
        | "ARCHIVE"
    }
  });

  revalidatePath("/admin/actions-terrain");
  revalidatePath("/actions-terrain");
  revalidatePath("/");
  redirect("/admin/actions-terrain");
}

// --- Galleries --------------------------------------------------------

export async function createGallery(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!title || !category) {
    throw new Error("Le titre et la catégorie sont obligatoires.");
  }

  const baseSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slug = `${baseSlug}-${Date.now()}`;

  await prisma.gallery.create({
    data: {
      title,
      slug,
      category
    }
  });

  revalidatePath("/admin/galeries");
  redirect("/admin/galeries");
}

export async function deleteGallery(id: string) {
  await requireAdmin();
  await prisma.gallery.delete({ where: { id } });
  revalidatePath("/admin/galeries");
  revalidatePath("/galerie");
}

export async function addGalleryImage(galleryId: string, formData: FormData) {
  await requireAdmin();

  const url = String(formData.get("url") ?? "");
  if (!url) return;

  await prisma.galleryImage.create({
    data: {
      url,
      caption: String(formData.get("caption") ?? "") || null,
      altText: String(formData.get("altText") ?? "") || null,
      galleryId
    }
  });

  revalidatePath(`/admin/galeries/${galleryId}`);
  revalidatePath("/galerie");
}

export async function deleteGalleryImage(id: string, galleryId: string) {
  await requireAdmin();
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath(`/admin/galeries/${galleryId}`);
  revalidatePath("/galerie");
}

// --- Videos -------------------------------------------------------------

export async function createVideo(formData: FormData) {
  await requireAdmin();

  await prisma.video.create({
    data: {
      title: String(formData.get("title") ?? ""),
      provider: String(formData.get("provider") ?? "YOUTUBE"),
      url: String(formData.get("url") ?? "")
    }
  });

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
}

// --- Social links -----------------------------------------------------

export async function updateSocialLinks(formData: FormData) {
  await requireAdmin();

  const platforms = ["facebook", "instagram", "youtube", "linkedin", "tiktok"];
  for (const platform of platforms) {
    const url = String(formData.get(platform) ?? "").trim();
    const visible = formData.get(`${platform}_visible`) === "on";
    await prisma.socialLink.upsert({
      where: { platform },
      update: { url, visible },
      create: { platform, url, visible }
    });
  }

  revalidatePath("/admin/reseaux-sociaux");
  revalidatePath("/");
  revalidatePath("/contact");
}

// --- Site settings ------------------------------------------------------

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const data = {
    siteName: String(formData.get("siteName") ?? "Goudoussy Diallo"),
    displayName: String(formData.get("displayName") ?? "Goudoussy Diallo"),
    slogan: String(formData.get("slogan") ?? "") || null,
    heroTagline: String(formData.get("heroTagline") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? "") || null,
    faviconUrl: String(formData.get("faviconUrl") ?? "") || null,
    contactEmail: String(formData.get("contactEmail") ?? "") || null,
    contactPhone: String(formData.get("contactPhone") ?? "") || null,
    contactWhatsapp: String(formData.get("contactWhatsapp") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    seoDefaultTitle: String(formData.get("seoDefaultTitle") ?? "") || null,
    seoDefaultDescription: String(formData.get("seoDefaultDescription") ?? "") || null,
    ogImageUrl: String(formData.get("ogImageUrl") ?? "") || null,
    homepageArticlesCount: Number(formData.get("homepageArticlesCount") ?? 4) || 4,
    homepageProjectsCount: Number(formData.get("homepageProjectsCount") ?? 3) || 3,
    homepageGalleryCount: Number(formData.get("homepageGalleryCount") ?? 6) || 6,
    footerDescription: String(formData.get("footerDescription") ?? "") || null,
    footerCopyright: String(formData.get("footerCopyright") ?? "") || null,
    footerLegalNotice: String(formData.get("footerLegalNotice") ?? "") || null,
    footerPrivacyPolicyUrl: String(formData.get("footerPrivacyPolicyUrl") ?? "") || null
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data }
  });

  revalidatePath("/admin/parametres");
  revalidatePath("/");
}

// --- Galeries multimédias (Actualités / Projets / Événements / Terrain) ---
// Implémentation générique en interne (les 4 tables de liaison ont la même
// forme : id, <contentId>, mediaId, order, caption) pour éviter de dupliquer
// la même logique 4 fois. Le délégué Prisma est typé largement ici (chaque
// modèle a un type de retour Prisma précis et incompatible entre eux en
// mode strict) — chaque fonction EXPORTÉE reste, elle, strictement typée
// à l'appel (articleId: string, mediaId: string, etc.), donc aucune perte
// de sécurité côté pages admin qui les utilisent.
/* eslint-disable @typescript-eslint/no-explicit-any */
type MediaLinkDelegate = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

async function addMediaLink(
  delegate: MediaLinkDelegate,
  foreignKeyField: string,
  foreignKeyValue: string,
  mediaId: string
) {
  await requireAdmin();
  const count = await delegate.count({ where: { [foreignKeyField]: foreignKeyValue } });
  await delegate.create({ data: { [foreignKeyField]: foreignKeyValue, mediaId, order: count } });
}

async function removeMediaLink(delegate: MediaLinkDelegate, linkId: string) {
  await requireAdmin();
  await delegate.delete({ where: { id: linkId } });
}

async function updateMediaLinkCaption(delegate: MediaLinkDelegate, linkId: string, caption: string) {
  await requireAdmin();
  await delegate.update({ where: { id: linkId }, data: { caption: caption || null } });
}

async function moveMediaLink(
  delegate: MediaLinkDelegate,
  foreignKeyField: string,
  linkId: string,
  direction: "up" | "down"
) {
  await requireAdmin();
  const current = await delegate.findUnique({ where: { id: linkId } });
  if (!current) return;

  const siblings = await delegate.findMany({
    where: { [foreignKeyField]: current[foreignKeyField] },
    orderBy: { order: "asc" }
  });
const index = siblings.findIndex((s: { id: string }) => s.id === linkId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];
  await Promise.all([
    delegate.update({ where: { id: a.id }, data: { order: b.order } }),
    delegate.update({ where: { id: b.id }, data: { order: a.order } })
  ]);
}

// Actualités
export async function addArticleMedia(articleId: string, mediaId: string) {
  await addMediaLink(prisma.articleMedia, "articleId", articleId, mediaId);
  revalidatePath(`/admin/actualites/${articleId}`);
}
export async function removeArticleMedia(linkId: string) {
  await removeMediaLink(prisma.articleMedia, linkId);
  revalidatePath("/admin/actualites");
}
export async function moveArticleMedia(linkId: string, direction: "up" | "down") {
  await moveMediaLink(prisma.articleMedia, "articleId", linkId, direction);
  revalidatePath("/admin/actualites");
}
export async function updateArticleMediaCaption(linkId: string, caption: string) {
  await updateMediaLinkCaption(prisma.articleMedia, linkId, caption);
}

// Projets
export async function addProjectMedia(projectId: string, mediaId: string) {
  await addMediaLink(prisma.projectMedia, "projectId", projectId, mediaId);
  revalidatePath(`/admin/projets/${projectId}`);
}
export async function removeProjectMedia(linkId: string) {
  await removeMediaLink(prisma.projectMedia, linkId);
  revalidatePath("/admin/projets");
}
export async function moveProjectMedia(linkId: string, direction: "up" | "down") {
  await moveMediaLink(prisma.projectMedia, "projectId", linkId, direction);
  revalidatePath("/admin/projets");
}
export async function updateProjectMediaCaption(linkId: string, caption: string) {
  await updateMediaLinkCaption(prisma.projectMedia, linkId, caption);
}

// Événements sportifs
export async function addSportEventMedia(sportEventId: string, mediaId: string) {
  await addMediaLink(prisma.sportEventMedia, "sportEventId", sportEventId, mediaId);
  revalidatePath("/admin/evenements-sportifs");
}
export async function removeSportEventMedia(linkId: string) {
  await removeMediaLink(prisma.sportEventMedia, linkId);
  revalidatePath("/admin/evenements-sportifs");
}
export async function moveSportEventMedia(linkId: string, direction: "up" | "down") {
  await moveMediaLink(prisma.sportEventMedia, "sportEventId", linkId, direction);
  revalidatePath("/admin/evenements-sportifs");
}
export async function updateSportEventMediaCaption(linkId: string, caption: string) {
  await updateMediaLinkCaption(prisma.sportEventMedia, linkId, caption);
}

// Actions de terrain
export async function addFieldActionMedia(fieldActionId: string, mediaId: string) {
  await addMediaLink(prisma.fieldActionMedia, "fieldActionId", fieldActionId, mediaId);
  revalidatePath("/admin/actions-terrain");
}
export async function removeFieldActionMedia(linkId: string) {
  await removeMediaLink(prisma.fieldActionMedia, linkId);
  revalidatePath("/admin/actions-terrain");
}
export async function moveFieldActionMedia(linkId: string, direction: "up" | "down") {
  await moveMediaLink(prisma.fieldActionMedia, "fieldActionId", linkId, direction);
  revalidatePath("/admin/actions-terrain");
}
export async function updateFieldActionMediaCaption(linkId: string, caption: string) {
  await updateMediaLinkCaption(prisma.fieldActionMedia, linkId, caption);
}

export async function deleteMedia(id: string) {
  await requireAdmin();
  // NOTE: on ne supprime pas le fichier physique ici pour rester prudent
  // (il peut être référencé ailleurs par une simple copie d'URL) — seule la
  // fiche de la médiathèque est retirée. Un nettoyage de /public/uploads
  // peut être fait manuellement ou via une tâche dédiée en production.
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/medias");
}

export async function updateMediaMeta(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.media.update({
    where: { id },
    data: {
      altText: String(formData.get("altText") ?? "") || null,
      caption: String(formData.get("caption") ?? "") || null
    }
  });
  revalidatePath("/admin/medias");
}

// --- Hero slider ----------------------------------------------------------

export async function createHeroSlide(formData: FormData) {
  await requireAdmin();

  const count = await prisma.heroSlide.count();

  await prisma.heroSlide.create({
    data: {
      order: count,
      label: String(formData.get("label") ?? "") || null,
      title: String(formData.get("title") ?? ""),
      subtitle: String(formData.get("subtitle") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      imageDesktopUrl: String(formData.get("imageDesktopUrl") ?? "") || null,
      imageMobileUrl: String(formData.get("imageMobileUrl") ?? "") || null,
      primaryButtonText: String(formData.get("primaryButtonText") ?? "") || null,
      primaryButtonLink: String(formData.get("primaryButtonLink") ?? "") || null,
      secondaryButtonText: String(formData.get("secondaryButtonText") ?? "") || null,
      secondaryButtonLink: String(formData.get("secondaryButtonLink") ?? "") || null,
      quote: String(formData.get("quote") ?? "") || null,
      durationMs: Number(formData.get("durationMs") ?? 7000) || 7000,
      active: formData.get("active") === "on"
    }
  });

  revalidatePath("/admin/slider");
  revalidatePath("/");
  redirect("/admin/slider");
}

export async function updateHeroSlide(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.heroSlide.update({
    where: { id },
    data: {
      label: String(formData.get("label") ?? "") || null,
      title: String(formData.get("title") ?? ""),
      subtitle: String(formData.get("subtitle") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      imageDesktopUrl: String(formData.get("imageDesktopUrl") ?? "") || null,
      imageMobileUrl: String(formData.get("imageMobileUrl") ?? "") || null,
      primaryButtonText: String(formData.get("primaryButtonText") ?? "") || null,
      primaryButtonLink: String(formData.get("primaryButtonLink") ?? "") || null,
      secondaryButtonText: String(formData.get("secondaryButtonText") ?? "") || null,
      secondaryButtonLink: String(formData.get("secondaryButtonLink") ?? "") || null,
      quote: String(formData.get("quote") ?? "") || null,
      durationMs: Number(formData.get("durationMs") ?? 7000) || 7000,
      active: formData.get("active") === "on"
    }
  });

  revalidatePath("/admin/slider");
  revalidatePath("/");
  redirect("/admin/slider");
}

export async function deleteHeroSlide(id: string) {
  await requireAdmin();
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/admin/slider");
  revalidatePath("/");
}

export async function toggleHeroSlideActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  revalidatePath("/admin/slider");
  revalidatePath("/");
}

export async function moveHeroSlide(id: string, direction: "up" | "down") {
  await requireAdmin();

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= slides.length) return;

  const a = slides[index];
  const b = slides[swapWith];

  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.heroSlide.update({ where: { id: b.id }, data: { order: a.order } })
  ]);

  revalidatePath("/admin/slider");
  revalidatePath("/");
}
