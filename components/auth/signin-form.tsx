"use client";

import type React from "react";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use a full redirect for credentials sign-in so the browser receives
      // the `Set-Cookie` header from the server response. In local dev a
      // redirect-based flow is more reliable for cookie persistence.
      const callbackUrl = `${window.location.origin}/dashboard`;
      // Default NextAuth behavior (redirect: true) will navigate the page on
      // success and set the session cookie via the server response.
      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
      });
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const callbackUrl = `${window.location.origin}/dashboard`;
    await signIn("google", { callbackUrl });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="px-4 pt-2 pb-2 sm:px-6 sm:py-6 items-center sm:items-start text-center sm:text-left">
        <CardTitle className="text-lg sm:text-xl leading-tight font-semibold">
          Sign In
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Sign in to your PrimeAddis account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-1 pb-3 sm:px-6 sm:pt-6 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent h-9 sm:h-10 text-sm sm:text-base"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
