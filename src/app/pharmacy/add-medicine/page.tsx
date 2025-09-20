import { AddMedicineClient } from '@/components/pharmacy-add-medicine-client';
import { PackagePlus } from 'lucide-react';

export default function AddMedicinePage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <PackagePlus className="h-8 w-8" /> Add Medicine to Inventory
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                Scan a medicine's barcode to quickly add it to your inventory. If the barcode is not found, you can enter the details manually.
            </p>
            <AddMedicineClient />
        </div>
    );
}
