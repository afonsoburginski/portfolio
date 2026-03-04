"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { ValueType, NameType, Payload } from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";

/* ── ChartConfig ──────────────────────────────────────── */
export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<"light" | "dark", string>;
  }
>;

/* ── Context ──────────────────────────────────────────── */
const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

/* ── ChartContainer ───────────────────────────────────── */
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig; children: React.ReactNode }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart-container
        ref={ref}
        id={chartId}
        className={cn(
          "w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

/* ── ChartTooltip ─────────────────────────────────────── */
const ChartTooltip = RechartsPrimitive.Tooltip;

/* ── ChartTooltipContent ──────────────────────────────── */
interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[];
  label?: string | number;
  labelFormatter?: (label: string | number, payload: Payload<ValueType, NameType>[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (
    value: ValueType,
    name: NameType,
    entry: Payload<ValueType, NameType>,
    index: number,
    payload: Payload<ValueType, NameType>[]
  ) => React.ReactNode;
  contentStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  itemSorter?: (payload: Payload<ValueType, NameType>[]) => (a: Payload<ValueType, NameType>, b: Payload<ValueType, NameType>) => number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  /** Stripped so Recharts' boolean is not passed to the DOM */
  cursor?: unknown;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      contentStyle,
      itemStyle,
      itemSorter,
      nameKey,
      labelKey,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip Recharts cursor so it isn't passed to DOM
      cursor: _cursor,
      ...domProps
    },
    ref
  ) => {
    const { config } = useChart();
    if (!active || !payload?.length) return null;

    const defaultCompare = (
      a: Payload<ValueType, NameType>,
      b: Payload<ValueType, NameType>
    ) => (Number(b.value) ?? 0) - (Number(a.value) ?? 0);

    const sorted = payload
      .filter((entry) => !entry.hide)
      .sort((a, b) => {
        if (typeof itemSorter !== "function") return defaultCompare(a, b);
        const comparator = itemSorter(payload);
        return typeof comparator === "function" ? comparator(a, b) : defaultCompare(a, b);
      });

    const labelValue = labelKey
      ? (payload[0]?.payload as Record<string, unknown>)?.[labelKey]
      : label;

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        style={contentStyle}
        {...domProps}
      >
        {!hideLabel && (
          <div className={cn("font-medium text-foreground", labelClassName)}>
            {labelFormatter
              ? labelFormatter(labelValue as string | number, payload)
              : String(labelValue ?? "")}
          </div>
        )}
        <div className="grid gap-1.5">
          {sorted.map((entry, index) => {
            const key =
              (nameKey && (entry.payload as Record<string, unknown>)[nameKey]) ??
              entry.name ??
              entry.dataKey;
            const configEntry = config[(key as string) ?? ""];
            const value =
              formatter && entry.value !== undefined && entry.name
                ? formatter(entry.value, entry.name, entry, index, payload)
                : entry.value;
            return (
              <div
                key={String(entry.dataKey)}
                className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground"
                style={itemStyle}
              >
                {!hideIndicator && (
                  <span
                    className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                    style={
                      {
                        "--color-bg": configEntry?.color ?? entry.color,
                        "--color-border": configEntry?.color ?? entry.color,
                        ...(indicator === "line" && {
                          width: "4px",
                          borderLeftWidth: 2,
                          borderColor: "var(--color-border)",
                        }),
                        ...(indicator === "dashed" && {
                          width: "4px",
                          borderLeftWidth: 2,
                          borderColor: "var(--color-border)",
                          borderStyle: "dashed",
                        }),
                        ...(indicator === "dot" && {
                          width: "8px",
                          height: "8px",
                          borderRadius: "9999px",
                          borderWidth: 0,
                          backgroundColor: "var(--color-bg)",
                        }),
                      } as React.CSSProperties
                    }
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <span className="text-muted-foreground">{configEntry?.label ?? String(key ?? "")}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
