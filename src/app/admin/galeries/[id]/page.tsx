import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function AdminGalleryDetailPage({ params }: { params: { id: string } }) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } }
  });
  if (!gallery) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-extrabold">{gallery.title}</h1>
      <p className="mb-8 text-sm text-ink-soft">{gallery.category}</p>

      <div className="mb-10 grid grid-cols-4 gap-4 max-[700px]:grid-cols-2">
        {gallery.images.map((img) => (
          <div key={img.id} className="group relative">
            <Image
              src={img.url}
              alt={img.altText ?? ""}
              width={200}
              height={200}
              className="aspect-square w-full rounded-md object-cover"
            />
            <form action={deleteGalleryImage.bind(null, img.id, gallery.id)}>
              <button className="mt-1 text-xs font-semibold text-red">Supprimer</button>
            </form>
          </div>
        ))}
        {gallery.images.length === 0 && (
          <p className="col-span-full text-sm text-ink-soft">Aucune photo dans cette galerie pour le moment.</p>
        )}
      </div>

      <section className="rounded-lg border border-line bg-offwhite p-6">
        <h2 className="mb-2 font-display text-lg font-bold">
          Ajouter une photo
        </h2>
        <p className="mb-6 text-sm text-ink-soft">
          Sélectionnez une photo dans la médiathèque ou importez-la directement depuis votre ordinateur.
        </p>
        <form
          action={addGalleryImage.bind(null, gallery.id)}
          className="flex flex-col gap-5"
        >
          <MediaPicker
            name="url"
            label="Photo"
            mode="image"
            triggerLabel="Choisir ou importer une photo"
          />
          <input
            name="caption"
            placeholder="Légende (optionnel)"
            className="input"
          />
          <input
            name="altText"
            placeholder="Texte alternatif SEO (optionnel)"
            className="input"
          />
          <button type="submit" className="btn btn-red w-fit">
            Ajouter la photo
          </button>
        </form>
      </section>
    </div>
  );
}
