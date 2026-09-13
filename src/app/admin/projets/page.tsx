import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProject, deleteProject } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function AdminProjetsPage() {
  const [projects, categories] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Projets</h1>

      {projects.length > 0 && (
        <table className="mb-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3">Titre</th>
              <th className="py-3">Statut</th>
              <th className="py-3">Lieu</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-3 font-semibold">
                  {p.title}
                  {p.isDemoContent && <span className="ml-2 demo-flag align-middle">Démo</span>}
                </td>
                <td className="py-3 text-ink-soft">{p.status}</td>
                <td className="py-3 text-ink-soft">{p.location}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/projets/${p.id}`} className="text-xs font-semibold text-navy">Modifier</Link>
                    <Link href={`/projets/${p.slug}`} target="_blank" className="text-xs font-semibold text-ink-soft">Aperçu</Link>
                    <form action={deleteProject.bind(null, p.id)}>
                      <button className="text-xs font-semibold text-red">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Nouveau projet</h2>
      <form action={createProject} className="flex flex-col gap-4">
        <input name="title" placeholder="Titre" required className="input" />
        <input name="slug" placeholder="Slug (généré automatiquement si vide)" className="input" />
        <textarea name="description" placeholder="Description" rows={3} required className="input" />
        <textarea name="objective" placeholder="Objectif (optionnel)" rows={2} className="input" />
        <textarea name="results" placeholder="Résultats (optionnel)" rows={2} className="input" />
        <MediaPicker name="coverImageUrl" label="Image principale" />
        <div className="grid grid-cols-2 gap-4">
          <input name="location" placeholder="Lieu" className="input" />
          <input name="date" type="date" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="categoryId" className="input">
            <option value="">— Catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="status" defaultValue="EN_PREPARATION" className="input">
            <option value="EN_PREPARATION">En préparation</option>
            <option value="EN_COURS">En cours</option>
            <option value="REALISE">Réalisé</option>
            <option value="TERMINE">Terminé</option>
          </select>
        </div>
        <input name="videoUrl" placeholder="URL vidéo (optionnel)" className="input" />
        <input name="externalLink" placeholder="Lien externe (optionnel)" className="input" />
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
    </div>
  );
}
