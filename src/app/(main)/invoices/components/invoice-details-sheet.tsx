
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateInvoiceStatus } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const formSchema = z.object({
  status: z.enum(['paid', 'pending', 'overdue', 'written-off']),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: invoice.status,
    },
  });

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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Detalhes da Fatura</SheetTitle>
          <SheetDescription>
            Veja e edite os detalhes da fatura #{invoice.id}.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-6">
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
              {invoice.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-muted-foreground">Cliente</span>
            <span>{invoice.clientName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-muted-foreground">Valor</span>
            <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-muted-foreground">Data de Emissão</span>
            <span>{format(new Date(invoice.issueDate), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-muted-foreground">Data de Vencimento</span>
            <span>{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</span>
          </div>
          {invoice.paymentDate && (
             <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Data de Pagamento</span>
                <span>{format(new Date(invoice.paymentDate), 'dd/MM/yyyy')}</span>
            </div>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
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
            <SheetFooter className="mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salvar Alterações
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
