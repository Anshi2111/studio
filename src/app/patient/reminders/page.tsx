'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell } from 'lucide-react';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';
import { HISTORY_STORAGE_KEY } from '@/components/patient-medical-history-client';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';
const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';
const LOGGED_IN_PATIENT_PHONE = '123-456-7890'; // Mock logged-in patient

interface Reminder {
    id: string;
    title: string;
    description: string;
    type: 'expiry' | 'refill' | 'dosage';
}

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    
    useEffect(() => {
        // Expiry reminders
        const salesRecordsStr = localStorage.getItem(SALES_RECORDS_STORAGE_KEY);
        const salesRecords = salesRecordsStr ? JSON.parse(salesRecordsStr) : [];
        const cabinetRecordsStr = localStorage.getItem(MED_CABINET_STORAGE_KEY);
        const cabinetRecords = cabinetRecordsStr ? JSON.parse(cabinetRecordsStr) : [];

        const mySales = salesRecords.filter((sale: any) => sale.patientPhone === LOGGED_IN_PATIENT_PHONE);

        const allMeds = [
            ...mySales.map((med: any) => ({...med, id: `sale_${med.id}`})),
            ...cabinetRecords.map((med: any) => ({...med, id: `cab_${med.id}`, medicineName: med.name}))
        ];

        const expiryReminders: Reminder[] = [];
        const today = new Date();

        allMeds.forEach(med => {
            if (med.expiryDate) {
                const expiry = new Date(med.expiryDate);
                const daysUntilExpiry = differenceInDays(expiry, today);

                if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                    expiryReminders.push({
                        id: `${med.id}_expiry`,
                        title: `Medicine Expiring Soon: ${med.medicineName || med.name}`,
                        description: `Your ${med.medicineName || med.name} will expire in ${daysUntilExpiry} days on ${format(expiry, 'PPP')}.`,
                        type: 'expiry'
                    });
                }
            }
        });

        // Dosage reminders from medical history
        const historyRecordsStr = localStorage.getItem(HISTORY_STORAGE_KEY);
        const historyRecords = historyRecordsStr ? JSON.parse(historyRecordsStr) : [];
        const dosageReminders: Reminder[] = [];

        historyRecords.forEach((entry: any) => {
            if (entry.tabletsPerDay > 0 && entry.courseDurationDays > 0) {
                const startDate = new Date(entry.appointmentDate);
                const endDate = addDays(startDate, entry.courseDurationDays);
                
                // Show reminder only if the course is currently active
                if (isBefore(today, endDate) && !isBefore(today, startDate)) {
                     dosageReminders.push({
                        id: `hist_${entry.id}_dosage`,
                        title: `Take ${entry.medicineName}`,
                        description: `Time for your daily dose: ${entry.tabletsPerDay} tablet(s). Course ends on ${format(endDate, 'PPP')}.`,
                        type: 'dosage'
                    });
                }
            }
        });

        // Mock refill reminders
        const mockRefillReminders: Reminder[] = [
            { id: 'mock2', type: 'refill', title: 'Refill Metformin', description: 'You have only 1 refill left for Metformin. Contact your pharmacy soon.' },
        ];

        setReminders([...expiryReminders, ...dosageReminders, ...mockRefillReminders]);

    }, []);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Bell className="h-8 w-8" />
                    My Reminders
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Reminders & Alerts</CardTitle>
                    <CardDescription>Manage expiry, dosage, and refill reminders.</CardDescription>
                </CardHeader>
                <CardContent>
                    {reminders.length > 0 ? (
                        <div className="space-y-4">
                            {reminders.map(reminder => (
                                <Alert key={reminder.id} variant={reminder.type === 'expiry' ? 'destructive' : 'default'}>
                                    <Bell className="h-4 w-4" />
                                    <AlertTitle>{reminder.title}</AlertTitle>
                                    <AlertDescription>{reminder.description}</AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bell className="mx-auto h-12 w-12" />
                            <p className="mt-4">You have no active reminders.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
