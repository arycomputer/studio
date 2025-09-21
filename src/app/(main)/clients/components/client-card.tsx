
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FilePen, FileText, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ClientData = Client & {
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  isOverdue?: boolean;
};

type ClientCardProps = {
  client: ClientData;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onViewContracts: (client: Client) => void;
};

export function ClientCard({ client, onEdit, onDelete, onViewContracts }: ClientCardProps) {
    const formattedBalance = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(client.balance);

    return (
        <Card 
            className={cn("w-full flex flex-col", client.isOverdue && "border-destructive")}
            onDoubleClick={() => onEdit(client)}
        >
            <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer" onClick={() => onEdit(client)}>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={client.avatarUrl || `https://placehold.co/40x40/E2E8F0/475569?text=${client.name.charAt(0)}`} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-semibold">{client.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">Taxa Padrão: {client.rate}%</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 cursor-pointer" onClick={() => onEdit(client)}>
                <div className="text-sm text-muted-foreground">
                   {client.phone}
                </div>
                <div className="text-sm font-semibold mt-2">{formattedBalance}</div>
                <div className="text-xs text-muted-foreground">Pendente</div>
            </CardContent>
            <CardFooter className="flex justify-end gap-1 bg-muted/50 p-2 text-sm border-t">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
                            <FilePen className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar Cliente</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewContracts(client)}>
                            <FileText className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ver Contratos</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(client)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Excluir Cliente</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
