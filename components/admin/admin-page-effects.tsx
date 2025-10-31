"use client";

import { useEffect } from "react";

// Applies body-level classes when on admin pages to control global layout (e.g., hide footer)
export default function AdminPageEffects() {
  useEffect(() => {
    const el = document.body;
    el.classList.add("hide-footer", "has-admin-bottom-nav");
    return () => {
      el.classList.remove("hide-footer", "has-admin-bottom-nav");
    };
  }, []);
  return null;
}
