'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { PlusCircle, Bot, Loader2, Mail, QrCode } from 'lucide-react';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { findMedicationExpiryDate } from '@/app/actions/medication-guide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { QRCodeAddMedicineClient } from './qrcode-add-medicine-client';


const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';
const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';
const LOGGED_IN_PATIENT_PHONE = '123-456-7890'; // Mock logged-in patient

interface CombinedMedicineRecord {
    name: string;
    mfgDate?: string;
    expiryDate?: string;
    quantity?: number;
    source: 'Purchased' | 'Manual' | 'Scanned';
    dateAdded: string;
    id: string; // From sales or cabinet
}

export function MyMedicinesClient() {
    const [medicines, setMedicines] = useState<CombinedMedicineRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Form state
    const [newMedName, setNewMedName] = useState('');
    const [newMedPurchaseDate, setNewMedPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [newMedExpiry, setNewMedExpiry] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const fetchMedicines = useCallback(() => {
        // Fetch purchased medicines
        const salesRecordsStr = localStorage.getItem(SALES_RECORDS_STORAGE_KEY);
        const salesRecords = salesRecordsStr ? JSON.parse(salesRecordsStr) : [];
        
        const purchasedMedicines: CombinedMedicineRecord[] = salesRecords
            .filter((sale: any) => sale.patientPhone === LOGGED_IN_PATIENT_PHONE)
            .map((sale: any) => ({
                name: sale.medicineName,
                mfgDate: sale.mfgDate,
                expiryDate: sale.expiryDate,
                quantity: sale.quantity,
                source: 'Purchased' as const,
                dateAdded: sale.dateSold,
                id: sale.id,
            }));

        // Fetch scanned/manually added medicines from medicine cabinet
        const cabinetRecordsStr = localStorage.getItem(MED_CABINET_STORAGE_KEY);
        const cabinetRecords = cabinetRecordsStr ? JSON.parse(cabinetRecordsStr) : [];
        
        const manualMedicines: CombinedMedicineRecord[] = cabinetRecords.map((med: any) => ({
            name: med.name,
            mfgDate: undefined,
            expiryDate: med.expiryDate,
            quantity: undefined,
            source: med.source || ('Manual' as const),
            dateAdded: med.purchaseDate,
            id: med.id,
        }));

        const allMedicines = [...purchasedMedicines, ...manualMedicines].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

        setMedicines(allMedicines);
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    const updateManualMedicines = (meds: any[]) => {
        const sortedMeds = meds.sort((a, b) => {
            const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
            const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
            return dateA - dateB;
        });
        localStorage.setItem(MED_CABINET_STORAGE_KEY, JSON.stringify(sortedMeds));
        fetchMedicines(); // Refresh the main list
    };
    
    const handleAddMedication = (source: 'Manual' | 'Scanned' = 'Manual') => {
        if (newMedName && newMedPurchaseDate) {
          const cabinetRecordsStr = localStorage.getItem(MED_CABINET_STORAGE_KEY);
          const cabinetRecords = cabinetRecordsStr ? JSON.parse(cabinetRecordsStr) : [];
          
          const newMed = {
            id: `um${Date.now()}`,
            name: newMedName,
            purchaseDate: newMedPurchaseDate,
            expiryDate: newMedExpiry,
            source,
          };
          updateManualMedicines([...cabinetRecords, newMed]);
          
          setNewMedName('');
          setNewMedPurchaseDate(new Date().toISOString().split('T')[0]);
          setNewMedExpiry('');
          setUserEmail('');
          toast({
            title: 'Medicine Added!',
            description: `${newMed.name} has been added to your medicines.`
          })
        }
    };


    const handleFindExpiry = () => {
        if (!newMedName || !newMedPurchaseDate || !userEmail) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please enter the medicine name, purchase date, and your email.',
            });
            return;
        }
        startTransition(async () => {
            const salesRecordsStr = localStorage.getItem(SALES_RECORDS_STORAGE_KEY) || '[]';
            const salesRecords = JSON.parse(salesRecordsStr);
            const response = await findMedicationExpiryDate({ medicationName: newMedName, purchaseDate: newMedPurchaseDate, email: userEmail, salesRecords });
            if (response.success && response.data?.expiryDate) {
                setNewMedExpiry(response.data.expiryDate);
                toast({
                    title: 'Expiry Date Found!',
                    description: `The expiry date for ${newMedName} has been set to ${format(new Date(response.data.expiryDate), 'PPP')}.`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Expiry Date Not Found',
                    description: 'We couldn\'t find an expiry date for this medication based on the provided details.',
                });
            }
        });
    }

    const handleQRScan = useCallback((data: {name: string, expDate: string}) => {
        const newMed = {
            id: `um${Date.now()}`,
            name: data.name,
            purchaseDate: new Date().toISOString().split('T')[0], // Default to today
            expiryDate: data.expDate,
            source: 'Scanned' as const,
          };
        
        const cabinetRecordsStr = localStorage.getItem(MED_CABINET_STORAGE_KEY);
        const cabinetRecords = cabinetRecordsStr ? JSON.parse(cabinetRecordsStr) : [];
        updateManualMedicines([...cabinetRecords, newMed]);

        toast({
            title: "Medicine Added!",
            description: `${data.name} was added to your medicines via QR scan.`,
        });
    }, [toast]);


    const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const getExpiryBadge = (expiryDate?: string) => {
        if (!expiryDate) return <Badge variant="outline">N/A</Badge>;
        const today = new Date();
        today.setHours(0,0,0,0);
        const expiry = new Date(expiryDate);
        if (isNaN(expiry.getTime())) return <Badge variant="outline">Invalid Date</Badge>;
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysUntilExpiry < 0) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (daysUntilExpiry <= 30) {
            return <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">Expires Soon</Badge>;
        }
        return <Badge variant="secondary">{format(expiry, 'PPP')}</Badge>;
    };

    const addMedicineForm = (
        <div className="space-y-4 rounded-lg border p-4 bg-background">
            <h3 className="font-semibold text-lg">Add Personal Medicine</h3>
            <div className="space-y-2">
                <Label htmlFor="med-name">Medicine Name</Label>
                <Input id="med-name" placeholder="e.g., Tylenol, Vitamin C" value={newMedName} onChange={e => setNewMedName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="med-purchase-date">Purchase Date</Label>
                <Input id="med-purchase-date" type="date" value={newMedPurchaseDate} onChange={e => setNewMedPurchaseDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="user-email">Your Email (for AI lookup)</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="user-email" type="email" placeholder="you@example.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="pl-10"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="med-expiry">Expiry Date</Label>
                <div className="flex gap-2">
                    <Input id="med-expiry" type="date" value={newMedExpiry} onChange={e => setNewMedExpiry(e.target.value)} placeholder="YYYY-MM-DD" />
                    <Button variant="outline" onClick={handleFindExpiry} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4"/>}
                        <span className="ml-2 hidden sm:inline">Find</span>
                    </Button>
                </div>
            </div>
            <Button onClick={() => handleAddMedication('Manual')} className="w-full" disabled={!newMedName || !newMedPurchaseDate}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add to My Medicines
            </Button>
        </div>
    );

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Medicines List</CardTitle>
                        <CardDescription>A unified list of your purchased and manually added medicines.</CardDescription>
                        <Input 
                            placeholder="Search by medicine name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm mt-2"
                        />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMedicines.length > 0 ? filteredMedicines.map((med) => (
                                    <TableRow key={med.id}>
                                        <TableCell className="font-medium">{med.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={med.source === 'Purchased' ? 'default' : med.source === 'Scanned' ? 'secondary' : 'outline'}>
                                                {med.source}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(med.dateAdded), 'PPP')}</TableCell>
                                        <TableCell>{getExpiryBadge(med.expiryDate)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No medicines found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <div>
                <Tabs defaultValue="manual">
                     <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="scan"><QrCode className="w-4 h-4 mr-2"/>Scan to Add</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual">
                        {addMedicineForm}
                    </TabsContent>
                    <TabsContent value="scan">
                        <QRCodeAddMedicineClient onScan={handleQRScan} />
                    </TabsContent>
                </Tabs>
             </div>
        </div>
    );
}
