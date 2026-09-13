import { prisma } from "@/lib/prisma";
import { updateSiteSettings } from "@/lib/actions";
import MediaPicker from "@/components/admin/MediaPicker";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Paramètres du site</h1>
      <form action={updateSiteSettings} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold">Identité</h2>
          <Field label="Nom du site (interne)">
            <input name="siteName" defaultValue={settings.siteName} className="input" />
          </Field>
          <Field label="Nom affiché publiquement">
            <input name="displayName" defaultValue={settings.displayName} className="input" />
          </Field>
          <Field label="Slogan">
            <input name="slogan" defaultValue={settings.slogan ?? ""} className="input" />
          </Field>
          <Field label="Phrase d'accroche du hero (si aucun slide actif)">
            <input name="heroTagline" defaultValue={settings.heroTagline} className="input" />
          </Field>
          <MediaPicker name="logoUrl" label="Logo" defaultValue={settings.logoUrl} />
          <MediaPicker name="faviconUrl" label="Favicon" defaultValue={settings.faviconUrl} />
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold">Contact</h2>
          <Field label="Email de contact">
            <input name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} className="input" />
          </Field>
          <Field label="Téléphone de contact">
            <input name="contactPhone" defaultValue={settings.contactPhone ?? ""} className="input" />
          </Field>
          <Field label="WhatsApp">
            <input name="contactWhatsapp" defaultValue={settings.contactWhatsapp ?? ""} className="input" />
          </Field>
          <Field label="Adresse">
            <input name="address" defaultValue={settings.address ?? ""} className="input" />
          </Field>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold">SEO par défaut</h2>
          <Field label="Titre SEO par défaut">
            <input name="seoDefaultTitle" defaultValue={settings.seoDefaultTitle ?? ""} className="input" />
          </Field>
          <Field label="Meta description par défaut">
            <textarea name="seoDefaultDescription" rows={2} defaultValue={settings.seoDefaultDescription ?? ""} className="input" />
          </Field>
          <MediaPicker name="ogImageUrl" label="Image Open Graph par défaut" defaultValue={settings.ogImageUrl} />
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold">Affichage de l&apos;accueil</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Nb. actualités">
              <input name="homepageArticlesCount" type="number" defaultValue={settings.homepageArticlesCount} className="input" />
            </Field>
            <Field label="Nb. projets">
              <input name="homepageProjectsCount" type="number" defaultValue={settings.homepageProjectsCount} className="input" />
            </Field>
            <Field label="Nb. photos galerie">
              <input name="homepageGalleryCount" type="number" defaultValue={settings.homepageGalleryCount} className="input" />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold">Footer</h2>
          <Field label="Description">
            <textarea name="footerDescription" rows={2} defaultValue={settings.footerDescription ?? ""} className="input" />
          </Field>
          <Field label="Copyright">
            <input name="footerCopyright" defaultValue={settings.footerCopyright ?? ""} className="input" />
          </Field>
          <Field label="Mentions légales">
            <textarea name="footerLegalNotice" rows={2} defaultValue={settings.footerLegalNotice ?? ""} className="input" />
          </Field>
          <Field label="Lien politique de confidentialité">
            <input name="footerPrivacyPolicyUrl" defaultValue={settings.footerPrivacyPolicyUrl ?? ""} className="input" />
          </Field>
        </section>

        <button type="submit" className="btn btn-red w-fit">
          Enregistrer les paramètres
        </button>
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
