import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, History, Bell } from 'lucide-react';
import { MyMedicinesClient } from "@/components/patient-my-medicines-client";
import { MedicalHistoryClient } from "@/components/patient-medical-history-client";
import { RemindersClient } from "@/components/patient-reminders-client";

export default function MyRecordsPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    My Records
                </h1>
            </div>
            <p className="text-muted-foreground mb-6">
                View your medications, track your medical history, and manage reminders.
            </p>

            <Tabs defaultValue="my-medicines" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="my-medicines">
                        <Pill className="mr-2 h-4 w-4" />
                        My Medicines
                    </TabsTrigger>
                    <TabsTrigger value="medical-history">
                        <History className="mr-2 h-4 w-4" />
                        Medical History
                    </TabsTrigger>
                    <TabsTrigger value="reminders">
                        <Bell className="mr-2 h-4 w-4" />
                        Reminders
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="my-medicines">
                    <MyMedicinesClient />
                </TabsContent>
                <TabsContent value="medical-history">
                     <MedicalHistoryClient />
                </TabsContent>
                <TabsContent value="reminders">
                     <RemindersClient />
                </TabsContent>
            </Tabs>
        </div>
    );
}
