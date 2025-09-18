import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  FileText,
  Settings,
  Briefcase,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-headline font-semibold">
                FinanceFlow
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/invoices" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Invoices">
                    <FileText />
                    <span>Invoices</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/clients" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Clients">
                    <Users />
                    <span>Clients</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="#" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
              <span className="sr-only">Toggle Sidebar</span>
            </SidebarTrigger>
            <div className="w-full flex-1">
              {/* Header content can go here */}
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
