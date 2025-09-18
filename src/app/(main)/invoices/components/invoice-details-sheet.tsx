
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateInvoiceStatus } from '@/actions';
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import type { Invoice, InvoiceStatus, Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  status: z.enum(['paid', 'pending', 'overdue', 'written-off']),
});

const statusTranslations: { [key: string]: string } = {
  paid: 'Paga',
  pending: 'Pendente',
  overdue: 'Atrasada',
  'written-off': 'Baixada',
};

type InvoiceDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  onInvoiceUpdated: (invoice: Invoice) => void;
  clients: Client[];
};

export function InvoiceDetailsSheet({
  isOpen,
  onOpenChange,
  invoice,
  onInvoiceUpdated,
  clients,
}: InvoiceDetailsSheetProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: invoice.status,
    },
  });
  
  const client = useMemo(() => clients.find(c => c.id === invoice.clientId), [clients, invoice.clientId]);

  const interestCalculation = useMemo(() => {
    if (invoice.status !== 'overdue' || !client?.rate) {
      return null;
    }

    const dueDate = new Date(invoice.dueDate);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    const daysOverdue = differenceInDays(new Date(), dueDate);

    if (daysOverdue <= 0) return null;
    
    // Simple interest calculation: P * r * t
    // P = Principal amount, r = daily interest rate, t = time in days
    const dailyRate = (client.rate / 100) / 30; // Assuming monthly rate
    const interest = invoice.amount * dailyRate * daysOverdue;
    const totalAmount = invoice.amount + interest;

    return {
        interest,
        totalAmount,
        daysOverdue
    };
  }, [invoice, client]);


  useEffect(() => {
    if (invoice) {
      form.reset({
        status: invoice.status,
      });
    }
  }, [invoice, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedInvoice = await updateInvoiceStatus(
        invoice.id,
        values.status as InvoiceStatus
      );
      onInvoiceUpdated(updatedInvoice);
      toast({
        title: 'Sucesso!',
        description: 'Status da fatura atualizado.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a fatura. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const getFormattedDate = (dateString: string) => {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return format(date, 'dd/MM/yyyy');
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col max-h-[100svh]">
        <SheetHeader>
          <SheetTitle>Detalhes da Fatura</SheetTitle>
          <SheetDescription>
            Veja e edite os detalhes da fatura #{invoice.id}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden -mx-6 px-6">
          <ScrollArea className="h-full pr-4">
            <div className="py-4 pr-2">
              <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Status</span>
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
                  {statusTranslations[invoice.status]}
                  </Badge>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Cliente</span>
                  <span>{invoice.clientName}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Valor Original</span>
                  <span className="font-semibold">{invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              {interestCalculation && (
                  <>
                  <div className="flex justify-between items-center text-destructive">
                      <span className="font-medium">Juros ({interestCalculation.daysOverdue} dias)</span>
                      <span className='font-semibold'>{interestCalculation.interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                      <span className="font-medium">Valor Total</span>
                      <span className="font-bold">{interestCalculation.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  </>
              )}
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Data de Emissão</span>
                  <span>{getFormattedDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Data de Vencimento</span>
                  <span>{getFormattedDate(invoice.dueDate)}</span>
              </div>
              {invoice.paymentDate && (
                  <div className="flex justify-between items-center">
                      <span className="font-medium text-muted-foreground">Data de Pagamento</span>
                      <span>{getFormattedDate(invoice.paymentDate)}</span>
                  </div>
              )}
              </div>
              <Form {...form}>
              <form id="status-update-form" onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
                  <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Atualizar Status</FormLabel>
                      <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                      >
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Paga</SelectItem>
                          <SelectItem value="overdue">Atrasada</SelectItem>
                          <SelectItem value="written-off">Baixada</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </form>
              </Form>
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="border-t pt-4 -mx-6 px-6">
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <Button type="submit" form='status-update-form' disabled={isSubmitting}>
                {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar Alterações
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
