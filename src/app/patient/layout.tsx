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
import { Calendar, FlaskConical, LayoutDashboard, History } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';

const menuItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/medication-guide', label: 'Medication Guide', icon: FlaskConical },
  { href: '/patient/my-records', label: 'My Records', icon: History },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
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
        <DashboardHeader userType="Patient" />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
