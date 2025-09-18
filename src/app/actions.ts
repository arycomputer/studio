'use server';

import {
  generateRevenueProjectionReport,
  RevenueProjectionReportInput,
} from '@/ai/flows/revenue-projection-report';
import { invoices as mockInvoices, clients as mockClients } from '@/lib/data';
import { Invoice } from '@/lib/types';

// Simulate a delay to mimic real-world network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getInvoices(): Promise<Invoice[]> {
  // In a real app, you'd fetch this from a database.
  await delay(200);
  return mockInvoices;
}

export async function getClients() {
  await delay(200);
  return mockClients;
}

export async function runRevenueReport() {
  const invoices = await getInvoices();
  
  if (!invoices || invoices.length === 0) {
    return { report: "Nenhum dado de fatura disponível para gerar um relatório." };
  }
  
  const reportInput: RevenueProjectionReportInput = {
    invoices: invoices.map((invoice) => ({
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      amount: invoice.amount,
      dueDate: new Date(invoice.dueDate).toISOString(),
      paymentDate: invoice.paymentDate
        ? new Date(invoice.paymentDate).toISOString()
        : null,
    })),
  };

  try {
    const result = await generateRevenueProjectionReport(reportInput);
    return result;
  } catch (error) {
    console.error("Error generating revenue report:", error);
    throw new Error("Falha ao gerar o relatório de IA.");
  }
}
