"use client";

import React, { useEffect, useState, useRef } from "react";
import { DEFAULT_SLIDES } from "@/components/home/hero-defaults";

type Slide = {
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
};

export default function HeroEditor() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/admin/hero", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const data = json?.data;
        if (data && Array.isArray(data.slides) && data.slides.length)
          setSlides(data.slides);
        else setSlides(DEFAULT_SLIDES as any);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const updateSlide = (i: number, patch: Partial<Slide>) => {
    setSlides((s) =>
      s.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
    setDirty(true);
  };

  const addSlide = () => {
    setSlides((s) => [...s, { image: "", title: "", subtitle: "", link: "" }]);
    setDirty(true);
  };

  const removeSlide = (i: number) => {
    setSlides((s) => s.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const move = (i: number, dir: number) => {
    setSlides((s) => {
      const copy = [...s];
      const j = i + dir;
      if (j < 0 || j >= copy.length) return copy;
      const tmp = copy[j];
      copy[j] = copy[i];
      copy[i] = tmp;
      setDirty(true);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(j?.error || "Failed to save");
      } else {
        setMessage("Saved successfully");
        setDirty(false);
      }
    } catch (e) {
      setMessage("Network error while saving");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Upload a file to Cloudinary via server route and set slide image
  const uploadFile = async (file: File, i: number) => {
    setUploadingIndex(i);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/hero/upload", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setMessage(j?.error || "Upload failed");
        return;
      }
      const j = await res.json();
      if (j?.url) {
        updateSlide(i, { image: j.url });
        setDirty(true);
      }
    } catch (e) {
      setMessage("Upload error");
    } finally {
      setUploadingIndex(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Drag & Drop handlers for reordering
  const onDragStart = (e: React.DragEvent, i: number) => {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    const to = i;
    if (from === null || from === to) return;
    setSlides((s) => {
      const copy = [...s];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
    dragIndex.current = null;
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-3">Hero Editor</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {slides.map((s, i) => (
            <div
              key={i}
              className="border p-3 rounded"
              draggable
              onDragStart={(e) => onDragStart(e, i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDrop={(e) => onDrop(e, i)}
            >
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSlide(i)}
                  className="ml-auto px-2 py-1 bg-red-100 rounded"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm">Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    className="w-full p-2 border rounded"
                    value={s.image}
                    onChange={(e) => updateSlide(i, { image: e.target.value })}
                  />
                  <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, i);
                      }}
                    />
                    {uploadingIndex === i ? "Uploading..." : "Upload"}
                  </label>
                </div>
                <div className="mt-2">
                  <div
                    className="relative w-full overflow-hidden rounded"
                    style={{ height: 220 }}
                  >
                    {s.image ? (
                      <>
                        <img
                          src={s.image}
                          alt={s.title || `slide-${i}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/45" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
                          <h3 className="text-lg font-bold line-clamp-1">
                            {s.title || "Title"}
                          </h3>
                          <p className="text-sm opacity-90 mt-2 line-clamp-2">
                            {s.subtitle || "Subtitle"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                </div>
                <label className="text-sm">Title</label>
                <input
                  className="w-full p-2 border rounded"
                  value={s.title}
                  onChange={(e) => updateSlide(i, { title: e.target.value })}
                />
                <label className="text-sm">Subtitle</label>
                <input
                  className="w-full p-2 border rounded"
                  value={s.subtitle}
                  onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                />
                <label className="text-sm">Link (optional)</label>
                <input
                  className="w-full p-2 border rounded"
                  value={s.link}
                  onChange={(e) => updateSlide(i, { link: e.target.value })}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSlide}
              className="px-3 py-2 bg-primary text-white rounded"
            >
              Add Slide
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className={
                "px-3 py-2 rounded " +
                (dirty && !saving
                  ? "bg-accent text-white"
                  : "bg-gray-200 text-gray-600")
              }
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {message && <div className="ml-3 text-sm">{message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
