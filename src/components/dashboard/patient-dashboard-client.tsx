'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAppointments, mockHealthStats, mockPrescriptions } from '@/lib/mock-data';
import type { Appointment, HealthStat, Prescription } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, HeartPulse, Pill } from 'lucide-react';

export function PatientDashboardClient() {
  const appointments: Appointment[] = mockAppointments;
  const prescriptions: Prescription[] = mockPrescriptions;
  const healthStats: HealthStat[] = mockHealthStats;

  const chartConfig = {
    systolic: {
      label: 'Systolic',
      color: 'hsl(var(--chart-1))',
    },
    diastolic: {
      label: 'Diastolic',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium font-headline">Upcoming Appointments</CardTitle>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.filter(a => a.status === 'Upcoming').map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.doctor}</TableCell>
                  <TableCell>{appointment.specialty}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium font-headline">Blood Pressure Trend</CardTitle>
          <HeartPulse className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={healthStats} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="systolic" fill="var(--color-systolic)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diastolic" fill="var(--color-diastolic)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium font-headline">Current Prescriptions</CardTitle>
          <Pill className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.medication}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p><strong>Dosage:</strong> {p.dosage}</p>
                  <p><strong>Refills left:</strong> {p.refills}</p>
                  <p><strong>Prescribed by:</strong> {p.doctor}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
