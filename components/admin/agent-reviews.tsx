"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function AgentReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const res = await fetch(`/api/agent/reviews?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (e) {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const onAct = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/agent/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json?.error || "Action failed");
        return;
      }
      setReviews((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, status: action === "approve" ? "approved" : "rejected" }
            : r
        )
      );
    } catch {}
  };

  const filtered = useMemo(() => reviews, [reviews]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border px-2 py-1 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by user or property"
          className="w-64 rounded-md border px-3 py-1.5 text-sm"
        />
        <button
          onClick={load}
          className="rounded-md bg-muted px-3 py-1.5 text-sm"
        >
          Apply
        </button>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="flex items-start justify-between border-b pb-4 last:border-0"
            >
              <div className="pr-4">
                <div className="font-medium">
                  {r.userId?.name || "User"} on{" "}
                  {r.propertyId?.title || "Property"}
                </div>
                <div className="text-sm">{r.comment}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-xs capitalize">
                  Status: {r.status || "pending"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAct(r._id, "approve")}
                  disabled={r.status === "approved"}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAct(r._id, "reject")}
                  disabled={r.status === "rejected"}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
