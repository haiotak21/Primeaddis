import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      if (res.ok) {
        setSubmitted(true);
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
        className="w-full"
        onClick={() => setOpen(true)}
      >
        Request Site Visit
      </Button>
      <p className="mt-1 text-xs text-green-600 text-center">
        Free transportation included!
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Site Visit</DialogTitle>
            <p className="text-xs text-muted-foreground mb-2">
              We'll arrange a free ride for you!
            </p>
          </DialogHeader>
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-green-600 font-semibold mb-2">
                Request submitted!
              </p>
              <p>Our team will contact you soon to confirm your visit.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="propertyId" value={propertyId} />
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  name="name"
                  required
                  className="w-full border rounded px-2 py-1"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border rounded px-2 py-1"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  required
                  className="w-full border rounded px-2 py-1"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Preferred Date
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full border rounded px-2 py-1"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
