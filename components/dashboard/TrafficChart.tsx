'use client';

import { useState, useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  orders: number;
  users: number;
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const chartConfig = {
  activity: { label: 'Activity' },
  orders: { label: 'Orders', color: 'hsl(var(--chart-1))' },
  users: { label: 'New Users', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const PERIOD_OPTIONS: { value: TimeRange; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Orders & registrations — last 7 days' },
  { value: 'weekly', label: 'Weekly', description: 'Orders & registrations — last 4 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Orders & registrations — last 6 months' },
  { value: 'yearly', label: 'Yearly', description: 'Orders & registrations — last 5 years' },
];

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

function getTrend(chartData: DataPoint[]): { text: string; up: boolean } | null {
  if (chartData.length < 2) return null;

  const total = (d: DataPoint) => d.orders + d.users;
  const last = total(chartData[chartData.length - 1]);
  const prev = total(chartData[chartData.length - 2]);

  if (prev === 0 && last === 0) return null;
  if (prev === 0) return { text: 'Activity increased this period', up: true };
  if (last === 0) return { text: 'Activity decreased this period', up: false };

  const change = ((last - prev) / prev) * 100;
  const up = change >= 0;
  return {
    text: `${up ? 'Up' : 'Down'} ${Math.abs(change).toFixed(1)}% from previous period`,
    up,
  };
}

const TrafficChart = () => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/traffic?range=${timeRange}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load activity data.');
        }
        if (!cancelled) {
          setChartData(json.data as DataPoint[]);
        }
      } catch (err) {
        if (!cancelled) {
          setChartData([]);
          setError(err instanceof Error ? err.message : 'Failed to load activity data.');
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

  const totals = useMemo(
    () => ({
      orders: chartData.reduce((sum, d) => sum + d.orders, 0),
      users: chartData.reduce((sum, d) => sum + d.users, 0),
    }),
    [chartData]
  );

  const hasData = chartData.some((d) => d.orders > 0 || d.users > 0);
  const activePeriod = PERIOD_OPTIONS.find((p) => p.value === timeRange);
  const trend = useMemo(() => getTrend(chartData), [chartData]);
  const rangeLabel =
    chartData.length > 0
      ? `${chartData[0].label} – ${chartData[chartData.length - 1].label}`
      : activePeriod?.description ?? '';

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Business Activity</CardTitle>
          <CardDescription>
            {activePeriod?.description ?? 'New orders & registrations over time'}
          </CardDescription>
        </div>
        <PeriodSelector value={timeRange} onChange={setTimeRange} />
      </CardHeader>

      <CardContent className="overflow-visible px-2 pb-4 pt-6 sm:px-6 sm:pb-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-[300px] rounded-lg bg-muted" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : !hasData ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <svg
              className="mb-4 h-12 w-12 text-muted-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Orders and user registrations will appear here
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] min-h-[300px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, left: 12, bottom: 40 }}
            >
              <defs>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={timeRange === 'daily' ? 8 : 16}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[170px]"
                    nameKey="activity"
                    indicator="dot"
                    labelFormatter={(value) => String(value)}
                  />
                }
              />
              <Area
                dataKey="users"
                type="natural"
                fill="url(#fillUsers)"
                stroke="var(--color-users)"
                stackId="a"
                strokeWidth={2}
              />
              <Area
                dataKey="orders"
                type="natural"
                fill="url(#fillOrders)"
                stroke="var(--color-orders)"
                stackId="a"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>

      {!loading && !error && hasData && (
        <CardFooter className="flex-col items-start gap-1.5 border-t px-6 py-4 text-sm">
          {trend && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.up ? (
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{trend.text}</span>
            </div>
          )}
          <div className="text-xs leading-none text-muted-foreground">
            {rangeLabel}
            <span className="mx-2">·</span>
            {totals.orders.toLocaleString('en-PK')} orders
            <span className="mx-2">·</span>
            {totals.users.toLocaleString('en-PK')} new users
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TrafficChart;
