import { prisma } from "@/lib/prisma";
import { createMenuItem, deleteMenuItem, moveMenuItem, updateMenuItem } from "@/lib/actions";
import ActiveToggle from "@/components/admin/ActiveToggle";

export default async function AdminMenuPage() {
  const items = await prisma.menuItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Menu principal</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Ce menu alimente directement l&apos;en-tête du site public — plus aucun lien n&apos;y est codé en dur.
      </p>

      <div className="mb-10 flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.id} className="rounded-lg border border-line p-4">
            <form action={updateMenuItem.bind(null, item.id)} className="flex flex-wrap items-center gap-3">
              <input name="label" defaultValue={item.label} placeholder="Libellé" className="input flex-1" />
              <input name="url" defaultValue={item.url} placeholder="/url" className="input flex-1" />
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" name="newTab" defaultChecked={item.newTab} /> Nouvel onglet
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" name="active" defaultChecked={item.active} /> Actif
              </label>
              <button type="submit" className="btn btn-outline text-xs">Enregistrer</button>
            </form>
            <div className="mt-3 flex items-center gap-4">
              <ActiveToggle active={item.active} onToggle={async (active) => {
                "use server";
                const fd = new FormData();
                fd.set("label", item.label);
                fd.set("url", item.url);
                if (item.newTab) fd.set("newTab", "on");
                if (active) fd.set("active", "on");
                await updateMenuItem(item.id, fd);
              }} />
              <form action={moveMenuItem.bind(null, item.id, "up")}>
                <button disabled={i === 0} className="text-xs text-ink-soft disabled:opacity-30">▲ Monter</button>
              </form>
              <form action={moveMenuItem.bind(null, item.id, "down")}>
                <button disabled={i === items.length - 1} className="text-xs text-ink-soft disabled:opacity-30">▼ Descendre</button>
              </form>
              <form action={deleteMenuItem.bind(null, item.id)}>
                <button className="text-xs font-semibold text-red">Supprimer</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-lg font-bold">Ajouter un élément</h2>
      <form action={createMenuItem} className="flex flex-wrap items-center gap-3">
        <input name="label" placeholder="Libellé" required className="input flex-1" />
        <input name="url" placeholder="/url" required className="input flex-1" />
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" name="newTab" /> Nouvel onglet
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" name="active" defaultChecked /> Actif
        </label>
        <button type="submit" className="btn btn-red text-xs">Ajouter</button>
      </form>
    </div>
  );
}
