import { toast } from "sonner";
import { ReactNode } from "react";

type CustomToastOptions = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export const showCustomToast = ({
  title,
  description,
  icon,
}: CustomToastOptions) => {
  toast.custom(() => (
    <div className="p-4 border border-gray-700 dark:border-border rounded-lg bg-white dark:bg-card shadow-md w-full max-w-sm">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div className="flex flex-col">
          <p className="font-medium text-gray-900 dark:text-foreground">
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-600 dark:text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  ));
};
