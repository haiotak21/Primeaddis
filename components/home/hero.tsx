"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

const SLIDES = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDI31LFZ_nt5UjhYIOyDgVobHnj9NW3I3NI7dKBBDh5ngxxbmo7pgzG5zdEjQGFAgEvWW6cusOj9xvAiSoiAuMvuuGvUJcti2pgERSShkL0i1DeRWFA44Ti7cJJcUzYccsx8gWCrDZFCO3OSapkPTl8-NRqIPSdaCU0agIqBHxENtkZNlUhE3UI_C2OlkyAT_G-fVii8IUGv9eZWBTiAURqIaM3PLa-7EH2qLt6h7HEWH2smq9UhWkWXHGWb2RVKvSGHKh88z9w1_Di",
    title: "Your New Beginning Starts Here.",
    subtitle:
      "Discover exclusive properties in the world's most desired neighborhoods.",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDI31LFZ_nt5UjhYIOyDgVobHnj9NW3I3NI7dKBBDh5ngxxbmo7pgzG5zdEjQGFAgEvWW6cusOj9xvAiSoiAuMvuuGvUJcti2pgERSShkL0i1DeRWFA44Ti7cJJcUzYccsx8gWCrDZFCO3OSapkPTl8-NRqIPSdaCU0agIqBHxENtkZNlUhE3UI_C2OlkyAT_G-fVii8IUGv9eZWBTiAURqIaM3PLa-7EH2qLt6h7HEWH2smq9UhWkWXHGWb2RVKvSGHKh88z9w1_Di",
    title: "Find Luxury Homes & Apartments.",
    subtitle: "Handpicked listings for modern living and smart investment.",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDI31LFZ_nt5UjhYIOyDgVobHnj9NW3I3NI7dKBBDh5ngxxbmo7pgzG5zdEjQGFAgEvWW6cusOj9xvAiSoiAuMvuuGvUJcti2pgERSShkL0i1DeRWFA44Ti7cJJcUzYccsx8gWCrDZFCO3OSapkPTl8-NRqIPSdaCU0agIqBHxENtkZNlUhE3UI_C2OlkyAT_G-fVii8IUGv9eZWBTiAURqIaM3PLa-7EH2qLt6h7HEWH2smq9UhWkWXHGWb2RVKvSGHKh88z9w1_Di",
    title: "Live Where It Matters.",
    subtitle: "Top neighborhoods. Trusted agents. Seamless experience.",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );

  return (
    <section
      className="relative flex min-h-[70svh] sm:min-h-[85vh] md:min-h-screen w-full items-center justify-center overflow-hidden"
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStartX.current = t.clientX;
        touchStartY.current = t.clientY;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX.current;
        const dy =
          touchStartY.current === null ? 0 : t.clientY - touchStartY.current;
        // swipe threshold and horizontal dominance
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next();
          else prev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
      }}
    >
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50" />
        <img
          className="h-full w-full object-cover"
          src={SLIDES[index].image}
          alt="A luxurious modern house with a pristine lawn, large windows, and a sophisticated architectural design at dusk."
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-4 sm:px-6 pt-16 sm:pt-0 text-center text-white">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {SLIDES[index].title}
          </h1>
          <h2 className="mx-auto max-w-2xl text-base font-normal leading-normal text-slate-200 sm:text-lg">
            {SLIDES[index].subtitle}
          </h2>
        </div>
        <Link
          href="/properties"
          className="w-full sm:w-auto focus:outline-none"
        >
          <span className="flex h-10 sm:h-12 w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-primary px-5 sm:px-6 text-sm sm:text-base font-bold text-white transition-colors hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
            Explore Properties
          </span>
        </Link>
      </div>

      {/* Prev/Next buttons */}
      <button
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-sm ring-1 ring-white/30 backdrop-blur hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-sm ring-1 ring-white/30 backdrop-blur hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-center space-x-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? "h-2 w-2 rounded-full bg-accent ring-2 ring-accent ring-offset-2 ring-offset-black/50"
                  : "h-2 w-2 rounded-full bg-white/50 transition-colors hover:bg-white"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
