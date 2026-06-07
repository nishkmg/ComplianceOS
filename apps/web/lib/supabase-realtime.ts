import { RealtimeClient, RealtimeChannel, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/realtime-js";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";
export type RealtimePayload<T = Record<string, unknown>> = {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
};

export type RealtimeCallback<T = Record<string, unknown>> = (payload: RealtimePayload<T>) => void;

const DEFAULT_SUPABASE_URL = "https://jjffitzswjizxcsdhtjn.supabase.co";
const REALTIME_SCHEMA = "public";

let client: RealtimeClient | null = null;
let clientUrl: string | null = null;

function baseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const httpsIndex = raw.indexOf("https://");
  const httpIndex = raw.indexOf("http://");
  const start = httpsIndex >= 0 ? httpsIndex : httpIndex >= 0 ? httpIndex : -1;
  const normalized = start >= 0 ? raw.slice(start) : raw;
  return normalized.replace(/\/$/, "");
}

function anonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function wsEndpoint(httpUrl: string) {
  return httpUrl.replace(/^http/i, "ws") + "/realtime/v1/websocket";
}

export function getRealtimeClient(): RealtimeClient {
  if (typeof window === "undefined") {
    throw new Error("Realtime client can only be created in the browser");
  }
  const url = baseUrl();
  if (client && clientUrl === url) {
    return client;
  }
  if (client) {
    void client.disconnect();
  }
  client = new RealtimeClient(wsEndpoint(url), {
    params: { apikey: anonKey(), eventsPerSecond: 10 },
    heartbeatIntervalMs: 30_000,
    timeout: 10_000,
    transport: WebSocket,
  });
  clientUrl = url;
  return client;
}

export function tenantChannel(tenantId: string): RealtimeChannel {
  const c = getRealtimeClient();
  const topic = `tenant:${tenantId}`;
  const existing = c.channels.find((ch) => ch.topic === topic);
  if (existing) return existing;
  return c.channel(topic, {
    config: { broadcast: { self: false }, presence: { key: "" } },
  });
}

type BindArgs = Parameters<RealtimeChannel["on"]>;

function bindPostgresChange<T>(
  channel: RealtimeChannel,
  event: RealtimeEvent | "*",
  table: string,
  tenantId: string,
  callback: RealtimeCallback<T>,
): () => void {
  const handler = (payload: {
    eventType: string;
    new: T;
    old: T;
    schema: string;
    table: string;
    commit_timestamp: string;
  }) => {
    callback({
      eventType: payload.eventType as RealtimeEvent,
      new: payload.new,
      old: payload.old,
      schema: payload.schema,
      table: payload.table,
      commit_timestamp: payload.commit_timestamp,
    });
  };
  const filter = {
    event: event === "*" ? REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL : event,
    schema: REALTIME_SCHEMA,
    table,
    filter: `tenant_id=eq.${tenantId}`,
  };
  (channel.on as unknown as (...args: BindArgs) => RealtimeChannel)(
    "postgres_changes" as BindArgs[0],
    filter as BindArgs[1],
    handler as BindArgs[2],
  );
  return () => {};
}

export type TableSubscription = {
  event: RealtimeEvent | "*";
  table: string;
  callback: RealtimeCallback;
};

export function bindTenantSubscriptions(
  tenantId: string,
  subscriptions: TableSubscription[],
): { channel: RealtimeChannel; cleanup: () => Promise<void> } {
  const channel = tenantChannel(tenantId);
  const cleanups: (() => void)[] = [];
  for (const sub of subscriptions) {
    cleanups.push(bindPostgresChange(channel, sub.event, sub.table, tenantId, sub.callback));
  }
  let subscribed = false;
  const ensureSubscribe = () => {
    if (subscribed) return;
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        subscribed = true;
      }
    });
  };
  ensureSubscribe();
  return {
    channel,
    cleanup: async () => {
      cleanups.forEach((fn) => fn());
      const c = getRealtimeClient();
      const ch = c.channels.find((x) => x.topic === channel.topic);
      if (ch) {
        await c.removeChannel(ch);
      }
    },
  };
}

export const REALTIME_TABLES = [
  "event_store",
  "account_balances",
  "gst_liability",
  "fy_summary",
  "inventory_valuation",
  "invoice_view",
] as const;

export type RealtimeTable = (typeof REALTIME_TABLES)[number];

export function useRealtimeTable<T = Record<string, unknown>>(
  table: string,
  callback: RealtimeCallback<T>,
): void {
  void table;
  void callback;
}

export function useRealtimePostgresChanges(_config: {
  event: RealtimeEvent;
  table: string;
  filter?: string;
  callback: RealtimeCallback;
}): void {}
