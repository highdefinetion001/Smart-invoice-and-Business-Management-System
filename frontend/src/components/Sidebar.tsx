"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Wallet,
  BarChart3,
  Settings,
  Receipt,
  LogOut,
  Calendar,
} from "lucide-react";

import { gsap } from "gsap";
import { sidebarAnimations } from "@/lib/animations";
import ThemeToggle from "@/components/ThemeToggle";

const salesItems = [
  {
    href: "/invoices",
    label: "Invoices",
    icon: FileText,
  },
  {
    href: "/payments",
    label: "Payments",
    icon: Receipt,
  },
];

const manageItems = [
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/materials",
    label: "Materials",
    icon: Package,
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Wallet,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        {
          x: -240,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        '[data-animate="nav-item"]',
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }, sidebarRef.current);

    return () => ctx.revert();
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const NavItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const itemRef = useRef<HTMLAnchorElement>(null);
    const active = isActive(href);

    return (
      <Link
        ref={itemRef}
        href={href}
        data-animate="nav-item"
        onMouseEnter={() => {
          if (!active && itemRef.current) {
            sidebarAnimations.navItemHover(itemRef.current);
          }
        }}
        onMouseLeave={() => {
          if (!active && itemRef.current) {
            sidebarAnimations.navItemLeave(itemRef.current);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          height: "40px",
          padding: "0 16px",
          margin: "0 8px",
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
          fontWeight: active ? 600 : 400,
          color: active
            ? "var(--stone-900)"
            : "var(--stone-600)",
          backgroundColor: active
            ? "var(--stone-100)"
            : "transparent",
          textDecoration: "none",
          position: "relative",
          transition:
            "color 0.2s ease, background-color 0.2s ease",
        }}
      >
        {active && (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "3px",
              height: "20px",
              background: "var(--accent-500)",
              borderRadius: "2px",
            }}
          />
        )}

        <Icon
          style={{
            width: "18px",
            height: "18px",
            color: active
              ? "var(--primary-700)"
              : "var(--stone-400)",
            flexShrink: 0,
          }}
        />

        {label}
      </Link>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "240px",
        height: "100vh",
        background: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        transition:
          "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* =========================
          LOGO + THEME TOGGLE
         ========================= */}

      <div
        style={{
          height: "72px",
          padding: "0 16px 0 24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "var(--primary-950)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileText
            style={{
              width: "14px",
              height: "14px",
              color: "#FFFFFF",
            }}
          />
        </div>

        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--stone-900)",
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
          }}
        >
          Smart Invoice
        </span>

        {/* LIGHT / DARK TOGGLE */}
        <ThemeToggle />
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--sidebar-border)",
          margin: "0 16px",
        }}
      />

      {/* =========================
          NAVIGATION
         ========================= */}

      <nav
        style={{
          flex: 1,
          paddingTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        <NavItem
          href="/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
        />

        {/* SALES */}
        <div
          style={{
            padding: "24px 24px 8px 24px",
            fontSize: "11px",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--stone-400)",
          }}
        >
          Sales
        </div>

        {salesItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
          />
        ))}

        {/* MANAGE */}
        <div
          style={{
            padding: "24px 24px 8px 24px",
            fontSize: "11px",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--stone-400)",
          }}
        >
          Manage
        </div>

        {manageItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
          />
        ))}
      </nav>

      <div
        style={{
          height: "1px",
          background: "var(--sidebar-border)",
          margin: "0 16px",
        }}
      />

      {/* SETTINGS */}

      <div
        style={{
          padding: "8px 0",
        }}
      >
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings}
        />
      </div>

      {/* =========================
          ADMIN USER
         ========================= */}

      <div
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--primary-100)",
            color: "var(--primary-700)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          A
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--stone-900)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Admin
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--stone-400)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            admin@company.com
          </div>
        </div>

        <button
          title="Logout"
          type="button"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--stone-400)",
            transition:
              "color 0.2s ease, background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color =
              "var(--danger-500)";
            e.currentTarget.style.background =
              "var(--danger-50)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color =
              "var(--stone-400)";
            e.currentTarget.style.background =
              "transparent";
          }}
        >
          <LogOut
            style={{
              width: "16px",
              height: "16px",
            }}
          />
        </button>
      </div>
    </aside>
  );
}