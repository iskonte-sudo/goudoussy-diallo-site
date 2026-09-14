import type { Responsibility } from "@prisma/client";

const DOMAIN_LABEL: Record<string, string> = {
  SPORT: "01 — SPORT",
  INSTITUTIONS: "02 — INSTITUTIONS",
  AFRIQUE: "03 — AFRIQUE"
};

const DOMAIN_COLOR: Record<string, string> = {
  SPORT: "#E8B923",
  INSTITUTIONS: "#0F8A4F",
  AFRIQUE: "#CE1126"
};

const OVERLAY = "linear-gradient(0deg, rgba(6,10,22,0.94) 0%, rgba(6,10,22,0.48) 55%, rgba(6,10,22,0.18) 100%)";

export default function ResponsibilityCards({
  items
}: {
  items: Responsibility[];
}) {
  return (
    <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
      {items.map((r) => (
        <div
          key={r.id}
          className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-br from-[#1a2647] to-navy"
        >
          {r.imageUrl && (
            <img
              src={r.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div
            className="absolute inset-0"
            style={{ background: OVERLAY }}
          />

          <div
            className="absolute left-0 right-0 top-0 h-[5px]"
            style={{
              background: DOMAIN_COLOR[r.domain] ?? "#CE1126"
            }}
          />

          {!r.imageUrl && (
            <div className="absolute right-4 top-4 border border-dashed border-white/30 px-2 py-1 text-[0.62rem] text-white/55">
              Photo à ajouter
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <div className="mb-2 font-display text-[0.85rem] font-extrabold tracking-wide text-gold">
              {DOMAIN_LABEL[r.domain] ?? r.domain}
            </div>

            <h3 className="mb-2.5 text-xl font-bold leading-snug">
              {r.title}
            </h3>

            <p className="text-sm text-[#D6D9E0]">
              {r.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
