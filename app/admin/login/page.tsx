"use client";

import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

// Admin login form skeleton
function AdminLoginFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-3">
        <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<AdminLoginFormSkeleton />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
