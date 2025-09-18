

export type ClientDocument = {
  name: string;
  url: string;
}

export type ClientAddress = {
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  referencia?: string;
  cidade?: string;
  estado?: string;
}

export type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone?: string;
  rate?: number;
  documents?: ClientDocument[];
  address?: ClientAddress;
};

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'written-off';

export type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentDate: string | null;
};

    

    