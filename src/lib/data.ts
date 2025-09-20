

import { Client, Contract, Invoice } from './types';

export const clients: Client[] = [
  { id: '1', name: 'Innovate Inc.', email: 'contact@innovate.com', avatarUrl: 'https://placehold.co/40x40/E2E8F0/475569?text=II', phone: '123-456-7890', rate: 1.5, address: { logradouro: '123 Innovation Dr', cidade: 'Techville', estado: 'CA', cep: '12345' } },
  { id: '2', name: 'Solutions Co.', email: 'hello@solutions.co', avatarUrl: 'https://placehold.co/40x40/E2E8F0/475569?text=SC', phone: '234-567-8901', rate: 2.0, address: { logradouro: '456 Solutions Ave', cidade: 'Business City', estado: 'NY', cep: '67890' } },
  { id: '3', name: 'Apex Enterprises', email: 'support@apex.com', avatarUrl: 'https://placehold.co/40x40/E2E8F0/475569?text=AE', phone: '345-678-9012', rate: 1.2, address: { logradouro: '789 Apex St', cidade: 'Summit Peak', estado: 'CO', cep: '24680' } },
  { id: '4', name: 'Quantum Dynamics', email: 'info@quantum.dev', avatarUrl: 'https://placehold.co/40x40/E2E8F0/475569?text=QD', phone: '456-789-0123', rate: 2.5, address: { logradouro: '101 Quantum Blvd', cidade: 'Particle Park', estado: 'TX', cep: '13579' } },
  { id: '5', name: 'Stellar Group', email: 'admin@stellar.org', avatarUrl: 'https://placehold.co/40x40/E2E8F0/475569_text=SG', phone: '567-890-1234', rate: 1.8, address: { logradouro: '222 Stellar Rd', cidade: 'Galaxy Heights', estado: 'FL', cep: '97531' } },
];

export const contracts: Contract[] = [
  {
    id: 'CON001',
    clientId: '1',
    clientName: 'Innovate Inc.',
    clientEmail: 'contact@innovate.com',
    amount: 2500,
    issueDate: '2024-05-01',
    dueDate: '2024-06-01',
    status: 'active',
    interestRate: 1.5,
    type: 'single',
  },
  {
    id: 'CON002',
    clientId: '2',
    clientName: 'Solutions Co.',
    clientEmail: 'hello@solutions.co',
    amount: 1500,
    issueDate: '2024-05-05',
    dueDate: '2024-06-05',
    status: 'active',
    interestRate: 2.0,
    type: 'installment',
    installments: 3,
  },
  {
    id: 'CON003',
    clientId: '3',
    clientName: 'Apex Enterprises',
    clientEmail: 'support@apex.com',
    amount: 3500,
    issueDate: '2024-04-10',
    dueDate: '2024-05-10',
    status: 'active',
    interestRate: 1.2,
    type: 'single',
  },
];

export const invoices: Invoice[] = [
    {
        id: 'INV001',
        contractId: 'CON001',
        clientId: '1',
        clientName: 'Innovate Inc.',
        clientEmail: 'contact@innovate.com',
        amount: 2500,
        issueDate: '2024-05-01',
        dueDate: '2024-06-01',
        status: 'paid',
        paymentDate: '2024-05-28',
    },
    {
        id: 'INV002',
        contractId: 'CON003',
        clientId: '3',
        clientName: 'Apex Enterprises',
        clientEmail: 'support@apex.com',
        amount: 3500,
        issueDate: '2024-04-10',
        dueDate: '2024-05-10',
        status: 'overdue',
        paymentDate: null,
    },
];
