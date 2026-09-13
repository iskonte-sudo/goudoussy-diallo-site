"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Échec de l'envoi");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-md border border-green/30 bg-green/10 p-6 text-sm text-green">
        Message envoyé — merci, nous revenons vers vous rapidement.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-[480px] flex-col gap-3.5">
      <input name="name" type="text" placeholder="Nom" required className="rounded-md border border-line px-3.5 py-3 text-sm" />
      <input name="email" type="email" placeholder="Email" required className="rounded-md border border-line px-3.5 py-3 text-sm" />
      <input name="phone" type="tel" placeholder="Téléphone" className="rounded-md border border-line px-3.5 py-3 text-sm" />
      <input name="subject" type="text" placeholder="Objet" className="rounded-md border border-line px-3.5 py-3 text-sm" />
      <textarea name="message" rows={4} placeholder="Message" required className="rounded-md border border-line px-3.5 py-3 text-sm" />
      <button type="submit" disabled={status === "sending"} className="btn btn-red w-fit">
        {status === "sending" ? "Envoi en cours…" : "Envoyer le message →"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red">Une erreur est survenue, merci de réessayer.</p>
      )}
    </form>
  );
}
