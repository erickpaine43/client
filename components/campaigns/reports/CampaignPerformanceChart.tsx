"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend
} from "recharts";

// MIGRATED: Define the expected data structure for props using standardized field names
interface ChartDataPoint {
  name: string;
  [key: string]: unknown; // Allow other properties like opened_tracked, clicked_tracked, etc.
}

interface CampaignPerformanceChartProps {
  data: ChartDataPoint[];
}

// Migration note: Canonicalize chart data keys for safety.
function canonicalizeChartData(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map((point) => ({
    ...point,
    opened_tracked: point.opened_tracked ?? point.opened ?? 0,
    clicked_tracked: point.clicked_tracked ?? point.clicked ?? 0,
  }));
}

// Custom Tooltip component (remains the same)
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: {
    color: string;
    name: string;
    value: number;
  }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow rounded border border-gray-200">
        <p className="font-semibold text-sm text-gray-700">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color }}
            className="text-xs"
          >
            {`${entry.name} : ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Accept data as props
const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({
  data,
}) => {
  const safeData = canonicalizeChartData(data);
  return (
    <div className="bg-white shadow rounded-lg p-4 h-96 flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Campaign Performance
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {/* Use canonicalized data */}
          <LineChart
            data={safeData}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
            />
            {/* <Legend verticalAlign="top" height={36}/> */}
            <Line
              type="monotone"
              dataKey="opened_tracked"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Opens (Tracked)"
            />
            <Line
              type="monotone"
              dataKey="clicked_tracked"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Clicks (Tracked)"
            />
            <Line
              type="monotone"
              dataKey="replies"
              stroke="#93C5FD"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Replies"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CampaignPerformanceChart;
