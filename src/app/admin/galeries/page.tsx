import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createGallery, deleteGallery } from "@/lib/actions";

export default async function AdminGaleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } }
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Galeries</h1>

      {galleries.length > 0 && (
        <table className="mb-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3">Titre</th>
              <th className="py-3">Catégorie</th>
              <th className="py-3">Photos</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((g) => (
              <tr key={g.id} className="border-b border-line">
                <td className="py-3 font-semibold">
                  {g.title}
                </td>
                <td className="py-3 text-ink-soft">{g.category}</td>
                <td className="py-3 text-ink-soft">{g._count.images}</td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/galeries/${g.id}`}
                      className="text-xs font-semibold text-ink hover:text-red"
                    >
                      Gérer les photos
                    </Link>
                    <form action={deleteGallery.bind(null, g.id)}>
                      <button type="submit" className="text-xs font-semibold text-red">
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Nouvelle galerie</h2>
      <form action={createGallery} className="flex flex-col gap-4">
        <input name="title" placeholder="Titre (ex : Sport, Rencontres, Afrique...)" required className="input" />
<select name="category" required className="input">
  <option value="">Choisir une catégorie</option>
  <option value="Portraits">Portraits</option>
  <option value="Institutions">Institutions</option>
  <option value="Mini-Football">Mini-Football</option>
  <option value="Jeunesse">Jeunesse</option>
  <option value="Terrain">Terrain</option>
  <option value="Afrique">Afrique</option>
</select>        <button type="submit" className="btn btn-red w-fit">Créer la galerie</button>
      </form>
    </div>
  );
}
