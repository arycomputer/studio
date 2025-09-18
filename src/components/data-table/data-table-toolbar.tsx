
'use client';

import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterColumnId: string;
  filterPlaceholder: string;
}

export function DataTableToolbar<TData>({
  table,
  filterColumnId,
  filterPlaceholder,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={filterPlaceholder}
          value={
            (table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
          }
          className="h-8 w-full sm:w-[150px] lg:w-[250px]"
        />
      </div>
    </div>
  );
}
