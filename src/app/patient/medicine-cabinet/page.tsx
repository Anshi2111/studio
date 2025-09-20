import { MedicineCabinetClient } from '@/components/medicine-cabinet-client';
import { BookUser } from 'lucide-react';

export default function MedicineCabinetPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BookUser className="h-8 w-8" /> My Medicine Cabinet
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                Track your personal over-the-counter medications and their expiry dates. Get automatic reminders for items expiring soon.
            </p>
            <MedicineCabinetClient />
        </div>
    );
}
