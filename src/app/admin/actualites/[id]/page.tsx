import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateArticle,
  addArticleMedia,
  removeArticleMedia,
  moveArticleMedia,
  updateArticleMediaCaption
} from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { media: { include: { media: true }, orderBy: { order: "asc" } } }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!article) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Modifier l&apos;article</h1>
        {article.status === "PUBLIE" && (
          <Link href={`/actualites/${article.slug}`} target="_blank" className="text-sm font-semibold text-navy">
            Aperçu →
          </Link>
        )}
      </div>
      <form action={updateArticle.bind(null, article.id)} className="flex flex-col gap-4">
        <Field label="Titre">
          <input name="title" defaultValue={article.title} required className="input" />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={article.slug} className="input" />
        </Field>
        <Field label="Résumé">
          <textarea name="excerpt" defaultValue={article.excerpt} rows={2} required className="input" />
        </Field>

        <RichTextEditor name="content" label="Contenu" defaultValue={article.content} />

        <MediaPicker name="coverImageUrl" label="Image principale" defaultValue={article.coverImageUrl} />
        <Field label="Texte alternatif (ALT) de l'image">
          <input name="coverImageAlt" defaultValue={article.coverImageAlt ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select name="categoryId" defaultValue={article.categoryId ?? ""} className="input">
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Auteur">
            <input name="author" defaultValue={article.author} className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de publication">
            <input
              name="publishedAt"
              type="date"
              defaultValue={article.publishedAt ? article.publishedAt.toISOString().slice(0, 10) : ""}
              className="input"
            />
          </Field>
          <Field label="Statut">
            <select name="status" defaultValue={article.status} className="input">
              <option value="BROUILLON">Brouillon</option>
              <option value="A_VALIDER">À valider</option>
              <option value="PUBLIE">Publié</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={article.featured} /> Article à la une
        </label>

        <div className="mt-2 flex flex-col gap-4 border-t border-line pt-5">
          <h2 className="font-display text-base font-bold">SEO</h2>
          <Field label="Titre SEO">
            <input name="seoTitle" defaultValue={article.seoTitle ?? ""} className="input" />
          </Field>
          <Field label="Meta description">
            <textarea name="seoDescription" defaultValue={article.seoDescription ?? ""} rows={2} className="input" />
          </Field>
          <Field label="Mots-clés (séparés par des virgules)">
            <input name="seoKeywords" defaultValue={article.seoKeywords ?? ""} className="input" />
          </Field>
        </div>

        {article.isDemoContent && (
          <p className="demo-flag w-fit">Contenu de démonstration</p>
        )}

        <button type="submit" className="btn btn-red mt-2 w-fit">
          Enregistrer les modifications
        </button>
      </form>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Médias de l&apos;actualité</h2>
        <MediaGalleryManager
          items={article.media.map((m) => ({ id: m.id, order: m.order, caption: m.caption, media: m.media }))}
          onAdd={async (mediaId) => {
            "use server";
            await addArticleMedia(article.id, mediaId);
          }}
          onRemove={removeArticleMedia}
          onMove={moveArticleMedia}
          onUpdateCaption={updateArticleMediaCaption}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}
