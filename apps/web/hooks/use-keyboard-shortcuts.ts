"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  scope?: "global" | "journal" | "list";
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  // Define shortcuts based on current path
  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    const isJournalEntryPage = pathname.startsWith("/journal/") && pathname !== "/journal" && pathname !== "/journal/new";
    const isJournalListPage = pathname === "/journal";
    const isNewEntryPage = pathname === "/journal/new";

    const shortcuts: KeyboardShortcut[] = [
      {
        key: "k",
        meta: true,
        action: openCommandPalette,
        description: "Open command palette",
        scope: "global",
      },
    ];

    // Global shortcuts (not on entry form)
    if (!isNewEntryPage && !isJournalEntryPage) {
      shortcuts.push({
        key: "n",
        action: () => router.push("/journal/new"),
        description: "New journal entry",
        scope: "global",
      });
    }

    // List page shortcuts
    if (isJournalListPage) {
      shortcuts.push({
        key: "/",
        action: () => {
          const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        },
        description: "Focus search",
        scope: "list",
      });
    }

    // New entry page shortcuts
    if (isNewEntryPage) {
      shortcuts.push(
        {
          key: "s",
          meta: true,
          action: () => {
            const saveButton = document.querySelector('[data-save-draft]') as HTMLButtonElement;
            if (saveButton) saveButton.click();
          },
          description: "Save draft",
          scope: "journal",
        },
        {
          key: "Enter",
          meta: true,
          action: () => {
            const postButton = document.querySelector('[data-post-entry]') as HTMLButtonElement;
            if (postButton && !postButton.disabled) postButton.click();
          },
          description: "Post entry",
          scope: "journal",
        },
        {
          key: "n",
          action: () => {
            const addLineButton = document.querySelector('[data-add-line]') as HTMLButtonElement;
            if (addLineButton) addLineButton.click();
          },
          description: "Add line",
          scope: "journal",
        }
      );
    }

    return shortcuts;
  }, [pathname, router, openCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Allow Escape in modals
        if (e.key === "Escape") {
          closeCommandPalette();
        }
        return;
      }

      // Handle Escape globally
      if (e.key === "Escape") {
        closeCommandPalette();
        return;
      }

      const shortcuts = getShortcuts();

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() ||
          (shortcut.key === "/" && e.key === "/");
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
        const metaMatch = shortcut.meta ? e.metaKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const altMatch = shortcut.alt ? e.altKey : true;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getShortcuts, closeCommandPalette]);

  return {
    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    getShortcuts,
  };
}

export function formatShortcut(shortcut: { key: string; meta?: boolean; ctrl?: boolean }): string {
  const parts: string[] = [];
  if (shortcut.meta) parts.push("⌘");
  if (shortcut.ctrl) parts.push("Ctrl");
  parts.push(shortcut.key);
  return parts.join("");
}
