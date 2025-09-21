'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Upload, Database, Cloud } from 'lucide-react';
import { fetchMedicineDetails } from '@/app/actions/medication-guide';
import type { MedicineDetailsOutput } from '@/ai/flows/get-medicine-details';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Input } from './ui/input';

export function QRCodeScannerClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MedicineDetailsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback((qrCode: string) => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await fetchMedicineDetails({ qrCode });
      if (response.success && response.data) {
        setResult(response.data);
         toast({
          title: 'Medicine Found!',
          description: `Details for ${response.data.name} loaded from ${response.data.source === 'firestore' ? 'your database' : 'a public source'}.`,
        });
      } else {
        const errorMessage = response.error || 'Failed to get information for this QR code.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: errorMessage,
        });
      }
    });
  }, [toast]);

  useEffect(() => {
    if (document.getElementById('reader')?.innerHTML !== "") return;

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
      if (scanner.getState() === 2) { // 2 === SCANNING
        scanner.pause();
        handleAnalysis(decodedText);
      }
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }
    
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current && scannerRef.current.getState() !== 1) { // 1 === NOT_STARTED
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [handleAnalysis]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          // This is a placeholder for file-based QR code scanning
          // For a real implementation, you would use a library to decode the QR from the image
           toast({
            title: "File Uploaded",
            description: "File-based QR code scanning is not fully implemented in this example. Use the live scanner.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRescan = () => {
      setResult(null);
      setError(null);
      if(scannerRef.current && scannerRef.current.getState() === 3 /* PAUSED */) {
        scannerRef.current.resume();
      }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan Medication QR Code
          </CardTitle>
          <CardDescription>
            Point your camera at the QR code or upload an image to get instant information.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
            <div id="reader" className="w-full"></div>
             {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Scan Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
        </CardContent>
         <CardFooter className="grid grid-cols-2 gap-2">
            <Button onClick={handleRescan} disabled={isPending || (!result && !error)}>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Again
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

      <div className="flex flex-col gap-4">
        {isPending && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Fetching medicine data...</p>
              <p className="text-sm">This may take a moment.</p>
            </div>
          </div>
        )}
        
        {result && (
          <Card className="shadow-lg animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-xl font-headline">
                <div className="flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" />
                    {result.name}
                </div>
                 {result.source === 'firestore' ? <Database className="h-5 w-5 text-green-500" title="From your database"/> : <Cloud className="h-5 w-5 text-blue-500" title="From public source"/>}
              </CardTitle>
              <CardDescription>
                Batch: {result.batchNo} | Supplier: {result.supplier}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>QR Code:</strong> {result.qrCode}</p>
              <p><strong>Mfg. Date:</strong> {result.mfgDate}</p>
              <p><strong>Expiry Date:</strong> {result.expDate}</p>
              <p><strong>Initial Quantity:</strong> {result.quantity}</p>
            </CardContent>
          </Card>
        )}
        {!isPending && !result && !error && (
             <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Info className="h-10 w-10" />
                    <p className="font-medium">Medication information will appear here.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
