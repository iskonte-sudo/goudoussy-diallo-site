"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HeroSlideData = {
  id: string;
  label: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageDesktopUrl: string | null;
  imageMobileUrl: string | null;
  primaryButtonText: string | null;
  primaryButtonLink: string | null;
  secondaryButtonText: string | null;
  secondaryButtonLink: string | null;
  quote: string | null;
  durationMs: number;
};

type Props = {
  slides: HeroSlideData[];
  /** Used only when no slide exists yet, so the homepage never shows a blank hero. */
  fallbackTagline: string;
};

export default function HeroSlider({ slides, fallbackTagline }: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const slide = slides[index];

  function go(n: number) {
    setIndex(((n % slides.length) + slides.length) % slides.length);
  }

  useEffect(() => {
    if (slides.length <= 1) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(index + 1), slide?.durationMs || 7000);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides.length]);

  // Fallback propre si aucun slide n'est configuré dans l'administration.
  if (slides.length === 0) {
    return (
      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-navy px-6 text-center">
        <div>
          <p className="mb-3 font-display text-2xl font-extrabold text-white sm:text-3xl">Goudoussy Diallo</p>
          <p className="mx-auto max-w-[46ch] text-[#D6D9E0]">{fallbackTagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[620px] overflow-hidden bg-navy max-[640px]:min-h-[560px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={
          slide.imageDesktopUrl
            ? { backgroundImage: `url(${slide.imageDesktopUrl})` }
            : {
                backgroundImage:
                  "linear-gradient(155deg,#3a4666 0%,#1a2440 45%,#0E1B3C 100%)"
              }
        }
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(8,13,28,0.94) 0%, rgba(8,13,28,0.82) 26%, rgba(8,13,28,0.42) 52%, rgba(8,13,28,0.12) 74%, rgba(8,13,28,0.06) 100%)"
          }}
        />
        {!slide.imageDesktopUrl && (
          <div className="absolute right-6 top-5 z-10 border border-dashed border-white/28 px-3 py-2 text-[0.68rem] text-white/50">
            Photographie à ajouter
          </div>
        )}
        <div
          className="absolute bottom-0 right-0 top-0 w-2"
          style={{
            background: "linear-gradient(180deg,#CE1126 0 33.3%,#E8B923 33.3% 66.6%,#0F8A4F 66.6% 100%)"
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[620px] items-center px-14 max-[640px]:min-h-[560px] max-[640px]:px-5">
        <div className="max-w-[600px] py-16">
          {slide.label && (
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#C9CCCE]">{slide.label}</p>
          )}
          <h1 className="mb-4 font-display text-4xl font-extrabold uppercase leading-[1.04] tracking-tight text-white sm:text-6xl">
            {slide.title}
          </h1>
          {slide.subtitle && <p className="mb-4 text-lg font-semibold text-white/90">{slide.subtitle}</p>}
          {slide.description && (
            <p className="mb-7 max-w-[46ch] text-[1.02rem] text-[#D6D9E0]">{slide.description}</p>
          )}
          <div className="flex flex-wrap gap-3.5">
            {slide.primaryButtonText && slide.primaryButtonLink && (
              <Link href={slide.primaryButtonLink} className="btn btn-red">
                {slide.primaryButtonText} →
              </Link>
            )}
            {slide.secondaryButtonText && slide.secondaryButtonLink && (
              <Link href={slide.secondaryButtonLink} className="btn btn-outline-hero">
                {slide.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {slide.quote && (
        <div className="absolute bottom-9 right-9 z-10 hidden max-w-[230px] bg-navy/70 p-5 font-display text-base font-semibold leading-snug text-white backdrop-blur-sm sm:block">
          « {slide.quote} »
        </div>
      )}

      {slides.length > 1 && (
        <>
          <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4">
            <button
              aria-label="Précédent"
              onClick={() => go(index - 1)}
              className="h-10 w-10 rounded-full border border-white/35 bg-navy/40 text-white"
            >
              ←
            </button>
            <button
              aria-label="Suivant"
              onClick={() => go(index + 1)}
              className="h-10 w-10 rounded-full border border-white/35 bg-navy/40 text-white"
            >
              →
            </button>
          </div>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Diapositive ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-red" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
