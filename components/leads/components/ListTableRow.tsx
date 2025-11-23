import { leadListsData } from "@/lib/data/leads";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../../ui/button/button";

// Type for performance metrics
type PerformanceMetrics = {
  openRate: number;
  replyRate: number;
};
const getStatusColor = (status: string) => {
  switch (status) {
    case "used":
    case "being-used":
      return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/30";
    case "not-used":
      return "bg-muted/50 dark:bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted/50 dark:bg-muted text-muted-foreground border-border";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "used":
    case "being-used":
      return <CheckCircle className="w-3 h-3" />;
    case "not-used":
      return <Clock className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "used":
    case "being-used":
      return "Being Used";
    case "not-used":
      return "Not Used Yet";
    default:
      return "Not Used Yet";
  }
};

function ListTableRow({ list }: { list: (typeof leadListsData)[0] }) {
  const isUsed = list.status === "used" || list.status === "being-used";

  return (
    <TableRow key={list.id}>
      <TableCell>
        <div>
          <h3 className="font-semibold text-foreground">{list.name}</h3>
          {/* Only show bounced if the list is being used */}
          {isUsed && list.bounced > 0 && (
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-red-600 dark:text-red-400">
                {list.bounced} bounced
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {list.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted/50 dark:bg-muted text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {list.contacts.toLocaleString()}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            list.status
          )}`}
        >
          {getStatusIcon(list.status)}
          <span>{getStatusLabel(list.status)}</span>
        </span>
      </TableCell>
      <TableCell>
        <div className="text-sm font-medium text-foreground">
          {isUsed ? (
            list.campaign
          ) : (
            <span className="text-muted-foreground italic">Not used yet</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isUsed ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {("performance" in list &&
                list.performance &&
                typeof list.performance === "object" &&
                "openRate" in list.performance
                  ? (list.performance as PerformanceMetrics).openRate
                  : 0) || 0}
                %
              </span>
              <span className="text-xs text-muted-foreground">open</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {("performance" in list &&
                list.performance &&
                typeof list.performance === "object" &&
                "replyRate" in list.performance
                  ? (list.performance as PerformanceMetrics).replyRate
                  : 0) || 0}
                %
              </span>
              <span className="text-xs text-muted-foreground">reply</span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Not used yet
          </span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(list.uploadDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className=" hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20"
            title="View Contacts"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className=" hover:text-foreground hover:bg-accent dark:hover:bg-accent"
            title="Edit List"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className=" hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/20"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className=" hover:text-red-600 hover:bg-red-50"
            title="Delete List"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
export default ListTableRow;
