'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { runRevenueReport } from '@/app/actions';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RevenueReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setReport(null);
    try {
      const result = await runRevenueReport();
      setReport(result.report);
      toast({
        title: 'Relatório Gerado',
        description: 'O relatório de projeção de receita da IA foi criado com sucesso.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao gerar o relatório. Por favor, tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Projeção de Receita com IA
        </CardTitle>
        <CardDescription>
          Analise as faturas para gerar um relatório de projeção de receita.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Gerar Relatório
        </Button>
        {loading && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Gerando relatório... isso pode levar um momento.
          </p>
        )}
        {report && (
          <div className="mt-4 rounded-lg border bg-secondary/30 p-4">
            <h3 className="font-semibold mb-2 font-headline">
              Resumo da Projeção
            </h3>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">
              {report}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
