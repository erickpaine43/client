import { RefreshCw } from "lucide-react";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <RefreshCw size={60} className="text-blue-500 dark:text-blue-400" />
      <span className="ml-4 text-lg text-foreground">Loading...</span>
    </div>
  );
}

export default Loading;
