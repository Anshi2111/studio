'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockAppointments, mockHealthStats, mockPrescriptions, mockHealthGoals, mockUserMedications } from '@/lib/mock-data';
import type { Appointment, HealthStat, Prescription, HealthGoal, UserMedication } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, HeartPulse, Pill, Trophy, Target, Star, AlertTriangle, PlusCircle, BookUser } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  return (
    <div className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl">
      <Card className="h-full transition-transform duration-300 group-hover:-translate-y-full">
        <CardHeader>
          <CardTitle className="text-base">{prescription.medication}</CardTitle>
          <CardDescription>{prescription.dosage}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p><strong>Refills left:</strong> {prescription.refills}</p>
          <p><strong>Prescribed by:</strong> {prescription.doctor}</p>
        </CardContent>
      </Card>
      <div className="absolute top-0 left-0 w-full h-full bg-card p-6 flex flex-col justify-center items-center text-center transition-transform duration-300 translate-y-full group-hover:translate-y-0">
          <Pill className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-bold">{prescription.medication}</h3>
          <p className="text-sm text-muted-foreground mt-2">Click to view detailed information or request a refill.</p>
      </div>
    </div>
  );
}

function getExpiryBadge(expiryDate: string): React.ReactNode {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) {
        return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysUntilExpiry <= 30) {
        return <Badge variant="destructive" className="bg-yellow-500/80 text-white hover:bg-yellow-500/90">Expires in {daysUntilExpiry} days</Badge>;
    }
    return <Badge variant="secondary">{format(expiry, "PPP")}</Badge>;
}


export function PatientDashboardClient() {
  const appointments: Appointment[] = mockAppointments;
  const prescriptions: Prescription[] = mockPrescriptions;
  const healthStats: HealthStat[] = mockHealthStats;
  const healthGoals: HealthGoal[] = mockHealthGoals;
  const [userMedications, setUserMedications] = useState<UserMedication[]>(mockUserMedications);
  const [newMedName, setNewMedName] = useState('');
  const [newMedExpiry, setNewMedExpiry] = useState('');

  const handleAddMedication = () => {
    if (newMedName && newMedExpiry) {
      const newMed: UserMedication = {
        id: `um${userMedications.length + 1}`,
        name: newMedName,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: newMedExpiry,
      };
      setUserMedications([...userMedications, newMed]);
      setNewMedName('');
      setNewMedExpiry('');
    }
  };

  const chartConfig = {
    systolic: {
      label: 'Systolic',
      color: 'hsl(var(--chart-2))',
    },
    diastolic: {
      label: 'Diastolic',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2 transition-all hover:shadow-lg hover:scale-[1.02]">
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
                    <TableRow key={appointment.id} className="transition-colors hover:bg-muted/50">
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

          <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
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
                      cursor={true}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="systolic" fill="var(--color-systolic)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="diastolic" fill="var(--color-diastolic)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

      <Card className="lg:col-span-3 transition-all hover:shadow-lg hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium font-headline">Current Prescriptions</CardTitle>
          <Pill className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((p) => (
              <PrescriptionCard key={p.id} prescription={p} />
            ))}
          </div>
        </CardContent>
      </Card>
      
        <Card className="lg:col-span-3 transition-all hover:shadow-lg hover:scale-[1.01]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><BookUser className="text-primary" /> My Medicine Cabinet</CardTitle>
                <CardDescription>Track your personal over-the-counter medications and their expiry dates.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <h3 className="font-semibold mb-3">Your Medications</h3>
                        <div className="space-y-2">
                            {userMedications.map(med => (
                                <div key={med.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                    <span className="font-medium">{med.name}</span>
                                    {getExpiryBadge(med.expiryDate)}
                                </div>
                            ))}
                            {userMedications.length === 0 && <p className="text-sm text-muted-foreground">You haven't added any medications yet.</p>}
                        </div>
                    </div>
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Add a New Medicine</h3>
                        <div className="space-y-2">
                            <Label htmlFor="med-name">Medicine Name</Label>
                            <Input id="med-name" placeholder="e.g., Tylenol" value={newMedName} onChange={e => setNewMedName(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="med-expiry">Expiry Date</Label>
                            <Input id="med-expiry" type="date" value={newMedExpiry} onChange={e => setNewMedExpiry(e.target.value)} />
                        </div>
                        <Button onClick={handleAddMedication} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add to Cabinet
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

      <Card className="lg:col-span-3 transition-all hover:shadow-lg hover:scale-[1.01]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><Trophy className="text-yellow-500" /> Health Goals & Achievements</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Target/> Current Goals</h3>
                <div className="space-y-4">
                    {healthGoals.map(goal => (
                        <div key={goal.id}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{goal.title}</span>
                                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Star/> Recent Badges</h3>
                 <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1"><Pill className="w-3 h-3" /> Medication Master</Badge>
                    <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1"><Calendar className="w-3 h-3" /> Perfect Attendance</Badge>
                    <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Health Tracker</Badge>
                 </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
