
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Client } from '@/lib/types';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

type ClientData = Client & {
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
};

type GetColumnsProps = {
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewInvoices: (client: Client) => void;
};


export const getColumns = ({
  onEdit,
  onDelete,
  onViewInvoices,
}: GetColumnsProps): ColumnDef<ClientData>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={client.avatarUrl || `https://placehold.co/40x40/E2E8F0/475569?text=${client.name.charAt(0)}`} alt={client.name} />
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div>{client.name}</div>
            <div className="text-sm text-muted-foreground">
              Juros: {client.rate}%
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Celular" />
    ),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div>
          <div className="text-sm">{client.phone}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalInvoiced',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Faturado" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalInvoiced'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'totalPaid',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Pago" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalPaid'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pendente" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('balance'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(client)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewInvoices(client)}>
              Ver Faturas
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(client)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
