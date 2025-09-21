'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Info, Package, PlusCircle, XCircle, Keyboard, Upload, Database, Cloud, Search, ScanLine } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Html5QrcodeScanner, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { fetchMedicineDetails } from '@/app/actions/medication-guide';
import Link from 'next/link';

const MOCK_INVENTORY_KEY = 'healthure-inventory';

export function AddMedicineClient() {
  const [isSaving, startSaveTransition] = useTransition();
  const [isFetching, startFetchTransition] = useTransition();
  
  const { toast } = useToast();

  const [mode, setMode] = useState<'scanning' | 'manual'>('scanning');
  
  // Form state
  const [name, setName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [source, setSource] = useState<'firestore' | 'public_api' | 'manual' | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; qrCode?: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const readerId = 'add-medicine-reader';

  const handleBarcodeDetection = useCallback((decodedText: string) => {
    setQrCode(decodedText);
    setErrorInfo(null);
    setShowForm(true);

    startFetchTransition(async () => {
        const response = await fetchMedicineDetails({ qrCode: decodedText });
        if (response.success && response.data) {
            const { data } = response;
            setName(data.name);
            setBatchNo(data.batchNo);
            setMfgDate(data.mfgDate);
            setExpDate(data.expDate);
            setQuantity(data.quantity.toString());
            setSupplier(data.supplier);
            setSource(data.source);
            toast({
                title: "Medicine Found!",
                description: `${data.name} details loaded from ${data.source === 'firestore' ? 'your database' : 'a public source'}.`,
            });
        } else {
            setSource('manual');
            const errorMessage = response.error || 'Medicine not found.';
            setErrorInfo({ message: errorMessage, qrCode: response.qrCode });
            toast({
                variant: 'default',
                title: "New Medicine Detected",
                description: "Please add its details manually.",
            });
        }
    });
  }, [toast]);
  
  useEffect(() => {
    if (mode === 'scanning' && !showForm && document.getElementById(readerId)) {
      const config: Html5QrcodeCameraScanConfig = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 }, 
        rememberLastUsedCamera: true 
      };

      const scanner = new Html5QrcodeScanner(
        readerId,
        config,
        false
      );

      const onScanSuccess = (decodedText: string) => {
        if (scanner.getState() === 2) { // SCANNING
          try {
            scanner.pause(true);
          } catch(e) {}
        }
        handleBarcodeDetection(decodedText);
      }

      scanner.render(onScanSuccess, undefined);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === 2) { // SCANNING
            scannerRef.current.pause(true);
          }
          scannerRef.current.clear();
        } catch (err) {
           console.error("Failed to clear scanner on unmount:", err)
        } finally {
            scannerRef.current = null;
        }
      }
    };
  }, [mode, showForm, handleBarcodeDetection]);
  

  const resetForm = () => {
      setName('');
      setBatchNo('');
      setMfgDate('');
      setExpDate('');
      setQuantity('');
      setSupplier('');
      setQrCode('');
      setSource(null);
      setErrorInfo(null);
  }

  const handleNewScan = () => {
    resetForm();
    setShowForm(false);
    setMode('scanning');
  };

  const handleSaveMedicine = () => {
      startSaveTransition(() => {
          const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
          
          const newMedicine = { medName: name, batchNo, mfgDate, expDate, quantity, supplier, barcode: qrCode, id: `inv_${Date.now()}` };
          
          inventory.push(newMedicine);
          
          localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inventory));

          toast({
              title: "Medicine Added!",
              description: `${name} has been successfully added to your inventory.`,
          });
          handleNewScan();
      });
  }
  
  const isFormValid = name && batchNo && mfgDate && expDate && quantity && supplier && qrCode;

  if (showForm) {
      return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font_headline">
                    <Package className="h-6 w-6" />
                    Medicine Details
                </CardTitle>
                <CardDescription>
                    {isFetching ? 'Fetching details...' : 'Fill in the details for the new medicine below.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isFetching ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                <>
                <div className="space-y-1">
                    <Label htmlFor="barcode">QR Code</Label>
                     <div className="flex items-center gap-2">
                        <Input id="barcode" value={qrCode} onChange={(e) => setQrCode(e.target.value)} disabled={mode !== 'manual'} />
                        {source === 'firestore' && <Database className="h-5 w-5 text-green-500" title="From your database"/>}
                        {source === 'public_api' && <Cloud className="h-5 w-5 text-blue-500" title="From public source"/>}
                    </div>
                </div>
                 {mode === 'manual' && !name && (
                    <Button className="w-full" onClick={() => handleBarcodeDetection(qrCode)} disabled={!qrCode || isFetching}>
                      <Search className="mr-2 h-4 w-4" />
                      Find Medicine by QR Code
                    </Button>
                  )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="med-name">Medicine Name</Label>
                        <Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Tylenol 500mg" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="batch-no">Batch No.</Label>
                        <Input id="batch-no" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} placeholder="e.g., AB12345" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="mfg-date">Manufacturing Date</Label>
                        <Input id="mfg-date" type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="expiry-date">Expiry Date</Label>
                        <Input id="expiry-date" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 100" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g., MedDistributors Inc." />
                    </div>
                </div>
                </>
                )}
            </CardContent>
             <CardFooter className="grid grid-cols-2 gap-2">
                <Button onClick={handleSaveMedicine} disabled={isSaving || isFetching || !isFormValid} className="w-full">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory</>}
                </Button>
                <Button onClick={handleNewScan} variant="outline" disabled={isFetching}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear & New Scan
                </Button>
            </CardFooter>
          </Card>
           <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                {errorInfo ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10 text-destructive" />
                        <p className="font-medium">{errorInfo.message}</p>
                        {errorInfo.qrCode && (
                            <Link href={`https://www.google.com/search?q=${encodeURIComponent(errorInfo.qrCode)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 underline text-primary">
                               <Search className="h-4 w-4" />
                               Search for this code on Google
                           </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10" />
                        <p className="font-medium">Please fill out all fields to add the medicine to your inventory.</p>
                    </div>
                )}
            </div>
        </div>
      )
  }

  return (
    <Card className="shadow-lg md:col-span-2">
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan QR Code
        </CardTitle>
        <CardDescription>
            Place a medicine's QR code in the viewfinder, or enter it manually.
        </CardDescription>
        </CardHeader>
        <CardContent className="relative">
            {mode === 'scanning' ? (
                <div id={readerId} className="w-full"></div>
            ) : (
                <div className="space-y-4">
                    <Label htmlFor="manual-barcode">QR Code Value</Label>
                    <Input id="manual-barcode" value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Enter QR code..."/>
                    <Button className="w-full" onClick={() => handleBarcodeDetection(qrCode)} disabled={!qrCode}>Find Medicine</Button>
                </div>
            )}
        </CardContent>
        <CardFooter className="grid grid-cols-1 gap-2">
        <Button variant="outline" className="w-full" onClick={() => {
            setShowForm(false);
            setMode(mode === 'scanning' ? 'manual' : 'scanning');
            resetForm();
            }}>
            <Keyboard className="mr-2 h-4 w-4" />
            {mode === 'scanning' ? 'Enter Details Manually' : 'Use Scanner'}
        </Button>
        </CardFooter>
    </Card>
  );
}
