
'use client';

import { useEffect, useState } from 'react';
import {
  getInvoices,
  getClients,
  deleteInvoice,
  updateInvoiceStatus,
} from '@/app/actions';
import { Badge } from '@/components/ui/badge';
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
import type { Invoice, Client, InvoiceStatus } from '@/lib/types';
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [isDetailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Faturas</h1>
        <Button onClick={() => setAddInvoiceOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Fatura
        </Button>
      </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da Fatura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data de Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.id}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'overdue'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${invoice.amount.toLocaleString()}
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
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(invoice)}
                          >
                            Ver Detalhes
                          </DropdownMenuItem>
                          {invoice.status !== 'paid' && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              Marcar como Paga
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(invoice)}
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
