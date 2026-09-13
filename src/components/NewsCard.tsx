import Link from "next/link";
import Image from "next/image";
import type { Article, Category } from "@prisma/client";

const TAG_COLOR: Record<string, string> = {
  Sport: "bg-gold text-[#3a2c00]",
  "Mini-Football": "bg-gold text-[#3a2c00]",
  Institutions: "bg-red text-white",
  Jeunesse: "bg-navy text-white",
  Projets: "bg-navy text-white",
  "Actions de terrain": "bg-green text-white",
  Rencontres: "bg-navy text-white",
  "Afrique & International": "bg-green text-white"
};

export default function NewsCard({
  article
}: {
  article: Article & { category: Category | null };
}) {
  const tagClass = article.category ? TAG_COLOR[article.category.name] ?? "bg-navy text-white" : "bg-navy text-white";

  return (
    <Link href={`/actualites/${article.slug}`} className="group block">
      <div className="card-photo-placeholder mb-4 aspect-[4/3] rounded-md">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt ?? article.title}
            width={480}
            height={360}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          "Image à ajouter"
        )}
      </div>
      {article.category && (
        <span className={`mb-2.5 inline-block rounded px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-wide ${tagClass}`}>
          {article.category.name}
        </span>
      )}
      {article.publishedAt && (
        <span className="float-right text-[0.78rem] text-ink-soft">
          {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
        </span>
      )}
      <h3 className="clear-both mb-2.5 mt-1.5 text-base font-bold leading-snug text-ink group-hover:text-red">
        {article.title}
      </h3>
      {article.isDemoContent && <div className="demo-flag mb-2">Contenu de démonstration</div>}
      <span className="text-sm font-bold text-red">Lire la suite →</span>
    </Link>
  );
}
