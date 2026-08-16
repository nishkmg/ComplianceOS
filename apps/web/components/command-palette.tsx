"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

interface CommandItem {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
  category: "screen" | "action" | "report";
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

  const commands = useMemo<CommandItem[]>(() => [
    { id: "dashboard", name: "Dashboard", icon: "dashboard", category: "screen", onSelect: () => router.push("/dashboard") },
    { id: "journal", name: "Journal Entries", icon: "menu_book", category: "screen", onSelect: () => router.push("/journal") },
    { id: "accounts", name: "Chart of Accounts", icon: "account_tree", category: "screen", onSelect: () => router.push("/accounts") },
    { id: "invoices", name: "Invoices", icon: "receipt_long", category: "screen", onSelect: () => router.push("/invoices") },
    { id: "payments", name: "Payments", icon: "account_balance_wallet", category: "screen", onSelect: () => router.push("/payments") },
    { id: "inventory", name: "Inventory", icon: "inventory_2", category: "screen", onSelect: () => router.push("/inventory") },
    { id: "gst", name: "GST", icon: "gavel", category: "screen", onSelect: () => router.push("/gst/returns") },
    { id: "itr", name: "ITR", icon: "description", category: "screen", onSelect: () => router.push("/itr/returns") },
    { id: "payroll", name: "Payroll", icon: "payments", category: "screen", onSelect: () => router.push("/payroll") },
    { id: "reports", name: "Reports", icon: "insert_chart", category: "screen", onSelect: () => router.push("/reports/ledger") },
    { id: "settings", name: "Settings", icon: "settings", category: "screen", onSelect: () => router.push("/settings") },
    { id: "new-entry", name: "New Journal Entry", icon: "add", category: "action", shortcut: "N", onSelect: () => router.push("/journal/new") },
    { id: "pl", name: "Profit & Loss", icon: "trending_up", category: "report", onSelect: () => router.push("/reports/pl") },
    { id: "balance-sheet", name: "Balance Sheet", icon: "account_balance", category: "report", onSelect: () => router.push("/reports/balance-sheet") },
    { id: "trial-balance", name: "Trial Balance", icon: "scale", category: "report", onSelect: () => router.push("/reports/trial-balance") },
    { id: "cash-flow", name: "Cash Flow", icon: "trending_up", category: "report", onSelect: () => router.push("/reports/cash-flow") },
    { id: "ledger", name: "Ledger", icon: "list_alt", category: "report", onSelect: () => router.push("/reports/ledger") },
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
    screen: "Screens", action: "Actions", report: "Reports",
  };

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  let flatIndex = 0;

  return (
    <div
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
                    className="px-3 py-1.5 text-xs font-ui text-mid bg-surface-muted border border-border rounded-sm hover:border-amber hover:text-amber transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-2 text-ui-2xs uppercase tracking-wide text-light bg-surface-muted">
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
                      className={`command-palette-item group ${isSelected ? "selected" : ""}`}
                      onClick={() => { cmd.onSelect(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon name={cmd.icon} size={16} className="text-mid group-hover:text-white shrink-0" />
                        <span className="command-palette-item-name truncate">{cmd.name}</span>
                      </span>
                      {cmd.shortcut && <span className="command-palette-item-hint">{cmd.shortcut}</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-2.5 border-t border-border-subtle flex items-center gap-2.5 text-ui-2xs font-mono text-mid select-none">
          <span>{filteredCommands.length} {filteredCommands.length === 1 ? "result" : "results"}</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1 rounded-sm border border-border-subtle bg-section-muted">↑↓</kbd> navigate</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1 rounded-sm border border-border-subtle bg-section-muted">↵</kbd> open</span>
          <span aria-hidden="true">·</span>
          <span><kbd className="px-1 rounded-sm border border-border-subtle bg-section-muted">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
