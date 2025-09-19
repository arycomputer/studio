
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { deleteClient, getClients, getInvoices } from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, X } from 'lucide-react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { ClientCard } from './components/client-card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const statusTranslations: { [key: string]: string } = {
    pending: 'Com Pendências',
    paid: 'Em Dia',
};


function ClientsPageContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddClientOpen, setAddClientOpen] = useState(false);
  const [isEditClientOpen, setEditClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const filterStatus = searchParams.get('status');

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
    setClients((prevClients) => [newClient, ...prevClients].sort((a, b) => a.name.localeCompare(b.name)));
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
  
  const handleStatusFilterChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('status', 'pending');
    } else {
      params.delete('status');
    }
    router.push(`/clients?${params.toString()}`);
  };


  const clearFilter = () => {
     const params = new URLSearchParams(searchParams.toString());
     params.delete('status');
     router.push(`/clients?${params.toString()}`);
  };

  const clientData = useMemo(() => clients.map((client) => {
    const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
    const totalInvoiced = clientInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalPaid = clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const balance = totalInvoiced - totalPaid;
    const isOverdue = clientInvoices.some(inv => inv.status === 'overdue');
    return { ...client, totalInvoiced, totalPaid, balance, isOverdue };
  }), [clients, invoices]);

  const filteredData = useMemo(() => {
    let baseData = [...clientData];
    
    if (filterStatus) {
        if(filterStatus === 'pending') {
            baseData = baseData.filter(client => client.balance > 0);
        } else if (filterStatus === 'paid') {
            baseData = baseData.filter(client => client.balance <= 0);
        }
    }
    
    if (!filter) return baseData;
    
    return baseData.filter(client => client.name.toLowerCase().includes(filter.toLowerCase()));
  }, [clientData, filter, filterStatus]);
  
  const getFilterDescription = () => {
    if(filterStatus) {
        const translated = statusTranslations[filterStatus] || filterStatus;
        return <>com status: <span className="font-semibold">{translated}</span></>;
    }
    return '';
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Clientes</h1>
        <Button onClick={() => setAddClientOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>
      
      {(filterStatus) && (
        <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 p-3">
          <span className="text-sm">
            Mostrando clientes {getFilterDescription()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearFilter}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar filtro</span>
          </Button>
        </div>
      )}


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
        <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className='space-y-1.5'>
            <CardTitle className="font-headline">
              Visão Geral dos Clientes
            </CardTitle>
            <CardDescription>
              Gerencie seus clientes e veja o histórico financeiro deles.
            </CardDescription>
          </div>
           <div className="pt-2 sm:pt-0 flex items-center space-x-2">
            <Switch 
              id="status-filter"
              checked={filterStatus === 'pending'}
              onCheckedChange={handleStatusFilterChange}
            />
            <Label htmlFor="status-filter">Mostrar apenas com pendências</Label>
           </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : (
             <div className="space-y-4">
              <Input 
                placeholder="Filtrar por nome..." 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="h-9 w-full max-w-sm"
              />
              {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredData.map(client => (
                    <ClientCard 
                        key={client.id}
                        client={client}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onViewInvoices={handleViewInvoicesClick}
                    />
                ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground pt-4">Nenhum cliente encontrado.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientsPage() {
    return (
      <Suspense fallback={<div>Carregando...</div>}>
        <ClientsPageContent />
      </Suspense>
    );
  }
