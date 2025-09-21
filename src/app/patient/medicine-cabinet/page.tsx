import { MedicineCabinetClient } from '@/components/medicine-cabinet-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUser, QrCode } from 'lucide-react';
import { QRCodeScannerCabinetClient } from '@/components/qrcode-scanner-cabinet-client';

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
             <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="manual">
                        <BookUser className="mr-2 h-4 w-4" />
                        Manual Entry & List
                    </TabsTrigger>
                    <TabsTrigger value="scan">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan to Add
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                    <MedicineCabinetClient />
                </TabsContent>
                <TabsContent value="scan">
                   <p className="text-center text-muted-foreground mb-4">Scanning a QR code will pre-fill the form in the 'Manual Entry' tab.</p>
                   <MedicineCabinetClient showFormOnly={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
