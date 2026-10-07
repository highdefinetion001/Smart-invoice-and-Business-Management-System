"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={
                mounted
                    ? `Switch to ${isDark ? "light" : "dark"} mode`
                    : "Toggle theme"
            }
            title={
                mounted
                    ? isDark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                    : "Toggle theme"
            }
            style={{
                position: "relative",
                width: "44px",
                height: "26px",
                padding: 0,
                border: "1px solid var(--border-primary)",
                borderRadius: "999px",
                background: "var(--surface-tertiary)",
                color: "var(--stone-600)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                transition:
                    "background-color 0.2s ease, border-color 0.2s ease",
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: "2px",
                    left: isDark ? "20px" : "2px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--surface-primary)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition:
                        "left 0.2s ease, background-color 0.2s ease",
                }}
            >
                {mounted && isDark ? (
                    <Moon
                        style={{
                            width: "12px",
                            height: "12px",
                            color: "var(--accent-400)",
                        }}
                    />
                ) : (
                    <Sun
                        style={{
                            width: "12px",
                            height: "12px",
                            color: "var(--accent-500)",
                        }}
                    />
                )}
            </span>
        </button>
    );
}