"use client";

import { useMemo, useState } from "react";
import NewsCard from "@/components/NewsCard";
import type { Article, Category } from "@prisma/client";

type NewsItem = Article & { category: Category | null };

export default function NewsFilterGrid({ articles, categories }: { articles: NewsItem[]; categories: Category[] }) {
  const filters = ["Toutes", ...categories.map((category) => category.name)];
  const [active, setActive] = useState("Toutes");

  const filtered = useMemo(() => {
    if (active === "Toutes") return articles;
    return articles.filter((article) => article.category?.name === active);
  }, [active, articles]);

  return (
    <>
      <div className="mb-9 flex flex-wrap gap-2.5">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              active === filter ? "bg-navy text-white" : "border border-line text-ink-soft hover:border-navy hover:text-navy"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-soft">Aucun article dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
          {filtered.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
