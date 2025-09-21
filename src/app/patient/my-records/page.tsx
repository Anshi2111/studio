import { MedicalHistoryClient } from "@/components/patient-medical-history-client";
import { History } from 'lucide-react';

export default function MyRecordsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <History className="h-8 w-8" />
                    My Medical Records
                </h1>
            </div>
             <p className="text-muted-foreground mb-6">
                A timeline of your past diagnoses, prescriptions, and doctor visits.
            </p>
            <MedicalHistoryClient />
        </div>
    );
}
