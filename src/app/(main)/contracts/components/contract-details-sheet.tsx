
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
import { useToast } from '@/hooks/use-toast';
import { generateInvoicesForContract } from '@/actions';
import { useState } from 'react';
import { Loader2, FilePlus2 } from 'lucide-react';
import type { Contract, Client } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

const typeTranslations: { [key: string]: string } = {
  single: 'Parcela Única',
  installment: 'Parcelado',
};

const statusTranslations: { [key: string]: string } = {
  active: 'Ativo',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
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
}: ContractDetailsSheetProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const getFormattedDate = (dateString: string) => {
      const date = new Date(dateString);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return format(date, 'dd/MM/yyyy');
  }

  const handleGenerateInvoices = async () => {
    setIsSubmitting(true);
    try {
        await generateInvoicesForContract(contract.id);
        toast({
            title: 'Faturas Geradas!',
            description: `As faturas para o contrato #${contract.id} foram geradas com sucesso.`,
        });
        onOpenChange(false);
        router.push(`/invoices?contractId=${contract.id}`);
    } catch(error: any) {
         toast({
            variant: 'destructive',
            title: 'Erro ao Gerar Faturas',
            description: error.message || 'Não foi possível gerar as faturas. Tente novamente.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col max-h-[100svh]">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Detalhes do Contrato</SheetTitle>
          <SheetDescription>
            Veja os detalhes do contrato #{contract.id}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Cliente</span>
                  <span>{contract.clientName}</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Tipo</span>
                  <span>{typeTranslations[contract.type]}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Valor Total</span>
                  <span className="font-semibold">{contract.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
               <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Taxa de Juros</span>
                  <span>{contract.interestRate}% a.m.</span>
              </div>
              {contract.type === 'installment' && contract.installments && (
                 <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Parcelas</span>
                  <span>{contract.installments}x de {(contract.amount / contract.installments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Data de Emissão</span>
                  <span>{getFormattedDate(contract.issueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Primeiro Vencimento</span>
                  <span>{getFormattedDate(contract.dueDate)}</span>
              </div>
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="px-6 pb-6 pt-4 border-t flex-col sm:flex-col sm:items-stretch gap-2">
            <Button 
                type="button" 
                onClick={handleGenerateInvoices} 
                disabled={isSubmitting}
            >
               {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                Gerar Faturas
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

    