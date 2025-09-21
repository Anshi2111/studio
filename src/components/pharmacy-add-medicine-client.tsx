'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Info, Package, PlusCircle, XCircle, Keyboard, Upload } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const MOCK_INVENTORY_KEY = 'healthure-inventory';

export function AddMedicineClient() {
  const [isSaving, startSaveTransition] = useTransition();
  const [scannedData, setScannedData] = useState<{ barcode: string, name?: string } | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [medName, setMedName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [barcode, setBarcode] = useState('');

  const handleBarcodeDetection = useCallback((decodedText: string) => {
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
            description: "This QR code isn't in your system. Please add its details manually.",
        });
    }
  }, [toast]);

  useEffect(() => {
    if (isManualEntry || scannedData) {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.clear();
      }
      return;
    }

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
    scannerRef.current = scanner;

    function onScanSuccess(decodedText: string) {
        scanner.pause();
        handleBarcodeDetection(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }
    
    if (document.getElementById('reader')?.innerHTML === "") {
        scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 is SCANNING state
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [isManualEntry, scannedData, handleBarcodeDetection]);
  

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
    setIsManualEntry(false);
    
    toast({
        title: "Form Cleared",
        description: "You can now scan a new item or enter details manually.",
    });
  };

  const handleSaveMedicine = () => {
      startSaveTransition(() => {
          const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
          
          const newMedicine = { medName, batchNo, mfgDate, expiryDate, quantity, supplier, barcode: barcode, id: `inv_${Date.now()}` };
          
          inventory.push(newMedicine);
          
          localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inventory));

          toast({
              title: "Medicine Added!",
              description: `${medName} has been successfully added to your inventory.`,
          });
          handleClear();
      });
  }
  
  const handleManualBarcodeCheck = () => {
    if(!barcode) {
        toast({variant: "destructive", title: "QR Code Required", description: "Please enter a QR code value."});
        return;
    }
     const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
    const foundItem = inventory.find((item: any) => item.barcode === barcode);

    if (foundItem) {
        toast({
            title: "Medicine Found!",
            description: `${foundItem.medName} is already in the system.`,
        });
        setMedName(foundItem.medName);
    } else {
        toast({
            variant: 'default',
            title: "New QR Code",
            description: "Please fill in the rest of the details for this new medicine.",
        });
    }
    setScannedData({barcode});
    setIsManualEntry(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const html5QrCode = new Html5Qrcode( "reader", false);
      html5QrCode.scanFile(file, true)
        .then(decodedText => {
            handleBarcodeDetection(decodedText);
        })
        .catch(err => {
            toast({variant: "destructive", title: "Scan failed", description: "Could not read QR code from image."});
        });
    }
  };

  const isFormVisible = scannedData || isManualEntry;
  const isFormValid = medName && batchNo && mfgDate && expiryDate && quantity && supplier && barcode;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {!isFormVisible && (
        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <Camera className="h-6 w-6" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Place a medicine's QR code in the viewfinder, or upload/enter it manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div id="reader" className="w-full"></div>
          </CardContent>
           <CardFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full" onClick={() => setIsManualEntry(true)}>
                <Keyboard className="mr-2 h-4 w-4" />
                Enter QR Code Manually
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload QR Code
            </Button>
            <Input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
           </CardFooter>
        </Card>
      )}

      {isFormVisible && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font_headline">
                    <Package className="h-6 w-6" />
                    Medicine Details
                </CardTitle>
                <CardDescription>
                    Fill in the details for the new medicine below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="barcode">QR Code</Label>
                    <div className="flex gap-2">
                        <Input id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} readOnly={!!scannedData && !isManualEntry} />
                        {isManualEntry && !scannedData && (
                            <Button onClick={handleManualBarcodeCheck}>Check</Button>
                        )}
                    </div>
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
            </CardContent>
             <CardFooter className="grid grid-cols-2 gap-2">
                <Button onClick={handleSaveMedicine} disabled={isSaving || !isFormValid} className="w-full">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory</>}
                </Button>
                <Button onClick={handleClear} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear & Rescan
                </Button>
            </CardFooter>
          </Card>
           <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Info className="h-10 w-10" />
                    <p className="font-medium">Please fill out all fields to add the medicine to your inventory.</p>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
