import { prisma } from "@/lib/prisma";
import { updateHomepageSection, moveHomepageSection } from "@/lib/actions";
import ActiveToggle from "@/components/admin/ActiveToggle";

export default async function AdminAccueilPage() {
  const sections = await prisma.homepageSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Page d&apos;accueil</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Activez, désactivez, réordonnez et titrez chaque section de la homepage. Le contenu détaillé de chaque
        section (articles, projets, responsabilités…) se gère depuis son propre module.
      </p>

      <div className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <div key={s.id} className="rounded-lg border border-line p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">{s.key}</span>
              <div className="flex items-center gap-3">
                <ActiveToggle
                  active={s.enabled}
                  onToggle={async (enabled) => {
                    "use server";
                    const fd = new FormData();
                    fd.set("enabled", enabled ? "on" : "off");
                    fd.set("title", s.title ?? "");
                    fd.set("subtitle", s.subtitle ?? "");
                    await updateHomepageSection(s.id, fd);
                  }}
                />
                <form action={moveHomepageSection.bind(null, s.id, "up")}>
                  <button disabled={i === 0} className="text-xs text-ink-soft disabled:opacity-30">▲</button>
                </form>
                <form action={moveHomepageSection.bind(null, s.id, "down")}>
                  <button disabled={i === sections.length - 1} className="text-xs text-ink-soft disabled:opacity-30">▼</button>
                </form>
              </div>
            </div>
            <form action={updateHomepageSection.bind(null, s.id)} className="flex flex-col gap-2">
              <input type="hidden" name="enabled" value={s.enabled ? "on" : "off"} />
              <input name="title" defaultValue={s.title ?? ""} placeholder="Titre de la section" className="input text-sm" />
              <input name="subtitle" defaultValue={s.subtitle ?? ""} placeholder="Sur-titre (optionnel)" className="input text-sm" />
              <button type="submit" className="btn btn-outline w-fit text-xs">Enregistrer le titre</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
