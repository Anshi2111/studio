'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Package, PlusCircle, ServerCrash, User, Phone, Hash } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Mock functions, same as in add-medicine-client
const MOCK_INVENTORY_KEY = 'healthure-inventory';

const detectBarcode = (imageDataUri: string): string | null => {
    console.log("Simulating barcode detection for sale:", imageDataUri.substring(0, 30) + "...");
    // Return a mock barcode. In a real app, this would detect a barcode from the image.
    // To test a "found" item, the mock inventory needs to have this barcode.
    // Let's assume the mock inventory uses the medicine name as a key for simplicity.
    const mockInventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
    if (mockInventory.length > 0) {
        return mockInventory[0].medName; // Return the name of the first item as a mock barcode
    }
    return `UNKNOWN_${Date.now()}`;
};


export function RecordSaleClient() {
  const [isScanning, startScanTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  
  const [scannedMedicine, setScannedMedicine] = useState<{ name: string, expiryDate?: string, mfgDate?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Form state
  const [patientPhone, setPatientPhone] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error('Error accessing camera:', e);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    getCameraPermission();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  const handleScan = () => {
    const imageDataUri = captureFrame();
    if (!imageDataUri) return;

    setError(null);
    setScannedMedicine(null);
    resetForm();

    startScanTransition(() => {
      setTimeout(() => {
        const detectedBarcode = detectBarcode(imageDataUri); // This is the medicine name in our mock setup
        const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
        const foundItem = inventory.find((item: any) => item.medName.toLowerCase() === detectedBarcode?.toLowerCase());

        if (foundItem) {
          setScannedMedicine({
            name: foundItem.medName,
            expiryDate: foundItem.expiryDate,
            mfgDate: foundItem.mfgDate,
          });
          toast({
            title: "Medicine Found!",
            description: `${foundItem.medName} is ready to be sold.`,
          });
        } else {
          setError('This medicine is not in the inventory. Please add it first using the "Add Medicine" page.');
        }
      }, 1000);
    });
  };

  const resetForm = () => {
      setPatientPhone('');
      setQuantity('');
  };
  
  const handleRecordSale = () => {
    if (!scannedMedicine) return;

    startSaveTransition(() => {
        const SALES_RECORDS_KEY = 'healthure-sales-records';
        const salesRecords = JSON.parse(localStorage.getItem(SALES_RECORDS_KEY) || '[]');
        
        const newSale = {
            id: `sale_${Date.now()}`,
            medicineName: scannedMedicine.name,
            patientPhone: patientPhone,
            quantity: parseInt(quantity),
            dateSold: new Date().toISOString(),
            expiryDate: scannedMedicine.expiryDate,
            mfgDate: scannedMedicine.mfgDate,
        };

        salesRecords.unshift(newSale);
        localStorage.setItem(SALES_RECORDS_KEY, JSON.stringify(salesRecords));
        
        console.log("Recording new sale:", newSale);
        toast({
            title: "Sale Recorded!",
            description: `Sale of ${scannedMedicine.name} to ${patientPhone} has been logged.`,
        });

        // In a real app, you would also update the inventory quantity here.

        setScannedMedicine(null);
        resetForm();
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
            Scan the barcode of the medicine you want to sell.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-slate-200" autoPlay muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ScanLine className="h-2/3 w-2/3 text-white/50 animate-pulse" />
          </div>
          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>Please allow camera access.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full">
            {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : 'Scan Medicine'}
          </Button>
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
            {!scannedMedicine && !isScanning && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10" />
                        <p className="font-medium">Scan a medicine to begin.</p>
                    </div>
                </div>
            )}
            {isScanning && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="font-medium">Identifying medicine...</p>
                    </div>
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <ServerCrash className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
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
