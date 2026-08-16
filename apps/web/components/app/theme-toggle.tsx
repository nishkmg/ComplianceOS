"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

import { applyTheme, currentTheme, STORAGE_KEY, type Theme } from "@/lib/theme";

const NEXT: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  useEffect(() => {
    setTheme(currentTheme());
    applyTheme(currentTheme());
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((t) => {
      const next = NEXT[t];
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const label = theme === "dark" ? "Switch to system theme" : theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      onClick={cycle}
      aria-label={label}
      title={label}
      className="flex w-full items-center gap-3 px-3 py-2 rounded-sm text-ui-sm text-sidebar-muted hover:text-sidebar-dim hover:bg-lighter/40 transition-colors border-none bg-transparent cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
    >
      <Icon name={theme === "dark" ? "dark_mode" : theme === "light" ? "light_mode" : "brightness_auto"} className="text-lg" />
      <span className="flex-1 text-left">
        {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"}
      </span>
      <span className="text-ui-2xs uppercase tracking-wider text-sidebar-muted/80">Theme</span>
    </button>
  );
}
