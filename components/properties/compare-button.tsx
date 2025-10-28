"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/compare-context";
import type { IProperty } from "@/models";
import { Scale, Check } from "lucide-react";

interface CompareButtonProps {
  property: IProperty;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  labels?: {
    add?: string;
    added?: string;
  };
}

export function CompareButton({
  property,
  variant = "outline",
  size = "default",
  className,
  labels,
}: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(property._id as string);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(property._id as string);
    } else {
      addToCompare(property);
    }
  };

  const addLabel = labels?.add ?? "Compare";
  const addedLabel = labels?.added ?? "Added to Compare";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {inCompare ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {addedLabel}
        </>
      ) : (
        <>
          <Scale className="mr-2 h-4 w-4" />
          {addLabel}
        </>
      )}
    </Button>
  );
}
