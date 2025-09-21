
'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateInvoiceStatus } from '@/actions';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Vencida',
  'written-off': 'Baixada',
};

type InvoiceDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  onInvoiceUpdated: (invoice: Invoice) => void;
};

export function InvoiceDetailsSheet({
  isOpen,
  onOpenChange,
  invoice,
  onInvoiceUpdated,
}: InvoiceDetailsSheetProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<InvoiceStatus>(invoice.status);

  
  const getFormattedDate = (dateString: string | null) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return format(date, 'dd/MM/yyyy');
  }

  const handleStatusChange = async () => {
    setIsSubmitting(true);
    try {
        const updatedInvoice = await updateInvoiceStatus(invoice.id, currentStatus);
        onInvoiceUpdated(updatedInvoice);
        toast({
            title: 'Status Atualizado!',
            description: `A fatura #${invoice.id} foi atualizada para ${statusTranslations[currentStatus]}.`,
        });
        onOpenChange(false);
    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Erro ao atualizar status',
            description: error.message || 'Não foi possível atualizar o status da fatura.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col max-h-[100svh]">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Detalhes da Fatura</SheetTitle>
          <SheetDescription>
            Veja os detalhes da fatura #{invoice.id}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 py-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Cliente</span>
                    <span>{invoice.clientName}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Contrato</span>
                    <span>#{invoice.contractId}</span>
                </div>
                {invoice.installmentNumber && (
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-muted-foreground">Parcela</span>
                        <span>{invoice.installmentNumber} de {invoice.totalInstallments}</span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Valor</span>
                    <span className="font-semibold">{invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Data de Emissão</span>
                    <span>{getFormattedDate(invoice.issueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Data de Vencimento</span>
                    <span>{getFormattedDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Data de Pagamento</span>
                    <span>{getFormattedDate(invoice.paymentDate)}</span>
                </div>

                <div className="space-y-2">
                    <label className="font-medium text-muted-foreground">Status</label>
                    <Select value={currentStatus} onValueChange={(value: InvoiceStatus) => setCurrentStatus(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statusTranslations).map(([statusValue, statusLabel]) => (
                                <SelectItem key={statusValue} value={statusValue}>{statusLabel}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="px-6 pb-6 pt-4 border-t flex-col sm:flex-col sm:items-stretch gap-2">
            <Button 
                type="button" 
                onClick={handleStatusChange} 
                disabled={isSubmitting || invoice.status === currentStatus}
            >
               {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Alterações
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
            >
                Fechar
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    