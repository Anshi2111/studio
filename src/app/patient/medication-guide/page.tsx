import { MedicationGuideClient } from '@/components/medication-guide-client';

export default function MedicationGuidePage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Medication Interaction Guide</h1>
            <MedicationGuideClient />
        </>
    );
}
