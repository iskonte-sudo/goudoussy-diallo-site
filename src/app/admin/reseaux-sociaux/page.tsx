import { prisma } from "@/lib/prisma";
import { updateSocialLinks } from "@/lib/actions";

const PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" }
];

export default async function AdminSocialLinksPage() {
  const links = await prisma.socialLink.findMany();
  const byPlatform = Object.fromEntries(links.map((l) => [l.platform, l]));

  return (
    <div className="max-w-xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Réseaux sociaux</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Ces liens alimentent le header, le pied de page, la bande &laquo;&nbsp;Restons connectés&nbsp;&raquo; de
        l&apos;accueil et la page Contact.
      </p>
      <form action={updateSocialLinks} className="flex flex-col gap-6">
        {PLATFORMS.map((p) => {
          const existing = byPlatform[p.key];
          return (
            <div key={p.key} className="flex flex-col gap-2 border-b border-line pb-5">
              <label className="text-sm font-semibold">{p.label}</label>
              <input
                name={p.key}
                type="url"
                placeholder={`https://...`}
                defaultValue={existing?.url ?? ""}
                className="input"
              />
              <label className="flex items-center gap-2 text-xs text-ink-soft">
                <input type="checkbox" name={`${p.key}_visible`} defaultChecked={existing?.visible ?? true} />
                Afficher ce lien sur le site
              </label>
            </div>
          );
        })}
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
    </div>
  );
}
