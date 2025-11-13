"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { FileText, Edit2, Trash2 } from "lucide-react";
import { Template } from "@/types";

interface FileProps {
  file: Template;
  onRename?: (fileId: number, newName: string) => void;
  onDelete?: (fileId: number) => void;
}

function File({ file, onRename: _, onDelete: __ }: FileProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-muted/50 rounded-md cursor-pointer">
          <FileText className="w-4 h-4 text-gray-500" />

          <span className="text-sm ">{file.name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>
          <Edit2 />
          Rename
        </ContextMenuItem>
        <ContextMenuItem className="text-red-600 focus:text-red-600">
          <Trash2 className="text-red-600" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default File;
