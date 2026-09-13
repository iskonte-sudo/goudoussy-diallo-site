import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateHeroSlide } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function EditHeroSlidePage({ params }: { params: { id: string } }) {
  const slide = await prisma.heroSlide.findUnique({ where: { id: params.id } });
  if (!slide) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Modifier la diapositive</h1>
      <form action={updateHeroSlide.bind(null, slide.id)} className="flex flex-col gap-4">
        <input name="label" defaultValue={slide.label ?? ""} placeholder="Sur-titre" className="input" />
        <input name="title" defaultValue={slide.title} required placeholder="Titre principal" className="input" />
        <input name="subtitle" defaultValue={slide.subtitle ?? ""} placeholder="Sous-titre" className="input" />
        <textarea name="description" defaultValue={slide.description ?? ""} rows={2} placeholder="Description" className="input" />
        <MediaPicker name="imageDesktopUrl" label="Image (desktop)" defaultValue={slide.imageDesktopUrl} />
        <MediaPicker name="imageMobileUrl" label="Image (mobile — optionnel)" defaultValue={slide.imageMobileUrl} />
        <div className="grid grid-cols-2 gap-4">
          <input name="primaryButtonText" defaultValue={slide.primaryButtonText ?? ""} placeholder="Texte bouton principal" className="input" />
          <input name="primaryButtonLink" defaultValue={slide.primaryButtonLink ?? ""} placeholder="Lien bouton principal" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="secondaryButtonText" defaultValue={slide.secondaryButtonText ?? ""} placeholder="Texte bouton secondaire" className="input" />
          <input name="secondaryButtonLink" defaultValue={slide.secondaryButtonLink ?? ""} placeholder="Lien bouton secondaire" className="input" />
        </div>
        <input name="quote" defaultValue={slide.quote ?? ""} placeholder="Citation flottante" className="input" />
        <label className="flex flex-col gap-1.5 text-sm">
          Durée d&apos;affichage (millisecondes)
          <input name="durationMs" type="number" defaultValue={slide.durationMs} className="input" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={slide.active} /> Actif (visible sur le site)
        </label>
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
    </div>
  );
}
