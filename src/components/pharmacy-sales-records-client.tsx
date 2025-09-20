'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SoldMedication } from '@/lib/types';
import { mockSoldMedications } from '@/lib/mock-data';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';

export function PharmacySalesRecordsClient() {
  const [salesRecords, setSalesRecords] = useState<SoldMedication[]>([]);
  const [medicineName, setMedicineName] = useState('');
  const [dateSold, setDateSold] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const storedRecords = localStorage.getItem(SALES_RECORDS_STORAGE_KEY);
    if (storedRecords) {
      setSalesRecords(JSON.parse(storedRecords));
    } else {
      setSalesRecords(mockSoldMedications);
    }
  }, []);
  
  const updateSalesRecords = (records: SoldMedication[]) => {
    setSalesRecords(records);
    localStorage.setItem(SALES_RECORDS_STORAGE_KEY, JSON.stringify(records));
  };


  const handleAddRecord = () => {
    if (medicineName && dateSold && expiryDate) {
      const newRecord: SoldMedication = {
        id: `sm${Date.now()}`,
        medicineName,
        dateSold,
        expiryDate,
        patientName: patientName || undefined,
      };
      updateSalesRecords([newRecord, ...salesRecords]);
      // Reset form
      setMedicineName('');
      setDateSold(new Date().toISOString().split('T')[0]);
      setExpiryDate('');
      setPatientName('');
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
             <Card className="shadow-lg">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Logged Sales</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Medicine</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date Sold</TableHead>
                                <TableHead>Expiry Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.medicineName}</TableCell>
                                    <TableCell>{record.patientName || 'N/A'}</TableCell>
                                    <TableCell>{format(new Date(record.dateSold), 'PPP')}</TableCell>
                                    <TableCell>{format(new Date(record.expiryDate), 'PPP')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
        <div className="space-y-4 rounded-lg border p-4 bg-background h-fit">
            <h3 className="font-semibold text-lg">Log a New Sale</h3>
            <div className="space-y-2">
                <Label htmlFor="med-name">Medicine Name</Label>
                <Input id="med-name" placeholder="e.g., Advil" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="date-sold">Date Sold</Label>
                <Input id="date-sold" type="date" value={dateSold} onChange={e => setDateSold(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input id="expiry-date" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name (Optional)</Label>
                <Input id="patient-name" placeholder="e.g., John Doe" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
            <Button onClick={handleAddRecord} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Record
            </Button>
        </div>
    </div>
  );
}
