
'use server';

import {
  generateRevenueProjectionReport,
  RevenueProjectionReportInput,
} from '@/ai/flows/revenue-projection-report';
import { invoices as mockInvoices, clients as mockClients } from '@/lib/data';
import { Client, Invoice } from '@/lib/types';
import {format} from 'date-fns';

// Simulate a delay to mimic real-world network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getInvoices(): Promise<Invoice[]> {
  // In a real app, you'd fetch this from a database.
  await delay(200);
  return mockInvoices;
}

export async function getClients(): Promise<Client[]> {
  await delay(200);
  return mockClients;
}

export async function addClient(client: Omit<Client, 'id' | 'avatarUrl'>): Promise<Client> {
  await delay(500);
  const newId = (mockClients.length + 1).toString();
  const newClient: Client = {
    ...client,
    id: newId,
    avatarUrl: `https://picsum.photos/seed/${newId}/40/40`,
  };
  mockClients.push(newClient);
  return newClient;
}

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'clientName' | 'clientEmail' | 'issueDate' | 'status' | 'paymentDate' >): Promise<Invoice> {
    await delay(500);
    const client = mockClients.find(c => c.id === invoice.clientId);
    if (!client) {
        throw new Error('Client not found');
    }

    const newId = `INV${(mockInvoices.length + 1).toString().padStart(3, '0')}`;
    const newInvoice: Invoice = {
        ...invoice,
        id: newId,
        clientName: client.name,
        clientEmail: client.email,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'pending',
        paymentDate: null,
    };
    mockInvoices.unshift(newInvoice);
    return newInvoice;
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
