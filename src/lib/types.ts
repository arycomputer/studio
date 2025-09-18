
export type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
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
