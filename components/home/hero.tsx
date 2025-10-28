"use client";

import { useState, useCallback } from "react";
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

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );

  return (
    <section className="relative flex h-screen w-full items-center justify-center">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50" />
        <img
          className="h-full w-full object-cover"
          src={SLIDES[index].image}
          alt="A luxurious modern house with a pristine lawn, large windows, and a sophisticated architectural design at dusk."
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center text-white">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {SLIDES[index].title}
          </h1>
          <h2 className="mx-auto max-w-2xl text-base font-normal leading-normal text-slate-200 sm:text-lg">
            {SLIDES[index].subtitle}
          </h2>
        </div>
        <Link href="/properties" className="focus:outline-none">
          <span className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
            Explore Properties
          </span>
        </Link>
      </div>

      {/* Prev/Next buttons */}
      <button
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-sm ring-1 ring-white/30 backdrop-blur hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black/40"
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
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-sm ring-1 ring-white/30 backdrop-blur hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black/40"
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
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
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
