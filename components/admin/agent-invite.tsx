"use client";

import React, { useState } from "react";

export default function AgentInvite() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/agent/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
      setMessage("Agent account created. They can sign in now.");
      setEmail("");
      setPassword("");
    } catch (e: any) {
      setStatus("error");
      setMessage("Failed to create account. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        className="w-64 rounded-md border px-3 py-2 text-sm"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Set password"
        className="w-48 rounded-md border px-3 py-2 text-sm"
        minLength={8}
        required
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Invitation"}
      </button>
      {message && (
        <span
          className={`text-xs ${
            status === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {message}
        </span>
      )}
    </form>
  );
}
