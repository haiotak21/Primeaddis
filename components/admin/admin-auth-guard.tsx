"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If unauthenticated, send to sign-in
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    // If authenticated but not an admin or superadmin, send back to dashboard
    if (status === "authenticated" && session) {
      if (!["admin", "superadmin"].includes(session.user.role)) {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // When authenticated and role allowed, render children
  return <>{children}</>;
}
