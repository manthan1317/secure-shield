"use client";

import { ReactNode, useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { adminLogout } from "@/redux/features/admin/adminSlice";
import { useRouter, usePathname } from "next/navigation";
import { ButtonWrapper } from "@/components/ui/button-wrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.admin);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  // Check if current path is login or register page
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {mounted && isAuthenticated && !isAuthPage && (
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <a href="/admin/dashboard" className="text-xl font-bold">
                Admin Portal
              </a>
            </div>
            <nav className="flex items-center gap-4 sm:gap-6">
              <a
                href="/admin/dashboard"
                className={`text-sm font-medium ${
                  pathname === "/admin/dashboard"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Dashboard
              </a>
              <a
                href="/admin/blogs"
                className={`text-sm font-medium ${
                  pathname?.startsWith("/admin/blogs")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Blogs
              </a>
              <a
                href="/admin/users"
                className={`text-sm font-medium ${
                  pathname?.startsWith("/admin/users")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Users
              </a>
              <a
                href="/admin/settings"
                className={`text-sm font-medium ${
                  pathname?.startsWith("/admin/settings")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Settings
              </a>
              <div className="ml-4 flex items-center gap-2">
                <ThemeToggle />
                <ButtonWrapper
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </ButtonWrapper>
              </div>
            </nav>
          </div>
        </header>
      )}
      <main>{children}</main>
    </ThemeProvider>
  );
}
