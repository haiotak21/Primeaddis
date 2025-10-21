"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Light logo */}
              <Image
                src="/logo.png"
                alt={t("site.title")}
                width={180}
                height={40}
                className="h-8 w-auto block dark:hidden"
                priority
              />
              {/* Dark logo: uses exact file name in /public */}
              <Image
                src="/prime addis white 1.png"
                alt={t("site.title")}
                width={180}
                height={40}
                onClick={() => {
                  setLangOpen((v) => !v);
                  setCurrencyOpen(false);
                }}
                className="h-8 w-auto hidden dark:block"
                priority
              />
            </Link>

            <div className="ml-2 md:ml-10 flex md:hidden">
              {/* Mobile menu toggle */}
              <button
                className="inline-flex items-center justify-center rounded p-2 hover:bg-muted focus:outline-none"
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {/* Hamburger icon */}
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="ml-10 hidden space-x-4 md:flex">
              <Link
                href="/properties"
                prefetch
                className="text-sm font-medium hover:text-primary"
              >
                {t("nav.properties")}
              </Link>
              <Link
                href="/agents"
                prefetch
                className="text-sm font-medium hover:text-primary"
              >
                Agents
              </Link>
              <Link
                href="/about"
                prefetch
                className="text-sm font-medium hover:text-primary"
              >
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle Dropdown */}
            <div className="relative">
              <button
                className="flex items-center px-2 py-1 rounded hover:bg-muted focus:outline-none"
                id="lang-toggle"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                onClick={() => {
                  setLangOpen((v) => !v);
                  setCurrencyOpen(false);
                }}
              >
                <GlobeIcon className="h-5 w-5 mr-1" />
                <span className="font-medium uppercase text-xs">{locale}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div
                className={`absolute right-0 mt-2 w-20 rounded bg-popover shadow-lg z-50 ${
                  langOpen ? "" : "hidden"
                }`}
                id="lang-menu"
              >
                <button
                  className={`w-full text-left px-3 py-2 text-xs rounded ${
                    locale === "en" ? "bg-primary text-white" : "hover:bg-muted"
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
                    locale === "am" ? "bg-primary text-white" : "hover:bg-muted"
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
            {/* Currency Toggle Dropdown */}
            <div className="relative">
              <button
                className="flex items-center px-2 py-1 rounded hover:bg-muted focus:outline-none"
                id="currency-toggle"
                aria-haspopup="listbox"
                aria-expanded={currencyOpen}
                onClick={() => {
                  setCurrencyOpen((v) => !v);
                  setLangOpen(false);
                }}
              >
                <span className="font-medium text-xs">{currency}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
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
            {/* Theme Toggle */}
            <button
              className="flex items-center px-2 py-1 rounded hover:bg-muted focus:outline-none"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    List Property
                  </Button>
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                        <p className="text-xs font-medium text-primary capitalize">
                          {session.user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          session.user.role === "admin" ||
                          session.user.role === "superadmin"
                            ? "/admin/properties"
                            : "/dashboard"
                        }
                        prefetch
                      >
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" prefetch>
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" prefetch>
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    {(session.user.role === "admin" ||
                      session.user.role === "superadmin") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" prefetch>
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/signin" prefetch>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" prefetch>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t bg-background">
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
