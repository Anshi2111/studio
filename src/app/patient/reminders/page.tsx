'use client';

import { Bell } from 'lucide-react';
import { RemindersClient } from '@/components/patient-reminders-client';

export default function RemindersPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Bell className="h-8 w-8" />
                    My Reminders
                </h1>
            </div>
            <RemindersClient />
        </div>
    );
}
