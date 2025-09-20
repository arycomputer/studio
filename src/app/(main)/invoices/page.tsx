
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getInvoices,
  getClients,
  deleteInvoice,
} from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X } from 'lucide-react';
import type { Invoice, Client, InvoiceStatus } from '@/lib/types';
import { InvoiceDetailsSheet } from './components/invoice-details-sheet';
import { useToast } from '@/hooks/use-toast';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { InvoiceCard } from './components/invoice-card';
import { Input } from '@/components/ui/input';

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Vencida',
};

function InvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams.get('clientId');
  const contractId = searchParams.get('contractId');

  const filteredClient = useMemo(() => {
    return clients.find((c) => c.id === clientId);
  }, [clients, clientId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [invoicesData, clientsData] = await Promise.all([
        getInvoices(),
        getClients(),
      ]);
      setInvoices(invoicesData);
      setClients(clientsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];
    if (clientId) {
      filtered = filtered.filter((invoice) => invoice.clientId === clientId);
    }
    if (contractId) {
      filtered = filtered.filter((invoice) => invoice.contractId === contractId);
    }
    if (!filter) return filtered;
    
    return filtered.filter(invoice => 
        invoice.clientName.toLowerCase().includes(filter.toLowerCase()) ||
        invoice.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [invoices, clientId, contractId, filter]);


  const getFilterDescription = () => {
    if(clientId && filteredClient) {
        return <>para o cliente: <span className="font-semibold">{filteredClient?.name}</span></>;
    }
    if (contractId) {
        return <>do contrato: <span className="font-semibold">#{contractId}</span></>;
    }
    return '';
  }


  const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    if (selectedInvoice && selectedInvoice.id === updatedInvoice.id) {
      setSelectedInvoice(updatedInvoice);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsSheetOpen(true);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice) return;
    try {
      await deleteInvoice(selectedInvoice.id);
      setInvoices((prev) =>
        prev.filter((inv) => inv.id !== selectedInvoice.id)
      );
      toast({
        title: 'Fatura Excluída',
        description: `A fatura ${selectedInvoice.id} foi excluída.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao excluir a fatura.',
      });
    } finally {
      setDeleteAlertOpen(false);
      setSelectedInvoice(null);
    }
  };

  const clearFilter = () => {
    router.push('/invoices');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Faturas</h1>
      </div>

      {(clientId || contractId) && (
        <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 p-3">
          <span className="text-sm">
            Mostrando faturas {getFilterDescription()}
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

      {selectedInvoice && (
        <InvoiceDetailsSheet
          isOpen={isDetailsSheetOpen}
          onOpenChange={setDetailsSheetOpen}
          invoice={selectedInvoice}
          onInvoiceUpdated={handleInvoiceUpdated}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              fatura.
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
                <CardTitle className="font-headline">Histórico de Faturas</CardTitle>
                <CardDescription>
                    Veja e gerencie todas as suas faturas.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Input 
                    placeholder="Filtrar por cliente ou fatura..." 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-9 w-full max-w-sm"
                />
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando faturas...</p>
          ) : (
             <div className="space-y-4">
              {filteredInvoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredInvoices.map(invoice => (
                    <InvoiceCard 
                        key={invoice.id}
                        invoice={invoice}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteClick}
                    />
                ))}
                </div>
              ) : (
                 <p className="text-center text-muted-foreground pt-4">Nenhuma fatura encontrada.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <InvoicesPageContent />
    </Suspense>
  );
}
