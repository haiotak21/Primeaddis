"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { IProperty } from "@/models";
import { HomePropertyCard } from "./home-property-card";
import { Button } from "@/components/ui/button";

type Props = {
  properties: IProperty[];
};

const MAX_STEPS = 7;

export function HomeLatest({ properties }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [steps, setSteps] = useState(0);

  const canPrev = steps > 0;
  const canNext = steps < MAX_STEPS;

  const handleNext = () => {
    if (!canNext) return;
    const el = scrollerRef.current;
    if (!el) return;
    const width = Math.max(280, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: width, behavior: "smooth" });
    setSteps((s) => Math.min(MAX_STEPS, s + 1));
  };

  const handlePrev = () => {
    if (!canPrev) return;
    const el = scrollerRef.current;
    if (!el) return;
    const width = Math.max(280, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: -width, behavior: "smooth" });
    setSteps((s) => Math.max(0, s - 1));
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No properties found.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto space-x-8 pb-4 no-scrollbar"
      >
        {properties.map((p) => (
          <div
            key={String(p._id)}
            className="flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]"
          >
            <HomePropertyCard property={p as any} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={!canPrev}
            className="rounded-full"
            aria-label="Previous"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canNext}
            className="rounded-full"
            aria-label="Next"
          >
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
