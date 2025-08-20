"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  RadialBar,
  RadialBarChart,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
} from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// NOTE: Recharts is not yet compatible with React 18 Strict Mode.
// Please disable Strict Mode in your `next.config.js` file:
// `reactStrictMode: false`

export function Chart({
  type,
  data,
  category,
  index,
  categories,
  colors,
  className,
  ...props
}: {
  type: "line" | "bar" | "area" | "radial" | "pie" | "scatter"
  data: Record<string, any>[]
  category?: string
  index?: string
  categories?: string[]
  colors?: string[]
  className?: string
}) {
  const ChartComponent = React.useMemo(() => {
    switch (type) {
      case "line":
        return LineChart
      case "bar":
        return BarChart
      case "area":
        return AreaChart
      case "radial":
        return RadialBarChart
      case "pie":
        return PieChart
      case "scatter":
        return ScatterChart
      default:
        return LineChart
    }
  }, [type])

  const ChartElement = React.useMemo(() => {
    switch (type) {
      case "line":
        return Line
      case "bar":
        return Bar
      case "area":
        return Area
      case "radial":
        return RadialBar
      case "pie":
        return Pie
      case "scatter":
        return Scatter
      default:
        return Line
    }
  }, [type])

  return (
    <ChartContainer config={{}} className={className} {...props}>
      <ChartComponent data={data}>
        <CartesianGrid vertical={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {categories?.map((c, i) => (
          <ChartElement
            key={c}
            dataKey={c}
            stroke={colors?.[i] || "hsl(var(--primary))"}
            fill={colors?.[i] || "hsl(var(--primary))"}
            activeDot={{ r: 6 }}
            type="monotone"
            dataKey={c}
            name={c}
            unit={c}
            stackId="a"
            fillOpacity={0.8}
            dot={false}
            strokeDasharray="3 3"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            barSize={10}
            angleAxisId={0}
            labelLine={false}
            sector={false}
            isAnimationActive={false}
            shape={<></>}
            className="stroke-primary"
          />
        ))}
      </ChartComponent>
    </ChartContainer>
  )
}
