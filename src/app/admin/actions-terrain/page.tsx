import { prisma } from "@/lib/prisma";
import { createFieldAction, deleteFieldAction, updateFieldActionStatus } from "@/lib/actions";
import StatusSelect from "@/components/admin/StatusSelect";
import MediaPicker from "@/components/admin/MediaPicker";
import Link from "next/link";

export default async function AdminActionsTerrainPage() {
  const actions = await prisma.fieldAction.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Actions de terrain</h1>

      {actions.length > 0 && (
        <table className="mb-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3">Titre</th>
              <th className="py-3">Lieu</th>
              <th className="py-3">Statut</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id} className="border-b border-line">
                <td className="py-3 font-semibold">{a.title}</td>
                <td className="py-3 text-ink-soft">{a.location}</td>
                <td className="py-3">
                  <StatusSelect
                    currentStatus={a.status}
                    onChangeStatus={updateFieldActionStatus.bind(null, a.id)}
                  />
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/actions-terrain/${a.id}`} className="text-xs font-semibold text-navy">Modifier</Link>
                    <form action={deleteFieldAction.bind(null, a.id)}>
                      <button className="text-xs font-semibold text-red">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Nouvelle action de terrain</h2>
      <form action={createFieldAction} className="flex flex-col gap-4">
        <input name="title" placeholder="Titre" required className="input" />
        <textarea name="description" placeholder="Description" rows={3} required className="input" />
        <MediaPicker name="imageUrl" label="Image" />
        <input name="location" placeholder="Lieu" required className="input" />
        <select name="status" defaultValue="BROUILLON" className="input">
          <option value="BROUILLON">Brouillon</option>
          <option value="A_VALIDER">À valider</option>
          <option value="PUBLIE">Publié</option>
          <option value="ARCHIVE">Archivé</option>
        </select>
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
    </div>
  );
}
