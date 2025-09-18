
'use client';

import { useEffect, useState } from 'react';
import { deleteClient, getClients, getInvoices } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Client, Invoice } from '@/lib/types';
import { AddClientForm } from './components/add-client-form';
import { EditClientForm } from './components/edit-client-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type ClientData = Client & {
  totalInvoiced: number;
  totalPaid: number;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddClientOpen, setAddClientOpen] = useState(false);
  const [isEditClientOpen, setEditClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [clientsData, invoicesData] = await Promise.all([
        getClients(),
        getInvoices(),
      ]);
      setClients(clientsData);
      setInvoices(invoicesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleClientAdded = (newClient: Client) => {
    setClients((prevClients) => [...prevClients, newClient]);
  };

  const handleClientUpdated = (updatedClient: Client) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setEditClientOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;
    try {
      await deleteClient(selectedClient.id);
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== selectedClient.id)
      );
      toast({
        title: 'Cliente Excluído',
        description: `O cliente ${selectedClient.name} foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
      });
    } finally {
      setDeleteAlertOpen(false);
      setSelectedClient(null);
    }
  };

  const clientData: ClientData[] = clients.map((client) => {
    const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
    const totalInvoiced = clientInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalPaid = clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { ...client, totalInvoiced, totalPaid };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Clientes</h1>
        <Button onClick={() => setAddClientOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>

      <AddClientForm
        isOpen={isAddClientOpen}
        onOpenChange={setAddClientOpen}
        onClientAdded={handleClientAdded}
      />

      {selectedClient && (
        <EditClientForm
          isOpen={isEditClientOpen}
          onOpenChange={setEditClientOpen}
          client={selectedClient}
          onClientUpdated={handleClientUpdated}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              cliente e todas as suas faturas associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Visão Geral dos Clientes
          </CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja o histórico financeiro deles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total Faturado</TableHead>
                  <TableHead>Total Pago</TableHead>
                  <TableHead>Pendente</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientData.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={client.avatarUrl}
                            alt={client.name}
                          />
                          <AvatarFallback>
                            {client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${client.totalInvoiced.toLocaleString()}
                    </TableCell>
                    <TableCell>${client.totalPaid.toLocaleString()}</TableCell>
                    <TableCell>
                      $
                      {(
                        client.totalInvoiced - client.totalPaid
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(client)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>Ver Faturas</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(client)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
