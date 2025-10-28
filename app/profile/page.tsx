"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  // Unified input styling for consistent box sizes
  const inputBase =
    "block w-full h-11 rounded-lg border border-[#dfe6e9] px-3 text-sm focus:border-[#0b8bff] focus:ring-[#0b8bff] focus:outline-none placeholder:text-slate-400";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        profileImage: session.user.image || "",
      });
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Prevent saving giant base64 data URLs into JWT/session; require hosted URL
      if (formData.profileImage && formData.profileImage.startsWith("data:")) {
        throw new Error(
          "Please upload the image using the uploader or provide an http(s) URL. Data URLs are not supported."
        );
      }
      await axios.put("/api/users/profile", {
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage,
      });

      // Update the auth session so Navbar avatar/name refresh immediately
      await update({ name: formData.name, image: formData.profileImage });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = async (e: any) => {
      const files: File[] = e?.detail?.files || [];
      if (!files.length) return;
      try {
        const fd = new FormData();
        fd.append("files", files[0]);
        // Add a client-side timeout slightly lower than server timeout so UI fails fast
        const clientTimeoutMs = Number(
          process.env.NEXT_PUBLIC_UPLOAD_TIMEOUT_MS || 25000
        );
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), clientTimeoutMs);
        const res = await fetch("/api/uploads", {
          method: "POST",
          body: fd,
          signal: controller.signal as any,
        });
        clearTimeout(timer);
        // Try to parse JSON body safely (some errors may return non-JSON)
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          const serverErr =
            (data && (data.error || data.details)) ||
            res.statusText ||
            "Upload failed";
          // Give a helpful hint when uploads are not configured on the server
          if (
            String(serverErr).toLowerCase().includes("uploads not configured")
          ) {
            setError(
              "Uploads are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment."
            );
          } else {
            setError(`Upload failed: ${serverErr}`);
          }
          return;
        }

        const url = data?.uploads?.[0]?.url || "";
        if (url) {
          setFormData((prev) => ({ ...prev, profileImage: url }));
          // Optimistically update session avatar so navbar reflects change immediately
          try {
            await update({ image: url });
          } catch {}
        }
      } catch (err: any) {
        // Log as warn to avoid surfacing expected user errors as app crashes
        const isAbort = err?.name === "AbortError";
        console.warn("Avatar upload error:", err?.message || err);
        setError(
          isAbort
            ? "Upload canceled or timed out. Please try again or use a smaller image."
            : err?.message || "Avatar upload failed. Please try again."
        );
      }
    };
    window.addEventListener("file-upload:change", handler as any);
    return () =>
      window.removeEventListener("file-upload:change", handler as any);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fafe]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between gap-3 mb-6">
          <div className="flex min-w-72 flex-col gap-1">
            <p className="text-[#03063b] text-4xl font-black leading-tight tracking-[-0.033em]">
              Profile Settings
            </p>
            <p className="text-slate-500 text-base">
              Manage your account information
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#dfe6e9] overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Section header */}
            <div className="border-b border-[#dfe6e9] pb-5">
              <h2 className="text-[#03063b] text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Personal Information
              </h2>
              <p className="text-slate-500 text-base pt-1">
                Update your profile details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="pt-6">
              {success && (
                <Alert className="mb-4">
                  <AlertDescription>
                    Profile updated successfully!
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column */}
                <div className="md:col-span-1">
                  <p className="text-[#03063b] font-semibold">
                    Profile Picture
                  </p>
                  <p className="text-slate-500 text-sm">
                    Update your profile picture.
                  </p>
                </div>
                {/* Right column */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  {/* Current avatar */}
                  <div className="flex items-center gap-4">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex-shrink-0 h-20 w-20"
                      style={{
                        backgroundImage: `url(${
                          formData.profileImage || "/placeholder.svg"
                        })`,
                      }}
                    />
                    <div className="flex flex-col justify-center">
                      <p className="text-[#03063b] text-lg font-bold leading-tight tracking-[-0.015em]">
                        Current Profile Picture
                      </p>
                      <p className="text-slate-500 text-base">
                        Upload a new photo
                      </p>
                    </div>
                  </div>
                  {/* Drag-and-drop area */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-500">
                          cloud_upload
                        </span>
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">Click to select</span>{" "}
                          or drop image(s)
                        </p>
                      </div>
                      {/* keep functional upload component hidden but clickable via label */}
                      <div className="hidden">
                        <FileUpload
                          eventName="file-upload:change"
                          multiple={false}
                        />
                      </div>
                    </label>
                  </div>
                  {/* Profile Image URL Input */}
                  <div>
                    <label
                      className="block text-sm font-medium text-[#03063b] mb-2"
                      htmlFor="profileImageUrl"
                    >
                      Profile Image URL
                    </label>
                    <input
                      id="profileImageUrl"
                      className={`${inputBase}`}
                      type="url"
                      value={formData.profileImage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profileImage: e.target.value,
                        })
                      }
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>

              <hr className="my-8 border-[#dfe6e9]" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column */}
                <div className="md:col-span-1">
                  <p className="text-[#03063b] font-semibold">
                    Account Details
                  </p>
                  <p className="text-slate-500 text-sm">
                    Edit your personal information.
                  </p>
                </div>
                {/* Right column */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  {/* Full Name */}
                  <div>
                    <label
                      className="block text-sm font-medium text-[#03063b] mb-2"
                      htmlFor="full-name"
                    >
                      Full Name
                    </label>
                    <input
                      id="full-name"
                      className={`${inputBase}`}
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium text-[#03063b] mb-2"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      className={`${inputBase} bg-slate-100 text-slate-500 cursor-not-allowed`}
                      type="email"
                      value={formData.email}
                      readOnly
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Email cannot be changed.
                    </p>
                  </div>
                  {/* Phone Number */}
                  <div>
                    <label
                      className="block text-sm font-medium text-[#03063b] mb-2"
                      htmlFor="phone-number"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone-number"
                      className={`${inputBase}`}
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  {/* Account Role */}
                  <div>
                    <label
                      className="block text-sm font-medium text-[#03063b] mb-2"
                      htmlFor="account-role"
                    >
                      Account Role
                    </label>
                    <div className="w-full h-11 rounded-lg border border-[#dfe6e9] bg-slate-100 text-slate-500 px-3 flex items-center text-sm capitalize">
                      {session?.user.role}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Your current account type.
                    </p>
                  </div>
                </div>
              </div>
              {/* Card footer */}
              <div className="bg-slate-50 mt-6 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 rounded-b-xl flex justify-end border-t border-[#dfe6e9]">
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg h-10 bg-[#0b8bff] text-white px-6 hover:bg-[#0b8bff]/90"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
