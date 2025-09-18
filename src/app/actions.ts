
'use server';

import {
  generateRevenueProjectionReport,
  RevenueProjectionReportInput,
} from '@/ai/flows/revenue-projection-report';
import { invoices as mockInvoices, clients as mockClients } from '@/lib/data';
import { Client, Invoice, InvoiceStatus } from '@/lib/types';
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

export async function addClient(client: Omit<Client, 'id' | 'avatarUrl' | 'documents'> & { documents?: File[] }): Promise<Client> {
  await delay(500);
  const newId = (mockClients.length + 1).toString();
  
  // Simulate file upload
  const uploadedDocuments = client.documents?.map(file => ({
    name: file.name,
    url: `/documents/${newId}/${file.name}`, // Simulated URL
  })) || [];

  const newClient: Client = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    rate: client.rate,
    id: newId,
    avatarUrl: `https://picsum.photos/seed/${newId}/40/40`,
    documents: uploadedDocuments,
  };
  mockClients.push(newClient);
  return newClient;
}

export async function updateClient(id: string, data: Omit<Client, 'id' | 'avatarUrl' | 'documents'> & { documents?: File[] }): Promise<Client> {
  await delay(500);
  const clientIndex = mockClients.findIndex(c => c.id === id);
  if (clientIndex === -1) {
    throw new Error('Client not found');
  }

  // Simulate file upload - in a real app, you'd handle new files, keep existing, or delete
  const uploadedDocuments = data.documents?.map(file => ({
    name: file.name,
    url: `/documents/${id}/${file.name}`, // Simulated URL
  })) || mockClients[clientIndex].documents;

  const updatedClient = { 
    ...mockClients[clientIndex], 
    ...data,
    documents: uploadedDocuments, 
  };

  mockClients[clientIndex] = updatedClient;
  return updatedClient;
}


export async function deleteClient(id: string): Promise<{ success: boolean }> {
    await delay(500);
    const clientIndex = mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
        throw new Error('Client not found');
    }
    mockClients.splice(clientIndex, 1);
    // Also delete associated invoices
    const invoicesToDelete = mockInvoices.filter(inv => inv.clientId === id);
    invoicesToDelete.forEach(inv => {
        const invIndex = mockInvoices.findIndex(i => i.id === inv.id);
        if (invIndex !== -1) {
            mockInvoices.splice(invIndex, 1);
        }
    });
    return { success: true };
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


export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    await delay(500);
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) {
        throw new Error('Invoice not found');
    }
    mockInvoices[invoiceIndex].status = status;
    if (status === 'paid') {
        mockInvoices[invoiceIndex].paymentDate = format(new Date(), 'yyyy-MM-dd');
    } else {
        mockInvoices[invoiceIndex].paymentDate = null;
    }
    return mockInvoices[invoiceIndex];
}


export async function deleteInvoice(id: string): Promise<{ success: boolean }> {
    await delay(500);
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    if (invoiceIndex === -1) {
        throw new Error('Invoice not found');
    }
    mockInvoices.splice(invoiceIndex, 1);
    return { success: true };
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
