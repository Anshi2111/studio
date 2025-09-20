'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';

interface SaleRecord {
    id: string;
    medicineName: string;
    patientPhone: string;
    quantity: number;
    dateSold: string;
}

export function PharmacySalesRecordsClient() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const storedRecords = localStorage.getItem(SALES_RECORDS_STORAGE_KEY);
    if (storedRecords) {
      setSalesRecords(JSON.parse(storedRecords));
    }
  }, []);

  const filteredRecords = salesRecords.filter(record => 
    record.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientPhone.includes(searchTerm)
  );

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>A log of all past sales transactions.</CardDescription>
             <Input 
                placeholder="Search by medicine or buyer phone..."
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
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date of Sale</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.medicineName}</TableCell>
                            <TableCell>{record.patientPhone}</TableCell>
                            <TableCell>{record.quantity}</TableCell>
                            <TableCell>{format(new Date(record.dateSold), 'PPP p')}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
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
