import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="kicker">Erreur 404</p>
      <h1 className="mb-4 font-display text-3xl font-extrabold">Cette page n&apos;existe pas.</h1>
      <p className="mb-8 max-w-md text-ink-soft">
        La page que vous cherchez a peut-être été déplacée ou n&apos;existe plus.
      </p>
      <Link href="/" className="btn btn-red">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
