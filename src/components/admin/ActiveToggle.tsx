"use client";

import { useTransition } from "react";

type Props = {
  active: boolean;
  onToggle: (active: boolean) => Promise<void>;
};

export default function ActiveToggle({ active, onToggle }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => onToggle(!active))}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
        active ? "bg-green/15 text-green" : "bg-line text-ink-soft"
      }`}
    >
      {active ? "Actif" : "Inactif"}
    </button>
  );
}
