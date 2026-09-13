import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { deleteHeroSlide, moveHeroSlide, toggleHeroSlideActive, createHeroSlide } from "@/lib/actions";
import ActiveToggle from "@/components/admin/ActiveToggle";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function AdminSliderPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Slider / Hero de l&apos;accueil</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Ces diapositives alimentent directement le hero de la page d&apos;accueil. S&apos;il n&apos;y en a aucune,
        le site affiche un contenu de secours propre plutôt qu&apos;un espace vide.
      </p>

      {slides.length > 0 && (
        <div className="mb-12 flex flex-col gap-4">
          {slides.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4 rounded-lg border border-line p-4">
              <div className="h-16 w-24 flex-none overflow-hidden rounded bg-offwhite">
                {s.imageDesktopUrl ? (
                  <Image src={s.imageDesktopUrl} alt="" width={120} height={80} className="h-full w-full object-cover" />
                ) : (
                  <div className="card-photo-placeholder h-full w-full text-[0.6rem]">Sans image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {s.label && <div className="text-[0.68rem] font-bold uppercase text-red">{s.label}</div>}
                <div className="truncate font-display font-bold">{s.title}</div>
              </div>
              <ActiveToggle active={s.active} onToggle={toggleHeroSlideActive.bind(null, s.id)} />
              <div className="flex flex-col gap-1">
                <form action={moveHeroSlide.bind(null, s.id, "up")}>
                  <button disabled={i === 0} className="text-xs text-ink-soft disabled:opacity-30">▲</button>
                </form>
                <form action={moveHeroSlide.bind(null, s.id, "down")}>
                  <button disabled={i === slides.length - 1} className="text-xs text-ink-soft disabled:opacity-30">▼</button>
                </form>
              </div>
              <a href={`/admin/slider/${s.id}`} className="text-xs font-semibold text-navy">Modifier</a>
              <form action={deleteHeroSlide.bind(null, s.id)}>
                <button className="text-xs font-semibold text-red">Supprimer</button>
              </form>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Nouvelle diapositive</h2>
      <form action={createHeroSlide} className="flex flex-col gap-4">
        <input name="label" placeholder="Sur-titre (ex : BIENVENUE SUR LE SITE OFFICIEL)" className="input" />
        <input name="title" placeholder="Titre principal" required className="input" />
        <input name="subtitle" placeholder="Sous-titre" className="input" />
        <textarea name="description" placeholder="Description" rows={2} className="input" />
        <MediaPicker name="imageDesktopUrl" label="Image (desktop)" />
        <MediaPicker name="imageMobileUrl" label="Image (mobile — optionnel)" />
        <div className="grid grid-cols-2 gap-4">
          <input name="primaryButtonText" placeholder="Texte du bouton principal" className="input" />
          <input name="primaryButtonLink" placeholder="Lien du bouton principal (ex: /biographie)" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="secondaryButtonText" placeholder="Texte du bouton secondaire" className="input" />
          <input name="secondaryButtonLink" placeholder="Lien du bouton secondaire" className="input" />
        </div>
        <input name="quote" placeholder="Citation flottante (optionnel)" className="input" />
        <label className="flex flex-col gap-1.5 text-sm">
          Durée d&apos;affichage (millisecondes)
          <input name="durationMs" type="number" defaultValue={7000} className="input" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked /> Actif (visible sur le site)
        </label>
        <button type="submit" className="btn btn-red w-fit">Créer la diapositive</button>
      </form>
    </div>
  );
}
