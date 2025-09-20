import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, History, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyMedicinesClient } from "@/components/patient-my-medicines-client";

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
                     <Card>
                        <CardHeader>
                            <CardTitle>Medical History</CardTitle>
                             <CardDescription>Record and view your medical history timeline.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reminders">
                     <Card>
                        <CardHeader>
                            <CardTitle>Reminders & Alerts</CardTitle>
                            <CardDescription>Manage expiry, dosage, and refill reminders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">Coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
