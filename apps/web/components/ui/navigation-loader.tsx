"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const EXIT_DURATION = 200;

export function NavigationLoader({ fullScreen }: { fullScreen?: boolean }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const loadingRef = useRef(false);
  const exitTimerRef = useRef(0);

  const show = (from: string) => {
    if (loadingRef.current) return;
    console.log("[NavLoader] show(" + from + ")");
    loadingRef.current = true;
    setExiting(false);
    setVisible(true);
  };

  const hide = () => {
    if (!loadingRef.current) {
      console.log("[NavLoader] hide skipped (not loading)");
      return;
    }
    console.log("[NavLoader] hide");
    loadingRef.current = false;
    setExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, EXIT_DURATION);
  };

  useEffect(() => {
    console.log("[NavLoader] mounted, pathname:", pathname);
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) {
        console.log("[NavLoader] click no link");
        return;
      }
      try {
        const url = new URL(link.href);
        const sameOrigin = url.origin === window.location.origin;
        const samePath = url.pathname === window.location.pathname;
        console.log("[NavLoader] click", url.pathname, "sameOrigin:", sameOrigin, "samePath:", samePath);
        if (sameOrigin && !samePath && !link.hasAttribute("download") && !link.target) {
          show("click");
        }
      } catch (e) {
        console.log("[NavLoader] click parse error", e);
      }
    };
    document.addEventListener("click", handler);
    return () => {
      console.log("[NavLoader] cleanup click handler");
      document.removeEventListener("click", handler);
    };
  }, []);

  useEffect(() => {
    console.log("[NavLoader] history effect");
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = function (...args) {
      console.log("[NavLoader] pushState", args[2]);
      origPush(...args);
      show("push");
    };

    history.replaceState = function (...args) {
      console.log("[NavLoader] replaceState", args[2]);
      origReplace(...args);
      show("replace");
    };

    const onPopState = () => {
      console.log("[NavLoader] popstate");
      show("pop");
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      console.log("[NavLoader] cleanup history");
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    console.log("[NavLoader] pathname effect:", pathname, "prev:", prevPathnameRef.current);
    if (pathname !== prevPathnameRef.current) {
      hide();
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  console.log("[NavLoader] render: visible=" + visible + " exiting=" + exiting);

  if (!visible && !exiting) return null;

  return (
    <div
      className={`fixed z-50 flex items-center justify-center transition-opacity duration-200 ${
        exiting ? "opacity-0" : "opacity-100"
      } ${fullScreen ? "inset-0" : "top-14 left-0 right-0 bottom-0 lg:left-64"}`}
      style={{ pointerEvents: exiting ? "none" : "auto" }}
      aria-hidden="true"
      role="status"
      aria-label="Page loading"
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      <div className="relative flex flex-col items-center gap-3">
        <svg className="animate-spin h-7 w-7 text-amber" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-ui text-xs text-mid uppercase tracking-widest">Loading</span>
      </div>
    </div>
  );
}
