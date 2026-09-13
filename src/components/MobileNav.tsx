"use client";

import Link from "next/link";
import { useState } from "react";

type MenuLink = { id: string; label: string; url: string; newTab: boolean };

export default function MobileNav({ links }: { links: MenuLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="text-2xl text-ink md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
        ☰
      </button>
      {open && (
        <div className="flex flex-col border-t border-line px-5 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.id}
              href={l.url}
              target={l.newTab ? "_blank" : undefined}
              className="border-b border-line py-3 text-sm text-ink"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
