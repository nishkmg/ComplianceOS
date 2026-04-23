"use client";

import { useState } from "react";

interface AccountNode {
  code: string;
  name: string;
  isEnabled: boolean;
  children?: AccountNode[];
}

interface AccountTreeProps {
  accounts: AccountNode[];
  onRefine: (refinements: AccountNode[]) => void;
}

export function AccountTree({ accounts, onRefine }: AccountTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleEnabled = (code: string) => {
    const updateNode = (nodes: AccountNode[]): AccountNode[] => {
      return nodes.map((node) => {
        if (node.code === code) {
          return { ...node, isEnabled: !node.isEnabled };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    onRefine(updateNode(accounts));
  };

  const renameNode = (code: string, newName: string) => {
    const updateNode = (nodes: AccountNode[]): AccountNode[] => {
      return nodes.map((node) => {
        if (node.code === code) {
          return { ...node, name: newName };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    onRefine(updateNode(accounts));
  };

  const renderNode = (node: AccountNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.code);

    return (
      <div key={node.code}>
        <div
          className="flex items-center gap-2 py-2"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.code)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <input
            type="checkbox"
            checked={node.isEnabled}
            onChange={() => toggleEnabled(node.code)}
            className="h-4 w-4 rounded border-gray-300"
          />

          <span className="font-mono text-xs text-gray-500 w-24">{node.code}</span>

          <input
            type="text"
            value={node.name}
            onChange={(e) => renameNode(node.code, e.target.value)}
            className="flex-1 border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-none text-sm"
          />
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 max-h-96 overflow-auto">
      {accounts.map((node) => renderNode(node))}
    </div>
  );
}
