import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Plus, Mail, Upload, AlertTriangle } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import AppSideBar from "@/components/layout/components/Sidebar";
import DashboardHeader from "@/components/layout/components/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Wrapper component that replicates the real app layout structure
const RealDashboardLayout = ({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: "light" | "dark";
}) => {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset className="max-w-10/12 md:peer-data-[variant=inset]:shadow-none gap-5 overflow-hidden">
        <div className="rounded-lg shadow-sm">
          <DashboardHeader />
        </div>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 rounded-lg shadow-sm">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

const meta = {
  title: "Legacy/App Layout/Dashboard Layout (Real)",
  component: RealDashboardLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "This is the REAL dashboard layout used in the application (from app/[locale]/dashboard/layout.tsx). It includes AppSideBar (hierarchical sidebar) and DashboardHeader. Compare this with Design System/Components/DashboardLayout to see the migration.",
      },
    },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/dashboard",
        query: {},
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Toggle between light and dark mode",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.args.theme || "light";

      React.useEffect(() => {
        const htmlElement = document.documentElement;
        if (theme === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }

        // Cleanup on unmount
        return () => {
          htmlElement.classList.remove("dark");
        };
      }, [theme]);

      return <Story />;
    },
  ],
} satisfies Meta<typeof RealDashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data matching the reference image
interface MockReply {
  name: string;
  email: string;
  status: "interested" | "not_interested";
  message: string;
  timestamp: string;
}

const mockRecentReplies: MockReply[] = [
  {
    name: "Sarah Johnson",
    email: "techcorp",
    status: "interested",
    message:
      "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    timestamp: "2 hours ago",
  },
  {
    name: "Mike Chen",
    email: "startupbb",
    status: "not_interested",
    message:
      "Not interested at this time, but please keep us in mind for the future.",
    timestamp: "4 hours ago",
  },
  {
    name: "Lisa Rodriguez",
    email: "enterprise-inc",
    status: "interested",
    message:
      "This looks interesting. Can you send me more information about pricing?",
    timestamp: "6 hours ago",
  },
];

const DashboardContentSample = () => (
  <div className="space-y-4">
    {/* Manual Header - matching reference image */}
    <div className="mb-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome back! Here&apos;s what&apos;s happening with your campaigns.
      </p>
    </div>

    {/* Empty State - No Campaign Data */}
    <div className="bg-muted/30 rounded-lg border border-border flex flex-col items-center justify-center py-20 mb-6">
      <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
        <Mail className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No Campaign Data</h3>
      <p className="text-sm text-muted-foreground">
        Start a campaign to see KPI metrics.
      </p>
    </div>

    {/* Main Grid: Recent Replies + Sidebar */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Recent Replies - 2/3 width */}
      <div className="lg:col-span-2">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Recent Replies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mockRecentReplies.map((reply, i) => (
              // TODO: React key anti-pattern - using array index as key can cause rendering issues
              // when list items are reordered, added, or removed
              //
              // Fix: Use reply.email as unique key instead of array index:
              // key={reply.email}
              //
              // Alternatively, add an 'id' field to MockReply interface and use:
              // key={reply.id}
              //
              // This ensures stable keys and prevents React reconciliation bugs.
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">
                    {reply.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {reply.name}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">
                      {reply.email}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        reply.status === "interested"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-xs ml-1"
                          : "bg-muted text-muted-foreground border-border text-xs ml-1"
                      }
                    >
                      {reply.status === "interested"
                        ? "Interested"
                        : "Not interested"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {reply.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {reply.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - 1/3 width */}
      <div className="space-y-4">
        {/* Warmup Status */}
        <Card className="border border-border">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">
              Warmup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Mailboxes
              </span>
              <span className="text-sm font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Warming Up</span>
              <span className="text-sm font-semibold text-orange-500">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Ready to Send
              </span>
              <span className="text-sm font-semibold text-green-500">5</span>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-3 pb-3 bg-amber-500/5">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <span>2 mailboxes need attention</span>
            </div>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-3 pb-3">
            <Button variant="ghost" className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 rounded-md transition-colors">
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Create Campaign</p>
                <p className="text-xs text-muted-foreground">
                  Start a new email campaign
                </p>
              </div>
            </Button>
            <button className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 rounded-md transition-colors">
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Upload Leads</p>
                <p className="text-xs text-muted-foreground">
                  Import your contact list
                </p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export const CompleteDashboard: Story = {
  args: {
    children: <DashboardContentSample />,
    theme: "light",
  },
};
