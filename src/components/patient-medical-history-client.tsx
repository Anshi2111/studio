'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const HISTORY_STORAGE_KEY = 'healthure-medical-history';

interface HistoryEntry {
    id: string;
    medicineName: string;
    doctorName: string;
    appointmentDate: string;
    tabletsPerDay: number;
    courseDurationDays: number;
    conditionNotes: string;
}

export function MedicalHistoryClient() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const { toast } = useToast();

    // Form state
    const [medicineName, setMedicineName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [tabletsPerDay, setTabletsPerDay] = useState('');
    const [courseDurationDays, setCourseDurationDays] = useState('');
    const [conditionNotes, setConditionNotes] = useState('');

    useEffect(() => {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    const handleSaveHistory = () => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        toast({
            title: 'History Saved!',
            description: 'Your medical history has been updated.',
        });
    };

    const handleAddEntry = () => {
        if (!medicineName || !doctorName || !appointmentDate) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill in all required fields to add a new entry.'
            });
            return;
        }

        const newEntry: HistoryEntry = {
            id: `hist_${Date.now()}`,
            medicineName,
            doctorName,
            appointmentDate,
            tabletsPerDay: parseInt(tabletsPerDay) || 0,
            courseDurationDays: parseInt(courseDurationDays) || 0,
            conditionNotes,
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        
        // Reset form
        setMedicineName('');
        setDoctorName('');
        setAppointmentDate(new Date().toISOString().split('T')[0]);
        setTabletsPerDay('');
        setCourseDurationDays('');
        setConditionNotes('');
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Medical History</CardTitle>
                <CardDescription>Record and view your medical history timeline.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Your Timeline</h3>
                        <Button variant="outline" size="sm" onClick={handleSaveHistory}>
                            <Save className="mr-2 h-4 w-4" />
                            Save History
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {history.length > 0 ? history.map(entry => (
                            <Card key={entry.id} className="bg-muted/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base flex justify-between">
                                        <span>{entry.medicineName} with {entry.doctorName}</span>
                                        <span className="text-sm font-normal text-muted-foreground">{format(new Date(entry.appointmentDate), 'PPP')}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground">{entry.conditionNotes}</p>
                                    {(entry.tabletsPerDay > 0 || entry.courseDurationDays > 0) && (
                                        <p className="text-xs mt-2">
                                            Dosage: {entry.tabletsPerDay || 'N/A'} tablets/day for {entry.courseDurationDays || 'N/A'} days
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No history recorded yet.</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4 rounded-lg border p-4 bg-background h-fit">
                    <h3 className="font-semibold text-lg">Add New Entry</h3>
                    <div className="space-y-2">
                        <Label htmlFor="hist-med-name">Medicine Name</Label>
                        <Input id="hist-med-name" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="hist-doc-name">Doctor Name</Label>
                        <Input id="hist-doc-name" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="hist-date">Appointment Date</Label>
                        <Input id="hist-date" type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hist-tablets">Tablets/Day</Label>
                            <Input id="hist-tablets" type="number" value={tabletsPerDay} onChange={e => setTabletsPerDay(e.target.value)} placeholder="e.g., 2" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hist-duration">Duration (Days)</Label>
                            <Input id="hist-duration" type="number" value={courseDurationDays} onChange={e => setCourseDurationDays(e.target.value)} placeholder="e.g., 14" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="hist-notes">Condition Notes</Label>
                        <Textarea id="hist-notes" value={conditionNotes} onChange={e => setConditionNotes(e.target.value)} />
                    </div>
                    <Button onClick={handleAddEntry} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add to History
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
