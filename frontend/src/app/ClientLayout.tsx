"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page has no sidebar
  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--stone-50)' }}>
      <Sidebar />
      <main className="flex-1 p-8" style={{ marginLeft: '240px' }}>
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LayoutContent>{children}</LayoutContent>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
