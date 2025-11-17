"use client";

import { useEffect } from "react";

export default function TawkWidget() {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "default";
    if (!propertyId) return;

    let scriptEl: HTMLScriptElement | null = null;
    const appendScript = () => {
      if (scriptEl) return;
      scriptEl = document.createElement("script");
      scriptEl.async = true;
      scriptEl.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      scriptEl.charset = "UTF-8";
      scriptEl.setAttribute("crossorigin", "*");
      document.body.appendChild(scriptEl);
    };

    // Prefer requestIdleCallback to avoid blocking LCP. Fallback to a short timeout.
    let idleId: number | null = null;
    if (typeof (window as any).requestIdleCallback === "function") {
      idleId = (window as any).requestIdleCallback(appendScript, {
        timeout: 2000,
      });
    } else {
      idleId = window.setTimeout(appendScript, 2000);
    }

    // Also load earlier on user interaction (click/scroll/keydown) to improve UX.
    const onInteract = () => {
      if (idleId !== null) {
        try {
          if (typeof (window as any).cancelIdleCallback === "function") {
            (window as any).cancelIdleCallback(idleId as number);
          } else {
            clearTimeout(idleId as number);
          }
        } catch {}
        idleId = null;
      }
      appendScript();
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onInteract);
    };

    window.addEventListener("click", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract, { passive: true });
    window.addEventListener("scroll", onInteract, { passive: true });

    return () => {
      try {
        if (idleId !== null) {
          if (typeof (window as any).cancelIdleCallback === "function") {
            (window as any).cancelIdleCallback(idleId as number);
          } else {
            clearTimeout(idleId as number);
          }
        }
        if (scriptEl) document.body.removeChild(scriptEl);
      } catch {}
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
  }, []);

  return null;
}
