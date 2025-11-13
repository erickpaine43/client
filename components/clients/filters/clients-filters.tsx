import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { copyText as t } from "../data/copy";
import { Client } from "@/app/[locale]/dashboard/inbox/schemas/schemas";

interface ClientsFiltersProps {
  table: Table<Client>;
}

export function ClientsFilters({ table }: ClientsFiltersProps) {
  return (
    <div className="flex items-center py-4">
      <Input
        placeholder={t.filters.emailsPlaceholder}
        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    </div>
  );
}
