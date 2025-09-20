'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const SALES_RECORDS_STORAGE_KEY = 'healthure-sales-records';
const MED_CABINET_STORAGE_KEY = 'healthure-medicine-cabinet';
const LOGGED_IN_PATIENT_PHONE = '123-456-7890'; // Mock logged-in patient

interface CombinedMedicineRecord {
    name: string;
    mfgDate?: string;
    expiryDate?: string;
    quantity?: number;
    source: 'Purchased' | 'Scanned';
    dateAdded: string;
}

export function MyMedicinesClient() {
    const [medicines, setMedicines] = useState<CombinedMedicineRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
            }));

        // Fetch scanned/manually added medicines from medicine cabinet
        const cabinetRecordsStr = localStorage.getItem(MED_CABINET_STORAGE_KEY);
        const cabinetRecords = cabinetRecordsStr ? JSON.parse(cabinetRecordsStr) : [];
        
        const scannedMedicines: CombinedMedicineRecord[] = cabinetRecords.map((med: any) => ({
            name: med.name,
            mfgDate: undefined, // Not available in cabinet
            expiryDate: med.expiryDate,
            quantity: undefined, // Not available in cabinet
            source: 'Scanned' as const,
            dateAdded: med.purchaseDate, // Using purchase date as date added
        }));

        
        const allMedicines = [...purchasedMedicines, ...scannedMedicines].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

        setMedicines(allMedicines);
    }, []);

    const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const getExpiryBadge = (expiryDate?: string) => {
        if (!expiryDate) return <Badge variant="outline">N/A</Badge>;
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
        <Card>
            <CardHeader>
                <CardTitle>My Medicines</CardTitle>
                <CardDescription>A unified list of your purchased and scanned medicines.</CardDescription>
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
                            <TableHead>Mfg Date</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMedicines.length > 0 ? filteredMedicines.map((med, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{med.name}</TableCell>
                                <TableCell>
                                    <Badge variant={med.source === 'Purchased' ? 'default' : 'outline'}>
                                        {med.source}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(med.dateAdded), 'PPP')}</TableCell>
                                <TableCell>{med.mfgDate ? format(new Date(med.mfgDate), 'PPP') : 'N/A'}</TableCell>
                                <TableCell>{getExpiryBadge(med.expiryDate)}</TableCell>
                                <TableCell>{med.quantity || 'N/A'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No medicines found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
