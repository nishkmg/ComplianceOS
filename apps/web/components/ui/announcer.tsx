"use client";

/**
 * Screen-reader announcer — one polite + one assertive live region mounted
 * once per app. Async operations (loads, saves, errors) announce through
 * `useAnnouncer` instead of leaving screen readers in the dark.
 */
export function Announcer() {
  return (
    <div className="sr-only" aria-live="polite" role="status" aria-atomic="true">
      <span id="announcer-polite" />
    </div>
  );
}

export function announce(message: string, mode: "polite" | "assertive" = "polite") {
  if (typeof document === "undefined") return;
  const id = mode === "assertive" ? "announcer-assertive" : "announcer-polite";
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement("span");
    node.id = id;
    node.setAttribute("aria-live", mode);
    node.setAttribute("role", mode === "assertive" ? "alert" : "status");
    node.className = "sr-only";
    document.body.appendChild(node);
  }
  // Reset then set — guarantees re-announcement of identical messages
  node.textContent = "";
  requestAnimationFrame(() => {
    node!.textContent = message;
  });
}
