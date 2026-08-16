"use client";

import { useEffect } from "react";
import { applyTheme, currentTheme } from "@/lib/theme";

/**
 * Keeps the SYSTEM theme live on every surface (marketing, auth, app).
 * The ThemeToggle's own listener only runs where the toggle is mounted
 * (the app sidebar); this watcher lives in the root layout so OS theme
 * changes propagate everywhere while the stored preference is "system".
 */
export function SystemThemeWatcher() {
  useEffect(() => {
    if (currentTheme() !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}
