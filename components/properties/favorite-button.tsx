"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  propertyId: string;
  className?: string;
};

export function FavoriteButton({ propertyId, className }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/users/favorites");
        const list: any[] = res.data?.favorites || [];
        if (!mounted) return;
        setIsFav(list.some((p: any) => String(p._id) === String(propertyId)));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const toggle = async () => {
    if (busy) return;
    if (!session) {
      const callback =
        typeof window !== "undefined"
          ? window.location.href
          : `/properties/${propertyId}`;
      router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }
    setBusy(true);
    try {
      if (isFav) {
        await axios.delete(`/api/users/favorites/${propertyId}`);
        setIsFav(false);
        toast({ title: "Removed", description: "Removed from favorites." });
      } else {
        await axios.post("/api/users/favorites", { propertyId });
        setIsFav(true);
        toast({ title: "Saved", description: "Added to favorites." });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Action failed.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label="Favorite"
      className={
        className ||
        "size-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
      }
      title={isFav ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={`${
          isFav ? "fill-red-500 stroke-red-500" : "stroke-gray-500"
        } h-4 w-4`}
        aria-hidden
      />
    </button>
  );
}

export default FavoriteButton;
