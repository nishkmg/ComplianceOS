"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) { setSearch(""); setSelectedIndex(0); }
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
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <input
          type="text"
          placeholder="Search commands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="command-palette-input"
          autoFocus
        />
        <div className="command-palette-list">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-light">No commands found</div>
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
