'use server';

/**
 * @fileOverview A revenue projection report AI agent.
 *
 * - generateRevenueProjectionReport - A function that handles the generation of a revenue projection report.
 * - RevenueProjectionReportInput - The input type for the generateRevenueProjectionReport function.
 * - RevenueProjectionReportOutput - The return type for the generateRevenueProjectionReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevenueProjectionReportInputSchema = z.object({
  invoices: z.array(
    z.object({
      invoiceId: z.string().describe('The ID of the invoice.'),
      clientId: z.string().describe('The ID of the client the invoice is for.'),
      amount: z.number().describe('The total amount of the invoice.'),
      dueDate: z.string().describe('The due date of the invoice (ISO format).'),
      paymentDate: z
        .string()
        .nullable()
        .describe('The date the invoice was paid (ISO format), null if not paid.'),
    })
  ).describe('A list of invoices to analyze.'),
});
export type RevenueProjectionReportInput = z.infer<typeof RevenueProjectionReportInputSchema>;

const RevenueProjectionReportOutputSchema = z.object({
  report: z.string().describe('A summary of revenue projections based on the invoices.'),
});
export type RevenueProjectionReportOutput = z.infer<typeof RevenueProjectionReportOutputSchema>;

export async function generateRevenueProjectionReport(
  input: RevenueProjectionReportInput
): Promise<RevenueProjectionReportOutput> {
  return revenueProjectionReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revenueProjectionReportPrompt',
  input: {schema: RevenueProjectionReportInputSchema},
  output: {schema: RevenueProjectionReportOutputSchema},
  prompt: `Você é um analista financeiro encarregado de gerar um relatório de projeção de receita com base em uma lista de faturas.

  Analise as seguintes faturas e determine o status de cada pagamento (concluído, pendente, atrasado ou baixado como prejuízo).
  Forneça um resumo das projeções de receita, incluindo pontos de dados e insights importantes.

  Faturas:
  {{#each invoices}}
  - ID da Fatura: {{invoiceId}}, ID do Cliente: {{clientId}}, Valor: {{amount}}, Data de Vencimento: {{dueDate}}, Data de Pagamento: {{paymentDate}}
  {{/each}}
  `,
});

const revenueProjectionReportFlow = ai.defineFlow(
  {
    name: 'revenueProjectionReportFlow',
    inputSchema: RevenueProjectionReportInputSchema,
    outputSchema: RevenueProjectionReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
