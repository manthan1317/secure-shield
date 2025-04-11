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
import { registerAdmin } from "@/redux/features/admin/adminSlice";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminRegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(
    (state) => state.admin
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin/login";

  // If admin is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(registerAdmin(formData));

    if (registerAdmin.fulfilled.match(resultAction)) {
      // After successful registration, redirect to admin login
      router.push(redirectPath);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register Admin Account</CardTitle>
          <CardDescription>Create a new administrator account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Admin Name"
                  required
                  suppressHydrationWarning
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  suppressHydrationWarning
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="adminCode">Admin Registration Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter the admin registration code"
                  required
                  suppressHydrationWarning
                  value={formData.adminCode}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  You need a valid admin registration code to create an admin
                  account
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <ButtonWrapper
                  type="submit"
                  className="w-full"
                  suppressHydrationWarning
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register Admin Account"}
                </ButtonWrapper>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an admin account?{" "}
              <a href="/admin/login" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
