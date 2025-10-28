"use client";

import { useCallback, useMemo, useState } from "react";

type ShareDialogButtonProps = {
  url: string;
  title?: string;
};

export function ShareDialogButton({ url, title }: ShareDialogButtonProps) {
  const [open, setOpen] = useState(false);
  const encodedUrl = useMemo(() => encodeURIComponent(url), [url]);
  const encodedTitle = useMemo(
    () => encodeURIComponent(title ?? "Check this property on PrimeAddis"),
    [title]
  );

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Simple visual feedback by briefly closing and reopening? Instead use alert.
      // In the current codebase we don't have a Toast here, so use a subtle fallback.
      // eslint-disable-next-line no-alert
      alert("Link copied to clipboard");
    } catch {
      // eslint-disable-next-line no-alert
      alert("Unable to copy. Please copy manually.");
    }
  }, [url]);

  const handleOpen = useCallback(async () => {
    // Prefer native share when available on mobile
    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? "PrimeAddis Property", url });
        return;
      } catch {
        // if user cancels or share fails, fall back to dialog
      }
    }
    setOpen(true);
  }, [title, url]);

  return (
    <>
      <button
        className="size-10 rounded-full border border-[#dde8f0] flex items-center justify-center hover:bg-[#f4fafe] transition-colors"
        aria-label="Share"
        onClick={handleOpen}
        type="button"
      >
        <span className="material-symbols-outlined">share</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Share this property"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl border border-[#dde8f0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#03063b]">
                Share this property
              </h2>
              <button
                className="text-[#03063b]/60 hover:text-[#03063b] transition-colors"
                onClick={() => setOpen(false)}
                aria-label="Close"
                type="button"
              >
                <span className="material-symbols-outlined text-3xl">
                  close
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6 text-center">
              <a
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#0b8bff]/10 transition-colors"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-14 h-14 bg-[#0b8bff] text-white flex items-center justify-center rounded-full">
                  {/* Facebook icon */}
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 24 24"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#03063b]">
                  Facebook
                </span>
              </a>

              <a
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#0b8bff]/10 transition-colors"
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-14 h-14 bg-[#0b8bff] text-white flex items-center justify-center rounded-full">
                  {/* X/Twitter icon */}
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 24 24"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#03063b]">
                  Twitter
                </span>
              </a>

              <a
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#0b8bff]/10 transition-colors"
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-14 h-14 bg-[#0b8bff] text-white flex items-center justify-center rounded-full">
                  {/* LinkedIn icon */}
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 24 24"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37z"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#03063b]">
                  LinkedIn
                </span>
              </a>

              <a
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#0b8bff]/10 transition-colors"
                href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
              >
                <div className="w-14 h-14 bg-[#0b8bff] text-white flex items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-3xl">
                    mail
                  </span>
                </div>
                <span className="text-sm font-medium text-[#03063b]">
                  Email
                </span>
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                className="w-full h-12 rounded-xl border border-[#dde8f0] bg-white pr-32 pl-4 text-[#03063b]/80 focus:ring-2 focus:ring-[#0b8bff]/50 focus:border-[#0b8bff]"
                readOnly
                type="text"
                value={url}
              />
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 px-4 bg-[#0b8bff] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                onClick={copyToClipboard}
                type="button"
              >
                <span>Copy link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
