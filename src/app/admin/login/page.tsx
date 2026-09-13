"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });

    setLoading(false);
    if (res?.error) {
      setError("Identifiants invalides.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="mb-2 font-display text-2xl font-extrabold">Administration</h1>
      <p className="mb-8 text-sm text-ink-soft">Connectez-vous pour gérer le contenu du site.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input name="email" type="email" placeholder="Email" required className="rounded-md border border-line px-3.5 py-3 text-sm" />
        <input name="password" type="password" placeholder="Mot de passe" required className="rounded-md border border-line px-3.5 py-3 text-sm" />
        {error && <p className="text-sm text-red">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-red">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
