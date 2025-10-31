"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  roles: Array<"admin" | "superadmin">;
};

export const adminLinks: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "dashboard",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Properties",
    href: "/admin/properties",
    icon: "apartment",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "group",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: "credit_card",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: "reviews",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: "bar_chart",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "settings",
    roles: ["superadmin"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    return null;
  }

  const roleLabel = session.user.role === "superadmin" ? "Superadmin" : "Admin";

  return (
    <aside className="hidden lg:flex h-screen min-h-[700px] w-64 flex-col justify-between bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 sticky top-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 px-3 pt-2">
          <h1 className="text-[#03063b] dark:text-white text-xl font-bold leading-normal">
            Admin Panel
          </h1>
          <span className="text-xs font-medium leading-none text-[#0b8bff] bg-[#0b8bff]/10 rounded-full px-2.5 py-1 self-start">
            {roleLabel}
          </span>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          {adminLinks
            .filter((l) => l.roles.includes(session.user.role as any))
            .map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                    active
                      ? "bg-[#0b8bff]/10 dark:bg-[#0b8bff]/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined",
                      active && "fill text-[#0b8bff]"
                    )}
                  >
                    {l.icon}
                  </span>
                  <p
                    className={cn(
                      "text-sm font-medium leading-normal",
                      active
                        ? "text-[#0b8bff]"
                        : "text-[#03063b] dark:text-gray-300"
                    )}
                  >
                    {l.title}
                  </p>
                </Link>
              );
            })}
        </nav>
      </div>
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-[#03063b] dark:text-gray-300">
            arrow_back
          </span>
          <p className="text-[#03063b] dark:text-gray-300 text-sm font-medium leading-normal">
            Back to Dashboard
          </p>
        </Link>
      </div>
    </aside>
  );
}
