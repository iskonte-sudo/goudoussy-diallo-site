import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@goudoussydiallo.gn";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-immediately";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrateur",
      password: hashed,
      role: "admin"
    }
  });

  // --- Site settings ----------------------------------------------------
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heroTagline: "Engagement, proximité et action au service de la Guinée",
      siteName: "Goudoussy Diallo"
    }
  });

  // --- Biography (internal note, never shown publicly) ------------------
  await prisma.biography.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" }
  });

  // --- Hero slides (previously hardcoded — now fully CMS-driven) ---------
  await prisma.heroSlide.deleteMany({});
  await prisma.heroSlide.createMany({
    data: [
      {
        order: 0,
        active: true,
        label: "Bienvenue sur le site officiel",
        title: "Goudoussy Diallo",
        description:
          "Un engagement constant au service de la jeunesse, du sport et du développement de la Guinée.",
        primaryButtonText: "Découvrir son parcours",
        primaryButtonLink: "/biographie",
        secondaryButtonText: "Voir les actualités",
        secondaryButtonLink: "/actualites",
        quote: "Une jeunesse plus forte, une Guinée plus ambitieuse"
      },
      {
        order: 1,
        active: true,
        label: "Sport & jeunesse",
        title: "Détecter les talents",
        description:
          "Structurer le mini-football guinéen, accompagner les jeunes talents et préparer les grandes échéances continentales, dont la CAN 2027 en Guinée.",
        primaryButtonText: "Voir la page Sport & Jeunesse",
        primaryButtonLink: "/sport-jeunesse",
        quote: "Le mini-football, une seconde chance pour nos jeunes talents"
      },
      {
        order: 2,
        active: true,
        label: "Rayonnement africain",
        title: "De la Guinée à l'Afrique",
        description:
          "Premier vice-président de la Confédération Africaine de Mini-Football, dont le siège s'installe à Conakry pour dix ans.",
        primaryButtonText: "Ses responsabilités",
        primaryButtonLink: "/biographie",
        quote: "La Guinée, maison du mini-football africain"
      }
    ]
  });

  // --- Categories ---------------------------------------------------
  const categoryNames = [
    "Sport",
    "Mini-Football",
    "Jeunesse",
    "Institutions",
    "Projets",
    "Actions de terrain",
    "Rencontres",
    "Afrique & International"
  ];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) }
      })
    )
  );
  const byName = (name: string) => categories.find((c) => c.name === name)!;

  // --- Responsibilities (sourced from independent Guinean press, confirmed) ---
  await prisma.responsibility.deleteMany({});
  await prisma.responsibility.createMany({
    data: [
      {
        order: 1,
        domain: "SPORT",
        title: "Président de la Fédération Guinéenne de Mini-Football",
        description: "Développer, structurer et promouvoir le mini-football en Guinée.",
        sourceNote:
          "Confirmé par plusieurs médias guinéens indépendants (Avenirguinee.org, Guinee7.com, Africaguinee.com, Guineenews.org — 2025-2026).",
        confidence: "ELEVEE"
      },
      {
        order: 2,
        domain: "INSTITUTIONS",
        title: "Attaché de Cabinet du Premier ministre",
        description: "Contribuer à la mise en œuvre des missions de la Primature.",
        sourceNote:
          "Confirmé par Guineenews.org et MediaGuinee.com (septembre 2025) — a représenté le Premier ministre Bah Oury lors d'une cérémonie officielle.",
        confidence: "ELEVEE"
      },
      {
        order: 3,
        domain: "AFRIQUE",
        title: "Premier vice-président de la Confédération Africaine de Mini-Football",
        description:
          "Élu le 28 février 2026 à Conakry, lors de l'Assemblée générale de l'AMC, qui a également fixé le siège de la Confédération à Conakry pour dix ans.",
        sourceNote: "Confirmé par Guinee7.com et Africaguinee.com (28 février 2026).",
        confidence: "ELEVEE"
      }
    ]
  });

  // --- Timeline (biographie) --------------------------------------------
  await prisma.timelineItem.deleteMany({});
  await prisma.timelineItem.createMany({
    data: [
      {
        order: 1,
        date: "À préciser",
        title: "Étape à renseigner",
        description: "Formation et débuts de carrière — à compléter depuis l'administration."
      },
      {
        order: 2,
        date: "2025 – 2026",
        title: "Développement du mini-football guinéen",
        description:
          "Première participation de la Guinée à la CAN de Mini-Football, structuration de la discipline."
      },
      {
        order: 3,
        date: "28 février 2026",
        title: "Élu Premier vice-président de l'AMC",
        description:
          "À l'issue de l'Assemblée générale de la Confédération Africaine de Mini-Football à Conakry."
      }
    ]
  });

  // --- Demo articles (clearly flagged) -----------------------------------
  await prisma.article.deleteMany({});
  const demoArticles = [
    {
      title: "Mini-Foot : un tournoi communal pour détecter des talents",
      excerpt: "Une initiative pour promouvoir la pratique du mini-football et révéler les jeunes talents dans les communautés.",
      category: "Sport",
      date: "2025-08-11"
    },
    {
      title: "La Guinée représentée dans le corps arbitral de la CAN 2026",
      excerpt: "Une première historique pour la Guinée dans la Coupe d'Afrique des Nations de Mini-Football féminin.",
      category: "Institutions",
      date: "2025-08-08"
    },
    {
      title: "Une belle rencontre à N'Dalao, dans le secteur de Pellèl",
      excerpt: "Échanges avec les populations locales autour des enjeux de développement communautaire.",
      category: "Actions de terrain",
      date: "2025-08-05"
    },
    {
      title: "Élu Premier vice-président de l'AMC",
      excerpt: "Retour sur l'Assemblée générale de la Confédération Africaine de Mini-Football tenue à Conakry.",
      category: "Afrique & International",
      date: "2026-02-28"
    },
    {
      title: "CAN 2027 : la Guinée hérite du groupe A",
      excerpt: "Les grandes lignes du tirage au sort et de la préparation de la CAN de Mini-Football 2027.",
      category: "Mini-Football",
      date: "2026-07-26"
    }
  ];

  for (const a of demoArticles) {
    await prisma.article.create({
      data: {
        title: a.title,
        slug: slugify(a.title),
        excerpt: a.excerpt,
        content: `${a.excerpt}\n\nContenu complet à rédiger depuis l'administration.`,
        status: "PUBLIE",
        isDemoContent: true,
        categoryId: byName(a.category)?.id,
        publishedAt: new Date(a.date)
      }
    });
  }

  // --- Demo projects -------------------------------------------------
  await prisma.project.deleteMany({});
  await prisma.project.createMany({
    data: [
      {
        title: "Mini-football : cap sur la CAN 2027",
        slug: "mini-football-can-2027",
        description: "Infrastructures et coopération internationale pour préparer la CAN de Mini-Football 2027 en Guinée.",
        location: "Istanbul, Turquie",
        status: "EN_COURS",
        isDemoContent: true
      },
      {
        title: "Détection des talents",
        slug: "detection-des-talents",
        description: "Programme de repérage des jeunes talents du mini-football à l'échelle nationale.",
        location: "Guinée",
        status: "EN_COURS",
        isDemoContent: true
      },
      {
        title: "Rencontres communautaires",
        slug: "rencontres-communautaires",
        description: "Cycle de visites de proximité dans les localités guinéennes.",
        location: "Guinée",
        status: "EN_PREPARATION",
        isDemoContent: true
      }
    ]
  });

  // --- Demo field actions -----------------------------------------------
  await prisma.fieldAction.deleteMany({});
  await prisma.fieldAction.createMany({
    data: [
      {
        title: "Visite de travail — développement sportif",
        description: "Échanges autour d'infrastructures sportives et de la préparation d'échéances continentales.",
        location: "Istanbul, Turquie",
        status: "PUBLIE",
        isDemoContent: true
      },
      {
        title: "Participation à une rencontre institutionnelle",
        description: "Présence aux côtés de représentants et délégués lors d'une session de travail nationale.",
        location: "Conakry, Guinée",
        status: "PUBLIE",
        isDemoContent: true
      },
      {
        title: "Rencontre de proximité avec les populations",
        description: "Détails à compléter depuis l'administration.",
        location: "Localité à préciser",
        status: "BROUILLON",
        isDemoContent: true
      }
    ]
  });

  // --- Social links -----------------------------------------------------
  const socials: { platform: string; url: string }[] = [
    { platform: "facebook", url: "https://www.facebook.com/share/1PNWfbu74b/" },
    { platform: "instagram", url: "" },
    { platform: "youtube", url: "" },
    { platform: "linkedin", url: "" },
    { platform: "tiktok", url: "" }
  ];
  for (const s of socials) {
    await prisma.socialLink.upsert({
      where: { platform: s.platform },
      update: {},
      create: s
    });
  }

  // --- Main menu ----------------------------------------------------------
  const menuLabels: { label: string; url: string }[] = [
    { label: "Accueil", url: "/" },
    { label: "Biographie", url: "/biographie" },
    { label: "Actualités", url: "/actualites" },
    { label: "Projets", url: "/projets" },
    { label: "Sport & Jeunesse", url: "/sport-jeunesse" },
    { label: "Galerie", url: "/galerie" },
    { label: "Contact", url: "/contact" }
  ];
  const existingMenuCount = await prisma.menuItem.count();
  if (existingMenuCount === 0) {
    await prisma.menuItem.createMany({
      data: menuLabels.map((m, i) => ({ ...m, order: i }))
    });
  }

  // --- Homepage sections (enable / order / titles) -----------------------
  // Uniquement les sections réellement présentes sur la homepage aujourd'hui.
  // "Statistiques" et "Galerie" (prévues au cahier des charges) ne sont pas
  // encore construites sur l'accueil — les ajouter ici avant de les avoir
  // implémentées donnerait un écran d'administration trompeur.
  const homepageSections: { key: string; title: string; subtitle?: string }[] = [
    { key: "hero", title: "Hero / Slider" },
    { key: "responsabilites", title: "Ses principales responsabilités", subtitle: "Ses fonctions" },
    { key: "actualites", title: "Dernières actualités", subtitle: "Actualités" },
    { key: "projets", title: "Projets & initiatives", subtitle: "À la une" },
    { key: "terrain", title: "Activités & actions de terrain", subtitle: "Sur le terrain" },
    { key: "reseaux", title: "Restons connectés" },
    { key: "contact", title: "Une question, une demande institutionnelle ou de partenariat ?", subtitle: "Contact" }
  ];
  for (let i = 0; i < homepageSections.length; i++) {
    const s = homepageSections[i];
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, order: i, title: s.title, subtitle: s.subtitle ?? null }
    });
  }

  console.log("Seed terminé.");
  console.log(`Compte admin : ${adminEmail} — pensez à changer le mot de passe après la première connexion.`);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
