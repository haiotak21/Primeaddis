"use client";

import { useEffect, useState } from "react";

interface Props {
  agentName?: string;
}

export default function ContactAgentActions({ agentName }: Props) {
  const [adminWhatsapp, setAdminWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchWhatsapp() {
      try {
        const res = await fetch("/api/admin/settings/whatsapp");
        const data = await res.json();
        if (!mounted) return;
        if (data?.whatsappNumber) {
          const digits = String(data.whatsappNumber).replace(/\D/g, "");
          setAdminWhatsapp(digits || null);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchWhatsapp();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChat = () => {
    const target = adminWhatsapp || "";
    if (!target) {
      // Fallback: open contact page if admin whatsapp not configured
      window.location.href = "/contact";
      return;
    }
    const message = encodeURIComponent(
      `Hello, I saw ${
        agentName || "your"
      } profile and would like to inquire about a listing.`
    );
    const href = `https://wa.me/${target}?text=${message}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleCall = () => {
    const tel = "0910840397";
    window.location.href = `tel:${tel}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleChat}
        className="w-full flex items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 bg-green-600 text-white text-sm sm:text-base font-bold tracking-wide hover:opacity-90"
      >
        Chat on WhatsApp
      </button>

      <button
        type="button"
        onClick={handleCall}
        className="w-full flex items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 bg-blue-600 text-white text-sm sm:text-base font-bold tracking-wide hover:opacity-90"
      >
        Call 0910840397
      </button>
    </div>
  );
}
