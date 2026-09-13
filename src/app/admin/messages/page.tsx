import { prisma } from "@/lib/prisma";
import { deleteMessage, markMessageRead, markMessageUnread } from "@/lib/actions";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-8 font-display text-2xl font-extrabold">Messages reçus</h1>

      {messages.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun message pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`rounded-lg border p-5 ${m.read ? "border-line" : "border-navy bg-offwhite"}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">{m.name}</span>
                  <span className="ml-2 text-xs text-ink-soft">{m.email}</span>
                  {m.phone && <span className="ml-2 text-xs text-ink-soft">· {m.phone}</span>}
                </div>
                <span className="text-xs text-ink-soft">{new Date(m.createdAt).toLocaleString("fr-FR")}</span>
              </div>
              {m.subject && <p className="mb-1 text-sm font-semibold">{m.subject}</p>}
              <p className="mb-4 text-sm text-ink-soft">{m.message}</p>
              <div className="flex gap-4">
                {m.read ? (
                  <form action={markMessageUnread.bind(null, m.id)}>
                    <button className="text-xs font-semibold text-navy">Marquer non lu</button>
                  </form>
                ) : (
                  <form action={markMessageRead.bind(null, m.id)}>
                    <button className="text-xs font-semibold text-navy">Marquer lu</button>
                  </form>
                )}
                <form action={deleteMessage.bind(null, m.id)}>
                  <button className="text-xs font-semibold text-red">Supprimer</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
