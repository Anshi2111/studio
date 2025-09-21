'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';

interface SaleRecord {
    id: string;
    medicineName: string;
    patientPhone: string;
    patientEmail?: string;
    quantity: number;
    dateSold: string;
    expiryDate?: string;
}

export function PharmacySalesRecordsClient() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const storedRecords = localStorage.getItem(SALES_RECORDS_STORAGE_KEY);
    if (storedRecords) {
      setSalesRecords(JSON.parse(storedRecords));
    }
  }, []);

  const handleSaveRecords = (updatedRecords: SaleRecord[]) => {
      localStorage.setItem(SALES_RECORDS_STORAGE_KEY, JSON.stringify(updatedRecords));
      setSalesRecords(updatedRecords);
  }

  const handleDeleteRecord = (id: string) => {
      const updatedRecords = salesRecords.filter(record => record.id !== id);
      handleSaveRecords(updatedRecords);
      toast({
          title: 'Record Deleted',
          description: 'The sales record has been successfully removed.'
      });
  }

  const filteredRecords = salesRecords.filter(record => 
    record.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientPhone.includes(searchTerm) ||
    (record.patientEmail && record.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>A log of all past sales transactions.</CardDescription>
             <Input 
                placeholder="Search by medicine, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm mt-2"
            />
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Medicine Name</TableHead>
                        <TableHead>Buyer Phone</TableHead>
                        <TableHead>Buyer Email</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date of Sale</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.medicineName}</TableCell>
                            <TableCell>{record.patientPhone}</TableCell>
                            <TableCell>{record.patientEmail || 'N/A'}</TableCell>
                            <TableCell>{record.quantity}</TableCell>
                            <TableCell>{format(new Date(record.dateSold), 'PPP p')}</TableCell>
                            <TableCell>{record.expiryDate ? format(new Date(record.expiryDate), 'PPP') : 'N/A'}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(record.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No sales records found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
