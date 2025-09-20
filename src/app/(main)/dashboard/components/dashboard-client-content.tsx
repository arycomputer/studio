
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { getContracts, getClients } from '@/actions';
import { RevenueChart } from './revenue-chart';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Contract, Client } from '@/lib/types';

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Atrasada',
  'written-off': 'Baixada',
};

export function DashboardClientContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [contractsData, clientsData] = await Promise.all([
        getContracts(),
        getClients(),
      ]);
      setContracts(contractsData);
      setClients(clientsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Carregando dados...</p></div>;
  }
  
  const totalRevenue = contracts
    .filter((contract) => contract.status === 'paid')
    .reduce((sum, contract) => sum + contract.amount, 0);

  const outstandingRevenue = contracts
    .filter((contract) => contract.status === 'pending' || contract.status === 'overdue')
    .reduce((sum, contract) => sum + contract.amount, 0);

  const recentContracts = contracts.slice(0, 5);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dueToday = contracts.filter(contract => contract.dueDate === today && contract.status !== 'paid');


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-headline font-bold">Painel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/contracts?status=paid">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-muted-foreground">
                Receita de todos os tempos de contratos pagos.
                </p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/contracts?status=pending,overdue">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Receita Pendente
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                 {outstandingRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-muted-foreground">
                De contratos pendentes e vencidos.
                </p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/clients?status=pending">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes com Pendências</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                Clientes com pagamentos pendentes.
                </p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/contracts">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos Totais</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{contracts.length}</div>
                <p className="text-xs text-muted-foreground">
                Total de contratos gerados.
                </p>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart contracts={contracts} />
          </CardContent>
        </Card>
        <div className="lg:col-span-3 flex flex-col gap-4">
            <Link href="/contracts?dueDate=today">
                <Card className="hover:bg-muted/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Vencimentos do Dia
                        </CardTitle>
                        <CardDescription>
                            Contratos que precisam de atenção imediata.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    {dueToday.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dueToday.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className='py-2'>
                                        <div className="font-medium">{contract.clientName}</div>
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                        {contract.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        ) : (
                        <p className="text-sm text-muted-foreground">Nenhum contrato vence hoje.</p>
                        )}
                    </CardContent>
                </Card>
            </Link>
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Contratos Recentes</CardTitle>
                <CardDescription>
                Os contratos criados mais recentemente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentContracts.map((contract) => (
                        <TableRow key={contract.id}>
                            <TableCell>
                            <div className="font-medium">{contract.clientName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                                {contract.clientEmail}
                            </div>
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-right">
                            {contract.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
