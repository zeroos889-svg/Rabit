/**
 * Pre-built Chart Components
 * مكونات رسوم بيانية جاهزة للاستخدام
 */
import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Skeleton } from "./skeleton";

// Theme colors
const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  muted: "hsl(var(--muted))",
};

const PIE_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// Types
interface DataPoint {
  [key: string]: string | number;
}

interface ChartWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  height?: number;
}

interface AreaChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  description?: string;
  color?: string;
  gradient?: boolean;
  loading?: boolean;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

interface MultiAreaChartProps {
  data: DataPoint[];
  areas: { dataKey: string; color: string; name?: string }[];
  xAxisKey?: string;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  height?: number;
  stacked?: boolean;
}

interface BarChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  description?: string;
  color?: string;
  loading?: boolean;
  className?: string;
  height?: number;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
}

interface MultiBarChartProps {
  data: DataPoint[];
  bars: { dataKey: string; color: string; name?: string }[];
  xAxisKey?: string;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  height?: number;
  stacked?: boolean;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  description?: string;
  color?: string;
  loading?: boolean;
  className?: string;
  height?: number;
  showDots?: boolean;
  curved?: boolean;
  showGrid?: boolean;
}

interface MultiLineChartProps {
  data: DataPoint[];
  lines: { dataKey: string; color: string; name?: string; dashed?: boolean }[];
  xAxisKey?: string;
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  height?: number;
}

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  description?: string;
  loading?: boolean;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

// Chart Wrapper Component
function ChartWrapper({
  title,
  description,
  children,
  loading = false,
  className,
  height = 350,
}: Readonly<ChartWrapperProps>) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-2">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="space-y-3 w-full px-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="h-[200px] relative">
                <Skeleton className="absolute inset-0" />
              </div>
              <div className="flex gap-4 justify-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height }}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Custom Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ 
  active, 
  payload, 
  label 
}: Readonly<CustomTooltipProps>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }} 
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium">{item.value.toLocaleString("ar-SA")}</span>
        </div>
      ))}
    </div>
  );
}

// Simple Area Chart
export function SimpleAreaChart({
  data,
  dataKey,
  xAxisKey = "name",
  title,
  description,
  color = CHART_COLORS.primary,
  gradient = true,
  loading = false,
  className,
  height = 350,
  showGrid = true,
  showLegend = false,
}: Readonly<AreaChartProps>) {
  const gradientId = React.useId();

  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#${gradientId})` : color}
            fillOpacity={gradient ? 1 : 0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Multi Area Chart
export function MultiAreaChart({
  data,
  areas,
  xAxisKey = "name",
  title,
  description,
  loading = false,
  className,
  height = 350,
  stacked = false,
}: Readonly<MultiAreaChartProps>) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={area.color}
              fill={area.color}
              fillOpacity={0.2}
              strokeWidth={2}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Simple Bar Chart
export function SimpleBarChart({
  data,
  dataKey,
  xAxisKey = "name",
  title,
  description,
  color = CHART_COLORS.primary,
  loading = false,
  className,
  height = 350,
  horizontal = false,
  showGrid = true,
  showLegend = false,
}: Readonly<BarChartProps>) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          {horizontal ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis 
                dataKey={xAxisKey} 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Multi Bar Chart
export function MultiBarChart({
  data,
  bars,
  xAxisKey = "name",
  title,
  description,
  loading = false,
  className,
  height = 350,
  stacked = false,
}: Readonly<MultiBarChartProps>) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Simple Line Chart
export function SimpleLineChart({
  data,
  dataKey,
  xAxisKey = "name",
  title,
  description,
  color = CHART_COLORS.primary,
  loading = false,
  className,
  height = 350,
  showDots = true,
  curved = true,
  showGrid = true,
}: Readonly<LineChartProps>) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type={curved ? "monotone" : "linear"}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={showDots ? { fill: color, strokeWidth: 2 } : false}
            activeDot={{ r: 6, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Multi Line Chart
export function MultiLineChart({
  data,
  lines,
  xAxisKey = "name",
  title,
  description,
  loading = false,
  className,
  height = 350,
}: Readonly<MultiLineChartProps>) {
  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.dashed ? "5 5" : undefined}
              dot={{ fill: line.color, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Pie Chart Tooltip Component
interface PieTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ name: string; value: number }>;
  total: number;
}

function PieTooltipContent({ active, payload, total }: Readonly<PieTooltipProps>) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const percent = ((item.value) / total * 100).toFixed(1);
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="font-medium">{item.name}</p>
      <p className="text-sm text-muted-foreground">
        {item.value.toLocaleString("ar-SA")} ({percent}%)
      </p>
    </div>
  );
}

// Legend formatter function
function legendFormatter(value: string) {
  return <span className="text-sm">{value}</span>;
}

// Donut/Pie Chart
export function DonutChart({
  data,
  title,
  description,
  loading = false,
  className,
  innerRadius = 60,
  outerRadius = 100,
  showLabels = false,
  showLegend = true,
}: Readonly<PieChartProps>) {
  const total = React.useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  const tooltipContent = React.useCallback(
    (props: { active?: boolean; payload?: ReadonlyArray<{ name: string; value: number }> }) => (
      <PieTooltipContent {...props} total={total} />
    ),
    [total]
  );

  return (
    <ChartWrapper
      title={title}
      description={description}
      loading={loading}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={showLabels ? ({ name, percent }: { name?: string; percent?: number }) => 
              `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
            : undefined}
          >
            {data.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={entry.color || PIE_COLORS[data.indexOf(entry) % PIE_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={tooltipContent} />
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={legendFormatter}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Mini Sparkline Chart (for inline stats)
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDot?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = CHART_COLORS.primary,
  height = 40,
  width = 120,
  showDot = true,
  className,
}: Readonly<SparklineProps>) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className={cn("inline-block", className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={showDot ? { r: 4, fill: color } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Progress Ring Chart
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = CHART_COLORS.primary,
  trackColor = "hsl(var(--muted))",
  showValue = true,
  className,
}: Readonly<ProgressRingProps>) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

// Export colors for external use
export { CHART_COLORS, PIE_COLORS };
