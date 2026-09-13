import { prisma } from "@/lib/prisma";
import { createSportEvent, deleteSportEvent } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import Link from "next/link";

export default async function AdminSportEventsPage() {
  const events = await prisma.sportEvent.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Événements sportifs</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Alimentent la page publique <code>/sport-jeunesse</code>.
      </p>

      {events.length > 0 && (
        <table className="mb-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3">Titre</th>
              <th className="py-3">Type</th>
              <th className="py-3">Lieu</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-line">
                <td className="py-3 font-semibold">{e.title}</td>
                <td className="py-3 text-ink-soft">{e.type ?? "—"}</td>
                <td className="py-3 text-ink-soft">{e.location ?? "—"}</td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/evenements-sportifs/${e.id}`} className="text-xs font-semibold text-navy">Modifier</Link>
                    <form action={deleteSportEvent.bind(null, e.id)}>
                      <button className="text-xs font-semibold text-red">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Nouvel événement</h2>
      <form action={createSportEvent} className="flex flex-col gap-4">
        <input name="title" placeholder="Titre" required className="input" />
        <textarea name="description" placeholder="Description" rows={3} required className="input" />
        <MediaPicker name="imageUrl" label="Image" />
        <div className="grid grid-cols-2 gap-4">
          <input name="type" placeholder="Type d'événement (tournoi, sélection...)" className="input" />
          <input name="location" placeholder="Lieu" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="date" type="date" className="input" />
          <select name="status" defaultValue="BROUILLON" className="input">
            <option value="BROUILLON">Brouillon</option>
            <option value="PUBLIE">Publié</option>
            <option value="ARCHIVE">Archivé</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked /> Actif
        </label>
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
    </div>
  );
}
