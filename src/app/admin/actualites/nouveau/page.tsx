import { prisma } from "@/lib/prisma";
import { createArticle } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Nouvel article</h1>
      <form action={createArticle} className="flex flex-col gap-4">
        <Field label="Titre">
          <input name="title" required className="input" />
        </Field>
        <Field label="Slug (laisser vide pour le générer automatiquement)">
          <input name="slug" placeholder="genere-automatiquement-si-vide" className="input" />
        </Field>
        <Field label="Résumé">
          <textarea name="excerpt" rows={2} required className="input" />
        </Field>

        <RichTextEditor name="content" label="Contenu" />

        <MediaPicker name="coverImageUrl" label="Image principale" />
        <Field label="Texte alternatif (ALT) de l'image">
          <input name="coverImageAlt" className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Catégorie">
            <select name="categoryId" className="input">
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Auteur">
            <input name="author" defaultValue="Goudoussy Diallo" className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date de publication">
            <input name="publishedAt" type="date" className="input" />
          </Field>
          <Field label="Statut">
            <select name="status" defaultValue="BROUILLON" className="input">
              <option value="BROUILLON">Brouillon</option>
              <option value="A_VALIDER">À valider</option>
              <option value="PUBLIE">Publié</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Article à la une
        </label>

        <div className="mt-2 flex flex-col gap-4 border-t border-line pt-5">
          <h2 className="font-display text-base font-bold">SEO</h2>
          <Field label="Titre SEO">
            <input name="seoTitle" className="input" />
          </Field>
          <Field label="Meta description">
            <textarea name="seoDescription" rows={2} className="input" />
          </Field>
          <Field label="Mots-clés (séparés par des virgules)">
            <input name="seoKeywords" className="input" />
          </Field>
        </div>

        <button type="submit" className="btn btn-red mt-2 w-fit">
          Enregistrer
        </button>
      </form>
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
