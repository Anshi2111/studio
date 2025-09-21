import { RemindersClient } from "@/components/patient-reminders-client";
import { MedicalHistoryClient } from "@/components/patient-medical-history-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Bell } from 'lucide-react';

export default function MyRecordsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Records</h1>
            </div>
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm">
                    <TabsTrigger value="history">
                        <History className="mr-2 h-4 w-4" />
                        Medical History
                    </TabsTrigger>
                    <TabsTrigger value="reminders">
                        <Bell className="mr-2 h-4 w-4" />
                        Reminders
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                    <MedicalHistoryClient />
                </TabsContent>
                <TabsContent value="reminders">
                    <RemindersClient />
                </TabsContent>
            </Tabs>
        </div>
    );
}
