import { getClients, getInvoices } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function ClientsPage() {
  const clients = await getClients();
  const invoices = await getInvoices();

  const clientData = clients.map((client) => {
    const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
    const totalInvoiced = clientInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    const totalPaid = clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { ...client, totalInvoiced, totalPaid };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Clients</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Client Overview</CardTitle>
          <CardDescription>
            Manage your clients and view their financial history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Total Invoiced</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={client.avatarUrl}
                          alt={client.name}
                        />
                        <AvatarFallback>
                          {client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${client.totalInvoiced.toLocaleString()}</TableCell>
                  <TableCell>${client.totalPaid.toLocaleString()}</TableCell>
                  <TableCell>
                    ${(client.totalInvoiced - client.totalPaid).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Invoices</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
