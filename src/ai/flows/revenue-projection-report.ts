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
  prompt: `You are a financial analyst tasked with generating a revenue projection report based on a list of invoices.

  Analyze the following invoices and determine the status of each payment (complete, overdue, past due, or written off as a loss).
  Provide a summary of the revenue projections, including key data points and insights.

  Invoices:
  {{#each invoices}}
  - Invoice ID: {{invoiceId}}, Client ID: {{clientId}}, Amount: {{amount}}, Due Date: {{dueDate}}, Payment Date: {{paymentDate}}
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
