
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Invoice } from '@/lib/types';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Atrasada',
  'written-off': 'Baixada',
};

type GetColumnsProps = {
  onViewDetails: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onDelete: (invoice: Invoice) => void;
};

export const getColumns = ({
  onViewDetails,
  onMarkAsPaid,
  onDelete,
}: GetColumnsProps): ColumnDef<Invoice>[] => [
  {
    accessorKey: 'clientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Vencimento" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('dueDate'));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'paid'
              ? 'default'
              : status === 'overdue'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {statusTranslations[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(invoice)}>
              Ver Detalhes
            </DropdownMenuItem>
            {invoice.status !== 'paid' && (
              <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                Marcar como Paga
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(invoice)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
