import { MyMedicinesClient } from "@/components/patient-my-medicines-client";
import { Pill } from 'lucide-react';

export default function MyMedicinesPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Pill className="h-8 w-8" /> My Medicines
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                A unified list of your purchased and manually added medicines. Add over-the-counter drugs, vitamins, and supplements here.
            </p>
            <MyMedicinesClient />
        </div>
    );
}
