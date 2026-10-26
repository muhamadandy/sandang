"use client";

import {
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
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

export type RevenuePoint = { label: string; total: number };
export type CategoryPoint = { category: string; total: number };

// Warna mengikuti variabel tema (--chart-1 sampai --chart-5) di globals.css
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type TooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string; name?: string | number }>;
  label?: string | number;
};

const ChartTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const title = label ?? item.name;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground">
        {formatRupiah(Number(item.value ?? 0))}
      </p>
    </div>
  );
};

const EmptyChart = ({ message }: { message: string }) => (
  <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

export const RevenueChart = ({ data }: { data: RevenuePoint[] }) => {
  if (data.every((point) => point.total === 0)) {
    return (
      <EmptyChart message="Belum ada pendapatan dalam 6 bulan terakhir." />
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            width={64}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatRupiahCompact(value)}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={<ChartTooltip />}
          />
          <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart = ({ data }: { data: CategoryPoint[] }) => {
  const sum = data.reduce((acc, item) => acc + item.total, 0);

  if (sum === 0) {
    return <EmptyChart message="Belum ada penjualan." />;
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip />} />
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="var(--background)"
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={PALETTE[index % PALETTE.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda dibuat dari HTML supaya rapi dan bisa membungkus di layar sempit */}
      <ul className="mt-4 space-y-2">
        {data.map((item, index) => (
          <li
            key={item.category}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
              />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {Math.round((item.total / sum) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
