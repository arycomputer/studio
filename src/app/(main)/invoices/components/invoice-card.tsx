
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Vencida',
  'written-off': 'Baixada',
};

type InvoiceCardProps = {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

export function InvoiceCard({ invoice, onViewDetails, onDelete }: InvoiceCardProps) {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(invoice.amount);

    const dueDate = new Date(invoice.dueDate);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    const formattedDueDate = format(dueDate, 'dd/MM/yyyy');

    return (
        <Card 
            className={cn("w-full cursor-pointer", invoice.status === 'overdue' && 'border-destructive')}
            onDoubleClick={() => onViewDetails(invoice)}
        >
             <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{invoice.clientName}</CardTitle>
                    <p className="text-xs text-muted-foreground">Vencimento: {formattedDueDate}</p>
                </div>
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
                        <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(invoice)}
                        >
                        Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                 <Badge
                    variant={ invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'secondary' }
                    className="capitalize"
                    >
                    {statusTranslations[invoice.status]}
                </Badge>
                <p className="text-sm text-muted-foreground">Fatura #{invoice.id}</p>
            </CardContent>
             <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm">
                <span className="text-muted-foreground">
                    {invoice.installmentNumber ? `Parcela ${invoice.installmentNumber}/${invoice.totalInstallments}` : 'Parcela Única'}
                </span>
                <span className="font-semibold">{formattedAmount}</span>
            </CardFooter>
        </Card>
    );
}
