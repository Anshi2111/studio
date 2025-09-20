'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockUserMedications } from '@/lib/mock-data';
import type { UserMedication } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Bot, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { findMedicationExpiryDate } from '@/app/actions/medication-guide';
import { useToast } from "@/hooks/use-toast";

const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';

function getExpiryBadge(expiryDate: string): React.ReactNode {
    if (!expiryDate) {
        return <Badge variant="outline">No Expiry Date</Badge>;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) {
        return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysUntilExpiry <= 30) {
        return <Badge variant="destructive" className="bg-yellow-500/80 text-white hover:bg-yellow-500/90">Expires in {daysUntilExpiry} days</Badge>;
    }
    return <Badge variant="secondary">{format(expiry, "PPP")}</Badge>;
}


export function MedicineCabinetClient() {
  const [userMedications, setUserMedications] = useState<UserMedication[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedPurchaseDate, setNewMedPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMedExpiry, setNewMedExpiry] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    const storedMeds = localStorage.getItem(MED_CABINET_STORAGE_KEY);
    if (storedMeds) {
      setUserMedications(JSON.parse(storedMeds));
    } else {
      setUserMedications(mockUserMedications);
    }
  }, []);

  const updateMedications = (meds: UserMedication[]) => {
    const sortedMeds = meds.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    setUserMedications(sortedMeds);
  };
  
  const handleSaveChanges = () => {
    localStorage.setItem(MED_CABINET_STORAGE_KEY, JSON.stringify(userMedications));
    toast({
        title: 'Cabinet Saved!',
        description: 'Your medication list has been saved successfully.',
    });
  };

  const handleAddMedication = () => {
    if (newMedName && newMedPurchaseDate) {
      const newMed: UserMedication = {
        id: `um${Date.now()}`,
        name: newMedName,
        purchaseDate: newMedPurchaseDate,
        expiryDate: newMedExpiry,
      };
      updateMedications([...userMedications, newMed]);
      setNewMedName('');
      setNewMedPurchaseDate(new Date().toISOString().split('T')[0]);
      setNewMedExpiry('');
    }
  };

  const handleFindExpiry = () => {
    if (!newMedName || !newMedPurchaseDate) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please enter the medicine name and purchase date.',
        });
        return;
    }
    startTransition(async () => {
        const response = await findMedicationExpiryDate({ medicationName: newMedName, purchaseDate: newMedPurchaseDate });
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

  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
        <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Your Medications</h3>
                         <Button variant="outline" size="sm" onClick={handleSaveChanges}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Cabinet
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {userMedications.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <div>
                                    <span className="font-medium">{med.name}</span>
                                    <p className="text-xs text-muted-foreground">Purchased: {format(new Date(med.purchaseDate), "PPP")}</p>
                                </div>
                                {getExpiryBadge(med.expiryDate)}
                            </div>
                        ))}
                        {userMedications.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">You haven't added any medications yet.</p>}
                    </div>
                </div>
                <div className="space-y-4 rounded-lg border p-4 bg-background">
                    <h3 className="font-semibold text-lg">Add a New Medicine</h3>
                    <div className="space-y-2">
                        <Label htmlFor="med-name">Medicine Name</Label>
                        <Input id="med-name" placeholder="e.g., Tylenol, Vitamin C" value={newMedName} onChange={e => setNewMedName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="med-purchase-date">Purchase Date</Label>
                        <Input id="med-purchase-date" type="date" value={newMedPurchaseDate} onChange={e => setNewMedPurchaseDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="med-expiry">Expiry Date</Label>
                        <div className="flex gap-2">
                            <Input id="med-expiry" type="date" value={newMedExpiry} onChange={e => setNewMedExpiry(e.target.value)} placeholder="YYYY-MM-DD" />
                            <Button variant="outline" onClick={handleFindExpiry} disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4"/>}
                                <span className="ml-2 hidden sm:inline">Find with AI</span>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Enter manually or let our AI find it for you.</p>
                    </div>
                    <Button onClick={handleAddMedication} className="w-full" disabled={!newMedName || !newMedPurchaseDate}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add to Cabinet
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
