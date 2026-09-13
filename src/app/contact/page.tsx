import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Goudoussy Diallo pour toute demande professionnelle, institutionnelle, sportive ou de partenariat."
};

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  tiktok: "TikTok"
};

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ where: { visible: true, url: { not: "" } } })
  ]);

  return (
    <div>
      <PageHero
        kicker="Contact"
        title="Une question, un partenariat ?"
        description="Pour toute demande professionnelle, institutionnelle, sportive ou de partenariat."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-14 px-8 max-[900px]:grid-cols-1 max-[640px]:px-5">
          <div>
            <p className="kicker">Suivre</p>
            <h2 className="mb-5 font-display text-2xl font-extrabold">Réseaux sociaux</h2>
            <div className="flex flex-col">
              {socialLinks.length === 0 ? (
                <p className="py-3.5 text-sm text-ink-soft">À renseigner depuis l&apos;administration.</p>
              ) : (
                socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between border-b border-line py-3.5 text-sm"
                  >
                    {LABELS[link.platform] ?? link.platform} →
                  </a>
                ))
              )}
            </div>
            <div className="mt-5 space-y-1 text-sm text-ink-soft">
              {settings?.contactEmail && <p>{settings.contactEmail}</p>}
              {settings?.contactPhone && <p>{settings.contactPhone}</p>}
              {settings?.address && <p>{settings.address}</p>}
              {!settings?.contactEmail && !settings?.contactPhone && !settings?.address && (
                <p>Email, téléphone et localisation à renseigner depuis l&apos;administration.</p>
              )}
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
