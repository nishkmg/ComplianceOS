"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string;
  category: "screen" | "action" | "entry" | "account" | "report";
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<CommandItem[]>(() => [
    { id: "dashboard", name: "Dashboard", category: "screen", onSelect: () => router.push("/dashboard") },
    { id: "journal", name: "Journal Entries", category: "screen", onSelect: () => router.push("/journal") },
    { id: "accounts", name: "Chart of Accounts", category: "screen", onSelect: () => router.push("/accounts") },
    { id: "invoices", name: "Invoices", category: "screen", onSelect: () => router.push("/invoices") },
    { id: "payments", name: "Payments", category: "screen", onSelect: () => router.push("/payments") },
    { id: "inventory", name: "Inventory", category: "screen", onSelect: () => router.push("/inventory") },
    { id: "gst", name: "GST", category: "screen", onSelect: () => router.push("/gst") },
    { id: "itr", name: "ITR", category: "screen", onSelect: () => router.push("/itr") },
    { id: "payroll", name: "Payroll", category: "screen", onSelect: () => router.push("/payroll") },
    { id: "reports", name: "Reports", category: "screen", onSelect: () => router.push("/reports") },
    { id: "settings", name: "Settings", category: "screen", onSelect: () => router.push("/settings") },
    { id: "new-entry", name: "New Journal Entry", category: "action", shortcut: "N", onSelect: () => router.push("/journal/new") },
    { id: "pl", name: "Profit & Loss", category: "report", onSelect: () => router.push("/reports/pl") },
    { id: "balance-sheet", name: "Balance Sheet", category: "report", onSelect: () => router.push("/reports/balance-sheet") },
    { id: "trial-balance", name: "Trial Balance", category: "report", onSelect: () => router.push("/reports/trial-balance") },
    { id: "cash-flow", name: "Cash Flow", category: "report", onSelect: () => router.push("/reports/cash-flow") },
    { id: "ledger", name: "Ledger", category: "report", onSelect: () => router.push("/reports/ledger") },
  ], [router]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const lowerSearch = search.toLowerCase();
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(lowerSearch) ||
      cmd.category.toLowerCase().includes(lowerSearch)
    );
  }, [commands, search]);

  useEffect(() => setSelectedIndex(0), [search]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => prev < filteredCommands.length - 1 ? prev + 1 : 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredCommands.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].onSelect();
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "Tab": {
        e.preventDefault();
        const focusable = getFocusableElements(overlayRef.current);
        if (focusable.length === 0) return;
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey) {
          const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          focusable[prevIndex]?.focus();
        } else {
          const nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
          focusable[nextIndex]?.focus();
        }
        break;
      }
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    screen: "Screens", action: "Actions", entry: "Recent Entries", account: "Accounts", report: "Reports",
  };

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  let flatIndex = 0;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="command-palette-overlay"
      onClick={onClose}
    >
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search commands..."
          aria-label="Search commands"
          aria-activedescendant={filteredCommands[selectedIndex] ? `cmd-${filteredCommands[selectedIndex].id}` : undefined}
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-autocomplete="list"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="command-palette-input"
          autoFocus
        />
        <div
          id="command-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="command-palette-list"
        >
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-ui text-sm text-mid mb-2">No commands found</p>
              <p className="font-ui text-xs text-light">Try searching for &quot;journal&quot;, &quot;invoice&quot;, or &quot;report&quot;</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {['Dashboard', 'Journal', 'Invoices', 'Reports'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setSearch(suggestion); }}
                    className="px-3 py-1.5 text-xs font-ui text-mid bg-surface-muted border border-border rounded-md hover:border-amber hover:text-amber transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-2 text-[10px] uppercase tracking-wide text-light bg-surface-muted">
                  {categoryLabels[category] || category}
                </div>
                {items.map(cmd => {
                  const isSelected = flatIndex === selectedIndex;
                  const currentIndex = flatIndex++;
                  return (
                    <div
                      key={cmd.id}
                      id={`cmd-${cmd.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`command-palette-item ${isSelected ? "selected" : ""}`}
                      onClick={() => { cmd.onSelect(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className="command-palette-item-name">{cmd.name}</span>
                      {cmd.shortcut && <span className="command-palette-item-hint">{cmd.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}
