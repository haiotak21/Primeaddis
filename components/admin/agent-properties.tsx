"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/agent/properties", { cache: "no-store" });
      const data = await res.json();
      setProperties(Array.isArray(data.properties) ? data.properties : []);
    } catch (e) {
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json?.error || "Failed to delete property");
        return;
      }
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch {}
  };

  if (loading)
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;

  if (!properties.length)
    return (
      <p className="text-sm text-muted-foreground">
        No properties yet. Use Add Property to create one.
      </p>
    );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => (
        <div key={p._id} className="rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {p.status}
              </div>
            </div>
            <div className="text-sm font-semibold">
              $ {Number(p.price || 0).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/properties/${p._id}`} className="underline">
              View
            </Link>
            <span>•</span>
            <Link
              href={`/admin/properties/${p._id}/edit`}
              className="underline"
            >
              Edit
            </Link>
            <span>•</span>
            <button
              onClick={() => onDelete(p._id)}
              className="text-destructive underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
