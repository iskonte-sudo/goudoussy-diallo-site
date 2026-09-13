import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject, addProjectMedia, removeProjectMedia, moveProjectMedia, updateProjectMediaCaption } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: { media: { include: { media: true }, orderBy: { order: "asc" } } }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!project) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Modifier le projet</h1>
      <form action={updateProject.bind(null, project.id)} className="flex flex-col gap-4">
        <input name="title" defaultValue={project.title} required className="input" />
        <input name="slug" defaultValue={project.slug} className="input" />
        <textarea name="description" defaultValue={project.description} rows={3} required className="input" />
        <textarea name="objective" defaultValue={project.objective ?? ""} rows={2} className="input" />
        <textarea name="results" defaultValue={project.results ?? ""} rows={2} className="input" />
        <MediaPicker name="coverImageUrl" label="Image principale" defaultValue={project.coverImageUrl} />
        <div className="grid grid-cols-2 gap-4">
          <input name="location" defaultValue={project.location ?? ""} className="input" />
          <input
            name="date"
            type="date"
            defaultValue={project.date ? project.date.toISOString().slice(0, 10) : ""}
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="categoryId" defaultValue={project.categoryId ?? ""} className="input">
            <option value="">— Catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={project.status} className="input">
            <option value="EN_PREPARATION">En préparation</option>
            <option value="EN_COURS">En cours</option>
            <option value="REALISE">Réalisé</option>
            <option value="TERMINE">Terminé</option>
          </select>
        </div>
        <input name="videoUrl" defaultValue={project.videoUrl ?? ""} placeholder="URL vidéo (optionnel)" className="input" />
        <input name="externalLink" defaultValue={project.externalLink ?? ""} placeholder="Lien externe (optionnel)" className="input" />
        {project.isDemoContent && <p className="demo-flag w-fit">Contenu de démonstration</p>}
        <button type="submit" className="btn btn-red mt-2 w-fit">Enregistrer les modifications</button>
      </form>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">Médias du projet</h2>
        <MediaGalleryManager
          items={project.media.map((m) => ({ id: m.id, order: m.order, caption: m.caption, media: m.media }))}
          onAdd={async (mediaId) => {
            "use server";
            await addProjectMedia(project.id, mediaId);
          }}
          onRemove={removeProjectMedia}
          onMove={moveProjectMedia}
          onUpdateCaption={updateProjectMediaCaption}
        />
      </div>
    </div>
  );
}
