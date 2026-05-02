'use client';

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ComboboxItem {
  id: string;
  label: string;
  subtitle?: string;
  group?: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onChange: (item: ComboboxItem | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  inputClassName?: string;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  className,
  disabled = false,
  inputClassName,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(
    () => items.find(i => i.id === value) ?? null,
    [items, value]
  );

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(q))
    );
  }, [items, search]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-combobox]')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) { setIsOpen(true); return; }
      setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filtered[highlightIndex]) {
        selectItem(filtered[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function selectItem(item: ComboboxItem) {
    onChange(item);
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div data-combobox className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        value={isOpen ? search : (selectedItem?.label ?? '')}
        onChange={e => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => { setSearch(''); setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors',
          inputClassName
        )}
      />
      {selectedItem && !isOpen && (
        <span
          
        >
          check_circle
        </span>
      )}

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-surface border border-border shadow-md rounded-md max-h-60 overflow-y-auto animate-in fade-in-80"
        >
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                role="option"
                aria-selected={item.id === value}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={cn(
                  'w-full text-left px-4 py-3 font-ui transition-colors border-none cursor-pointer flex items-center justify-between',
                  idx === highlightIndex ? 'bg-surface-muted text-dark' : 'hover:bg-surface-muted/50',
                  item.id === value ? 'font-semibold' : ''
                )}
              >
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-mid mt-0.5">{item.subtitle}</span>
                  )}
                </div>
                {item.id === value && (
                  <Icon name="check" className="text-[16px] text-amber" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-mid text-sm">
              <Icon name="search_off" className="text-[20px] mb-1" />
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
