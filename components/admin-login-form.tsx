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
import { loginAdmin } from "@/redux/features/admin/adminSlice";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm({
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
    (state) => state.admin
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/admin/dashboard";

  // If admin is already authenticated, redirect
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
      const resultAction = await dispatch(loginAdmin(formData));

      if (loginAdmin.fulfilled.match(resultAction)) {
        // Set admin auth cookie is handled in the loginAdmin.fulfilled reducer
        // Redirect to the admin dashboard
        router.push(redirectPath);
      } else if (loginAdmin.rejected.match(resultAction)) {
        // Handle the specific error message
        setLoginError(
          (resultAction.payload as string) || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to login to your admin account
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
                  placeholder="admin@example.com"
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
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Need an admin account?{" "}
              <a
                href="/admin/register"
                className="underline underline-offset-4"
              >
                Register
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
