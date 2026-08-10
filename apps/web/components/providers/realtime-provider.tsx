"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

/**
 * Realtime-lite: polling-based refresh bus.
 *
 * The legacy Supabase realtime stack is dead (project moved off Supabase), so
 * instead of websocket channels this provider polls on an interval and emits a
 * synthetic change event per subscribed table. Consumers (report pages) use
 * the events to invalidate their tRPC queries, which refetch fresh data —
 * identical behavior to true realtime for dashboard-scale refresh needs.
 */

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

type RealtimePayload<T = Record<string, unknown>> = {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
};

type RealtimeCallback<T = Record<string, unknown>> = (payload: RealtimePayload<T>) => void;

type RealtimeContextValue = {
  status: ConnectionStatus;
  tenantId: string | null;
  subscribe: <T = Record<string, unknown>>(
    table: string,
    callback: RealtimeCallback<T>,
  ) => () => void;
  subscribeEventType: <T = Record<string, unknown>>(
    eventType: string,
    callback: RealtimeCallback<T>,
  ) => () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

type Listener = {
  id: number;
  table: string | null;
  eventType: string | null;
  callback: RealtimeCallback;
};

const POLL_INTERVAL_MS = 15_000;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const tenantId =
    ((session?.user as Record<string, unknown> | undefined)?.tenantId as string | undefined) ??
    null;

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const listenersRef = useRef<Map<number, Listener>>(new Map());
  const nextIdRef = useRef(1);

  const fanOut = useCallback((payload: RealtimePayload) => {
    const listeners = listenersRef.current.values();
    for (const l of listeners) {
      if (l.table !== null && l.table !== payload.table) continue;
      if (l.eventType !== null && l.eventType !== payload.eventType) continue;
      try {
        l.callback(payload);
      } catch {
        // listener errors must not break fan-out
      }
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!tenantId) {
      setStatus("idle");
      return;
    }

    setStatus("connected");

    // Poll: emit a synthetic change per subscribed table so listeners refetch.
    const timer = setInterval(() => {
      const tables = new Set<string>();
      for (const l of listenersRef.current.values()) {
        if (l.table) tables.add(l.table);
      }
      for (const table of tables) {
        fanOut({
          eventType: "UPDATE",
          new: {},
          old: {},
          schema: "public",
          table,
          commit_timestamp: new Date().toISOString(),
        });
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      setStatus("disconnected");
    };
  }, [tenantId, sessionStatus, fanOut]);

  const subscribe = useCallback(
    <T = Record<string, unknown>>(table: string, callback: RealtimeCallback<T>) => {
      const id = nextIdRef.current++;
      listenersRef.current.set(id, { id, table, eventType: null, callback: callback as RealtimeCallback });
      return () => {
        listenersRef.current.delete(id);
      };
    },
    [],
  );

  const subscribeEventType = useCallback(
    <T = Record<string, unknown>>(eventType: string, callback: RealtimeCallback<T>) => {
      const id = nextIdRef.current++;
      listenersRef.current.set(id, {
        id,
        table: null,
        eventType,
        callback: callback as RealtimeCallback,
      });
      return () => {
        listenersRef.current.delete(id);
      };
    },
    [],
  );

  const value = useMemo<RealtimeContextValue>(
    () => ({ status, tenantId, subscribe, subscribeEventType }),
    [status, tenantId, subscribe, subscribeEventType],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtimeContext must be used within RealtimeProvider");
  return ctx;
}

export function useRealtimeSubscription<T = Record<string, unknown>>(
  table: string,
  callback: RealtimeCallback<T>,
) {
  const { subscribe, status } = useRealtimeContext();
  useEffect(() => {
    if (status !== "connected" && status !== "connecting") return;
    return subscribe<T>(table, callback);
  }, [subscribe, table, status, callback]);
}

export function useRealtimeEventType<T = Record<string, unknown>>(
  eventType: string,
  callback: RealtimeCallback<T>,
) {
  const { subscribeEventType, status } = useRealtimeContext();
  useEffect(() => {
    if (status !== "connected" && status !== "connecting") return;
    return subscribeEventType<T>(eventType, callback);
  }, [subscribeEventType, eventType, status, callback]);
}

export function useRealtimeStatus(): ConnectionStatus {
  return useRealtimeContext().status;
}
