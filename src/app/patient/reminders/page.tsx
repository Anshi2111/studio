import { RemindersClient } from "@/components/patient-reminders-client";
import { Bell } from 'lucide-react';

export default function RemindersPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Bell className="h-8 w-8" /> Reminders
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                Stay on track with expiry alerts, dosage schedules, and refill reminders.
            </p>
            <RemindersClient />
        </div>
    );
}
