import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="default-theme flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl w-full">{children}</div>
      </main>
    </div>
  );
}
