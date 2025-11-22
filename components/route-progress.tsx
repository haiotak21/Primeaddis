"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    if (!lastPath) {
      setLastPath(pathname);
      return;
    }
    if (pathname !== lastPath) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 600);
      setLastPath(pathname);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-1 bg-[#0b8bff] w-0 animate-[progress_1.2s_linear_infinite] origin-left"
        style={{ width: visible ? "100%" : "0%" }}
      />
      <style>{`@keyframes progress { 0% { transform: scaleX(0.02); } 50% { transform: scaleX(0.6); } 100% { transform: scaleX(0.9); } }`}</style>
    </div>
  );
}
