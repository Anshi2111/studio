'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Package, PlusCircle, ServerCrash } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

// This is a mock database of barcodes. In a real app, this would be a database call.
const MOCK_BARCODE_DB: { [key: string]: { name: string } } = {
    "0123456789012": { name: "Tylenol" },
    "9876543210987": { name: "Advil" },
};

// Mock function to simulate barcode detection from an image
const detectBarcode = (imageDataUri: string): string | null => {
    // In a real app, you'd use a library like `zxing-js` here.
    // For this demo, we'll just return a mock barcode to simulate a "not found" case.
    console.log("Simulating barcode detection for:", imageDataUri.substring(0, 30) + "...");
    return `MOCK_${Date.now()}`;
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
      // Simulate a network delay
      setTimeout(() => {
        const detectedBarcode = detectBarcode(imageDataUri);
        if (detectedBarcode) {
          const medicineInfo = MOCK_BARCODE_DB[detectedBarcode];
          if (medicineInfo) {
            setScannedData({ barcode: detectedBarcode, name: medicineInfo.name });
             toast({
                title: "Medicine Found!",
                description: `${medicineInfo.name} is already in the system. You can add it to inventory.`,
            });
            setMedName(medicineInfo.name);
          } else {
            setScannedData({ barcode: detectedBarcode });
             toast({
                variant: 'destructive',
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
          // In a real app, you would save this to your database/inventory.
          // For now, we just show a success toast.
          const newMedicine = { medName, batchNo, mfgDate, expiryDate, quantity, supplier };
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
