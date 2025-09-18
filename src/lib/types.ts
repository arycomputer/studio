
export type ClientDocument = {
  name: string;
  url: string;
}

export type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone?: string;
  rate?: number;
  documents?: ClientDocument[];
  address?: string;
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

    