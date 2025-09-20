import { PharmacySalesRecordsClient } from '@/components/pharmacy-sales-records-client';
import { History } from 'lucide-react';

export default function SalesRecordsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <History className="h-8 w-8" /> Sales & Expiry Records
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                Manually log sold over-the-counter medications to help patients track their expiry dates via the AI assistant.
            </p>
            <PharmacySalesRecordsClient />
        </div>
    );
}
