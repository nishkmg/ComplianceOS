"use client";

/**
 * Chart primitives — Recharts behind thin token-driven wrappers.
 *
 * Rules enforced here:
 * - Colors come from CSS vars (--color-amber, --color-mid, ...) so charts
 *   flip with the theme automatically
 * - Animation is disabled under prefers-reduced-motion
 * - Every chart ships an accessible <table> fallback (sr-only) + a summary
 *   line, so the data is never lockstep with a screen reader
 * - Charts render only in the browser (dynamic import on server pages)
 */
import { useEffect, useState } from "react";
import type { Formatter } from "recharts/types/component/DefaultTooltipContent";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIndianNumber } from "@/lib/format";

export const CHART_COLORS = {
  amber: "var(--color-amber)",
  amberBright: "var(--color-amber-bright)",
  mid: "var(--color-mid)",
  lighter: "var(--color-lighter)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
  surface: "var(--color-surface)",
};

const moneyFormatter: Formatter = (value) => {
  const n = Array.isArray(value) ? Number(value[0]) : Number(value);
  return formatIndianNumber(n, { currency: true });
};
const moneyValueFormatter: Formatter = (value) => {
  const n = Array.isArray(value) ? Number(value[0]) : Number(value);
  return formatIndianNumber(n, { currency: true });
};

function useChartAnimation() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced ? { isAnimationActive: false } : { isAnimationActive: true, animationDuration: 500 };
}

function ChartTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>{headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

interface SeriesPoint {
  label: string;
  [key: string]: string | number;
}

/** Trend area chart (time series) */
export function TrendArea({
  data,
  xKey,
  series,
  caption,
  height = 220,
}: {
  data: SeriesPoint[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  caption: string;
  height?: number;
}) {
  const anim = useChartAnimation();
  return (
    <div aria-label={caption} role="img">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? CHART_COLORS.amberBright} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color ?? CHART_COLORS.amberBright} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lighter} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: CHART_COLORS.mid }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.mid }} tickLine={false} axisLine={false} width={56} />
          <Tooltip
            formatter={moneyFormatter}
            contentStyle={{ background: CHART_COLORS.surface, border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? CHART_COLORS.amber}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              {...anim}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartTable caption={caption} headers={[xKey, ...series.map((s) => s.name)]}
        rows={data.map((d) => [String(d[xKey]), ...series.map((s) => String(d[s.key]))])} />
    </div>
  );
}

/** Donut chart with legend (category share) */
export function Donut({
  data,
  caption,
  height = 220,
  colors = [CHART_COLORS.amber, CHART_COLORS.success, CHART_COLORS.mid, CHART_COLORS.danger],
}: {
  data: { label: string; value: number }[];
  caption: string;
  height?: number;
  colors?: string[];
}) {
  const anim = useChartAnimation();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="90%" paddingAngle={2} strokeWidth={0} {...anim}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip
            formatter={moneyValueFormatter}
            contentStyle={{ background: CHART_COLORS.surface, border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && (
        <ul className="mt-2 space-y-1.5">
          {data.map((d, i) => (
            <li key={d.label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-ui text-ui-xs text-mid">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                {d.label}
              </span>
              <span className="font-mono text-ui-xs text-dark tabular-nums">
                {formatIndianNumber(d.value, { currency: true })} · {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      )}
      <ChartTable caption={caption} headers={["Category", "Amount"]}
        rows={data.map((d) => [d.label, formatIndianNumber(d.value, { currency: true })])} />
    </div>
  );
}

/** Stacked/grouped bars */
export function StackedBars({
  data,
  xKey,
  series,
  caption,
  height = 220,
}: {
  data: SeriesPoint[];
  xKey: string;
  series: { key: string; name: string; color?: string }[];
  caption: string;
  height?: number;
}) {
  const anim = useChartAnimation();
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lighter} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: CHART_COLORS.mid }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.mid }} tickLine={false} axisLine={false} width={56} />
          <Tooltip
            formatter={moneyFormatter}
            contentStyle={{ background: CHART_COLORS.surface, border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
          />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? CHART_COLORS.amber} radius={[3, 3, 0, 0]} {...anim} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartTable caption={caption} headers={[xKey, ...series.map((s) => s.name)]}
        rows={data.map((d) => [String(d[xKey]), ...series.map((s) => String(d[s.key]))])} />
    </div>
  );
}
