"use client";

import { useEffect } from "react";

// Reload the page once if a dynamic chunk fails to load (common in dev after code changes)
export default function ChunkReloadOnce() {
  useEffect(() => {
    const key = "__chunk_reload_once__";
    const handler = (event: any) => {
      const msg = event?.message || event?.reason?.message || "";
      const name = event?.name || event?.reason?.name || "";
      const isChunkError =
        /ChunkLoadError|Loading chunk|import\(\).*failed|Failed to fetch dynamically imported module/i.test(
          msg
        );
      if (isChunkError || name === "ChunkLoadError") {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          // Force a hard reload to pick up new chunks
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  return null;
}
