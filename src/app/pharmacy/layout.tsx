'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Archive, ClipboardList, LayoutDashboard, History } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';

const menuItems = [
  { href: '/pharmacy/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pharmacy/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { href: '/pharmacy/inventory', label: 'Inventory', icon: Archive },
  { href: '/pharmacy/sales-records', label: 'Sales Records', icon: History },
];

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader userType="Pharmacist" />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
