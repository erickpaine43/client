"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const currentPage = usePathname();
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "p-2.5 rounded-lg transition-all duration-200 group ",
          currentPage === href
            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        {children}
      </Button>
    </Link>
  );
}
export default IconLink;
