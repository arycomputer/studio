
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getContracts,
  getClients,
  deleteContract,
  generateInvoicesForAllActiveContracts,
} from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, X, ListFilter, FileClock, Loader2 } from 'lucide-react';
import type { Contract, Client, ContractStatus } from '@/lib/types';
import { AddContractForm } from './components/add-contract-form';
import { ContractDetailsSheet } from './components/contract-details-sheet';
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
import { ContractCard } from './components/contract-card';
import { Input } from '@/components/ui/input';

function ContractsPageContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddContractOpen, setAddContractOpen] = useState(false);
  const [isDetailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [filter, setFilter] = useState('');
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
      const [contractsData, clientsData] = await Promise.all([
        getContracts(),
        getClients(),
      ]);
      setContracts(contractsData);
      setClients(clientsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];
    if (clientId) {
        filtered = filtered.filter((contract) => contract.clientId === clientId);
    }
    if (!filter) return filtered;
    
    return filtered.filter(contract => contract.clientName.toLowerCase().includes(filter.toLowerCase()));
  }, [contracts, clientId, filter]);


  const getFilterDescription = () => {
    if(clientId && filteredClient) {
        return <>para o cliente: <span className="font-semibold">{filteredClient?.name}</span></>;
    }
    return '';
  }


  const handleContractAdded = (newContract: Contract) => {
    setContracts((prevContracts) => [newContract, ...prevContracts]);
  };

  const handleContractUpdated = (updatedContract: Contract) => {
    setContracts((prevContracts) =>
      prevContracts.map((contract) =>
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );
    if (selectedContract && selectedContract.id === updatedContract.id) {
      setSelectedContract(updatedContract);
    }
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setDetailsSheetOpen(true);
  };

  const handleDeleteClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContract) return;
    try {
      await deleteContract(selectedContract.id);
      setContracts((prev) =>
        prev.filter((inv) => inv.id !== selectedContract.id)
      );
      toast({
        title: 'Contrato Excluído',
        description: `O contrato ${selectedContract.id} foi excluído.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao excluir o contrato.',
      });
    } finally {
      setDeleteAlertOpen(false);
      setSelectedContract(null);
    }
  };

  const handleGenerateAllInvoices = async () => {
    setIsGenerating(true);
    try {
      const result = await generateInvoicesForAllActiveContracts();
      if (result.generatedCount > 0) {
        toast({
          title: 'Faturas Geradas!',
          description: `${result.generatedCount} novas faturas foram criadas com sucesso.`,
        });
      } else {
        toast({
          title: 'Nenhuma Fatura Gerada',
          description: 'Todos os contratos ativos já possuem faturas.',
        });
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Faturas',
        description: 'Ocorreu um erro ao tentar gerar as faturas em lote.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearFilter = () => {
    router.push('/contracts');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-headline font-bold">Contratos</h1>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleGenerateAllInvoices} disabled={isGenerating}>
                 {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileClock className="mr-2 h-4 w-4" />}
                Gerar Faturas Pendentes
            </Button>
            <Button onClick={() => setAddContractOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Contrato
            </Button>
        </div>
      </div>

      {(clientId) && (
        <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 p-3">
          <span className="text-sm">
            Mostrando contratos {getFilterDescription()}
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

      <AddContractForm
        isOpen={isAddContractOpen}
        onOpenChange={setAddContractOpen}
        onContractAdded={handleContractAdded}
        clients={clients}
      />

      {selectedContract && (
        <ContractDetailsSheet
          isOpen={isDetailsSheetOpen}
          onOpenChange={setDetailsSheetOpen}
          contract={selectedContract}
          onContractUpdated={handleContractUpdated}
          clients={clients}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              contrato e todas as faturas associadas a ele.
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
                <CardTitle className="font-headline">Histórico de Contratos</CardTitle>
                <CardDescription>
                    Veja e gerencie todos os seus contratos.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <Input 
                    placeholder="Filtrar por cliente..." 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-9 w-full max-w-sm"
                />
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando contratos...</p>
          ) : (
             <div className="space-y-4">
              {filteredContracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredContracts.map(contract => (
                    <ContractCard 
                        key={contract.id}
                        contract={contract}
                        onViewDetails={handleViewDetails}
                        onDelete={handleDeleteClick}
                    />
                ))}
                </div>
              ) : (
                 <p className="text-center text-muted-foreground pt-4">Nenhum contrato encontrado.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ContractsPageContent />
    </Suspense>
  );
}
