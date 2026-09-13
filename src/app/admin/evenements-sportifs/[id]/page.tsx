import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateSportEvent,
  addSportEventMedia,
  removeSportEventMedia,
  moveSportEventMedia,
  updateSportEventMediaCaption
} from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";

export default async function EditSportEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.sportEvent.findUnique({
    where: { id: params.id },
    include: { media: { include: { media: true }, orderBy: { order: "asc" } } }
  });
  if (!event) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Modifier l&apos;événement</h1>
      <form action={updateSportEvent.bind(null, event.id)} className="flex flex-col gap-4">
        <input name="title" defaultValue={event.title} required className="input" />
        <textarea name="description" defaultValue={event.description} rows={3} required className="input" />
        <MediaPicker name="imageUrl" label="Image principale" defaultValue={event.imageUrl} />
        <div className="grid grid-cols-2 gap-4">
          <input name="type" defaultValue={event.type ?? ""} placeholder="Type d'événement" className="input" />
          <input name="location" defaultValue={event.location ?? ""} placeholder="Lieu" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="date" type="date" defaultValue={event.date ? event.date.toISOString().slice(0, 10) : ""} className="input" />
          <select name="status" defaultValue={event.status} className="input">
            <option value="BROUILLON">Brouillon</option>
            <option value="PUBLIE">Publié</option>
            <option value="ARCHIVE">Archivé</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={event.active} /> Actif
        </label>
        <button type="submit" className="btn btn-red mt-2 w-fit">Enregistrer les modifications</button>
      </form>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Médias de l&apos;événement</h2>
        <MediaGalleryManager
          items={event.media.map((m) => ({ id: m.id, order: m.order, caption: m.caption, media: m.media }))}
          onAdd={async (mediaId) => {
            "use server";
            await addSportEventMedia(event.id, mediaId);
          }}
          onRemove={removeSportEventMedia}
          onMove={moveSportEventMedia}
          onUpdateCaption={updateSportEventMediaCaption}
        />
      </div>
    </div>
  );
}
