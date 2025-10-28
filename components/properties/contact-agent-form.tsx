"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContactAgentFormProps {
  propertyId: string;
  propertyTitle: string;
}

export function ContactAgentForm({
  propertyId,
  propertyTitle,
}: ContactAgentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in ${propertyTitle}. Please contact me with more information.`,
  });

  // Prefill name/email if user is logged in. Using getSession avoids requiring a SessionProvider.
  useEffect(() => {
    let mounted = true;
    getSession()
      .then((sess) => {
        if (!mounted || !sess?.user) return;
        setFormData((prev) => ({
          ...prev,
          name: sess.user.name || prev.name,
          email: sess.user.email || prev.email,
        }));
      })
      .catch(() => void 0);
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post("/api/contact", {
        propertyId,
        ...formData,
      });

      setSuccess(true);
      // Keep auto-close after a short delay while also offering a Done button
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0b8bff] text-white text-base font-bold leading-normal tracking-wide hover:opacity-90 transition-opacity">
          Contact Agent
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="p-0 border-0 bg-transparent shadow-none"
      >
        {/* Hidden accessible title/description to satisfy Radix requirements */}
        <DialogTitle className="sr-only">Contact Agent</DialogTitle>
        <DialogDescription className="sr-only">
          Send an inquiry about this property
        </DialogDescription>
        {/* Container matching provided UI styling. We only change UI; functionality remains. */}
        {!success ? (
          <div className="relative w-full max-w-[560px] flex-1 rounded-xl bg-background shadow-lg">
            {/* Close button */}
            <button
              aria-label="Close modal"
              className="absolute top-4 right-4 text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex flex-col p-8 md:p-10">
              {/* We do not have agent details in this component props; omitting profile header per instruction to remove unsupported UI. */}

              {/* Headline */}
              <h2 className="text-foreground tracking-tight text-[28px] font-bold leading-tight pt-2 pb-4">
                Inquire About This Property
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <label className="flex flex-col flex-1">
                    <p className="text-foreground text-base font-medium leading-normal pb-2">
                      Full Name
                    </p>
                    <Input
                      className="h-12 rounded-lg border bg-white text-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </label>

                  {/* Email */}
                  <label className="flex flex-col flex-1">
                    <p className="text-foreground text-base font-medium leading-normal pb-2">
                      Email Address
                    </p>
                    <Input
                      type="email"
                      className="h-12 rounded-lg border bg-white text-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>

                {/* Phone */}
                <label className="flex flex-col flex-1">
                  <p className="text-foreground text-base font-medium leading-normal pb-2">
                    Phone Number (Optional)
                  </p>
                  <Input
                    type="tel"
                    className="h-12 rounded-lg border bg-white text-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </label>

                {/* Message */}
                <label className="flex flex-col flex-1">
                  <p className="text-foreground text-base font-medium leading-normal pb-2">
                    Message
                  </p>
                  <Textarea
                    className="min-h-36 rounded-lg border bg-white text-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/50"
                    placeholder={`I'm interested in ${propertyTitle}. Please contact me with more information.`}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </label>

                {/* Submit */}
                <Button
                  className="flex items-center justify-center w-full rounded-lg h-12 px-6 mt-4 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-wide hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[560px] flex-1 rounded-xl bg-background shadow-lg">
            {/* Close button */}
            <button
              aria-label="Close modal"
              className="absolute top-4 right-4 text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setOpen(false)}
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex flex-col items-center justify-center p-8 text-center md:p-10 h-[590px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6">
                <span className="material-symbols-outlined text-4xl text-green-600">
                  check_circle
                </span>
              </div>
              <h2 className="text-foreground text-[28px] font-bold leading-tight tracking-tight mb-2">
                Message Sent!
              </h2>
              <p className="text-foreground/80 max-w-sm text-base">
                The agent has been notified and will get back to you shortly.
              </p>
              <Button
                className="flex items-center justify-center w-full max-w-xs rounded-lg h-12 px-6 mt-8 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-wide hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSuccess(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
