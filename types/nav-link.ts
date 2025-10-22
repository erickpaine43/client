export type NavLink = {
  title: string;
  items: NavLinkItem[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type RouteConfig = {
  path: string;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  component?: () => Promise<{
    default: React.ComponentType<Record<string, unknown>>;
  }>;
  breadcrumbs?: BreadcrumbItem[];
};

export type NavLinkItem = {
  to: string;
  highlight?: boolean;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string | number;
  disabled?: boolean;
  children?: NavLinkItem[];
  tooltip?: string;
  active?: boolean;
};

export type SidebarMenuItemProps = {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  tooltip?: string;
  showOnHover?: boolean;
} & NavLinkItem;

export type MenuItemProps = NavLinkItem & {
  onClick?: () => void;
  separatorAfter?: boolean;
};
