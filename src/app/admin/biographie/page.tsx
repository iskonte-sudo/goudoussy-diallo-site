import { prisma } from "@/lib/prisma";
import { updateBiography, updateResponsibility } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function AdminBiographiePage() {
  const [bio, responsibilities] = await Promise.all([
    prisma.biography.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" }
    }),
    prisma.responsibility.findMany({ orderBy: { order: "asc" } })
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Biographie &amp; Responsabilités</h1>

      <section className="mb-14">
        <h2 className="mb-4 font-display text-lg font-bold">Texte de la biographie</h2>
        <p className="mb-5 text-sm text-ink-soft">
          Ces champs alimentent la page publique <code>/biographie</code>. Laissez un champ vide s&apos;il n&apos;y a
          rien à publier pour le moment plutôt que d&apos;inventer une information.
        </p>
        <form action={updateBiography} className="flex flex-col gap-4">
          <MediaPicker name="portraitUrl" label="Photo de portrait" defaultValue={bio.portraitUrl} />
          <MediaPicker name="secondaryImageUrl" label="Image secondaire (optionnel)" defaultValue={bio.secondaryImageUrl} />
          <Field label="Présentation">
            <textarea name="presentation" defaultValue={bio.presentation} rows={3} className="input" />
          </Field>
          <Field label="Parcours">
            <textarea name="parcours" defaultValue={bio.parcours} rows={3} className="input" />
          </Field>
          <Field label="Formation">
            <textarea name="formation" defaultValue={bio.formation} rows={2} className="input" />
          </Field>
          <Field label="Expériences">
            <textarea name="experiences" defaultValue={bio.experiences} rows={3} className="input" />
          </Field>
          <Field label="Engagements">
            <textarea name="engagements" defaultValue={bio.engagements} rows={3} className="input" />
          </Field>
          <Field label="Vision">
            <textarea name="vision" defaultValue={bio.vision} rows={2} className="input" />
          </Field>
          <Field label="Valeurs">
            <textarea name="valeurs" defaultValue={bio.valeurs} rows={2} className="input" />
          </Field>
          <Field label="Citation (optionnel)">
            <input name="citation" defaultValue={bio.citation ?? ""} className="input" />
          </Field>

          <div className="rounded-md border border-dashed border-line bg-offwhite p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Note interne — jamais affichée sur le site public
            </p>
            <textarea
              name="internalNameNote"
              defaultValue={bio.internalNameNote}
              rows={2}
              className="input bg-white"
              placeholder="Ex : nom complet à confirmer avant publication définitive"
            />
          </div>

          <button type="submit" className="btn btn-red mt-2 w-fit">Enregistrer la biographie</button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold">Responsabilités</h2>
        <p className="mb-5 text-sm text-ink-soft">
          Chaque fonction est affichée sur l&apos;accueil et la page Biographie. Le niveau de confiance permet de
          marquer une information comme &laquo;&nbsp;à confirmer&nbsp;&raquo; tant qu&apos;elle n&apos;est pas
          définitivement validée — cette mention reste interne, elle n&apos;apparaît jamais sur le site public.
        </p>
        <div className="flex flex-col gap-8">
          {responsibilities.map((r) => (
            <form
              key={r.id}
              action={updateResponsibility.bind(null, r.id)}
              className="rounded-lg border border-line p-5"
            >
 <Field label="Titre">
  <input name="title" defaultValue={r.title} className="input" />
</Field>

<div className="h-4" />

<MediaPicker
  name="imageUrl"
  label="Photo de fond"
  defaultValue={r.imageUrl}
  triggerLabel="Choisir la photo de fond"
/>

<div className="h-3" />

<Field label="Description">
  <textarea
    name="description"
    defaultValue={r.description}
    rows={2}
    className="input"
  />
</Field>

              <div className="h-3" />
              <Field label="Niveau de confiance (interne)">
                <select name="confidence" defaultValue={r.confidence} className="input">
                  <option value="ELEVEE">Élevée (sourcé, vérifié)</option>
                  <option value="A_CONFIRMER">À confirmer</option>
                </select>
              </Field>
              {r.sourceNote && (
                <p className="mt-3 text-xs text-ink-soft">Note de source : {r.sourceNote}</p>
              )}
              <button type="submit" className="btn btn-outline mt-4 w-fit">
                Mettre à jour
              </button>
            </form>
          ))}
        </div>
      </section>
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
