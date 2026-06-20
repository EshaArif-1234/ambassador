'use client';

import { useState, useEffect, useMemo } from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { getChartPeriodOptions, type ChartRange } from '@/lib/adminChartRanges';
import {
  ORDER_STATUS_CHART_ORDER,
  ORDER_STATUS_DISPLAY,
  type OrderFulfillmentStatus,
} from '@/utils/orderWorkflow.util';

type TimeRange = ChartRange;

type StatusCounts = Record<OrderFulfillmentStatus, number>;

interface OrderStatusData {
  total: number;
  byStatus: StatusCounts;
  range: TimeRange;
  rangeLabel: string;
  description: string;
}

type StatusKey = OrderFulfillmentStatus;

const STATUS_COLORS: Record<StatusKey, { color: string; dotClass: string; textClass: string }> = {
  processing: { color: 'hsl(217 91% 60%)', dotClass: 'bg-blue-500', textClass: 'text-blue-600' },
  confirmed: { color: 'hsl(239 84% 67%)', dotClass: 'bg-indigo-500', textClass: 'text-indigo-600' },
  shipped: { color: 'hsl(189 94% 43%)', dotClass: 'bg-cyan-500', textClass: 'text-cyan-600' },
  delivered: { color: 'hsl(142 71% 45%)', dotClass: 'bg-green-500', textClass: 'text-green-600' },
  pending: { color: 'hsl(25 95% 53%)', dotClass: 'bg-orange-500', textClass: 'text-orange-600' },
  cancelled: { color: 'hsl(0 84% 60%)', dotClass: 'bg-red-400', textClass: 'text-red-600' },
};

const STATUS_META = ORDER_STATUS_CHART_ORDER.map((key) => ({
  key,
  label: ORDER_STATUS_DISPLAY[key],
  ...STATUS_COLORS[key],
}));

const chartConfig = STATUS_META.reduce(
  (acc, item) => ({
    ...acc,
    [item.key]: { label: item.label, color: item.color },
  }),
  { orders: { label: 'Orders' } }
) satisfies ChartConfig;

const PERIOD_OPTIONS = getChartPeriodOptions().map((option) => ({
  ...option,
  description: `Order status · ${option.description}`,
}));

function PeriodSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
      role="group"
      aria-label="Select time period"
    >
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-all sm:text-sm',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function getTopStatus(byStatus: StatusCounts): { label: string; count: number } | null {
  const top = STATUS_META.map((item) => ({
    label: item.label,
    count: byStatus[item.key],
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)[0];

  return top ?? null;
}

const OrderStatusChart = () => {
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/order-status?range=${timeRange}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load order status data.');
        }
        if (!cancelled) {
          setData(json.data as OrderStatusData);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : 'Failed to load order status data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const pieData = useMemo(() => {
    if (!data) return [];
    return STATUS_META.map((item) => ({
      status: item.key,
      label: item.label,
      count: data.byStatus[item.key],
      fill: `var(--color-${item.key})`,
    })).filter((item) => item.count > 0);
  }, [data]);

  const topStatus = data ? getTopStatus(data.byStatus) : null;
  const activePeriod = PERIOD_OPTIONS.find((p) => p.value === timeRange);
  const hasData = (data?.total ?? 0) > 0;

  return (
    <Card className="flex flex-col py-0">
      <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Order Status Summary</CardTitle>
          <CardDescription>
            {activePeriod?.description ?? 'Distribution of orders by status'}
          </CardDescription>
        </div>
        <PeriodSelector value={timeRange} onChange={setTimeRange} />
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-6">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="mx-auto h-[220px] w-[220px] rounded-full bg-muted" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-muted" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : !hasData ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-muted-foreground">No orders in this period</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Order status breakdown will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="status" />}
                />
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={62}
                  outerRadius={88}
                  strokeWidth={4}
                  stroke="hsl(var(--background))"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
                      const cx = viewBox.cx as number;
                      const cy = viewBox.cy as number;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan
                            x={cx}
                            y={cy - 6}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {data?.total.toLocaleString('en-PK')}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy + 14}
                            className="fill-muted-foreground text-xs"
                          >
                            Total Orders
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-3">
              {STATUS_META.map(({ key, label, dotClass, textClass }) => {
                const count = data?.byStatus[key] ?? 0;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          dotClass,
                          count === 0 && 'opacity-40'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          count > 0 ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        count > 0 ? textClass : 'text-muted-foreground/60'
                      )}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {!loading && !error && hasData && data && (
        <CardFooter className="flex-col items-start gap-1 border-t px-6 py-4 text-sm">
          {topStatus && (
            <div className="font-medium leading-none">
              {topStatus.label} leads with {topStatus.count.toLocaleString('en-PK')} orders
            </div>
          )}
          <div className="text-xs text-muted-foreground">{data.rangeLabel}</div>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderStatusChart;
