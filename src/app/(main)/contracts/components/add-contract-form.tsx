
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { addContract } from '@/actions';
import { useState } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import type { Client, Contract, ContractType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  clientId: z.string().min(1, 'Por favor, selecione um cliente.'),
  amount: z.coerce.number({invalid_type_error: "O valor deve ser um número."}).min(0.01, 'O valor deve ser maior que zero.'),
  dueDate: z.date({
    required_error: 'A data do primeiro vencimento é obrigatória.',
  }),
  interestRate: z.coerce.number({invalid_type_error: "A taxa deve ser um número."}).min(0, 'A taxa de juros não pode ser negativa.'),
  type: z.enum(['single', 'installment'], {required_error: 'Por favor, selecione o tipo de contrato.'}),
  installments: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'installment' && (!data.installments || data.installments <= 1)) {
        return false;
    }
    return true;
}, {
    message: 'O número de parcelas deve ser maior que 1.',
    path: ['installments'],
});

type AddContractFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContractAdded: (contract: Contract) => void;
  clients: Client[];
};

export function AddContractForm({
  isOpen,
  onOpenChange,
  onContractAdded,
  clients,
}: AddContractFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: '',
      amount: 0,
      interestRate: 0,
      type: 'single',
    },
  });

  const contractType = form.watch('type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const contractData = {
        ...values,
        dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      };
      const newContract = await addContract(contractData);
      onContractAdded(newContract);
      toast({
        title: 'Sucesso!',
        description: 'Novo contrato criado.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível criar o contrato. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            form.reset();
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90svh] flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo contrato.
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-hidden'>
          <ScrollArea className="h-full px-6">
            <Form {...form}>
              <form id="add-contract-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4 pr-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Mensal de Juros (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1.0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Contrato</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="single" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Parcela Única
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="installment" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Parcelado
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {contractType === 'installment' && (
                     <FormField
                        control={form.control}
                        name="installments"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Parcelas</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="2" step="1" min="2" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
               
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do 1º Vencimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t bg-background sticky bottom-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form="add-contract-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Criar Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
