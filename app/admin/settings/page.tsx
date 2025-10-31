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

  if (session?.user.role !== "superadmin") {
    return null;
  }

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
                  <Switch defaultChecked className="ml-auto shrink-0" />
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
