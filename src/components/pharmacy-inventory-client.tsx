'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const MOCK_INVENTORY_KEY = 'healthure-inventory';

interface InventoryItem {
    id: string; // Added for unique key
    medName: string;
    batchNo: string;
    mfgDate: string;
    expDate: string;
    quantity: number;
    supplier: string;
}

export function InventoryClient() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const storedInventory = localStorage.getItem(MOCK_INVENTORY_KEY);
        if (storedInventory) {
            setInventory(JSON.parse(storedInventory));
        }
    }, []);
    
    const handleRemoveItem = (id: string) => {
        const updatedInventory = inventory.filter(item => item.id !== id);
        setInventory(updatedInventory);
        localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(updatedInventory));
    };

    const getStatusBadge = (quantity: number, expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        if (!expiryDate || isNaN(expiry.getTime())) {
            return <Badge variant="outline">Unknown</Badge>
        }
        if (expiry < today) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (quantity <= 20) {
            return <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">Low Stock</Badge>;
        }
        return <Badge variant="secondary">In Stock</Badge>;
    };

    const filteredInventory = inventory.filter(item =>
        item.medName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Stock</CardTitle>
                <CardDescription>View and manage all medicines in your inventory.</CardDescription>
                <Input
                    placeholder="Search by name or supplier..."
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
                            <TableHead>Batch No</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.medName}</TableCell>
                                <TableCell>{item.batchNo}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.expDate ? format(new Date(item.expDate), 'PPP') : 'N/A'}</TableCell>
                                <TableCell>{item.supplier}</TableCell>
                                <TableCell>{getStatusBadge(item.quantity, item.expDate)}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No inventory items found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
