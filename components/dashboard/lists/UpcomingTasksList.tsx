import React from "react";
import { Calendar, Mail, FileText, Globe } from "lucide-react";
import { standaloneIconColors, textColors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Define the expected data structure for props
interface Task {
  id: number;
  title: string;
  type: "campaign" | "email" | "template" | "domain";
  dueDate: string;
}

interface UpcomingTasksListProps {
  tasks: Task[];
}

// Helper function to get the appropriate icon for each task type
const getTaskIcon = (type: string) => {
  switch (type) {
    case "campaign":
      return <Calendar size={16} className={standaloneIconColors.blue} />;
    case "email":
      return <Mail size={16} className={standaloneIconColors.green} />;
    case "template":
      return <FileText size={16} className={standaloneIconColors.purple} />;
    case "domain":
      return <Globe size={16} className={standaloneIconColors.orange} />;
    default:
      return <Calendar size={16} className={standaloneIconColors.gray} />;
  }
};

// Accept tasks as props
const UpcomingTasksList: React.FC<UpcomingTasksListProps> = ({ tasks }) => {
  return (
    <div className="bg-card dark:bg-card shadow rounded-lg p-4 h-64 flex flex-col">
      <h3 className={cn("text-lg font-medium mb-4", textColors.primary)}>
        Upcoming Tasks
      </h3>
      <div className="flex-grow overflow-y-auto">
        {/* Use the tasks prop */}
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getTaskIcon(task.type)}
              </div>
              <div className="ml-3">
                <p className={cn("text-sm font-medium", textColors.primary)}>
                  {task.title}
                </p>
                <p className={cn("text-xs", textColors.secondary)}>
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)} ·{" "}
                  {task.dueDate}
                </p>
              </div>
            </li>
          ))}
          {/* Add a message if no tasks */}
          {tasks.length === 0 && (
            <li className={cn("py-3 text-sm text-center", textColors.secondary)}>
              No upcoming tasks found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UpcomingTasksList;
