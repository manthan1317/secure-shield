"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
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
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            User management functionality coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
