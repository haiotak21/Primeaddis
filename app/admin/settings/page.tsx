"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import axios from "axios";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (session && session.user.role !== "superadmin") {
      router.push("/admin");
    }
  }, [status, session, router]);

  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [siteVisitEmailEnabled, setSiteVisitEmailEnabled] =
    useState<boolean>(true);
  const [siteVisitLoading, setSiteVisitLoading] = useState(false);
  const [currency, setCurrency] = useState<string>("ETB");
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);

  // Load existing WhatsApp number once authenticated
  useEffect(() => {
    const load = async () => {
      if (session?.user.role === "superadmin") {
        try {
          const res = await fetch("/api/admin/settings/whatsapp", {
            credentials: "same-origin",
          });
          const data = await res.json();
          setWhatsappNumber(data.whatsappNumber || "");
        } catch {}
      }
    };
    load();
  }, [session]);

  // Load site-visit email toggle
  useEffect(() => {
    const loadToggle = async () => {
      if (session?.user.role === "superadmin") {
        try {
          const res = await fetch("/api/admin/settings/site-visit", {
            credentials: "same-origin",
          });
          const data = await res.json();
          setSiteVisitEmailEnabled(!!data.siteVisitEmailEnabled);
        } catch (e) {
          // keep default
        }
      }
    };
    loadToggle();
  }, [session]);

  // Load currency settings
  useEffect(() => {
    const loadCurrency = async () => {
      if (session?.user.role === "superadmin") {
        try {
          const res = await fetch("/api/admin/settings/currency", {
            credentials: "same-origin",
          });
          const data = await res.json();
          setCurrency(data.currency || "ETB");
          setExchangeRate(
            typeof data.exchangeRate === "number"
              ? data.exchangeRate
              : Number(data.exchangeRate) || 1
          );
        } catch (e) {
          // ignore
        }
      }
    };
    loadCurrency();
  }, [session]);

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  // Only render the admin settings UI for superadmins
  if (session?.user.role !== "superadmin") {
    return null;
  }

  const saveWhatsapp = async () => {
    setWhatsappLoading(true);
    setWhatsappSaved(false);
    try {
      const res = await axios.put("/api/admin/settings/whatsapp", {
        whatsappNumber,
      });
      if (res.data.success) {
        setWhatsappNumber(res.data.whatsappNumber || whatsappNumber);
        setWhatsappSaved(true);
        setTimeout(() => setWhatsappSaved(false), 2500);
      }
    } catch (e) {
      alert("Failed to save WhatsApp number");
    } finally {
      setWhatsappLoading(false);
    }
  };

  const saveSiteVisitToggle = async (val?: boolean) => {
    setSiteVisitLoading(true);
    try {
      const newVal = typeof val === "boolean" ? val : siteVisitEmailEnabled;
      const res = await axios.put("/api/admin/settings/site-visit", {
        siteVisitEmailEnabled: newVal,
      });
      if (res.data.success) {
        setSiteVisitEmailEnabled(!!res.data.siteVisitEmailEnabled);
      }
    } catch (err) {
      alert("Failed to update setting");
    } finally {
      setSiteVisitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-3 sm:mb-8">
          <h1 className="text-lg sm:text-4xl font-black leading-tight tracking-tight">
            System Settings
          </h1>
          <p className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">
            Configure platform settings (Superadmin only)
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full -mx-3 px-3 overflow-x-auto overflow-y-hidden touch-pan-x overscroll-x-contain no-scrollbar whitespace-nowrap flex justify-start gap-2 sm:gap-4">
            <TabsTrigger
              value="general"
              className="flex-none shrink-0 min-w-fit px-3 py-2 text-sm sm:text-base"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="flex-none shrink-0 min-w-fit px-3 py-2 text-sm sm:text-base"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex-none shrink-0 min-w-fit px-3 py-2 text-sm sm:text-base"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex-none shrink-0 min-w-fit px-3 py-2 text-sm sm:text-base"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex-none shrink-0 min-w-fit px-3 py-2 text-sm sm:text-base"
            >
              Contact / WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-3 sm:mt-6">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm !py-0 gap-3 sm:gap-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>General Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue="PrimeAddis" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    defaultValue="Find your dream property"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    defaultValue="support@primeaddis.com"
                  />
                </div>

                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-3 sm:mt-6">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm !py-0 gap-3 sm:gap-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Property Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval for new listings
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">VR Tours</p>
                    <p className="text-sm text-muted-foreground">
                      Enable VR viewing for properties
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Property Comparison</p>
                    <p className="text-sm text-muted-foreground">
                      Allow users to compare properties
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Reviews & Ratings</p>
                    <p className="text-sm text-muted-foreground">
                      Enable property reviews
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-3 sm:mt-6">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm !py-0 gap-3 sm:gap-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure payment and subscription options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="commission">Platform Commission (%)</Label>
                  <Input id="commission" type="number" defaultValue="5" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">Exchange Rate (to USD)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.0001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set the exchange rate used for displaying prices in
                    alternate currency (e.g. 1 ETB = 0.018 USD).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    disabled={currencyLoading}
                    onClick={async () => {
                      setCurrencyLoading(true);
                      try {
                        const res = await axios.put(
                          "/api/admin/settings/currency",
                          { currency, exchangeRate }
                        );
                        if (res.data.success) {
                          setCurrency(res.data.currency);
                          setExchangeRate(res.data.exchangeRate);
                          // Persist to cookies so the client CurrencyProvider picks up values immediately
                          try {
                            document.cookie = `CURRENCY=${res.data.currency}; path=/; max-age=31536000`;
                            document.cookie = `CURRENCY_RATE=${res.data.exchangeRate}; path=/; max-age=31536000`;
                          } catch (e) {
                            // ignore if cookies cannot be set (e.g., SSR contexts)
                          }
                          setCurrencySaved(true);
                          setTimeout(() => setCurrencySaved(false), 2500);
                        }
                      } catch (err) {
                        alert("Failed to save currency settings");
                      } finally {
                        setCurrencyLoading(false);
                      }
                    }}
                  >
                    {currencyLoading ? "Saving..." : "Save Currency"}
                  </Button>
                  {currencySaved && (
                    <div className="text-xs text-green-600 font-medium">
                      Saved.
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Featured Listings</p>
                    <p className="text-sm text-muted-foreground">
                      Allow agents to promote properties
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Subscription Plans</p>
                    <p className="text-sm text-muted-foreground">
                      Enable Pro and Enterprise plans
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-3 sm:mt-6">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm !py-0 gap-3 sm:gap-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure email and in-app notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={siteVisitEmailEnabled}
                    onCheckedChange={(v) => setSiteVisitEmailEnabled(!!v)}
                    className="ml-auto shrink-0"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Property Approval Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Notify agents when properties are approved/rejected
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Payment Confirmations</p>
                    <p className="text-sm text-muted-foreground">
                      Send payment receipts via email
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-auto shrink-0" />
                </div>

                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Save Changes
                </Button>
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Site Visit Emails</p>
                      <p className="text-sm text-muted-foreground">
                        When enabled, site visit requests will automatically
                        email the operator. Admins may still resend manually
                        from the Site Visits list.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={siteVisitEmailEnabled}
                        onCheckedChange={(v) => setSiteVisitEmailEnabled(!!v)}
                      />
                      <Button
                        size="sm"
                        onClick={() => saveSiteVisitToggle()}
                        disabled={siteVisitLoading}
                      >
                        {siteVisitLoading ? "Saving..." : "Save Toggle"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-3 sm:mt-6">
            <Card className="border border-primary/20 dark:bg-gray-900/30 shadow-sm !py-0 gap-3 sm:gap-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle>Contact Channels</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage public contact numbers used across the site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">Global WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    placeholder="e.g. +12025550123"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If set, this overrides the agent's phone for the WhatsApp
                    button. Digits only are stored internally.
                  </p>
                </div>
                <Button
                  disabled={whatsappLoading}
                  onClick={saveWhatsapp}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  {whatsappLoading ? "Saving..." : "Save"}
                </Button>
                {whatsappSaved && (
                  <div className="text-xs text-green-600 font-medium">
                    Saved successfully.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
