"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function ResendSiteVisit({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.post(`/api/admin/site-visits/${id}/resend`);
      if (res.data && res.data.success) {
        setStatus("sent");
      } else if (res.data && res.data.warning) {
        setStatus(res.data.warning);
      } else {
        setStatus("failed");
      }
    } catch (err: any) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={handleResend} disabled={loading}>
        {loading ? "Resending..." : "Resend"}
      </Button>
      {status === "sent" && (
        <span className="text-xs text-green-600">Sent</span>
      )}
      {status && status !== "sent" && (
        <span className="text-xs text-amber-600">{status}</span>
      )}
    </div>
  );
}
