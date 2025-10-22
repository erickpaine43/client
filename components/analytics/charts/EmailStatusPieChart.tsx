"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { ChartDataPoint } from "@/types/analytics/ui";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// Use standardized ChartDataPoint interface
interface EmailStatusPieChartProps {
  data: ChartDataPoint[];
}

// Colors matching the screenshot (approximate)
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#8884d8", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle = 0,
  innerRadius,
  outerRadius,
  percent = 0,
}: {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius: number;
  outerRadius: number;
  percent?: number;
}) => {
  if (
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined ||
    percent === undefined
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percent is large enough to avoid clutter
  if (percent * 100 < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0].value);
    const formattedValue =
      value < 1
        ? AnalyticsCalculator.formatRateAsPercentage(value / 100)
        : AnalyticsCalculator.formatNumber(value);

    return (
      <div className="bg-white p-2 shadow rounded border border-gray-200">
        <p className="font-semibold text-sm text-gray-700">
          {`${payload[0].name}: ${formattedValue}`}
        </p>
      </div>
    );
  }
  return null;
};

// Accept data as props
const EmailStatusPieChart: React.FC<EmailStatusPieChartProps> = ({ data }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 h-96 flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Status</h3>
      <div className="flex-grow flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100} // Adjust radius as needed
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Legend can be added here if needed */}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Manual Legend with standardized formatting */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((entry, index) => {
          const value =
            typeof entry.value === "number" ? entry.value : Number(entry.value);
          const formattedValue =
            value < 1
              ? AnalyticsCalculator.formatRateAsPercentage(value / 100)
              : `${AnalyticsCalculator.formatNumber(value)}%`;

          return (
            <div key={`legend-${index}`} className="flex items-center text-xs">
              <span
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>
                {entry.name} {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailStatusPieChart;
