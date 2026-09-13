import Link from "next/link";
import { prisma } from "@/lib/prisma";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  tiktok: "TikTok"
};

export default async function Footer() {
  const [socialLinks, menuItems, settings] = await Promise.all([
    prisma.socialLink.findMany({ where: { visible: true, url: { not: "" } } }),
    prisma.menuItem.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.siteSetting.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } })
  ]);

  const year = new Date().getFullYear();
  const displayName = settings.displayName || settings.siteName;

  return (
    <footer className="bg-navy py-14 text-[#B7C0DE]">
      <div className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
        <div className="mb-10 grid grid-cols-[1.4fr_1fr_1fr] gap-10 max-[760px]:grid-cols-1">
          <div>
            <div className="font-display text-lg font-extrabold text-white">{displayName.toUpperCase()}</div>
            <p className="mt-3.5 max-w-[36ch] text-sm">
              {settings.footerDescription || "Engagement, action et résultats au service de la Guinée et de sa jeunesse."}
            </p>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-bold uppercase tracking-wide text-white">
              Navigation
            </h5>
            <ul className="flex flex-col gap-2.5">
              {menuItems.length === 0 ? (
                <li className="text-sm text-[#7B84A5]">À renseigner depuis l&apos;administration</li>
              ) : (
                menuItems.map((item) => (
                  <li key={item.id}>
                    <Link href={item.url} target={item.newTab ? "_blank" : undefined} className="text-sm hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h5 className="mb-3.5 text-xs font-bold uppercase tracking-wide text-white">
              Réseaux
            </h5>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.length === 0 ? (
                <li className="text-sm text-[#7B84A5]">À renseigner depuis l&apos;administration</li>
              ) : (
                socialLinks.map((link) => (
                  <li key={link.platform}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white">
                      {SOCIAL_LABELS[link.platform] ?? link.platform}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5 text-xs text-[#7B84A5]">
          <span>{settings.footerCopyright || `© ${year} ${displayName} — Tous droits réservés.`}</span>
          {settings.footerPrivacyPolicyUrl ? (
            <a href={settings.footerPrivacyPolicyUrl} className="hover:text-white">Politique de confidentialité</a>
          ) : (
            <span>Site propulsé par une administration entièrement personnalisable.</span>
          )}
        </div>
        {settings.footerLegalNotice && (
          <p className="mt-4 max-w-[70ch] text-[0.7rem] text-[#5F6890]">{settings.footerLegalNotice}</p>
        )}
      </div>
    </footer>
  );
}
