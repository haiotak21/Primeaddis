"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  defaultValue?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
};

export function FeatureDialog({
  open,
  defaultValue = "30",
  onOpenChange,
  onConfirm,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      onConfirm(value);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feature duration</DialogTitle>
          <DialogDescription>
            Enter featured duration in days (e.g. 30) or an ISO date (e.g.
            2025-12-31). Leave blank for default 30 days.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="30"
            aria-label="featured duration"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Working..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
