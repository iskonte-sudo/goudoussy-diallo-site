import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteArticle, updateArticleStatus } from "@/lib/actions";
import StatusSelect from "@/components/admin/StatusSelect";

export default async function AdminActualitesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Actualités</h1>
        <Link href="/admin/actualites/nouveau" className="btn btn-red">
          + Nouvel article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun article pour le moment.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3"></th>
              <th className="py-3">Titre</th>
              <th className="py-3">Catégorie</th>
              <th className="py-3">Date</th>
              <th className="py-3">Statut</th>
              <th className="py-3">À la une</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b border-line">
                <td className="py-3">
                  <div className="h-12 w-16 overflow-hidden rounded bg-offwhite">
                    {a.coverImageUrl && (
                      <Image src={a.coverImageUrl} alt="" width={64} height={48} className="h-full w-full object-cover" />
                    )}
                  </div>
                </td>
                <td className="py-3 font-semibold">
                  {a.title}
                  {a.isDemoContent && <span className="ml-2 demo-flag align-middle">Démo</span>}
                </td>
                <td className="py-3 text-ink-soft">{a.category?.name ?? "—"}</td>
                <td className="py-3 text-ink-soft">
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="py-3">
                  <StatusSelect
                    currentStatus={a.status}
                    onChangeStatus={updateArticleStatus.bind(null, a.id)}
                  />
                </td>
                <td className="py-3">{a.featured ? "★" : ""}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/actualites/${a.id}`} className="text-xs font-semibold text-navy">
                      Modifier
                    </Link>
                    {a.status === "PUBLIE" && (
                      <Link href={`/actualites/${a.slug}`} target="_blank" className="text-xs font-semibold text-ink-soft">
                        Aperçu
                      </Link>
                    )}
                    <form action={deleteArticle.bind(null, a.id)}>
                      <button className="text-xs font-semibold text-red">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
