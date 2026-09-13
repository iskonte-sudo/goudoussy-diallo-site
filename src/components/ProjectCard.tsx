import Link from "next/link";
import Image from "next/image";
import type { Project } from "@prisma/client";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projets/${project.slug}`} className="block border-t-2 border-line pt-5">
      <div className="card-photo-placeholder mb-4 aspect-[4/3] rounded-md">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            width={480}
            height={360}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          "Image à ajouter"
        )}
      </div>
      {project.isDemoContent && <div className="demo-flag">Démo</div>}
      <div className="mb-2 text-[0.78rem] text-ink-soft">
        {statusLabel(project.status)}
        {project.location ? ` · ${project.location}` : ""}
      </div>
      <h3 className="mb-2.5 font-display text-lg font-bold text-ink">{project.title}</h3>
      <p className="text-sm text-ink-soft">{project.description}</p>
    </Link>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "EN_COURS":
      return "En cours";
    case "REALISE":
      return "Réalisé";
    case "TERMINE":
      return "Terminé";
    default:
      return "En préparation";
  }
}
