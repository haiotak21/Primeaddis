"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type GalleryModalButtonProps = {
  images: string[];
  title: string;
  initialIndex?: number;
  className?: string;
};

export function GalleryModalButton({
  images,
  title,
  initialIndex = 0,
  className,
}: GalleryModalButtonProps) {
  const safeImages = useMemo(
    () =>
      Array.isArray(images) && images.length ? images : ["/placeholder.svg"],
    [images]
  );
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  const close = useCallback(() => setOpen(false), []);
  const openModal = useCallback(() => setOpen(true), []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % safeImages.length);
  }, [safeImages.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  return (
    <>
      <button
        onClick={openModal}
        type="button"
        className={
          className ||
          "bg-white/90 text-[#03063b] font-bold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-white transition-colors"
        }
      >
        <span className="material-symbols-outlined">photo_library</span>
        Show all photos
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-[#03063b]/95 p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          onClick={close}
          style={{ animation: "pa-gallery-fade-in 200ms ease-in-out" }}
        >
          {/* Header */}
          <header className="flex h-16 w-full items-center justify-between text-white flex-shrink-0">
            <div className="font-semibold text-lg truncate pr-4">
              <span>{title}</span>
            </div>
            <button
              className="flex h-12 items-center gap-2 rounded-full bg-[#0b8bff] px-6 text-base font-bold text-white transition-opacity hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
              Close
            </button>
          </header>

          {/* Main image */}
          <main
            className="relative flex flex-1 items-center justify-center py-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 m-2 flex size-14 items-center justify-center rounded-full bg-[#0b8bff]/80 text-white transition-opacity hover:opacity-90 md:m-4 md:size-16"
              onClick={prev}
              type="button"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined text-4xl">
                arrow_back_ios_new
              </span>
            </button>
            <div className="relative h-full w-full max-w-7xl">
              <div className="relative h-full w-full rounded-xl">
                <Image
                  alt={title}
                  src={safeImages[index]}
                  fill
                  className="h-full w-full rounded-xl object-contain"
                  unoptimized
                />
              </div>
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 m-2 flex size-14 items-center justify-center rounded-full bg-[#0b8bff]/80 text-white transition-opacity hover:opacity-90 md:m-4 md:size-16"
              onClick={next}
              type="button"
              aria-label="Next"
            >
              <span className="material-symbols-outlined text-4xl">
                arrow_forward_ios
              </span>
            </button>
          </main>

          {/* Thumbnails */}
          <footer
            className="flex h-32 w-full items-center justify-center flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 overflow-x-auto p-2">
              {safeImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src + i}
                  alt={`Thumbnail ${i + 1}`}
                  src={src}
                  onClick={() => setIndex(i)}
                  className={
                    "h-24 w-auto cursor-pointer rounded-lg border-4 transition-all " +
                    (i === index
                      ? "border-[#0b8bff] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-[#0b8bff]/50")
                  }
                />
              ))}
            </div>
          </footer>

          {/* Local keyframes for fade-in */}
          <style jsx global>{`
            @keyframes pa-gallery-fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
