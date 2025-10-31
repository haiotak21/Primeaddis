"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const Star = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5 text-yellow-500"
  >
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" />
  </svg>
);

const ArrowLeft = () => (
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
);
const ArrowRight = () => (
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
);

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const total = 3; // three groups/slides
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  return (
    <section className="font-display bg-background text-foreground">
      <div className="relative flex min-h-[80vh] sm:min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex flex-1 justify-center px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-6xl flex-col items-center gap-8">
            {/* Header */}
            <div className="flex w-full max-w-[960px] flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0d171b] dark:text-white sm:text-4xl">
                What Our Clients Say
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Discover why homeowners and buyers trust us for a seamless real
                estate experience.
              </p>
            </div>

            {/* Carousel */}
            <div className="relative w-full">
              <div
                className="overflow-hidden"
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  touchStartXRef.current = t.clientX;
                  touchStartYRef.current = t.clientY;
                }}
                onTouchEnd={(e) => {
                  if (touchStartXRef.current === null) return;
                  const t = e.changedTouches[0];
                  const dx = t.clientX - touchStartXRef.current;
                  const dy =
                    touchStartYRef.current === null
                      ? 0
                      : t.clientY - touchStartYRef.current;
                  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx < 0) next();
                    else prev();
                  }
                  touchStartXRef.current = null;
                  touchStartYRef.current = null;
                }}
              >
                <div
                  className="flex w-full transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${index * 100}%)` }}
                >
                  {[0, 1, 2].map((slide) => (
                    <div key={slide} className="w-full flex gap-6 p-4 shrink-0">
                      {/* Card 1 */}
                      <div className="flex min-w-0 flex-[0_0_100%] flex-col rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 transition-all dark:bg-[#1a2831] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
                        <div className="flex items-center gap-2">
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                        </div>
                        <blockquote className="mt-4 flex-grow text-gray-800 dark:text-gray-200">
                          <p>
                            "The best real estate experience we've ever had. The
                            team was professional, knowledgeable, and incredibly
                            responsive throughout the entire process."
                          </p>
                        </blockquote>
                        <footer className="mt-6 flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div
                              className="h-full w-full rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage:
                                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALK0DjLPA6fTmuPUJRWwMlmNtH2_YHPhaQ9Gb8v-ZoHQkYkOHgAj3UlforE3WxP9Ho7z7lX1rng-XkNZkw0rRl6fz8mLSikSkV95D2oa_WfcihBiDWsiXfmp3idT59Ambrec37RCXddmQGTd3ftdKuZzcyE5DJQI4yvBsKsK-2o1yHMkjNDOCKut9nDfQCMv-VpTzsfjmARIE9HGhlxs6xZLZR27lumHL3Ot44kYZrXz5e3JW-l-226cblc8DIdsG72KQMtE6xXVEc')",
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Abeba Tesfaye
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Home Buyer in Addis Ababa
                            </p>
                          </div>
                        </footer>
                      </div>

                      {/* Card 2 */}
                      <div className="hidden min-w-0 flex-[0_0_100%] flex-col rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 transition-all dark:bg-[#1a2831] md:flex md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]">
                        <div className="flex items-center gap-2">
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                        </div>
                        <blockquote className="mt-4 flex-grow text-gray-800 dark:text-gray-200">
                          <p>
                            "I found my dream home in just two weeks! The
                            process was seamless from start to finish. I
                            couldn't have asked for a better team. Highly
                            recommended!"
                          </p>
                        </blockquote>
                        <footer className="mt-6 flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div
                              className="h-full w-full rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage:
                                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAUrbaY0OatC0SxU3P6vdtnn2eeWYM8baN8hpuQmQIZ2_Fy-XyyTtl2C0oGNmeC57duUi7eW4_5YEdSr06sMwf6K5tyPP8FBeYnrNiwoP1fmLXUEKZhb68p3CUjoMiYvYMtcujBGMCsAE5X1TpIqg30pD26C4Z_9vVy8yxM8S79aI4EtnygdHXHNBx3Si_pJN3FeX6XQ1q_2dCJoCIG3q1jNn-tReFKULQ9PXZ5saWdNHa8fIDtZ0oIsva4KK96XtOV7JKEubqbCWo8')",
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Dawit Lemma
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              First-Time Homeowner
                            </p>
                          </div>
                        </footer>
                      </div>

                      {/* Card 3 */}
                      <div className="hidden min-w-0 flex-[0_0_100%] flex-col rounded-xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 transition-all dark:bg-[#1a2831] lg:flex lg:flex-[0_0_calc(33.333%-16px)]">
                        <div className="flex items-center gap-2">
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                        </div>
                        <blockquote className="mt-4 flex-grow text-gray-800 dark:text-gray-200">
                          <p>
                            "Selling our home was stress-free thanks to their
                            expert guidance. They handled everything with
                            exceptional care and precision from listing to
                            closing."
                          </p>
                        </blockquote>
                        <footer className="mt-6 flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0">
                            <div
                              className="h-full w-full rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage:
                                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYH84ZvYuNdwNYHjR-9woEZYDYTfT8_FBIGFsJzqfMeRKH1jfbcMqBEVqTuIw-9K2n7RYozIz7PUuurlyS-hYHGA3voMIPsf2aTqX2K7pxsSzklZawGvMJh9a_Lyg14c5tNbsD8vMe-VmYRZ2OmcaQjbG34pdc6zidiGdvG9ATKraf5qKg2HoZllSnhCirJb210XmOxEE8wmlojL4xeMi8LdiATrj41cNv2yCpQFu4hMZkX0WbvMCIDk1mi2BiGBLc8njKRKOgwhDo')",
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              Lia Kebede
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Seller in Bole
                            </p>
                          </div>
                        </footer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="hidden sm:block absolute -left-8 top-1/2 -translate-y-1/2 md:-left-10">
                <button
                  onClick={prev}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md ring-1 ring-gray-900/5 backdrop-blur-sm transition hover:bg-white dark:bg-background/80 dark:text-gray-300 dark:hover:bg-background/90"
                >
                  <ArrowLeft />
                </button>
              </div>
              <div className="hidden sm:block absolute -right-8 top-1/2 -translate-y-1/2 md:-right-10">
                <button
                  onClick={next}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-md ring-1 ring-gray-900/5 backdrop-blur-sm transition hover:bg-white dark:bg-background/80 dark:text-gray-300 dark:hover:bg-background/90"
                >
                  <ArrowRight />
                </button>
              </div>
            </div>

            {/* Dots and CTA */}
            <div className="flex w-full max-w-[960px] flex-col items-center gap-8 sm:flex-row sm:justify-between">
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={
                      i === index
                        ? "h-2 w-2 rounded-full bg-primary"
                        : "h-2 w-2 rounded-full bg-gray-300 transition hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                    }
                  />
                ))}
              </div>
              <Link
                href="#"
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-primary/90"
              >
                Read More Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
