"use client";

import type React from "react";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
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

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const meetsPasswordRules = (pwd: string) => {
    const lenOk = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return lenOk && hasUpper && hasLower && hasNum && hasSpecial;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!meetsPasswordRules(formData.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      router.push("/auth/signin?registered=true");
    } catch (err: any) {
      const apiErr = err.response?.data;
      if (
        apiErr?.details &&
        Array.isArray(apiErr.details) &&
        apiErr.details.length
      ) {
        // Join Zod validation messages
        const msg = apiErr.details.map((d: any) => d.message).join(" \n");
        setError(msg || apiErr.error || "Registration failed");
      } else {
        setError(apiErr?.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="px-4 pt-2 pb-2 sm:px-6 sm:py-6 items-center sm:items-start text-center sm:text-left">
        <CardTitle className="text-lg sm:text-xl leading-tight font-semibold">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Sign up for a PrimeAddis account
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
            <Label htmlFor="name" className="text-xs sm:text-sm">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phone" className="text-xs sm:text-sm">
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="h-8 sm:h-9 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Must be 8+ chars, with uppercase, lowercase, number, and special
              character.
            </p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-8 sm:h-9 text-sm sm:text-base"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
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
            onClick={handleGoogleSignUp}
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
          Already have an account?{" "}
          <a href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
