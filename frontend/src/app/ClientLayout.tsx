"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /*
   * Login / landing page does not use the application sidebar.
   */
  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      <Sidebar />

      <main
        className="flex-1 p-8"
        style={{
          marginLeft: "240px",
          background: "var(--background)",
          color: "var(--foreground)",
          transition:
            "background-color 0.25s ease, color 0.25s ease",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <>
      <LayoutContent>{children}</LayoutContent>

      <Toaster
        position="bottom-right"
        richColors
        theme={theme === "dark" ? "dark" : "light"}
      />
    </>
  );
}