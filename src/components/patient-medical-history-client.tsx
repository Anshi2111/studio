'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Stethoscope, Pill, Activity, StickyNote, Paperclip, Upload, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from './ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';


const HISTORY_STORAGE_KEY = 'healthure-medical-history';

interface HistoryEntry {
    id: string;
    // Medical Details
    diagnosis: string;
    symptoms: string;
    hospitalName: string;
    doctorName: string;
    appointmentDate: string; // Start Date
    
    // Prescription Details
    medicineName: string;
    medicineType: string;
    strength: string;
    tabletsPerDay: number;
    courseDurationDays: number;
    endDate: string;
    
    // Tracking
    missedDose: boolean;
    completionStatus: 'ongoing' | 'finished';

    // Notes & Reports
    notes: string;
    followUpDate: string;
    doctorsAdvice: string;
}

const defaultEntry: Omit<HistoryEntry, 'id'> = {
    diagnosis: '',
    symptoms: '',
    hospitalName: '',
    doctorName: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    medicineName: '',
    medicineType: 'Tablet',
    strength: '',
    tabletsPerDay: 0,
    courseDurationDays: 0,
    endDate: '',
    missedDose: false,
    completionStatus: 'ongoing',
    notes: '',
    followUpDate: '',
    doctorsAdvice: '',
};

export function MedicalHistoryClient() {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [formState, setFormState] = useState<Omit<HistoryEntry, 'id'>>(defaultEntry);
    const [isAdding, setIsAdding] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    const handleSaveHistory = (updatedHistory: HistoryEntry[]) => {
        const sortedHistory = updatedHistory.sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sortedHistory));
        setHistory(sortedHistory);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEntry = () => {
        if (!formState.diagnosis || !formState.doctorName || !formState.medicineName) {
            toast({
                variant: 'destructive',
                title: 'Missing Required Fields',
                description: 'Please fill in Diagnosis, Doctor, and Medicine Name.'
            });
            return;
        }

        const startDate = new Date(formState.appointmentDate);
        const endDate = formState.courseDurationDays > 0 ? format(addDays(startDate, formState.courseDurationDays), 'yyyy-MM-dd') : formState.endDate;

        const newEntry: HistoryEntry = {
            id: `hist_${Date.now()}`,
            ...formState,
            endDate: endDate,
            tabletsPerDay: Number(formState.tabletsPerDay) || 0,
            courseDurationDays: Number(formState.courseDurationDays) || 0,
        };

        const updatedHistory = [newEntry, ...history];
        handleSaveHistory(updatedHistory);
        
        toast({
            title: 'History Entry Added!',
            description: 'Your new medical history entry has been saved.'
        });

        // Reset form and hide it
        setFormState(defaultEntry);
        setIsAdding(false);
    };
    
    const handleCancel = () => {
        setFormState(defaultEntry);
        setIsAdding(false);
    }

    const handleDeleteEntry = (id: string) => {
        const updatedHistory = history.filter(entry => entry.id !== id);
        handleSaveHistory(updatedHistory);
        toast({
            title: 'Entry Deleted',
            description: 'The medical history entry has been removed.'
        });
    };

    const toggleMissedDose = (id: string) => {
        const updatedHistory = history.map(entry => 
            entry.id === id ? { ...entry, missedDose: !entry.missedDose } : entry
        );
        handleSaveHistory(updatedHistory);
    };
    
    if (isAdding) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Add New Medical Entry</CardTitle>
                    <CardDescription>Fill out the details below to add a new record to your timeline.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Patient/Medical Details */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary"/>Medical Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Reason/Diagnosis</Label>
                                <Input id="diagnosis" name="diagnosis" value={formState.diagnosis} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="symptoms">Symptoms</Label>
                                <Input id="symptoms" name="symptoms" value={formState.symptoms} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="doctorName">Doctor Name</Label>
                                <Input id="doctorName" name="doctorName" value={formState.doctorName} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hospitalName">Hospital/Clinic Name</Label>
                                <Input id="hospitalName" name="hospitalName" value={formState.hospitalName} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                     {/* Medicine Details */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Pill className="h-5 w-5 text-primary"/>Prescription Details</h3>
                         <div className="space-y-2">
                            <Label htmlFor="medicineName">Medicine Name</Label>
                            <Input id="medicineName" name="medicineName" value={formState.medicineName} onChange={handleInputChange} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="medicineType">Type</Label>
                                <Select name="medicineType" value={formState.medicineType} onValueChange={(val) => handleSelectChange('medicineType', val)}>
                                    <SelectTrigger id="medicineType"><SelectValue placeholder="Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tablet">Tablet</SelectItem>
                                        <SelectItem value="Syrup">Syrup</SelectItem>
                                        <SelectItem value="Injection">Injection</SelectItem>
                                        <SelectItem value="Ointment">Ointment</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="strength">Strength</Label>
                                <Input id="strength" name="strength" value={formState.strength} onChange={handleInputChange} placeholder="e.g., 500mg" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tabletsPerDay">Units/Day</Label>
                                <Input id="tabletsPerDay" name="tabletsPerDay" type="number" value={formState.tabletsPerDay || ''} onChange={handleInputChange} placeholder="e.g., 2" />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="appointmentDate">Start Date</Label>
                                <Input id="appointmentDate" name="appointmentDate" type="date" value={formState.appointmentDate} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="courseDurationDays">Duration (Days)</Label>
                                <Input id="courseDurationDays" name="courseDurationDays" type="number" value={formState.courseDurationDays || ''} onChange={handleInputChange} placeholder="e.g., 14" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input id="endDate" name="endDate" type="date" value={formState.endDate} onChange={handleInputChange} />
                            </div>
                         </div>
                         <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground"><Upload className="h-4 w-4"/> Upload Prescription Image</Button>
                    </div>

                    {/* Tracking & Notes */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/>Tracking</h3>
                            <div className="space-y-2">
                                <Label htmlFor="completionStatus">Completion Status</Label>
                                <Select name="completionStatus" value={formState.completionStatus} onValueChange={(val: 'ongoing' | 'finished') => handleSelectChange('completionStatus', val)}>
                                    <SelectTrigger id="completionStatus"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ongoing">Ongoing</SelectItem>
                                        <SelectItem value="finished">Finished</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="followUpDate">Next Refill/Follow-up</Label>
                                <Input id="followUpDate" name="followUpDate" type="date" value={formState.followUpDate} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><StickyNote className="h-5 w-5 text-primary"/>Notes & Reports</h3>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Personal Notes</Label>
                                <Textarea id="notes" name="notes" value={formState.notes} onChange={handleInputChange} placeholder="e.g., Felt better after 2 days..."/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="doctorsAdvice">Doctor's Notes/Advice</Label>
                                <Textarea id="doctorsAdvice" name="doctorsAdvice" value={formState.doctorsAdvice} onChange={handleInputChange} />
                            </div>
                            <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground"><Paperclip className="h-4 w-4"/> Attach Lab Report</Button>
                        </div>
                    </div>
                     <div className="flex justify-end gap-2">
                        <Button onClick={handleCancel} variant="outline">
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button onClick={handleAddEntry}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add to History
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>A timeline of your past diagnoses, prescriptions, and doctor visits.</CardDescription>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Entry
                </Button>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {history.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                            {history.map(entry => (
                                <AccordionItem value={entry.id} key={entry.id}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-base">{entry.diagnosis}</span>
                                                <span className="text-sm text-muted-foreground">Dr. {entry.doctorName} - {format(new Date(entry.appointmentDate), 'PPP')}</span>
                                            </div>
                                            <Badge variant={entry.completionStatus === 'finished' ? 'secondary' : 'default'}>{entry.completionStatus}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="bg-muted/30 p-4 rounded-b-md">
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><strong className="block text-foreground">Medicine</strong> {entry.medicineName} ({entry.strength})</div>
                                                <div><strong className="block text-foreground">Dosage</strong> {entry.tabletsPerDay} {(entry.medicineType || '').toLowerCase()}(s) for {entry.courseDurationDays} days</div>
                                                <div><strong className="block text-foreground">Symptoms</strong> {entry.symptoms || 'N/A'}</div>
                                                <div><strong className="block text-foreground">Clinic/Hospital</strong> {entry.hospitalName || 'N/A'}</div>
                                                {entry.followUpDate && <div><strong className="block text-foreground">Follow-up</strong> {format(new Date(entry.followUpDate), 'PPP')}</div>}
                                            </div>
                                            {entry.doctorsAdvice && <p className="text-sm"><strong className="block text-foreground">Doctor's Advice</strong>{entry.doctorsAdvice}</p>}
                                            {entry.notes && <p className="text-sm"><strong className="block text-foreground">Personal Notes</strong>{entry.notes}</p>}
                                            
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`missed-${entry.id}`} checked={entry.missedDose} onCheckedChange={() => toggleMissedDose(entry.id)} />
                                                    <Label htmlFor={`missed-${entry.id}`} className="text-sm">Missed Dose?</Label>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No history recorded yet. Click "Add New Entry" to begin.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
