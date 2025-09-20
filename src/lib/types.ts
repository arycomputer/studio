

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

export type ContractStatus = 'active' | 'finished' | 'cancelled';
export type ContractType = 'single' | 'installment';

export type Contract = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string; // For single payment, this is the due date. For installment, this is the first due date.
  status: ContractStatus;
  interestRate: number;
  type: ContractType;
  installments?: number; // Number of installments
};


export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'written-off';

export type Invoice = {
  id: string;
  contractId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentDate: string | null;
  installmentNumber?: number; // e.g., 1 of 12
  totalInstallments?: number;
};
    
