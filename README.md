# Site officiel — Goudoussy Diallo

Site institutionnel et personnel de Goudoussy Diallo : parcours, responsabilités,
actualités, projets, sport & jeunesse, actions de terrain, galerie et contact —
entièrement administrable sans toucher au code.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript** strict
- **Tailwind CSS** — palette et typographie reprises exactement de la maquette
  validée (navy `#0E1B3C`, rouge `#CE1126`, or `#E8B923`, vert `#0F8A4F`,
  polices Sora + Public Sans)
- **Prisma** + **SQLite** en local (PostgreSQL recommandé en production)
- **NextAuth** (authentification par identifiants) pour protéger `/admin`
- **Zod** pour la validation des formulaires (contact, etc.)

## Structure du projet

```
prisma/
  schema.prisma        → tous les modèles de contenu (Article, Project,
                          Responsibility, TimelineItem, FieldAction, Gallery,
                          GalleryImage, Video, ContactMessage, SocialLink,
                          SiteSetting, Biography, User)
  seed.ts               → compte admin + données de démonstration
                          clairement marquées (isDemoContent) + les 3
                          responsabilités sourcées presse
src/
  app/
    page.tsx             → Accueil (hero slider, responsabilités, actualités,
                            projets, actions de terrain, réseaux, contact)
    biographie/           → Biographie (+ responsabilités + timeline)
    actualites/            → Liste + /actualites/[slug]
    projets/               → Liste + /projets/[slug]
    sport-jeunesse/         → Sport & Jeunesse (+ Blog + Infos utiles)
    actions-terrain/        → Actions de terrain
    galerie/                → Galerie (masonry)
    contact/                 → Formulaire de contact
    admin/                   → Espace d'administration protégé
    api/contact/route.ts     → Réception du formulaire (validation + anti-spam)
    api/auth/[...nextauth]/  → Authentification
    sitemap.ts, robots.ts, not-found.tsx
  components/            → Header, Footer, HeroSlider, PageHero, IconStrip,
                            ResponsibilityCards, NewsCard, ProjectCard,
                            FieldActionCard, ContactForm, AuthProvider,
                            SignOutButton
  lib/
    prisma.ts             → client Prisma singleton
    auth.ts                → configuration NextAuth
    actions.ts              → server actions (CRUD articles, projets,
                              biographie, responsabilités, messages)
middleware.ts             → protège toutes les routes /admin/* (sauf /admin/login)
```

## Installation locale (SQLite)

```bash
npm install
cp .env.example .env      # DATABASE_URL="file:./dev.db" par défaut, rien à changer en local
npx prisma generate
npx prisma db push        # crée le fichier prisma/dev.db et toutes les tables
npm run db:seed           # crée le compte admin + les données de démonstration
npm run dev                # http://localhost:3000
```

Le compte admin de démonstration est créé avec les identifiants définis dans
`.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — **changez ce mot de passe dès la
première connexion** sur `/admin`.

Les images uploadées depuis l'administration sont stockées dans
`public/uploads/AAAA/MM/` (créé automatiquement) — voir `src/lib/storage.ts`
pour l'abstraction de stockage.

## Passage en production (PostgreSQL)

Le schéma est écrit pour rester compatible SQLite ↔ PostgreSQL (aucun enum
Prisma, uniquement des `String` avec valeurs par défaut). Pour basculer :

1. Dans `prisma/schema.prisma`, changez `provider = "sqlite"` en
   `provider = "postgresql"`.
2. Renseignez une vraie chaîne de connexion PostgreSQL dans `DATABASE_URL`
   (Neon, Supabase, Vercel Postgres...).
3. Relancez `npx prisma generate && npx prisma db push` (ou `prisma migrate
   deploy` si vous préférez un historique de migrations versionné).
4. Pour le stockage des images en production, remplacez le corps de
   `saveFile()` dans `src/lib/storage.ts` par un upload vers S3 / Vercel Blob
   / Cloudinary — le reste de l'application ne manipule que des URLs, rien
   d'autre à changer.

## Variables d'environnement nécessaires

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL (Neon, Supabase, Vercel Postgres, ou instance dédiée) |
| `NEXTAUTH_URL` | URL publique du site (`http://localhost:3000` en local) |
| `NEXTAUTH_SECRET` | Secret aléatoire — générez-le avec `openssl rand -base64 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Identifiants du compte admin créé par le seed |

Aucune clé secrète n'est exposée côté front-end : tout accès à la base de
données passe par les Server Components / Server Actions / routes API.

## Build de production

```bash
npm run build
npm run start
```

## Déploiement (Vercel recommandé)

1. Poussez le projet sur un dépôt Git (GitHub/GitLab).
2. Importez-le dans Vercel.
3. Ajoutez les variables d'environnement ci-dessus dans les réglages du projet.
4. Provisionnez une base PostgreSQL (Vercel Postgres, Neon ou Supabase) et
   renseignez `DATABASE_URL`.
5. Dans les paramètres de build, ajoutez `npx prisma generate` si besoin (déjà
   inclus dans `postinstall` de Prisma par défaut), puis exécutez une fois
   `npx prisma db push && npm run db:seed` (via `vercel env pull` en local,
   ou une tâche one-off) pour initialiser la base.
6. Déployez.

- **Page d'accueil** : nom, description, copyright, mentions légales, lien
  politique de confidentialité (`/admin/footer`) ; liens rapides et réseaux
  gérés depuis `/admin/menu` et `/admin/reseaux-sociaux`.
- **Menu principal** (`/admin/menu`) : libellé, URL, ordre (▲▼), actif,
  nouvel onglet — le header et le footer du site le lisent en direct, plus
  aucun lien de navigation codé en dur.
- **Page d'accueil** (`/admin/accueil`) : active/désactive et titre chaque
  section de la homepage (Hero, Responsabilités, Actualités, Projets,
  Actions de terrain, Réseaux, Contact), avec réordonnancement.
- **Événements sportifs** (`/admin/evenements-sportifs`) : alimentent la
  galerie de la page Sport & Jeunesse.
- **Messages** (`/admin/messages`) : boîte de réception du formulaire de
  contact, lu/non lu, suppression.

## Système multimédia (galeries images + vidéos)

Chaque **Actualité**, **Projet**, **Événement sportif** et **Action de
terrain** peut avoir, en plus de son image principale : plusieurs images,
plusieurs vidéos (locales, YouTube, Vimeo, Facebook), un ordre personnalisé
et une légende par média — depuis la section "Médias" de sa page d'édition
(`/admin/actualites/[id]`, `/admin/projets/[id]`,
`/admin/evenements-sportifs/[id]`, `/admin/actions-terrain/[id]`).

- Un même fichier de la médiathèque peut être réutilisé sur plusieurs
  contenus sans être re-uploadé (tables de liaison `ArticleMedia`,
  `ProjectMedia`, `SportEventMedia`, `FieldActionMedia`).
- Vidéos externes : coller une URL YouTube/Vimeo/Facebook dans l'onglet
  "Lien externe" du sélecteur de média — le fournisseur est détecté
  automatiquement, aucun fichier n'est téléchargé sur le serveur.
- Vidéos Facebook : intégrées via le plugin vidéo officiel Facebook (aucune
  clé API requise pour du contenu public) ; un bouton "Voir sur Facebook"
  reste toujours affiché en secours si l'intégration est bloquée.
- Upload : la signature binaire réelle du fichier est vérifiée (pas
  seulement le nom ou le MIME envoyés par le navigateur) — images 8 Mo max,
  vidéos 100 Mo max (ajustable dans `src/lib/storage.ts`).
- Affichage public : galerie photo avec lightbox (`ImageGalleryGrid`) et
  lecteur vidéo universel (`VideoEmbed`) sur `/actualites/[slug]` et
  `/projets/[slug]`.

## Utiliser l'administration

Rendez-vous sur `/admin/login` et connectez-vous avec le compte créé par le
seed. Depuis le dashboard :

- **Biographie & Responsabilités** : modifiez les textes de présentation,
  parcours, formation, expériences, engagements, vision et valeurs ; ajustez
  chaque responsabilité et son niveau de confiance (Élevée / À confirmer).
- **Actualités** : créez, modifiez le statut (Brouillon / À valider / Publié /
  Archivé) et supprimez des articles.
- **Projets** : même logique, avec lieu et statut d'avancement.
- **Actions de terrain** : création, changement de statut, suppression.
- **Galeries** : créez une galerie par thème (Sport, Rencontres, Afrique...),
  ouvrez-la pour y ajouter ou retirer des photos (URL, légende, texte
  alternatif SEO).
- **Vidéos** : ajoutez des vidéos YouTube, Facebook ou hébergées.
- **Réseaux sociaux** : gérez les liens Facebook / Instagram / YouTube /
  LinkedIn / TikTok et leur visibilité — ces liens alimentent automatiquement
  le header, le pied de page, la bande « Restons connectés » de l'accueil et
  la page Contact (plus de lien codé en dur).
- **Paramètres du site** : nom du site, phrase d'accroche du hero, email/
  téléphone/adresse de contact, titre et meta description SEO par défaut, et
  le statut de confiance du nom complet (Mamadou / Abdoul Goudoussy Diallo).

## État de la vérification

- **Relecture manuelle complète** effectuée fichier par fichier après cette
  passe (structure des composants, cohérence Server/Client Components,
  signatures des Server Actions, imports).
- **Scan syntaxique automatisé** (`tsc --noResolve`) sur l'ensemble du projet :
  aucune erreur de syntaxe (TS1xxx) détectée.
- **Correctifs appliqués lors de cette passe** :
  - un `onChange` (gestionnaire d'événement) était utilisé directement dans un
    Server Component (`/admin/actualites`) — extrait dans un vrai Client
    Component (`StatusSelect`), et réutilisé pour `/admin/actions-terrain` ;
  - le middleware ne protégeait pas la route exacte `/admin` (seulement ses
    sous-pages) — corrigé ;
  - script `postinstall: prisma generate` ajouté (nécessaire notamment sur
    Vercel) ;
  - tous les liens sociaux codés en dur (`href="#"`) remplacés par une lecture
    depuis la base de données (table `SocialLink`).
- **`npm install` / `npx prisma generate` / `npm run build` n'ont PAS pu être
  exécutés** dans cet environnement : le sandbox utilisé pour cette
  conversation n'a pas d'accès réseau (confirmé par une tentative réelle,
  échouée avec une erreur 403 du registre npm). Le code a donc été vérifié
  aussi rigoureusement que possible sans installation réelle des paquets,
  mais **le build n'a pas été validé en conditions réelles**. Pour terminer
  cette étape, exécutez chez vous ou dans **Claude Code** (qui dispose d'un
  accès réseau et peut relancer le build en boucle jusqu'à zéro erreur) :
  ```bash
  npm install
  npx prisma generate
  npm run build
  ```

## Notes importantes

- **Aucune information n'est inventée.** Les trois responsabilités affichées
  (Président de la FGMF, Attaché de Cabinet, Premier vice-président de l'AMC)
  sont sourcées auprès de plusieurs médias guinéens indépendants et recoupées
  — voir le champ `sourceNote` de chaque `Responsibility` dans le seed.
- Le **nom complet** (Mamadou / Abdoul Goudoussy Diallo) reste à confirmer —
  le site utilise « Goudoussy Diallo » partout jusqu'à validation.
- **Lien Facebook** : le seed utilise le lien communiqué en amont
  (`https://www.facebook.com/share/1PNWfbu74b/`). S'il ne s'agit pas du bon
  lien, corrigez-le directement dans `/admin/reseaux-sociaux` une fois le
  site lancé — plus besoin de toucher au code, tous les boutons/liens du site
  le lisent désormais depuis la base de données.
- **Photos** : aucune image n'a encore été intégrée dans ce projet — voir
  `public/images/README.md` pour la marche à suivre exacte (emplacements
  attendus pour le portrait et les 3 images du slider, et comment les
  brancher dans le code).
- Tout le **contenu de démonstration** (articles, projets, actions de
  terrain) est marqué `isDemoContent: true` en base et affiche un badge
  « Contenu de démonstration » sur le site — à remplacer par de vraies
  publications depuis l'administration.
- Les **emplacements photo** sans image affichent un repère « Photo à
  ajouter » plutôt qu'une image cassée ou déformée.


## Multimédia

La médiathèque permet d'associer plusieurs images et vidéos à chaque **actualité**, **projet**, **événement sportif** et **action de terrain**. Les vidéos peuvent être :

- uploadées localement (MP4, WEBM, MOV) ;
- intégrées depuis YouTube ;
- intégrées depuis Vimeo ;
- intégrées depuis Facebook (vidéo, Reel ou publication vidéo publique).

Chaque média peut avoir une légende et un texte ALT pour les images. L'ordre des médias est modifiable depuis l'administration. Pour Facebook, le contenu doit être public et un lien « Voir sur Facebook » est conservé comme solution de secours.

## Authentification locale

Le middleware protège `/admin/*` à l'exception de `/admin/login`. Les routes API de la médiathèque vérifient directement le JWT NextAuth afin d'éviter les erreurs de session lors des uploads et de l'ouverture de la bibliothèque média.
