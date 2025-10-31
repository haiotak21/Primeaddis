"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useCurrency } from "@/contexts/currency-context";
import { useTheme } from "next-themes";
import { GlobeIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => setMounted(true), []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const langBtn = document.getElementById("lang-toggle");
      const langMenu = document.getElementById("lang-menu");
      const currencyBtn = document.getElementById("currency-toggle");
      const currencyMenu = document.getElementById("currency-menu");
      if (
        langOpen &&
        langMenu &&
        langBtn &&
        !langMenu.contains(e.target as Node) &&
        !langBtn.contains(e.target as Node)
      ) {
        setLangOpen(false);
      }
      if (
        currencyOpen &&
        currencyMenu &&
        currencyBtn &&
        !currencyMenu.contains(e.target as Node) &&
        !currencyBtn.contains(e.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen, currencyOpen]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="relative">
      <div
        className={`${
          isHome
            ? "absolute top-0 md:sticky md:top-[34px]"
            : "sticky top-0 md:top-[34px]"
        } z-50 w-full`}
      >
        <header
          className={`relative mx-auto max-w-[1380px] flex h-14 sm:h-16 lg:h-[90px] w-full items-center justify-between rounded-full px-3 sm:px-4 md:px-8 ${
            mobileMenuOpen
              ? "bg-transparent shadow-none"
              : "bg-white shadow-lg dark:bg-[#2D3748]"
          } border border-transparent dark:border-[#4A5568]`}
        >
          <div className="flex items-center gap-10">
            {/* Centered logo on mobile (absolute) */}
            <div className="sm:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none select-none">
              <Image
                src="/logo.png"
                alt={t("site.title")}
                width={180}
                height={40}
                className="h-7 w-auto"
                priority
              />
            </div>

            {/* Default logo (hidden on mobile) */}
            <Link href="/" className="hidden sm:flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={t("site.title")}
                width={180}
                height={40}
                className="h-8 w-auto block dark:hidden"
                priority
              />
              <Image
                src="/prime addis white 1.png"
                alt={t("site.title")}
                width={180}
                height={40}
                className="h-8 w-auto hidden dark:block"
                priority
              />
            </Link>

            <div className="ml-2 flex lg:hidden">
              <button
                className="inline-flex items-center justify-center rounded p-2 text-gray-800 dark:text-slate-200 sm:text-inherit hover:bg-transparent sm:hover:bg-muted focus:outline-none"
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link
                href="/properties"
                prefetch
                className="text-gray-800 dark:text-gray-300 text-base font-medium hover:text-primary dark:hover:text-white transition-colors whitespace-nowrap"
              >
                {t("nav.properties")}
              </Link>
              <Link
                href="/agents"
                prefetch
                className="text-gray-800 dark:text-gray-300 text-base font-medium hover:text-primary dark:hover:text-white transition-colors"
              >
                Agents
              </Link>
              <Link
                href="/about"
                prefetch
                className="text-gray-800 dark:text-gray-300 text-base font-medium hover:text-primary dark:hover:text-white transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          <div
            className={`flex items-center gap-3 sm:gap-4 ${
              mobileMenuOpen ? "invisible sm:visible" : ""
            }`}
          >
            <div className="hidden md:flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors"
                  id="lang-toggle"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  onClick={() => {
                    setLangOpen((v) => !v);
                    setCurrencyOpen(false);
                  }}
                >
                  <span className="uppercase">{locale}</span>
                  <ChevronDown className="text-base h-4 w-4" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-20 rounded bg-popover shadow-lg z-50 ${
                    langOpen ? "" : "hidden"
                  }`}
                  id="lang-menu"
                >
                  <button
                    className={`w-full text-left px-3 py-2 text-xs rounded ${
                      locale === "en"
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      document.cookie = `NEXT_LOCALE=en; path=/; max-age=31536000`;
                      router.refresh();
                    }}
                  >
                    EN
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-xs rounded ${
                      locale === "am"
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      document.cookie = `NEXT_LOCALE=am; path=/; max-age=31536000`;
                      router.refresh();
                    }}
                  >
                    AM
                  </button>
                </div>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5568]" />
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors"
                  id="currency-toggle"
                  aria-haspopup="listbox"
                  aria-expanded={currencyOpen}
                  onClick={() => {
                    setCurrencyOpen((v) => !v);
                    setLangOpen(false);
                  }}
                >
                  <span>{currency}</span>
                  <ChevronDown className="text-base h-4 w-4" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-20 rounded bg-popover shadow-lg z-50 ${
                    currencyOpen ? "" : "hidden"
                  }`}
                  id="currency-menu"
                >
                  <button
                    className={`w-full text-left px-3 py-2 text-xs rounded ${
                      currency === "USD"
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setCurrency("USD")}
                  >
                    USD
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-xs rounded ${
                      currency === "ETB"
                        ? "bg-primary text-white"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setCurrency("ETB")}
                  >
                    ETB
                  </button>
                </div>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5568]" />
              <button
                className="h-9 w-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
                    </svg>
                  )
                ) : null}
              </button>
            </div>

            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            ) : session ? (
              <>
                <NotificationDropdown />
                <Link
                  href="/properties/new"
                  prefetch
                  className="hidden sm:inline-block"
                >
                  <span className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium text-gray-900 dark:text-gray-100 border-gray-300 dark:border-[#4A5568] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    List Property
                  </span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name}
                        />
                        <AvatarFallback>
                          {getInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-56 sm:w-72 max-w-[90vw] p-0 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden text-[12px] sm:text-sm"
                  >
                    {/* Header */}
                    <div className="p-2.5 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <img
                          alt="User avatar"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          src={session.user.image || "/placeholder.svg"}
                        />
                        <div>
                          <p className="font-semibold text-[12px] sm:text-sm text-zinc-800 dark:text-zinc-100">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      <span className="mt-2 inline-block px-2 py-0.5 text-[11px] sm:text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors capitalize">
                        {session.user.role}
                      </span>
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                    {/* Main links */}
                    <div className="p-2">
                      <DropdownMenuItem
                        asChild
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                      >
                        <Link
                          href={
                            session.user.role === "admin" ||
                            session.user.role === "superadmin"
                              ? "/admin/properties"
                              : "/dashboard"
                          }
                          prefetch
                          className="flex items-center w-full"
                        >
                          <span className="material-symbols-outlined mr-2.5 sm:mr-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
                            grid_view
                          </span>
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                      >
                        <Link
                          href="/profile"
                          prefetch
                          className="flex items-center w-full"
                        >
                          <span className="material-symbols-outlined mr-2.5 sm:mr-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
                            person
                          </span>
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                      >
                        <Link
                          href="/favorites"
                          prefetch
                          className="flex items-center w-full"
                        >
                          <span className="material-symbols-outlined mr-2.5 sm:mr-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
                            favorite
                          </span>
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    {(session.user.role === "admin" ||
                      session.user.role === "superadmin") && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                        <div className="p-2">
                          <DropdownMenuItem
                            asChild
                            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                          >
                            <Link
                              href="/admin"
                              prefetch
                              className="flex items-center w-full"
                            >
                              <span className="material-symbols-outlined mr-2.5 sm:mr-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
                                admin_panel_settings
                              </span>
                              Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}

                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                    <div className="p-2">
                      <DropdownMenuItem
                        className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer"
                        onClick={() => signOut({ callbackUrl: "/" })}
                      >
                        <span className="material-symbols-outlined mr-2.5 sm:mr-3 text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
                          logout
                        </span>
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  prefetch
                  className="inline-block px-3 sm:px-5 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  prefetch
                  className="hidden sm:inline-block"
                >
                  <span className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 md:h-11 px-5 md:px-6 bg-gray-900 dark:bg-primary text-slate-50 text-sm font-semibold tracking-wide transition-colors hover:bg-gray-800 dark:hover:bg-primary/90">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </header>
      </div>
      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-0 z-40 sm:hidden bg-background border-b pt-14"
        >
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/properties"
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.properties")}
            </Link>
            <Link
              href="/agents"
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Agents
            </Link>
            <Link
              href="/about"
              className="block rounded px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {/* Auth shortcuts */}
            {status !== "loading" &&
              (session ? (
                <>
                  <Link
                    href={
                      session.user.role === "admin" ||
                      session.user.role === "superadmin"
                        ? "/admin"
                        : "/dashboard"
                    }
                    className="block rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/favorites"
                    className="block rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <button
                    className="w-full text-left rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="block rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block rounded px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ))}
          </div>
        </div>
      )}
    </nav>
  );
}
