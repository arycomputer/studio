
'use server';

import { contracts as mockContracts, clients as mockClients, invoices as mockInvoices } from '@/lib/data';
import { Client, Contract, ContractStatus, ClientDocument, ClientAddress, Invoice, InvoiceStatus } from '@/lib/types';
import {format, addMonths} from 'date-fns';

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

// --- Client Actions ---

export async function getClients(): Promise<Client[]> {
  await delay(200);
  return mockClients;
}

export async function addClient(client: Omit<Client, 'id' | 'avatarUrl' | 'documents' | 'address'> & { address?: ClientAddress, documents?: File[] }): Promise<Client> {
  await delay(500);
  const newId = (mockClients.length + 1).toString();
  
  const uploadedDocuments: ClientDocument[] = client.documents?.map(file => ({
    name: file.name,
    url: `/documents/${newId}/${file.name}`,
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
  
  const newUploadedDocuments: ClientDocument[] = data.newDocuments?.map(file => ({
    name: file.name,
    url: `/documents/${id}/${file.name}`,
  })) || [];

  let avatarUrl = existingClient.avatarUrl;
  if (data.removePhoto) {
    const initials = getInitials(data.name);
    avatarUrl = `https://placehold.co/40x40/E2E8F0/475569?text=${initials}`;
  } else if (data.photo) {
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
    
    // Also delete associated contracts and invoices
    const contractsToDelete = mockContracts.filter(c => c.clientId === id);
    contractsToDelete.forEach(c => {
        const cIndex = mockContracts.findIndex(i => i.id === c.id);
        if (cIndex !== -1) mockContracts.splice(cIndex, 1);
    });

    const invoicesToDelete = mockInvoices.filter(i => i.clientId === id);
    invoicesToDelete.forEach(i => {
        const iIndex = mockInvoices.findIndex(inv => inv.id === i.id);
        if (iIndex !== -1) mockInvoices.splice(iIndex, 1);
    });

    return { success: true };
}

export async function deleteClientDocument(clientId: string, documentUrl: string): Promise<{ success: boolean }> {
    await delay(500);
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) throw new Error('Client not found');
    
    const client = mockClients[clientIndex];
    const documentIndex = client.documents?.findIndex(doc => doc.url === documentUrl);

    if (documentIndex === undefined || documentIndex === -1) throw new Error('Document not found');

    client.documents?.splice(documentIndex, 1);
    return { success: true };
}

// --- Contract Actions ---

export async function getContracts(): Promise<Contract[]> {
  await delay(200);
  return mockContracts;
}

export async function addContract(contract: Omit<Contract, 'id' | 'clientName' | 'clientEmail' | 'issueDate' | 'status'>): Promise<Contract> {
    await delay(500);
    const client = mockClients.find(c => c.id === contract.clientId);
    if (!client) {
        throw new Error('Client not found');
    }

    const newId = `CON${(mockContracts.length + 1).toString().padStart(3, '0')}`;
    const issueDate = new Date();
    
    const newContract: Contract = {
        ...contract,
        id: newId,
        clientName: client.name,
        clientEmail: client.email,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        status: 'active',
    };
    mockContracts.unshift(newContract);
    return newContract;
}

export async function deleteContract(id: string): Promise<{ success: boolean }> {
    await delay(500);
    const contractIndex = mockContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) throw new Error('Contract not found');
    
    mockContracts.splice(contractIndex, 1);
    // Also delete associated invoices
    const invoicesToDelete = mockInvoices.filter(inv => inv.contractId === id);
    invoicesToDelete.forEach(inv => {
        const invIndex = mockInvoices.findIndex(i => i.id === inv.id);
        if (invIndex !== -1) mockInvoices.splice(invIndex, 1);
    });
    
    return { success: true };
}

// --- Invoice Actions ---

export async function getInvoices(): Promise<Invoice[]> {
  await delay(200);
  // Ensure status is updated based on due date
  const today = new Date();
  today.setHours(0,0,0,0);
  mockInvoices.forEach(inv => {
    const dueDate = new Date(inv.dueDate);
     dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    if (inv.status === 'pending' && dueDate < today) {
        inv.status = 'overdue';
    }
  });
  return mockInvoices;
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

export async function generateInvoicesForContract(contractId: string): Promise<Invoice[]> {
    await delay(1000);
    const contract = mockContracts.find(c => c.id === contractId);
    if (!contract) {
        throw new Error('Contract not found');
    }

    const existingInvoices = mockInvoices.filter(inv => inv.contractId === contractId);
    if (existingInvoices.length > 0) {
        throw new Error('Invoices have already been generated for this contract.');
    }

    const newInvoices: Invoice[] = [];
    const issueDate = new Date();
    issueDate.setHours(0,0,0,0);
    const firstDueDate = new Date(contract.dueDate);
    firstDueDate.setMinutes(firstDueDate.getMinutes() + firstDueDate.getTimezoneOffset());

    if (contract.type === 'single') {
        const newId = `INV${(mockInvoices.length + 1).toString().padStart(3, '0')}`;
        const newInvoice: Invoice = {
            id: newId,
            contractId: contract.id,
            clientId: contract.clientId,
            clientName: contract.clientName,
            clientEmail: contract.clientEmail,
            amount: contract.amount,
            issueDate: format(issueDate, 'yyyy-MM-dd'),
            dueDate: contract.dueDate,
            status: firstDueDate < issueDate ? 'overdue' : 'pending',
            paymentDate: null,
        };
        newInvoices.push(newInvoice);
    } else if (contract.type === 'installment' && contract.installments) {
        const installmentAmount = contract.amount / contract.installments;
        for (let i = 0; i < contract.installments; i++) {
            const newId = `INV${(mockInvoices.length + i + 1).toString().padStart(3, '0')}`;
            const dueDate = addMonths(firstDueDate, i);
            const newInvoice: Invoice = {
                 id: newId,
                contractId: contract.id,
                clientId: contract.clientId,
                clientName: contract.clientName,
                clientEmail: contract.clientEmail,
                amount: installmentAmount,
                issueDate: format(issueDate, 'yyyy-MM-dd'),
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                status: dueDate < issueDate ? 'overdue' : 'pending',
                paymentDate: null,
                installmentNumber: i + 1,
                totalInstallments: contract.installments,
            };
            newInvoices.push(newInvoice);
        }
    }

    mockInvoices.unshift(...newInvoices);
    return newInvoices;
}
