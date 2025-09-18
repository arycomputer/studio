
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getInvoices,
  getClients,
  deleteInvoice,
  updateInvoiceStatus,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, X } from 'lucide-react';
import type { Invoice, Client } from '@/lib/types';
import { AddInvoiceForm } from './components/add-invoice-form';
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
import { DataTable } from '@/components/data-table/data-table';
import { getColumns } from './components/columns';
import type { ColumnDef } from '@tanstack/react-table';

function InvoicesPageContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [isDetailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams.get('clientId');
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
    if (clientId) {
      return invoices.filter((invoice) => invoice.clientId === clientId);
    }
    return invoices;
  }, [invoices, clientId]);

  const handleInvoiceAdded = (newInvoice: Invoice) => {
    setInvoices((prevInvoices) => [newInvoice, ...prevInvoices]);
  };

  const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
    setSelectedInvoice(updatedInvoice);
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

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const updatedInvoice = await updateInvoiceStatus(invoiceId, 'paid');
      handleInvoiceUpdated(updatedInvoice);
      toast({
        title: 'Fatura Atualizada',
        description: `Fatura ${invoiceId} marcada como paga.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar o status da fatura.',
      });
    }
  };

  const clearFilter = () => {
    router.push('/invoices');
  };

  const columns = getColumns({
    onViewDetails: handleViewDetails,
    onMarkAsPaid: handleMarkAsPaid,
    onDelete: handleDeleteClick,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Faturas</h1>
        <Button onClick={() => setAddInvoiceOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Fatura
        </Button>
      </div>

      {filteredClient && (
        <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 p-3">
          <span className="text-sm">
            Mostrando faturas para o cliente:{' '}
            <span className="font-semibold">{filteredClient.name}</span>
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

      <AddInvoiceForm
        isOpen={isAddInvoiceOpen}
        onOpenChange={setAddInvoiceOpen}
        onInvoiceAdded={handleInvoiceAdded}
        clients={clients}
      />

      {selectedInvoice && (
        <InvoiceDetailsSheet
          isOpen={isDetailsSheetOpen}
          onOpenChange={setDetailsSheetOpen}
          invoice={selectedInvoice}
          onInvoiceUpdated={handleInvoiceUpdated}
          clients={clients}
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
        <CardHeader>
          <CardTitle className="font-headline">Histórico de Faturas</CardTitle>
          <CardDescription>
            Veja e gerencie todas as suas faturas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando faturas...</p>
          ) : (
            <DataTable
              columns={columns as ColumnDef<unknown, unknown>[]}
              data={filteredInvoices}
              filterColumnId="clientName"
              filterPlaceholder="Filtrar por cliente..."
            />
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
