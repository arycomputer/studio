
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
            className={cn("w-full flex flex-col")}
            onDoubleClick={() => onViewDetails(contract)}
        >
             <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 cursor-pointer" onClick={() => onViewDetails(contract)}>
                <div>
                    <CardTitle className="text-base font-semibold">{contract.clientName}</CardTitle>
                    <p className="text-xs text-muted-foreground">Emissão: {formattedIssueDate}</p>
                </div>
                 <Badge
                    variant={ 'secondary' }
                    className="capitalize"
                    >
                    {statusTranslations[contract.status]}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 flex-1 cursor-pointer" onClick={() => onViewDetails(contract)}>
                <p className="text-sm text-muted-foreground">{typeTranslations[contract.type]}</p>
                <div className="font-semibold">{formattedAmount}</div>
                <div className="text-xs text-muted-foreground">Valor Total</div>
            </CardContent>
             <CardFooter className="flex justify-end gap-1 bg-muted/50 p-2 text-sm border-t">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewDetails(contract)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver Detalhes</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(contract)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Excluir Contrato</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
