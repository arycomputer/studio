
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Client } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreHorizontal, FilePen, FileText, Trash2 } from 'lucide-react';

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
            className={cn("w-full cursor-pointer", client.isOverdue && "border-destructive")}
            onDoubleClick={() => onEdit(client)}
        >
            <CardHeader className="flex flex-row items-center justify-between p-4">
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
                            <FilePen className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewContracts(client)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Contratos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(client)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-sm text-muted-foreground">
                   {client.phone}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm">
                <span className="text-muted-foreground">Pendente</span>
                <span className="font-semibold">{formattedBalance}</span>
            </CardFooter>
        </Card>
    );
}
