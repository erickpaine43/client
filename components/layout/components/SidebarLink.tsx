import { cn } from "@/lib/utils";
import { NavLinkItem } from "@/types/nav-link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "../../ui/custom/Icon";
import { SidebarMenuButton } from "../../ui/sidebar";

function SidebarLink({ link }: { link: NavLinkItem }) {
  const isActive = usePathname() === link.to;
  const router = useRouter();

  function navigate() {
    router.push(link.to);
  }

  return (
    <SidebarMenuButton
      tooltip={link.label}
      onClick={navigate}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 cursor-pointer",
        {
          "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 hover:text-white":
            isActive && link.highlight,
          "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/50":
            isActive && !link.highlight,
          "text-foreground hover:bg-accent hover:text-accent-foreground":
            !isActive,
        }
      )}
    >
      <Icon
        icon={link.icon}
        className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive
            ? link.highlight
              ? "text-white"
              : "text-blue-600 dark:text-blue-400"
            : "text-muted-foreground"
        )}
      />
      <span>{link.label}</span>
      {link.highlight && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-300 rounded-full animate-pulse" />
        </div>
      )}
    </SidebarMenuButton>
  );
}

export default SidebarLink;
