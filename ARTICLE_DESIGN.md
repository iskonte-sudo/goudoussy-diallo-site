# Nouvelle présentation des articles

La page publique `src/app/actualites/[slug]/page.tsx` a été refondue :
- fil d’Ariane ;
- image de couverture compacte et arrondie ;
- titre, catégorie, auteur, date et temps de lecture ;
- colonne de lecture confortable ;
- hiérarchie H2/H3, listes, citations et liens ;
- partage Facebook / X / LinkedIn / WhatsApp ;
- navigation article précédent / suivant ;
- sidebar « Dernières actualités » ;
- catégories avec compteur ;
- citation de la biographie si elle est renseignée ;
- galerie et vidéos conservées ;
- responsive mobile.

L’image de couverture utilise `unoptimized` pour éviter que l’optimiseur Next.js bloque les URLs Vercel Blob publiques pendant la phase de déploiement.

L’archive de livraison exclut volontairement les secrets, `.env*`, `.git`, `.vercel`, `node_modules`, `.next`, la base locale Prisma et `public/uploads`.
