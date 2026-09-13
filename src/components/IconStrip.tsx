type Item = { label: string; description: string; icon: React.ReactNode };

const ICONS = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
    </svg>
  ),
  ball: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <path d="M4 20V10l8-6 8 6v10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <path d="M3 12h6l3-8 3 16 3-8h3" />
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <circle cx="7" cy="12" r="4" />
      <circle cx="17" cy="12" r="4" />
    </svg>
  ),
  africa: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
};

const ITEMS: Item[] = [
  { label: "Jeunesse", description: "Accompagner les talents de demain", icon: ICONS.users },
  { label: "Mini-Football", description: "Structurer et développer la discipline", icon: ICONS.ball },
  { label: "Institutions", description: "Servir avec responsabilité", icon: ICONS.building },
  { label: "Développement", description: "Des actions concrètes pour un impact durable", icon: ICONS.chart },
  { label: "Coopération", description: "Une Guinée ouverte sur l'Afrique et le monde", icon: ICONS.handshake },
  { label: "Rayonnement africain", description: "Pour un mini-football plus fort en Afrique", icon: ICONS.africa }
];

export default function IconStrip() {
  return (
    <div className="grid grid-cols-6 gap-px border border-line bg-line max-[960px]:grid-cols-3 max-[560px]:grid-cols-2">
      {ITEMS.map((item) => (
        <div key={item.label} className="bg-white px-5 py-8 text-center">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border-[1.4px] border-navy [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-navy">
            {item.icon}
          </div>
          <h4 className="mb-1.5 text-sm font-bold text-ink">{item.label}</h4>
          <p className="text-[0.8rem] text-ink-soft">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
