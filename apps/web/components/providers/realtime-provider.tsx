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
import {
  REALTIME_TABLES,
  bindTenantSubscriptions,
  type RealtimeCallback,
  type RealtimeEvent,
  type RealtimePayload,
} from "@/lib/supabase-realtime";

type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

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

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const tenantId =
    ((session?.user as Record<string, unknown> | undefined)?.tenantId as string | undefined) ??
    null;

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const listenersRef = useRef<Map<number, Listener>>(new Map());
  const nextIdRef = useRef(1);
  const cleanupRef = useRef<(() => Promise<void>) | null>(null);

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

    let cancelled = false;
    setStatus("connecting");

    const subs = REALTIME_TABLES.map((table) => ({
      event: "*" as RealtimeEvent | "*",
      table,
      callback: fanOut,
    }));

    // Realtime is optional: if the Supabase legacy stack is unconfigured
    // (no anon key / dead project), degrade to disconnected instead of
    // crashing the whole app shell.
    let cleanup: (() => Promise<void>) | null = null;
    try {
      ({ cleanup } = bindTenantSubscriptions(tenantId, subs));
    } catch {
      setStatus("disconnected");
      return () => {};
    }
    cleanupRef.current = cleanup;

    const statusTimer = setTimeout(() => {
      if (!cancelled) setStatus((prev) => (prev === "connecting" ? "connected" : prev));
    }, 1500);

    setStatus("connected");

    return () => {
      cancelled = true;
      clearTimeout(statusTimer);
      void cleanupRef.current?.();
      cleanupRef.current = null;
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
