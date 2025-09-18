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
        title: 'Report Generated',
        description: 'AI revenue projection report has been successfully created.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
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
          AI Revenue Projection
        </CardTitle>
        <CardDescription>
          Analyze invoices to generate a revenue projection report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Report
        </Button>
        {loading && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Generating report... this may take a moment.
          </p>
        )}
        {report && (
          <div className="mt-4 rounded-lg border bg-secondary/30 p-4">
            <h3 className="font-semibold mb-2 font-headline">
              Projection Summary
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
