'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';
const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';
const LOGGED_IN_PATIENT_PHONE = '123-456-7890'; // Mock logged-in patient

interface Reminder {
    id: string;
    title: string;
    description: string;
    type: 'expiry' | 'refill' | 'dosage';
}

export function RemindersClient() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    
    useEffect(() => {
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

        // Mock dosage and refill reminders
        const mockReminders: Reminder[] = [
            { id: 'mock1', type: 'dosage', title: 'Take Lisinopril', description: 'Time for your daily dose of Lisinopril (10mg).' },
            { id: 'mock2', type: 'refill', title: 'Refill Metformin', description: 'You have only 1 refill left for Metformin. Contact your pharmacy soon.' },
        ];

        setReminders([...expiryReminders, ...mockReminders]);

    }, []);
    
    return (
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
    );
}
