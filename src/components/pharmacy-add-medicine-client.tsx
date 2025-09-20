'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Info, Package, PlusCircle, XCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const MOCK_INVENTORY_KEY = 'healthure-inventory';

export function AddMedicineClient() {
  const [isSaving, startSaveTransition] = useTransition();
  const [scannedData, setScannedData] = useState<{ barcode: string, name?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Form state
  const [medName, setMedName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );
    scannerRef.current = scanner.html5Qrcode;

    function onScanSuccess(decodedText: string) {
      handleBarcodeDetection(decodedText, scanner);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.", error);
      });
    };
  }, []);
  
  const handleBarcodeDetection = (decodedText: string, scanner: Html5QrcodeScanner) => {
    scanner.pause();
    setBarcode(decodedText);

    const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
    const foundItem = inventory.find((item: any) => item.barcode === decodedText);

    if (foundItem) {
        setScannedData({ barcode: decodedText, name: foundItem.medName });
        toast({
            title: "Medicine Found!",
            description: `${foundItem.medName} is already in the system. You can update its inventory.`,
        });
        setMedName(foundItem.medName);
    } else {
        setScannedData({ barcode: decodedText });
        toast({
            variant: 'default',
            title: "New Medicine Detected",
            description: "This barcode isn't in your system. Please add its details manually.",
        });
    }
  }


  const resetForm = () => {
      setMedName('');
      setBatchNo('');
      setMfgDate('');
      setExpiryDate('');
      setQuantity('');
      setSupplier('');
      setBarcode('');
  }

  const handleClear = () => {
    resetForm();
    setScannedData(null);
    setError(null);
    if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.resume();
    }
    toast({
        title: "Form Cleared",
        description: "You can now scan a new item or enter details manually.",
    });
  };

  const handleSaveMedicine = () => {
      startSaveTransition(() => {
          const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
          
          const newMedicine = { medName, batchNo, mfgDate, expiryDate, quantity, supplier, barcode: barcode };
          
          inventory.push(newMedicine);
          
          localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inventory));

          console.log("Saving new medicine:", newMedicine);

          toast({
              title: "Medicine Added!",
              description: `${medName} has been successfully added to your inventory.`,
          });
          setScannedData(null);
          resetForm();
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
      });
  }

  const isFormValid = medName && batchNo && mfgDate && expiryDate && quantity && supplier && barcode;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan Barcode
          </CardTitle>
          <CardDescription>
            Place a medicine's barcode in the viewfinder to scan it.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div id="reader" className="w-full"></div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <Package className="h-6 w-6" />
                Medicine Details
            </CardTitle>
            <CardDescription>
                Fill in the details for the new medicine below.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {!scannedData && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10" />
                        <p className="font-medium">Scan a barcode to start.</p>
                    </div>
                </div>
            )}
             {scannedData && (
                 <div className="space-y-3 animate-in fade-in-50">
                    <div className="space-y-1">
                        <Label htmlFor="barcode">Barcode</Label>
                        <Input id="barcode" value={barcode} readOnly disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="med-name">Medicine Name</Label>
                            <Input id="med-name" value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g., Tylenol 500mg" />
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
                            <Input id="expiry-date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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
                 </div>
             )}
        </CardContent>
         {scannedData && (
            <CardFooter className="grid grid-cols-2 gap-2">
                <Button onClick={handleSaveMedicine} disabled={isSaving || !isFormValid} className="w-full">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory</>}
                </Button>
                <Button onClick={handleClear} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear & Rescan
                </Button>
            </CardFooter>
         )}
      </Card>

    </div>
  );
}
