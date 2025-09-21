
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
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const statusTranslations: { [key: string]: string } = {
  active: 'Ativo',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

const typeTranslations: { [key: string]: string } = {
  single: 'Parcela Única',
  installment: 'Parcelado',
};

type GetColumnsProps = {
  contract: Contract;
  onViewDetails: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
};

export function ContractCard({ contract, onViewDetails, onDelete }: GetColumnsProps) {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(contract.amount);

    const issueDate = new Date(contract.issueDate);
    // Adjust for timezone offset to show correct date
    issueDate.setMinutes(issueDate.getMinutes() + issueDate.getTimezoneOffset());
    const formattedIssueDate = format(issueDate, 'dd/MM/yyyy');

    return (
        <Card 
            className={cn("w-full cursor-pointer")}
            onDoubleClick={() => onViewDetails(contract)}
        >
             <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{contract.clientName}</CardTitle>
                    <p className="text-xs text-muted-foreground">Emissão: {formattedIssueDate}</p>
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
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(contract)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                 <Badge
                    variant={ 'secondary' }
                    className="capitalize"
                    >
                    {statusTranslations[contract.status]}
                </Badge>
                <p className="text-sm text-muted-foreground">{typeTranslations[contract.type]}</p>
            </CardContent>
             <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm">
                <span className="text-muted-foreground">Valor Total</span>
                <span className="font-semibold">{formattedAmount}</span>
            </CardFooter>
        </Card>
    );
}
