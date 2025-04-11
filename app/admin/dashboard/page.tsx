"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.admin);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If not authenticated, redirect to login page
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  // Show nothing during server-side rendering to prevent hydration issues
  if (!isClient) {
    return null;
  }

  // If no user or not authenticated, show loading or message
  if (!user || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {user.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Manage user accounts and permissions</p>
            <Button variant="outline" className="w-full">
              View Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Manage website content and pages</p>
            <Button variant="outline" className="w-full">
              Edit Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Configure system settings and preferences</p>
            <Button variant="outline" className="w-full">
              View Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
