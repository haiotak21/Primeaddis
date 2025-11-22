"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/layout/footer"), {
  ssr: false,
});

export default function ClientFooter() {
  return (
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  );
}
