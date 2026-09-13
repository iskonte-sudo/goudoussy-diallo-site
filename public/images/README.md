# Emplacement des photos

Déposez vos fichiers ici, puis suivez les 3 étapes ci-dessous pour les
brancher dans le site — le design bascule automatiquement de l'emplacement
"Photo à ajouter" vers votre image dès que le champ `imageUrl` est renseigné.

```
public/images/hero/        → photos du slider de l'accueil (3 images distinctes)
public/images/portraits/   → portrait(s) de Goudoussy Diallo (biographie, présentation)
public/images/galerie/     → photos de la galerie (ajoutées ensuite depuis /admin/galeries)
```

## 1. Photo de portrait (page Biographie)

Déposez le fichier, par exemple `public/images/portraits/portrait-1.jpg`,
puis dans `src/app/biographie/page.tsx` remplacez :

```tsx
<div className="card-photo-placeholder aspect-[3/4] rounded-md">Portrait à ajouter</div>
```

par :

```tsx
<div className="aspect-[3/4] overflow-hidden rounded-md">
  <Image src="/images/portraits/portrait-1.jpg" alt="Goudoussy Diallo" width={600} height={800} className="h-full w-full object-cover" />
</div>
```

(pensez à `import Image from "next/image";` en haut du fichier)

## 2. Les 3 images du slider (accueil)

Déposez 3 fichiers, par exemple `hero-1.jpg`, `hero-2.jpg`, `hero-3.jpg`
dans `public/images/hero/`. Dans `src/app/page.tsx`, chaque objet du tableau
`SLIDES` accepte un champ optionnel `imageUrl` — ajoutez-le à chacun des 3
slides :

```ts
const SLIDES: HeroSlide[] = [
  {
    ...
    imageUrl: "/images/hero/hero-1.jpg"
  },
  {
    ...
    imageUrl: "/images/hero/hero-2.jpg"
  },
  {
    ...
    imageUrl: "/images/hero/hero-3.jpg"
  }
];
```

Le composant `HeroSlider` applique déjà automatiquement le dégradé sombre par-
dessus pour garder le texte lisible, quelle que soit l'image.

## 3. Photos des heros de pages secondaires

Chaque page secondaire (Actualités, Projets, Sport & Jeunesse, etc.) utilise
le composant `<PageHero imageUrl={...} />`. Passez-lui une image de la même
façon, par exemple dans `src/app/sport-jeunesse/page.tsx` :

```tsx
<PageHero
  kicker="Sport & jeunesse"
  title="Le mini-football : une passion devenue une mission"
  description="..."
  imageUrl="/images/hero/mini-football.jpg"
/>
```

## 4. Photos d'articles, projets, actions de terrain, galerie

Celles-ci se gèrent directement depuis l'administration (`/admin`) une fois
le site en ligne : chaque formulaire de création/édition accepte une URL
d'image (qui peut pointer vers `/images/...` si le fichier est dans
`public/`, ou vers une image hébergée ailleurs).
