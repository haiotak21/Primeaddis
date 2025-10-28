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
    <div className="min-h-screen bg-[#f4fafe]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-[#03063b] text-4xl font-black leading-tight tracking-tight">
            System Settings
          </h1>
          <p className="mt-2 text-[#47739e]">
            Configure platform settings (Superadmin only)
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#03063b]">
                  General Settings
                </CardTitle>
                <CardDescription className="text-[#47739e]">
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Button className="bg-[#0b8bff] hover:bg-[#0b8bff]/90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#03063b]">
                  Feature Toggles
                </CardTitle>
                <CardDescription className="text-[#47739e]">
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Property Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Require admin approval for new listings
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">VR Tours</p>
                    <p className="text-sm text-muted-foreground">
                      Enable VR viewing for properties
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Property Comparison</p>
                    <p className="text-sm text-muted-foreground">
                      Allow users to compare properties
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reviews & Ratings</p>
                    <p className="text-sm text-muted-foreground">
                      Enable property reviews
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="bg-[#0b8bff] hover:bg-[#0b8bff]/90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#03063b]">
                  Payment Settings
                </CardTitle>
                <CardDescription className="text-[#47739e]">
                  Configure payment and subscription options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Platform Commission (%)</Label>
                  <Input id="commission" type="number" defaultValue="5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Featured Listings</p>
                    <p className="text-sm text-muted-foreground">
                      Allow agents to promote properties
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Subscription Plans</p>
                    <p className="text-sm text-muted-foreground">
                      Enable Pro and Enterprise plans
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="bg-[#0b8bff] hover:bg-[#0b8bff]/90">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="border border-[#dfe6e9] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#03063b]">
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-[#47739e]">
                  Configure email and in-app notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Property Approval Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Notify agents when properties are approved/rejected
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Confirmations</p>
                    <p className="text-sm text-muted-foreground">
                      Send payment receipts via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="bg-[#0b8bff] hover:bg-[#0b8bff]/90">
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
