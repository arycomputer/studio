
'use client';

import { useEffect, useState } from 'react';
import { deleteClient, getClients, getInvoices } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/data-table';
import { getColumns } from './components/columns';
import type { ColumnDef } from '@tanstack/react-table';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddClientOpen, setAddClientOpen] = useState(false);
  const [isEditClientOpen, setEditClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  const handleViewInvoicesClick = (client: Client) => {
    router.push(`/invoices?clientId=${client.id}`);
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

  const clientData = clients.map((client) => {
    const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
    const totalInvoiced = clientInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalPaid = clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const balance = totalInvoiced - totalPaid;
    return { ...client, totalInvoiced, totalPaid, balance };
  });

  const columns = getColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
    onViewInvoices: handleViewInvoicesClick,
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
            <DataTable
              columns={columns as ColumnDef<unknown, unknown>[]}
              data={clientData}
              filterColumnId="name"
              filterPlaceholder="Filtrar por nome..."
              onRowDoubleClick={handleEditClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
