
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


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
            className={cn("w-full flex flex-col", invoice.status === 'overdue' && 'border-destructive')}
            onDoubleClick={() => onViewDetails(invoice)}
        >
             <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 cursor-pointer" onClick={() => onViewDetails(invoice)}>
                <div>
                    <CardTitle className="text-base font-semibold">{invoice.clientName}</CardTitle>
                    <p className="text-xs text-muted-foreground">Vencimento: {formattedDueDate}</p>
                </div>
                 <Badge
                    variant={ invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'secondary' }
                    className="capitalize"
                    >
                    {statusTranslations[invoice.status]}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 flex-1 cursor-pointer" onClick={() => onViewDetails(invoice)}>
                <p className="text-sm text-muted-foreground">Fatura #{invoice.id}</p>
                 <div className="font-semibold">{formattedAmount}</div>
                 <div className="text-xs text-muted-foreground">
                    {invoice.installmentNumber ? `Parcela ${invoice.installmentNumber}/${invoice.totalInstallments}` : 'Parcela Única'}
                </div>
            </CardContent>
             <CardFooter className="flex justify-end gap-1 bg-muted/50 p-2 text-sm border-t">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewDetails(invoice)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver Detalhes</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(invoice)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Excluir Fatura</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
