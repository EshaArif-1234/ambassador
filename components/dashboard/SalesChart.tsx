'use client';

import { useState, useEffect, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { getChartPeriodOptions, type ChartRange } from '@/lib/adminChartRanges';

interface ChartPoint {
  label: string;
  sales: number;
  orders: number;
}

type TimeRange = ChartRange;
type ActiveMetric = 'sales' | 'orders';

const PERIOD_OPTIONS = getChartPeriodOptions();

const chartConfig = {
  overview: { label: 'Overview' },
  sales: { label: 'Sales', color: 'hsl(var(--chart-1))' },
  orders: { label: 'Orders', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

function formatPkr(value: number): string {
  return `PKR ${Math.round(value).toLocaleString('en-PK')}`;
}

function formatTotal(value: number, type: ActiveMetric): string {
  if (type === 'sales') return formatPkr(value);
  return value.toLocaleString('en-PK');
}

function SalesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function MetricCard({
  type,
  value,
  active,
  onClick,
  hasData,
}: {
  type: ActiveMetric;
  value: number;
  active: boolean;
  onClick: () => void;
  hasData: boolean;
}) {
  const isSales = type === 'sales';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-200',
        active
          ? isSales
            ? 'border-orange-200 bg-orange-50/80 shadow-sm ring-1 ring-orange-200/60'
            : 'border-blue-200 bg-blue-50/80 shadow-sm ring-1 ring-blue-200/60'
          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/40'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            active
              ? isSales
                ? 'bg-orange-500 text-white'
                : 'bg-blue-500 text-white'
              : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
          )}
        >
          {isSales ? <SalesIcon className="h-4 w-4" /> : <OrdersIcon className="h-4 w-4" />}
        </div>
        {active && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              isSales ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            )}
          >
            Active
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{chartConfig[type].label}</p>
        <p
          className={cn(
            'mt-0.5 text-xl font-bold leading-tight tracking-tight sm:text-2xl',
            active ? 'text-foreground' : 'text-foreground/80'
          )}
        >
          {hasData ? formatTotal(value, type) : '—'}
        </p>
      </div>
    </button>
  );
}

function PeriodSelector({
  value,
  onChange,
  className,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-border bg-muted/50 p-1',
        className
      )}
      role="group"
      aria-label="Select time period"
    >
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:text-sm',
            value === option.value
              ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ChartHeaderSkeleton() {
  return (
    <div className="animate-pulse border-b bg-gradient-to-br from-muted/40 via-background to-background px-6 py-5">
      <div className="h-6 w-40 rounded bg-muted" />
      <div className="mt-2 h-4 w-56 rounded bg-muted" />
      <div className="mt-4 h-9 w-full max-w-md rounded-xl bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-24 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

const SalesChart = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<ActiveMetric>('sales');
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/sales-chart?range=${timeRange}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to load chart data.');
        }
        if (!cancelled) {
          setChartData(json.data as ChartPoint[]);
        }
      } catch (err) {
        if (!cancelled) {
          setChartData([]);
          setError(err instanceof Error ? err.message : 'Failed to load chart data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChartData();
    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const totals = useMemo(
    () => ({
      sales: chartData.reduce((sum, d) => sum + d.sales, 0),
      orders: chartData.reduce((sum, d) => sum + d.orders, 0),
    }),
    [chartData]
  );

  const hasData = chartData.some((d) => d.sales > 0 || d.orders > 0);
  const activePeriod = PERIOD_OPTIONS.find((p) => p.value === timeRange);

  return (
    <Card className="py-0">
      {loading ? (
        <ChartHeaderSkeleton />
      ) : (
        <div className="border-b bg-gradient-to-br from-muted/40 via-background to-background">
          <div className="px-6 py-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Sales Overview
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {activePeriod?.description ?? 'Revenue and order trends'}
                  </p>
                </div>

                <PeriodSelector value={timeRange} onChange={setTimeRange} className="w-full sm:w-auto" />
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:min-w-[300px] lg:w-auto lg:min-w-[340px]">
                <MetricCard
                  type="sales"
                  value={totals.sales}
                  active={activeChart === 'sales'}
                  onClick={() => setActiveChart('sales')}
                  hasData={hasData}
                />
                <MetricCard
                  type="orders"
                  value={totals.orders}
                  active={activeChart === 'orders'}
                  onClick={() => setActiveChart('orders')}
                  hasData={hasData}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent className="overflow-visible px-2 pt-4 pb-8 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-[250px] rounded-lg bg-muted" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : !hasData ? (
          <div className="flex h-[250px] flex-col items-center justify-center text-center">
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
            <p className="text-sm font-medium text-muted-foreground">No activity</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              No data available for the selected period
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] min-h-[280px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, left: 12, bottom: 28 }}
            >
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={timeRange === 'daily' ? 4 : 24}
                interval={timeRange === 'daily' ? 'preserveStartEnd' : 'preserveStart'}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    nameKey="overview"
                    indicator="dot"
                    labelFormatter={(value) => String(value)}
                    formatter={(value, name) => {
                      const num = Number(value);
                      if (name === 'sales') {
                        return [formatPkr(num), chartConfig.sales.label];
                      }
                      return [
                        `${num.toLocaleString('en-PK')} orders`,
                        chartConfig.orders.label,
                      ];
                    }}
                  />
                }
              />
              <Area
                dataKey={activeChart}
                type={timeRange === 'daily' ? 'monotone' : 'natural'}
                fill={activeChart === 'sales' ? 'url(#fillSales)' : 'url(#fillOrders)'}
                stroke={`var(--color-${activeChart})`}
                strokeWidth={2}
                dot={timeRange === 'daily' ? { r: 3, fill: `var(--color-${activeChart})` } : false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;
