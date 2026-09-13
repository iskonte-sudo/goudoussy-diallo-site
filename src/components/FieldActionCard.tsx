import Image from "next/image";
import Link from "next/link";
import type { FieldAction } from "@prisma/client";

export default function FieldActionCard({ action }: { action: FieldAction }) {
  return (
    <Link href={`/actions-terrain/${action.id}`} className="block border-t-2 border-line pt-5">
      <div className="card-photo-placeholder mb-4 aspect-[4/3] rounded-md">
        {action.imageUrl ? (
          <Image
            src={action.imageUrl}
            alt={action.title}
            width={480}
            height={360}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          "Image à ajouter"
        )}
      </div>
      {action.isDemoContent && <div className="demo-flag">Démo</div>}
      <div className="mb-2 text-[0.78rem] text-ink-soft">{action.location}</div>
      <h3 className="mb-2.5 font-display text-lg font-bold text-ink">{action.title}</h3>
      <p className="text-sm text-ink-soft">{action.description}</p>
    </Link>
  );
}
