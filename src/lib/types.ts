

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

export type ContractStatus = 'paid' | 'pending' | 'overdue' | 'written-off';
export type ContractType = 'single' | 'installment';

export type Contract = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: ContractStatus;
  paymentDate: string | null;
  interestRate: number;
  type: ContractType;
};

    