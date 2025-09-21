import { MedicationGuideClient } from '@/components/medication-guide-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarcodeScannerClient } from '@/components/barcode-scanner-client';
import { Text, QrCode } from 'lucide-react';

export default function MedicationGuidePage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">AI Medication Guide</h1>
            <Tabs defaultValue="text-input" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="text-input">
                        <Text className="mr-2 h-4 w-4" />
                        Check Interactions
                    </TabsTrigger>
                    <TabsTrigger value="barcode-scanner">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="text-input">
                    <MedicationGuideClient />
                </TabsContent>
                <TabsContent value="barcode-scanner">
                    <BarcodeScannerClient />
                </TabsContent>
            </Tabs>
        </>
    );
}
