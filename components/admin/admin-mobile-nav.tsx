"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminLinks } from "@/components/admin/admin-sidebar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminMobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return null;
  }

  const filtered = adminLinks.filter((l) =>
    l.roles.includes(session.user.role as any)
  );

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl w-full px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0b8bff]">
            dashboard
          </span>
          <span className="font-semibold">Admin</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              aria-label="Open admin menu"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-sm font-medium"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </DialogTrigger>
          <DialogContent
            showCloseButton
            className="top-0 left-0 translate-x-0 translate-y-0 h-screen w-screen max-w-none rounded-none p-0"
          >
            {/* Hidden semantic title for accessibility */}
            <DialogHeader className="sr-only">
              <DialogTitle>Admin Menu</DialogTitle>
            </DialogHeader>
            <div className="h-full w-full flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b8bff]">
                    menu
                  </span>
                  <span className="font-semibold">Admin Menu</span>
                </div>
              </div>
              <nav className="p-3 grid gap-1">
                {filtered.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3",
                        active
                          ? "bg-[#0b8bff]/10 text-[#0b8bff]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <span className="material-symbols-outlined">
                        {l.icon}
                      </span>
                      <span className="text-sm font-medium">{l.title}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
              </nav>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
