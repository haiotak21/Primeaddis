"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  // Use string-based event names to keep props serializable under RSC constraints
  confirmEvent?: string; // dispatches window.dispatchEvent(new CustomEvent(confirmEvent))
  openChangeEvent?: string; // dispatches with detail { open: boolean }
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmEvent = "confirm-dialog:confirm",
  openChangeEvent = "confirm-dialog:open-change",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Dispatch custom event for host to handle the action
      window.dispatchEvent(new CustomEvent(confirmEvent));
      window.dispatchEvent(
        new CustomEvent(openChangeEvent, { detail: { open: false } })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) =>
        window.dispatchEvent(
          new CustomEvent(openChangeEvent, { detail: { open: next } })
        )
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(openChangeEvent, { detail: { open: false } })
              )
            }
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
