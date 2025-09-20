'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockUserMedications } from '@/lib/mock-data';
import type { UserMedication } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

function getExpiryBadge(expiryDate: string): React.ReactNode {
    const today = new Date();
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
  const [userMedications, setUserMedications] = useState<UserMedication[]>(mockUserMedications);
  const [newMedName, setNewMedName] = useState('');
  const [newMedExpiry, setNewMedExpiry] = useState('');

  const handleAddMedication = () => {
    if (newMedName && newMedExpiry) {
      const newMed: UserMedication = {
        id: `um${userMedications.length + 1}`,
        name: newMedName,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: newMedExpiry,
      };
      setUserMedications([...userMedications, newMed]);
      setNewMedName('');
      setNewMedExpiry('');
    }
  };

  return (
    <Card className="shadow-lg transition-all hover:shadow-xl">
        <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Your Medications</h3>
                    <div className="space-y-3">
                        {userMedications.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <span className="font-medium">{med.name}</span>
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
                        <Label htmlFor="med-expiry">Expiry Date</Label>
                        <Input id="med-expiry" type="date" value={newMedExpiry} onChange={e => setNewMedExpiry(e.target.value)} />
                    </div>
                    <Button onClick={handleAddMedication} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add to Cabinet
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
