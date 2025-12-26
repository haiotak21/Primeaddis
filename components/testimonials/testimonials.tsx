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
                                  "url('data:image/jpeg;base64,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')",
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
                                  "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4Dg7S55gnaGRmp5h6_Vqr9UJtCgBL3nqYxw&s')",
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
                                  "url('data:image/jpeg;base64,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')",
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
