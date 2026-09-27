"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on a page that doesn't need sidebar (we can keep this logic in case there are public pages later)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6 relative">
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LayoutContent>{children}</LayoutContent>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
