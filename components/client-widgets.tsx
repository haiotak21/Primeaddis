"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CompareBar = dynamic(
  () => import("@/components/properties/compare-bar").then((m) => m.CompareBar),
  { ssr: false }
);
const TawkWidget = dynamic(
  () => import("@/components/common/tawk-widget").then((m) => m.default),
  { ssr: false }
);

export default function ClientWidgets() {
  return (
    <>
      <Suspense fallback={null}>
        <TawkWidget />
      </Suspense>
      <Suspense fallback={null}>
        <CompareBar />
      </Suspense>
      {/* Footer is intentionally omitted here — rendered at page bottom via ClientFooter */}
    </>
  );
}
