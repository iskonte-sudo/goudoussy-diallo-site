"use client";

import { useTransition } from "react";

const STATUS_LABEL: Record<string, string> = {
  BROUILLON: "Brouillon",
  A_VALIDER: "À valider",
  PUBLIE: "Publié",
  ARCHIVE: "Archivé"
};

type Props = {
  currentStatus: string;
  onChangeStatus: (status: string) => Promise<void>;
};

export default function StatusSelect({ currentStatus, onChangeStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => startTransition(() => onChangeStatus(e.target.value))}
      className="rounded border border-line px-2 py-1 text-xs disabled:opacity-50"
    >
      {Object.entries(STATUS_LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
