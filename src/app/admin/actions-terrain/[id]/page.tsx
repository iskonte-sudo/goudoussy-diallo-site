import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateFieldAction,
  addFieldActionMedia,
  removeFieldActionMedia,
  moveFieldActionMedia,
  updateFieldActionMediaCaption
} from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";

export default async function EditFieldActionPage({ params }: { params: { id: string } }) {
  const action = await prisma.fieldAction.findUnique({
    where: { id: params.id },
    include: { media: { include: { media: true }, orderBy: { order: "asc" } } }
  });
  if (!action) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Modifier l&apos;action de terrain</h1>
      <form action={updateFieldAction.bind(null, action.id)} className="flex flex-col gap-4">
        <input name="title" defaultValue={action.title} required className="input" />
        <textarea name="description" defaultValue={action.description} rows={3} required className="input" />
        <MediaPicker name="imageUrl" label="Image principale" defaultValue={action.imageUrl} />
        <input name="location" defaultValue={action.location} required className="input" />
        <select name="status" defaultValue={action.status} className="input">
          <option value="BROUILLON">Brouillon</option>
          <option value="A_VALIDER">À valider</option>
          <option value="PUBLIE">Publié</option>
          <option value="ARCHIVE">Archivé</option>
        </select>
        {action.isDemoContent && <p className="demo-flag w-fit">Contenu de démonstration</p>}
        <button type="submit" className="btn btn-red mt-2 w-fit">Enregistrer les modifications</button>
      </form>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Médias de l&apos;action</h2>
        <MediaGalleryManager
          items={action.media.map((m) => ({ id: m.id, order: m.order, caption: m.caption, media: m.media }))}
          onAdd={async (mediaId) => {
            "use server";
            await addFieldActionMedia(action.id, mediaId);
          }}
          onRemove={removeFieldActionMedia}
          onMove={moveFieldActionMedia}
          onUpdateCaption={updateFieldActionMediaCaption}
        />
      </div>
    </div>
  );
}
