"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function InquiryActions({
  id,
  responded,
}: {
  id: string;
  responded: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(responded);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Listen for dialog open-change events so Cancel/X (which dispatch open-change)
  // properly update the local `confirmOpen` state.
  useEffect(() => {
    const onOpenChange = (e: any) => {
      try {
        const open = e?.detail?.open;
        if (typeof open === "boolean") setConfirmOpen(open);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("inquiry:delete-open-change", onOpenChange as any);
    return () =>
      window.removeEventListener(
        "inquiry:delete-open-change",
        onOpenChange as any
      );
  }, []);

  const toggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responded: !done }),
      });
      setDone(!done);
      // Notify other parts of the UI (badge) that inquiries changed
      try {
        window.dispatchEvent(new CustomEvent("inquiries:updated"));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update inquiry");
    } finally {
      setLoading(false);
    }
  };

  const del = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      // Try DELETE API first
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        // Not authenticated via fetch (no cookies) — fall back to form submit
        const form = document.createElement("form");
        form.method = "post";
        form.action = `/api/admin/inquiries/${id}/delete`;
        document.body.appendChild(form);
        form.submit();
        return;
      }
      // Notify badge/count listeners and reload after delete
      try {
        window.dispatchEvent(new CustomEvent("inquiries:updated"));
      } catch (e) {
        // ignore
      }
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to delete inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ConfirmDialog
        open={confirmOpen}
        title="Delete inquiry"
        description="This will permanently delete the inquiry. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmEvent={"inquiry:confirm-delete"}
        openChangeEvent={"inquiry:delete-open-change"}
      />

      <Button
        size="sm"
        variant={done ? "secondary" : "default"}
        onClick={toggle}
        disabled={loading}
      >
        {done ? "Responded" : "Mark responded"}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          setConfirmOpen(true);
          const onConfirm = () => {
            window.removeEventListener("inquiry:confirm-delete", onConfirm);
            setTimeout(() => del(), 0);
          };
          window.addEventListener("inquiry:confirm-delete", onConfirm);
        }}
        disabled={loading}
      >
        Delete
      </Button>
    </div>
  );
}
