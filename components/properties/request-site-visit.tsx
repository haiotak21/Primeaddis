"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RequestSiteVisitProps {
  propertyId: string;
  propertyTitle: string;
}

export const RequestSiteVisit: React.FC<RequestSiteVisitProps> = ({
  propertyId,
  propertyTitle,
}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/properties/site-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyId, propertyTitle }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        if ((data as any)?.warning === "email_failed") {
          setEmailWarning(true);
        }
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (err) {
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <>
      <Button
        variant="default"
        className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary/10 text-primary text-base font-bold leading-normal tracking-wide hover:bg-primary/20 transition-colors"
        onClick={() => setOpen(true)}
      >
        Schedule Viewing
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="p-0 border-0 bg-transparent shadow-none"
        >
          {/* Hidden accessible title/description for a11y */}
          <DialogTitle className="sr-only">Request a Site Visit</DialogTitle>
          <DialogDescription className="sr-only">
            Schedule a viewing for this property
          </DialogDescription>

          <div className="layout-container w-full max-w-2xl rounded-xl bg-background shadow-2xl">
            <div className="flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex-1" />
                <button
                  className="p-2 text-foreground/70 hover:text-foreground"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {/* Heading */}
                <div className="flex flex-wrap justify-between gap-3 pb-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-foreground tracking-tight text-3xl font-bold leading-tight">
                      Schedule a Viewing
                    </p>
                    <p className="text-foreground/60 text-base">
                      {propertyTitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-8 md:flex-row md:gap-10">
                  {/* Left: Date only (we remove unsupported fancy calendar/time) */}
                  <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex flex-col">
                      <h3 className="text-foreground text-lg font-bold leading-tight pb-2">
                        Select a Date
                      </h3>
                      <p className="text-foreground/80 text-sm pb-4">
                        Choose an available date.
                      </p>
                      {/* Native date input styled */}
                      <input
                        name="date"
                        type="date"
                        required
                        value={form.date}
                        onChange={handleChange}
                        className="h-12 rounded-lg border bg-white text-foreground px-3 focus-visible:ring-2 focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Right: Your Information */}
                  <div className="flex w-full flex-col md:w-1/2">
                    <h3 className="text-foreground text-lg font-bold leading-tight pb-2">
                      Your Information
                    </h3>
                    {submitted ? (
                      <div className="text-center py-8">
                        <p className="text-green-600 font-semibold mb-2">
                          Request submitted!
                        </p>
                        <p className="text-foreground/80">
                          Our team will contact you soon to confirm your visit.
                        </p>
                        {emailWarning && (
                          <p className="text-yellow-600 text-sm mt-2">
                            We couldn't send email notifications right now — the
                            request was saved and we'll follow up manually.
                          </p>
                        )}
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 pt-4"
                      >
                        <input
                          type="hidden"
                          name="propertyId"
                          value={propertyId}
                        />
                        <div className="flex flex-col gap-1.5">
                          <label
                            className="text-sm font-medium text-foreground"
                            htmlFor="rsv-name"
                          >
                            Full Name
                          </label>
                          <input
                            id="rsv-name"
                            name="name"
                            required
                            className="w-full rounded-lg border bg-white px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            className="text-sm font-medium text-foreground"
                            htmlFor="rsv-email"
                          >
                            Email
                          </label>
                          <input
                            id="rsv-email"
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border bg-white px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            className="text-sm font-medium text-foreground"
                            htmlFor="rsv-phone"
                          >
                            Phone Number
                          </label>
                          <input
                            id="rsv-phone"
                            name="phone"
                            required
                            className="w-full rounded-lg border bg-white px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                          />
                        </div>

                        {/* Footer / CTA */}
                        <DialogFooter className="mt-2">
                          <Button
                            type="submit"
                            className="w-full rounded-lg bg-primary text-primary-foreground h-12 text-base font-bold hover:bg-primary/90"
                          >
                            Confirm Schedule
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
