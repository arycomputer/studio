export type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate: string | null;
};
