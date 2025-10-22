// Centralized UI component prop interfaces and types
import { VariantProps } from "class-variance-authority";

// Button Types
export type ButtonVariants = VariantProps<
  typeof import("../components/ui/button").buttonVariants
>;
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

// Form Types
export interface FormFieldContextValue<
  TFieldValues extends
    import("react-hook-form").FieldValues = import("react-hook-form").FieldValues,
  TName extends
    import("react-hook-form").FieldPath<TFieldValues> = import("react-hook-form").FieldPath<TFieldValues>,
> {
  name: TName;
}

export type FormItemContextValue = {
  id: string;
};

// Input Types
export type InputProps = React.ComponentProps<"input">;

// Chart Types
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

// Chart Container Props
export interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof import("recharts").ResponsiveContainer
  >["children"];
}

// Chart Tooltip Content Props
export interface ChartTooltipContentProps
  extends React.ComponentProps<typeof import("recharts").Tooltip> {
  active?: boolean;
  payload?: Record<string, unknown>[];
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

// Chart Legend Content Props
export interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  payload?: unknown[];
  verticalAlign?: "bottom" | "top" | "middle";
  hideIcon?: boolean;
  nameKey?: string;
}

// Table Types
export type TableProps = React.ComponentProps<"table">;
export type TableHeaderProps = React.ComponentProps<"thead">;
export type TableBodyProps = React.ComponentProps<"tbody">;
export type TableFooterProps = React.ComponentProps<"tfoot">;
export type TableRowProps = React.ComponentProps<"tr">;
export type TableHeadProps = React.ComponentProps<"th">;
export type TableCellProps = React.ComponentProps<"td">;
export type TableCaptionProps = React.ComponentProps<"caption">;

// Card Types
export type CardProps = React.ComponentProps<"div">;
export type CardHeaderProps = React.ComponentProps<"div">;
export type CardTitleProps = React.ComponentProps<"div">;
export type CardDescriptionProps = React.ComponentProps<"div">;
export type CardActionProps = React.ComponentProps<"div">;
export type CardContentProps = React.ComponentProps<"div">;
export type CardFooterProps = React.ComponentProps<"div">;

// Layout Types
export interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Chart and Visualization Prop Types
export interface CampaignPerformanceChartProps {
  data: import("./analytics").ChartDataPoint[];
}

export interface PieChartDataPoint {
  name: string;
  value: number;
}

export interface EmailStatusPieChartProps {
  data: PieChartDataPoint[];
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

// Lexical Editor Types
export interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface LexicalEditorRef {
  insertText: (text: string) => void;
}
