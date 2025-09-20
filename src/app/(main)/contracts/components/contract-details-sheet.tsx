
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
import { updateContractStatus } from '@/actions';
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import type { Contract, ContractStatus, Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  status: z.enum(['paid', 'pending', 'overdue', 'written-off']),
});

const statusTranslations: { [key: string]: string } = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Atrasado',
  'written-off': 'Baixado',
};

const typeTranslations: { [key: string]: string } = {
  single: 'Parcela Única',
  installment: 'Parcelado',
};

type ContractDetailsSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contract: Contract;
  onContractUpdated: (contract: Contract) => void;
  clients: Client[];
};

export function ContractDetailsSheet({
  isOpen,
  onOpenChange,
  contract,
  onContractUpdated,
  clients,
}: ContractDetailsSheetProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: contract.status,
    },
  });
  
  const interestCalculation = useMemo(() => {
    if (contract.status !== 'overdue' || !contract.interestRate) {
      return null;
    }

    const dueDate = new Date(contract.dueDate);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    const daysOverdue = differenceInDays(new Date(), dueDate);

    if (daysOverdue <= 0) return null;
    
    const dailyRate = (contract.interestRate / 100) / 30; // Assuming monthly rate
    const interest = contract.amount * dailyRate * daysOverdue;
    const totalAmount = contract.amount + interest;

    return {
        interest,
        totalAmount,
        daysOverdue
    };
  }, [contract]);


  useEffect(() => {
    if (contract) {
      form.reset({
        status: contract.status,
      });
    }
  }, [contract, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const updatedContract = await updateContractStatus(
        contract.id,
        values.status as ContractStatus
      );
      onContractUpdated(updatedContract);
      toast({
        title: 'Sucesso!',
        description: 'Status do contrato atualizado.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o contrato. Tente novamente.',
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
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Detalhes do Contrato</SheetTitle>
          <SheetDescription>
            Veja e edite os detalhes do contrato #{contract.id}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-6 py-4 pr-2">
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Status</span>
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
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Cliente</span>
                  <span>{contract.clientName}</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Tipo</span>
                  <span>{typeTranslations[contract.type]}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Valor Original</span>
                  <span className="font-semibold">{contract.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Taxa de Juros</span>
                  <span>{contract.interestRate}% a.m.</span>
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
                  <span>{getFormattedDate(contract.issueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Data de Vencimento</span>
                  <span>{getFormattedDate(contract.dueDate)}</span>
              </div>
              {contract.paymentDate && (
                  <div className="flex justify-between items-center">
                      <span className="font-medium text-muted-foreground">Data de Pagamento</span>
                      <span>{getFormattedDate(contract.paymentDate)}</span>
                  </div>
              )}
              <Form {...form}>
              <form id="status-update-form" onSubmit={form.handleSubmit(onSubmit)} className="pt-8">
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
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="overdue">Atrasado</SelectItem>
                          <SelectItem value="written-off">Baixado</SelectItem>
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
        <SheetFooter className="px-6 pb-6 pt-4 border-t bg-background sticky bottom-0">
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
