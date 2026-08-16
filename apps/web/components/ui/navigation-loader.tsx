"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const EXIT_DURATION = 200;
const SAFETY_TIMEOUT = 4000;

export function NavigationLoader({ fullScreen }: { fullScreen?: boolean }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const loadingRef = useRef(false);
  const exitTimerRef = useRef(0);
  const hideTimerRef = useRef(0);

  const show = (from: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setExiting(false);
    setVisible(true);
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(hide, SAFETY_TIMEOUT);
  };

  const hide = () => {
    window.clearTimeout(hideTimerRef.current);
    if (!loadingRef.current) return;
    loadingRef.current = false;
    setExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, EXIT_DURATION);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;
      try {
        const url = new URL(link.href);
        const sameOrigin = url.origin === window.location.origin;
        const samePath = url.pathname === window.location.pathname;
        if (sameOrigin && !samePath && !link.hasAttribute("download") && !link.target) {
          show("click");
        }
      } catch {
        // invalid URL
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);

    history.pushState = function (...args) {
      origPush(...args);
      show("push");
    };

    history.replaceState = function (...args) {
      origReplace(...args);
    };

    const onPopState = () => show("pop");
    window.addEventListener("popstate", onPopState);

    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(exitTimerRef.current);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      hide();
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  if (!visible && !exiting) return null;

  return (
    <div
      className={`fixed z-50 flex items-center justify-center transition-opacity duration-200 ${
        exiting ? "opacity-0" : "opacity-100"
      } ${fullScreen ? "inset-0" : "top-14 left-0 right-0 bottom-0 lg:left-64"}`}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
      role="status"
      aria-label="Page loading"
    >
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-[2px]" />
      <div className="relative flex flex-col items-center gap-3">
        <svg className="animate-spin h-7 w-7 text-amber motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-ui text-xs text-mid uppercase tracking-widest">Loading</span>
      </div>
    </div>
  );
}
