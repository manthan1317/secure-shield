"use client";

import { cn } from "@/lib/utils";
import { ButtonWrapper } from "@/components/ui/button-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, FormEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser } from "@/redux/features/auth/authSlice";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { isLoading, error, user, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/dashboard";

  // If user is already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, redirectPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    setLoginError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      // Dispatch the login action
      const resultAction = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(resultAction)) {
        // Set auth cookie - in a real app, this would be an HTTP-only cookie set by the server
        try {
          const userString = JSON.stringify(resultAction.payload.user);
          // Use the browser's btoa for base64 encoding
          const encodedUserData = btoa(userString);
          document.cookie = `auth=${encodedUserData}; path=/; max-age=86400`; // 1 day expiry
          console.log("Auth cookie set successfully");

          // Redirect to the intended page or dashboard
          router.push(redirectPath);
        } catch (cookieError) {
          console.error("Error setting auth cookie:", cookieError);
          setLoginError("Authentication error. Please try again.");
        }
      } else if (loginUser.rejected.match(resultAction)) {
        // Handle the specific error message
        setLoginError(
          (resultAction.payload as string) || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {(error || loginError) && (
              <div className="mb-4 rounded bg-destructive/15 p-3 text-sm text-destructive">
                {loginError || error}
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  suppressHydrationWarning
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  suppressHydrationWarning
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-3">
                <ButtonWrapper
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </ButtonWrapper>
                <ButtonWrapper
                  variant="outline"
                  className="w-full"
                  type="button"
                >
                  Login with Google
                </ButtonWrapper>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
