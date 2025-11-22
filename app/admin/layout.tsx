import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import AdminBottomNav from "@/components/admin/admin-bottom-nav";
import AdminPageEffects from "@/components/admin/admin-page-effects";
import AdminAuthGuard from "@/components/admin/admin-auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="app-theme bg-background text-foreground flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 px-4 pt-6 pb-24 sm:p-6 lg:p-8">
          {/* Hide global footer on admin pages and handle body-level flags */}
          <AdminPageEffects />
          <div className="mx-auto max-w-7xl w-full">{children}</div>
          {/* Bottom tab bar on mobile */}
          <AdminBottomNav />
        </main>
      </div>
    </AdminAuthGuard>
  );
}
