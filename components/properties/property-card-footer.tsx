"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FooterProps {
  propertyId: string;
  listedBy?: { name: string; profileImage?: string };
}

export default function PropertyCardFooter({
  propertyId,
  listedBy,
}: FooterProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Use per-property event names so only this card responds
  const confirmEvent = React.useMemo(
    () => `property-delete:confirm:${propertyId}`,
    [propertyId]
  );
  const openChangeEvent = React.useMemo(
    () => `property-delete:open-change:${propertyId}`,
    [propertyId]
  );

  // Ensure SSR/CSR markup matches to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wire to custom events exposed by ConfirmDialog
  React.useEffect(() => {
    const onConfirm = async () => {
      await axios.delete(`/api/properties/${propertyId}`);
      setConfirmOpen(false);
      router.refresh();
    };
    const onOpenChange = (e: any) => setConfirmOpen(!!e?.detail?.open);
    window.addEventListener(confirmEvent, onConfirm as any);
    window.addEventListener(openChangeEvent, onOpenChange as any);
    return () => {
      window.removeEventListener(confirmEvent, onConfirm as any);
      window.removeEventListener(openChangeEvent, onOpenChange as any);
    };
  }, [propertyId, router, confirmEvent, openChangeEvent]);

  const isAdmin =
    mounted &&
    !!session &&
    ["admin", "superadmin"].includes((session as any).user?.role);

  if (isAdmin) {
    return (
      <div className="flex w-full items-center justify-between">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/properties/${propertyId}/edit`}>Edit</Link>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          title="Delete property?"
          description="This action cannot be undone."
          confirmText="Delete"
          confirmEvent={confirmEvent}
          openChangeEvent={openChangeEvent}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {listedBy?.profileImage && (
        <div className="relative h-6 w-6 overflow-hidden rounded-full">
          <Image
            src={listedBy.profileImage || "/placeholder.svg"}
            alt={listedBy.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <span className="text-sm text-muted-foreground">{listedBy?.name}</span>
    </div>
  );
}
