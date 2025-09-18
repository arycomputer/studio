import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
} from 'lucide-react';
import { getInvoices, getClients } from '@/app/actions';
import { RevenueChart } from './components/revenue-chart';
import { RevenueReportGenerator } from './components/revenue-report-generator';

export default async function DashboardPage() {
  const invoices = await getInvoices();
  const clients = await getClients();

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const outstandingRevenue = invoices
    .filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time revenue from paid invoices.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${outstandingRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From pending and overdue invoices.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total number of clients managed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Total invoices generated.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart invoices={invoices} />
          </CardContent>
        </Card>
        <div className="lg:col-span-3 flex flex-col gap-4">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Invoices</CardTitle>
                <CardDescription>
                The most recently created invoices.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                            {invoice.clientEmail}
                        </div>
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            invoice.status === 'paid'
                                ? 'default'
                                : invoice.status === 'overdue'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                        >
                            {invoice.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        ${invoice.amount.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
             <RevenueReportGenerator />
        </div>
      </div>
    </div>
  );
}
