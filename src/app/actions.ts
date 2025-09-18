
'use server';

import { invoices as mockInvoices, clients as mockClients } from '@/lib/data';
import { Client, Invoice, InvoiceStatus, ClientDocument, ClientAddress } from '@/lib/types';
import {format} from 'date-fns';

// Simulate a delay to mimic real-world network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// --- CEP Action ---
export async function getAddressFromCEP(cep: string): Promise<Partial<ClientAddress> | { error: string }> {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP.');
    }
    const data = await response.json();
    if (data.erro) {
      return { error: 'CEP não encontrado.' };
    }
    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    };
  } catch (error) {
    console.error('ViaCEP Error:', error);
    return { error: 'Não foi possível buscar o endereço.' };
  }
}


export async function getInvoices(): Promise<Invoice[]> {
  // In a real app, you'd fetch this from a database.
  await delay(200);
  // Ensure status is updated based on due date
  const today = new Date();
  today.setHours(0,0,0,0);
  mockInvoices.forEach(inv => {
    const dueDate = new Date(inv.dueDate);
    if (inv.status === 'pending' && dueDate < today) {
        inv.status = 'overdue';
    }
  });
  return mockInvoices;
}

export async function getClients(): Promise<Client[]> {
  await delay(200);
  return mockClients;
}

export async function addClient(client: Omit<Client, 'id' | 'avatarUrl' | 'documents' | 'address'> & { address?: ClientAddress, documents?: File[] }): Promise<Client> {
  await delay(500);
  const newId = (mockClients.length + 1).toString();
  
  // Simulate file upload
  const uploadedDocuments: ClientDocument[] = client.documents?.map(file => ({
    name: file.name,
    url: `/documents/${newId}/${file.name}`, // Simulated URL
  })) || [];

  const initials = getInitials(client.name);
  const newClient: Client = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    rate: client.rate,
    address: client.address,
    id: newId,
    avatarUrl: `https://placehold.co/40x40/E2E8F0/475569?text=${initials}`,
    documents: uploadedDocuments,
  };
  mockClients.push(newClient);
  return newClient;
}

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}


export async function updateClient(id: string, data: Omit<Client, 'id' | 'avatarUrl' | 'documents' | 'address'> & { address?: ClientAddress, newDocuments?: File[], photo?: File, removePhoto?: boolean }): Promise<Client> {
  await delay(500);
  const clientIndex = mockClients.findIndex(c => c.id === id);
  if (clientIndex === -1) {
    throw new Error('Client not found');
  }

  const existingClient = mockClients[clientIndex];
  
  // Simulate file upload for new documents
  const newUploadedDocuments: ClientDocument[] = data.newDocuments?.map(file => ({
    name: file.name,
    url: `/documents/${id}/${file.name}`, // Simulated URL
  })) || [];

  let avatarUrl = existingClient.avatarUrl;
  if (data.removePhoto) {
    const initials = getInitials(data.name);
    avatarUrl = `https://placehold.co/40x40/E2E8F0/475569?text=${initials}`;
  } else if (data.photo) {
    // In a real app, you would upload the file to a storage service
    // and get a URL. Here, we'll convert to a data URI to simulate
    // an immediate update.
    avatarUrl = await fileToDataUri(data.photo);
  }


  const updatedClient: Client = {
    ...existingClient,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    rate: data.rate,
    documents: [...(existingClient.documents || []), ...newUploadedDocuments],
    avatarUrl: avatarUrl,
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


export async function deleteClientDocument(clientId: string, documentUrl: string): Promise<{ success: boolean }> {
    await delay(500);
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) {
        throw new Error('Client not found');
    }
    const client = mockClients[clientIndex];
    const documentIndex = client.documents?.findIndex(doc => doc.url === documentUrl);

    if (documentIndex === undefined || documentIndex === -1) {
        throw new Error('Document not found');
    }

    client.documents?.splice(documentIndex, 1);
    return { success: true };
}


export async function addInvoice(invoice: Omit<Invoice, 'id' | 'clientName' | 'clientEmail' | 'issueDate' | 'status' | 'paymentDate' >): Promise<Invoice> {
    await delay(500);
    const client = mockClients.find(c => c.id === invoice.clientId);
    if (!client) {
        throw new Error('Client not found');
    }

    const newId = `INV${(mockInvoices.length + 1).toString().padStart(3, '0')}`;
    const issueDate = new Date();
    const dueDate = new Date(invoice.dueDate);
    
    // Set time to 0 to compare dates correctly
    issueDate.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);


    const newInvoice: Invoice = {
        ...invoice,
        id: newId,
        clientName: client.name,
        clientEmail: client.email,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        status: dueDate < issueDate ? 'overdue' : 'pending',
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
    // Re-check overdue status in case of manual update
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(mockInvoices[invoiceIndex].dueDate);
    if (mockInvoices[invoiceIndex].status === 'pending' && dueDate < today) {
        mockInvoices[invoiceIndex].status = 'overdue';
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

    