import { prisma } from "@/lib/prisma";
import { createVideo, deleteVideo } from "@/lib/actions";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Vidéos</h1>

      {videos.length > 0 && (
        <table className="mb-10 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="py-3">Titre</th>
              <th className="py-3">Source</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-line">
                <td className="py-3 font-semibold">{v.title}</td>
                <td className="py-3 text-ink-soft">{v.provider}</td>
                <td className="py-3 text-right">
                  <form action={deleteVideo.bind(null, v.id)}>
                    <button className="text-xs font-semibold text-red">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-5 font-display text-lg font-bold">Ajouter une vidéo</h2>
      <form action={createVideo} className="flex flex-col gap-4">
        <input name="title" placeholder="Titre" required className="input" />
        <select name="provider" defaultValue="YOUTUBE" className="input">
          <option value="YOUTUBE">YouTube</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="HOSTED">Vidéo hébergée</option>
        </select>
        <input name="url" placeholder="URL de la vidéo" required className="input" />
        <button type="submit" className="btn btn-red w-fit">Ajouter</button>
      </form>
    </div>
  );
}
