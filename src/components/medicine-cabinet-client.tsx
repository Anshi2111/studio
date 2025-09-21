'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { PlusCircle, Bot, Loader2, Mail } from 'lucide-react';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { findMedicationExpiryDate } from '@/app/actions/medication-guide';

const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';
const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';

interface CabinetMedicine {
    id: string;
    name: string;
    purchaseDate: string;
    expiryDate: string;
}

export function MedicineCabinetClient() {
    const [medicines, setMedicines] = useState<CabinetMedicine[]>([]);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Form state
    const [newMedName, setNewMedName] = useState('');
    const [newMedPurchaseDate, setNewMedPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [newMedExpiry, setNewMedExpiry] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const storedMeds = localStorage.getItem(MED_CABINET_STORAGE_KEY);
        if (storedMeds) {
            setMedicines(JSON.parse(storedMeds));
        }
    }, []);

    const updateAndSaveMeds = (meds: CabinetMedicine[]) => {
        const sortedMeds = meds.sort((a, b) => {
            const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
            const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
            return dateA - dateB;
        });
        setMedicines(sortedMeds);
        localStorage.setItem(MED_CABINET_STORAGE_KEY, JSON.stringify(sortedMeds));
    };
    
    const handleAddMedication = () => {
        if (newMedName && newMedPurchaseDate) {
          const newMed = {
            id: `um${Date.now()}`,
            name: newMedName,
            purchaseDate: newMedPurchaseDate,
            expiryDate: newMedExpiry,
          };
          updateAndSaveMeds([...medicines, newMed]);
          
          setNewMedName('');
          setNewMedPurchaseDate(new Date().toISOString().split('T')[0]);
          setNewMedExpiry('');
          setUserEmail('');
          toast({
            title: 'Medicine Added!',
            description: `${newMed.name} has been added to your cabinet.`
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

    const getExpiryBadge = (expiryDate: string) => {
        if (!expiryDate) return <Badge variant="outline">Unknown</Badge>;
        const today = new Date();
        today.setHours(0,0,0,0);
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysUntilExpiry < 0) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (daysUntilExpiry <= 30) {
            return <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">Expires Soon</Badge>;
        }
        return <Badge variant="secondary">{format(expiry, 'PPP')}</Badge>;
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Personal Medicines</CardTitle>
                        <CardDescription>A list of your manually added over-the-counter and other personal medicines.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Purchase Date</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {medicines.length > 0 ? medicines.map((med) => (
                                    <TableRow key={med.id}>
                                        <TableCell className="font-medium">{med.name}</TableCell>
                                        <TableCell>{format(new Date(med.purchaseDate), 'PPP')}</TableCell>
                                        <TableCell>{getExpiryBadge(med.expiryDate)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No medicines added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4 rounded-lg border p-4 bg-background">
                <h3 className="font-semibold text-lg">Add New Medicine</h3>
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
                <Button onClick={handleAddMedication} className="w-full" disabled={!newMedName || !newMedPurchaseDate}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add to Cabinet
                </Button>
            </div>
        </div>
    );
}
