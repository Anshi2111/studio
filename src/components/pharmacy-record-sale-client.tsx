'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Package, PlusCircle, ServerCrash, Phone, Hash, Keyboard, Mail, Upload } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

const MOCK_INVENTORY_KEY = 'healthure-inventory';
const SALES_RECORDS_KEY = 'healthure-sales-records';
const PATIENT_DATABASE_KEY = 'healthure-patient-database';

export function RecordSaleClient() {
  const [isSaving, startSaveTransition] = useTransition();
  
  const [scannedMedicine, setScannedMedicine] = useState<{ name: string, expiryDate?: string, mfgDate?: string, barcode: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [quantity, setQuantity] = useState('');

  const resetForm = () => {
      setPatientPhone('');
      setPatientEmail('');
      setQuantity('');
      setManualBarcode('');
  };
  
  const handleBarcodeScanned = useCallback((barcode: string) => {
    setError(null);
    setScannedMedicine(null);
    resetForm();

    const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
    const foundItem = inventory.find((item: any) => item.barcode && item.barcode.toLowerCase() === barcode.toLowerCase());

    if (foundItem) {
      setScannedMedicine({
        name: foundItem.medName,
        expiryDate: foundItem.expiryDate,
        mfgDate: foundItem.mfgDate,
        barcode: barcode
      });
      toast({
        title: "Medicine Found!",
        description: `${foundItem.medName} is ready to be sold.`,
      });
    } else {
      setError(`QR Code "${barcode}" not found in inventory. Please add the medicine first.`);
      toast({
          variant: "destructive",
          title: "Medicine Not Found",
          description: "This QR code is not in your inventory system."
      })
    }
  }, [toast]);

  useEffect(() => {
    if (isManualEntry || scannedMedicine) {
        if(scannerRef.current?.isScanning) {
            scannerRef.current.clear();
        }
        return;
    };
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

    function onScanSuccess(decodedText: string, decodedResult: any) {
        if (scannerRef.current?.isScanning) {
            scanner.pause();
            handleBarcodeScanned(decodedText);
        }
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    if (document.getElementById('reader')?.innerHTML === "") {
       scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
    }
    
    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 is SCANNING state
        scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [isManualEntry, scannedMedicine, handleBarcodeScanned]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const html5QrCode = new Html5Qrcode( "reader", false);
      html5QrCode.scanFile(file, true)
        .then(decodedText => {
            handleBarcodeScanned(decodedText);
        })
        .catch(err => {
            toast({variant: "destructive", title: "Scan failed", description: "Could not read QR code from image."});
        });
    }
  };

  const handleRescan = () => {
      setScannedMedicine(null);
      setError(null);
      setIsManualEntry(false);
      resetForm();
  }
  
  const handleRecordSale = () => {
    if (!scannedMedicine) return;

    startSaveTransition(() => {
        const patients = JSON.parse(localStorage.getItem(PATIENT_DATABASE_KEY) || '[]');
        let patientRecord = patients.find((p: any) => p.phone === patientPhone);

        if (!patientRecord) {
            patientRecord = {
                phone: patientPhone,
                email: patientEmail,
                name: `Patient ${patientPhone.slice(-4)}`, 
                createdAt: new Date().toISOString(),
            };
            patients.push(patientRecord);
            toast({
                title: "New Patient Created",
                description: `A new patient record has been created for phone number ${patientPhone}.`,
            });
        } else if (patientEmail && !patientRecord.email) {
            patientRecord.email = patientEmail;
        }
        localStorage.setItem(PATIENT_DATABASE_KEY, JSON.stringify(patients));

        const salesRecords = JSON.parse(localStorage.getItem(SALES_RECORDS_KEY) || '[]');
        
        const newSale = {
            id: `sale_${Date.now()}`,
            medicineName: scannedMedicine.name,
            patientPhone: patientPhone,
            patientEmail: patientEmail,
            quantity: parseInt(quantity),
            dateSold: new Date().toISOString(),
            expiryDate: scannedMedicine.expiryDate,
            mfgDate: scannedMedicine.mfgDate,
        };

        salesRecords.unshift(newSale);
        localStorage.setItem(SALES_RECORDS_KEY, JSON.stringify(salesRecords));
        
        toast({
            title: "Sale Recorded!",
            description: `Sale of ${scannedMedicine.name} to ${patientPhone} has been logged.`,
        });


        handleRescan();
    });
  };

  const isFormValid = patientPhone && quantity && parseInt(quantity) > 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan Medicine to Sell
          </CardTitle>
          <CardDescription>
            Scan, upload, or enter the QR code manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
            {!scannedMedicine && !isManualEntry && <div id="reader" className="w-full"></div>}
            {error && !scannedMedicine && (
                <Alert variant="destructive" className="mt-4">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Scan Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {isManualEntry && !scannedMedicine && (
                <div className="space-y-4">
                    <Label htmlFor="manual-barcode">QR Code Value</Label>
                    <Input id="manual-barcode" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder="Enter QR code..."/>
                    <Button className="w-full" onClick={() => handleBarcodeScanned(manualBarcode)}>Find Medicine</Button>
                </div>
            )}
             {scannedMedicine && (
                <Alert>
                    <Package className="h-4 w-4" />
                    <AlertTitle>{scannedMedicine.name}</AlertTitle>
                    <AlertDescription>QR Code scanned successfully. Fill in the sale details to proceed.</AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter className="grid gap-2 grid-cols-2">
            <Button onClick={handleRescan} className="w-full" variant={scannedMedicine ? "outline" : "default"}>
                <ScanLine className="mr-2 h-4 w-4" />
                {scannedMedicine || isManualEntry ? 'New Sale' : 'Scanning...'}
            </Button>
             <Button variant="outline" className="w-full" onClick={() => { setIsManualEntry(prev => !prev); setError(null); setScannedMedicine(null); }}>
                <Keyboard className="mr-2 h-4 w-4" />
                {isManualEntry ? 'Use Scanner' : 'Enter Manually'}
            </Button>
            <div className="col-span-2">
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
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
            </div>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <Info className="h-6 w-6" />
                Sale Details
            </CardTitle>
            <CardDescription>
                Enter the patient's phone and quantity sold.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {!scannedMedicine && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10" />
                        <p className="font-medium">Scan or enter a medicine QR code to begin.</p>
                    </div>
                </div>
            )}
            {scannedMedicine && (
                 <div className="space-y-4 animate-in fade-in-50">
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                {scannedMedicine.name}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="space-y-2">
                        <Label htmlFor="patient-phone">Patient's Phone Number</Label>
                        <div className="relative">
                             <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="patient-phone" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="e.g., 123-456-7890" className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="patient-email">Patient's Email (Optional)</Label>
                        <div className="relative">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="patient-email" type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="e.g., patient@example.com" className="pl-10" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity Sold</Label>
                         <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 1" className="pl-10" />
                        </div>
                    </div>
                 </div>
             )}
        </CardContent>
         {scannedMedicine && (
            <CardFooter>
                <Button onClick={handleRecordSale} disabled={isSaving || !isFormValid} className="w-full">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Record Sale</>}
                </Button>
            </CardFooter>
         )}
      </Card>
    </div>
  );
}
