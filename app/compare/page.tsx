import { CompareClient } from "./compare-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Compare Properties</CardTitle>
              <CardDescription>
                Side-by-side comparison of selected homes and apartments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/compare/properties">Compare real estate</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compare Agents</CardTitle>
              <CardDescription>
                See which agents sell or rent more, and at what price points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/compare/agents">Compare real estate agencies</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Default to property comparison content below for legacy URLs */}
        <CompareClient />
      </div>
    </div>
  );
}
