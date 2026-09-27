"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "next-themes";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !token && pathname !== "/login") {
      router.push("/login");
    }
    if (!isLoading && token && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [token, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (pathname === "/login" || !token) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 relative">
        <ThemeTogglerWrapper />
        {children}
      </main>
    </div>
  );
}

function ThemeTogglerWrapper() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="absolute top-6 right-6 z-50">
      <AnimatedThemeToggler 
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card dark:bg-zinc-800 shadow-md border border-border dark:border-border"
        theme={theme === "dark" ? "dark" : "light"}
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}
