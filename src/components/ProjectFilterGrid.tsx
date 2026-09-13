"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { Category, Project } from "@prisma/client";

type ProjectItem = Project & { category: Category | null };

export default function ProjectFilterGrid({ projects, categories }: { projects: ProjectItem[]; categories: Category[] }) {
  const filters = ["Tous", ...categories.map((category) => category.name)];
  const [active, setActive] = useState("Tous");

  const filtered = useMemo(() => {
    if (active === "Tous") return projects;
    return projects.filter((project) => project.category?.name === active);
  }, [active, projects]);

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
        <p className="text-ink-soft">Aucun projet dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
