import { prisma } from "@/lib/prisma";
import { updateSiteSettings } from "@/lib/actions";

export default async function AdminFooterPage() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Footer</h1>
      <p className="mb-8 text-sm text-ink-soft">
        Les liens rapides et les réseaux sociaux du footer se gèrent depuis{" "}
        <a href="/admin/menu" className="text-red">Menu principal</a> et{" "}
        <a href="/admin/reseaux-sociaux" className="text-red">Réseaux sociaux</a>. Ce formulaire couvre le reste du
        contenu éditorial du footer.
      </p>
      {/* Réutilise updateSiteSettings — les champs non présents ici gardent leur valeur actuelle
          côté serveur car ils sont bien renvoyés (hidden inputs) pour ne rien écraser. */}
      <form action={updateSiteSettings} className="flex flex-col gap-4">
        <input type="hidden" name="siteName" defaultValue={settings.siteName} />
        <input type="hidden" name="displayName" defaultValue={settings.displayName} />
        <input type="hidden" name="slogan" defaultValue={settings.slogan ?? ""} />
        <input type="hidden" name="heroTagline" defaultValue={settings.heroTagline} />
        <input type="hidden" name="logoUrl" defaultValue={settings.logoUrl ?? ""} />
        <input type="hidden" name="faviconUrl" defaultValue={settings.faviconUrl ?? ""} />
        <input type="hidden" name="contactEmail" defaultValue={settings.contactEmail ?? ""} />
        <input type="hidden" name="contactPhone" defaultValue={settings.contactPhone ?? ""} />
        <input type="hidden" name="contactWhatsapp" defaultValue={settings.contactWhatsapp ?? ""} />
        <input type="hidden" name="address" defaultValue={settings.address ?? ""} />
        <input type="hidden" name="seoDefaultTitle" defaultValue={settings.seoDefaultTitle ?? ""} />
        <input type="hidden" name="seoDefaultDescription" defaultValue={settings.seoDefaultDescription ?? ""} />
        <input type="hidden" name="ogImageUrl" defaultValue={settings.ogImageUrl ?? ""} />
        <input type="hidden" name="homepageArticlesCount" defaultValue={settings.homepageArticlesCount} />
        <input type="hidden" name="homepageProjectsCount" defaultValue={settings.homepageProjectsCount} />
        <input type="hidden" name="homepageGalleryCount" defaultValue={settings.homepageGalleryCount} />

        <Field label="Description (sous le nom, colonne de gauche)">
          <textarea name="footerDescription" defaultValue={settings.footerDescription ?? ""} rows={2} className="input" />
        </Field>
        <Field label="Copyright">
          <input name="footerCopyright" defaultValue={settings.footerCopyright ?? ""} placeholder="© 2026 Goudoussy Diallo — Tous droits réservés." className="input" />
        </Field>
        <Field label="Mentions légales">
          <textarea name="footerLegalNotice" defaultValue={settings.footerLegalNotice ?? ""} rows={3} className="input" />
        </Field>
        <Field label="Lien politique de confidentialité">
          <input name="footerPrivacyPolicyUrl" defaultValue={settings.footerPrivacyPolicyUrl ?? ""} className="input" />
        </Field>
        <button type="submit" className="btn btn-red w-fit">Enregistrer</button>
      </form>
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
