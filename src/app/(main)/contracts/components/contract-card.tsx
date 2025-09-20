
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
import type { Contract } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const statusTranslations: { [key: string]: string } = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Atrasado',
  'written-off': 'Baixado',
};

type GetColumnsProps = {
  contract: Contract;
  onViewDetails: (contract: Contract) => void;
  onMarkAsPaid: (contractId: string) => void;
  onDelete: (contract: Contract) => void;
};

export function ContractCard({ contract, onViewDetails, onMarkAsPaid, onDelete }: GetColumnsProps) {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(contract.amount);

    const dueDate = new Date(contract.dueDate);
    // Adjust for timezone offset to show correct date
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    const formattedDueDate = format(dueDate, 'dd/MM/yyyy');

    return (
        <Card 
            className={cn("w-full cursor-pointer", contract.status === 'overdue' && "border-destructive")}
            onDoubleClick={() => onViewDetails(contract)}
        >
             <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{contract.clientName}</CardTitle>
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
                        <DropdownMenuItem onClick={() => onViewDetails(contract)}>
                        Ver Detalhes
                        </DropdownMenuItem>
                        {contract.status !== 'paid' && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(contract.id)}>
                            Marcar como Pago
                        </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(contract)}
                        >
                        Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <Badge
                    variant={
                        contract.status === 'paid'
                        ? 'success'
                        : contract.status === 'overdue'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize"
                    >
                    {statusTranslations[contract.status]}
                </Badge>
            </CardContent>
             <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm">
                <span className="text-muted-foreground">Valor</span>
                <span className="font-semibold">{formattedAmount}</span>
            </CardFooter>
        </Card>
    );
}
