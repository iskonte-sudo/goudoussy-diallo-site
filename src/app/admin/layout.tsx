import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import SignOutButton from "@/components/SignOutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/accueil", label: "Page d'accueil" },
  { href: "/admin/slider", label: "Slider / Hero" },
  { href: "/admin/medias", label: "Médiathèque" },
  { href: "/admin/biographie", label: "Biographie & Responsabilités" },
  { href: "/admin/actualites", label: "Actualités" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/actions-terrain", label: "Actions de terrain" },
  { href: "/admin/evenements-sportifs", label: "Événements sportifs" },
  { href: "/admin/galeries", label: "Galeries" },
  { href: "/admin/videos", label: "Vidéos" },
  { href: "/admin/reseaux-sociaux", label: "Réseaux sociaux" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/footer", label: "Footer" },
  { href: "/admin/menu", label: "Menu principal" },
  { href: "/admin/parametres", label: "Paramètres du site" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <aside className="w-64 flex-none border-r border-line bg-offwhite p-6">
          <div className="mb-8 font-display text-lg font-extrabold">Administration</div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-white hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 border-t border-line pt-5">
            <SignOutButton />
          </div>
        </aside>
        <div className="flex-1 p-8">{children}</div>
      </div>
    </AuthProvider>
  );
}
