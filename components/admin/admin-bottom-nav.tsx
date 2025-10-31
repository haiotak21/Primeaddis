"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { adminLinks } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

export default function AdminBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return null;
  }

  const links = adminLinks.filter((l) =>
    l.roles.includes(session.user.role as any)
  );

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-gray-900/75 overflow-hidden">
      <nav
        className="mx-auto w-full max-w-full overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain no-scrollbar"
        aria-label="Admin bottom navigation"
      >
        <ul className="flex items-stretch gap-1 px-1 whitespace-nowrap">
          {links.slice(0, 7).map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/admin" && pathname?.startsWith(l.href));
            return (
              <li key={l.href} className="flex-shrink-0">
                <Link
                  href={l.href}
                  className={cn(
                    "inline-flex min-w-[84px] flex-col items-center justify-center px-3 py-2.5 text-[11px] font-medium rounded-md",
                    active
                      ? "text-[#0b8bff]"
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[22px] leading-none",
                      active && "text-[#0b8bff]"
                    )}
                  >
                    {l.icon}
                  </span>
                  <span className="mt-0.5 leading-none">{l.title}</span>
                </Link>
              </li>
            );
          })}
          {/* Back to dashboard as last item */}
          <li className="flex-shrink-0">
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex min-w-[84px] flex-col items-center justify-center px-3 py-2.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 rounded-md"
              )}
            >
              <span className="material-symbols-outlined text-[22px] leading-none">
                arrow_back
              </span>
              <span className="mt-0.5 leading-none">Back</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
