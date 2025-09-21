import { History } from 'lucide-react';
import { MedicalHistoryClient } from "@/components/patient-medical-history-client";

export default function HealthRecordPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <History className="h-8 w-8" /> Health Record
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                A timeline of your past diagnoses, prescriptions, and treatments.
            </p>
            <MedicalHistoryClient />
        </div>
    );
}
