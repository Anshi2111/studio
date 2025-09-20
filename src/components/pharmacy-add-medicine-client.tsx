'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Package, PlusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

const MOCK_INVENTORY_KEY = 'healthure-inventory';

// This is a mock barcode detection function. 
const detectBarcode = (imageDataUri: string): string | null => {
    console.log("Simulating barcode detection:", imageDataUri.substring(0, 30) + "...");
    // To simulate different scenarios, we can return different values.
    // In a real app, you'd use a library like `zxing-js`.
    // Let's return a "new" barcode every time to test the "add manually" flow.
    return `NEW_BARCODE_${Date.now()}`;
};

export function AddMedicineClient() {
  const [isScanning, startScanTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [scannedData, setScannedData] = useState<{ barcode: string, name?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Form state
  const [medName, setMedName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');


  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported by your browser.');
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
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
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const captureFrame = () => {
    if (!videoRef.current) {
      setError('Video feed not available.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not get canvas context.');
      return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  const handleScan = () => {
    const imageDataUri = captureFrame();
    if (!imageDataUri) return;

    setError(null);
    setScannedData(null);
    resetForm();

    startScanTransition(() => {
      setTimeout(() => {
        const detectedBarcode = detectBarcode(imageDataUri);
        const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
        const foundItem = inventory.find((item: any) => item.barcode === detectedBarcode);

        if (detectedBarcode) {
          if (foundItem) {
            setScannedData({ barcode: detectedBarcode, name: foundItem.medName });
             toast({
                title: "Medicine Found!",
                description: `${foundItem.medName} is already in the system. You can update its inventory.`,
            });
            setMedName(foundItem.medName);
          } else {
            setScannedData({ barcode: detectedBarcode });
             toast({
                variant: 'default',
                title: "New Medicine Detected",
                description: "This barcode isn't in your system. Please add its details manually.",
            });
          }
        } else {
          setError('Could not detect a barcode. Please try again with a clearer image.');
        }
      }, 1000);
    });
  };

  const resetForm = () => {
      setMedName('');
      setBatchNo('');
      setMfgDate('');
      setExpiryDate('');
      setQuantity('');
      setSupplier('');
  }

  const handleSaveMedicine = () => {
      startSaveTransition(() => {
          // Get current inventory or initialize an empty array
          const inventory = JSON.parse(localStorage.getItem(MOCK_INVENTORY_KEY) || '[]');
          
          const newMedicine = { medName, batchNo, mfgDate, expiryDate, quantity, supplier, barcode: scannedData?.barcode };
          
          // Add the new medicine to the inventory array
          inventory.push(newMedicine);
          
          // Save the updated inventory back to localStorage
          localStorage.setItem(MOCK_INVENTORY_KEY, JSON.stringify(inventory));

          console.log("Saving new medicine:", newMedicine);

          toast({
              title: "Medicine Added!",
              description: `${medName} has been successfully added to your inventory.`,
          });
          setScannedData(null);
          resetForm();
      });
  }

  const isFormValid = medName && batchNo && mfgDate && expiryDate && quantity && supplier;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan Barcode
          </CardTitle>
          <CardDescription>
            Point your camera at a medicine's barcode to begin.
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
              <AlertDescription>
                Please allow camera access.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full">
            {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : 'Scan'}
          </Button>
        </CardFooter>
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
            {!scannedData && !isScanning && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Info className="h-10 w-10" />
                        <p className="font-medium">Scan a barcode to start.</p>
                    </div>
                </div>
            )}
             {isScanning && (
                 <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="font-medium">Checking database...</p>
                    </div>
                </div>
            )}
             {scannedData && (
                 <div className="space-y-3 animate-in fade-in-50">
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
            <CardFooter>
                <Button onClick={handleSaveMedicine} disabled={isSaving || !isFormValid} className="w-full">
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory</>}
                </Button>
            </CardFooter>
         )}
      </Card>

    </div>
  );
}
