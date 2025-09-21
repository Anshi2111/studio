'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Upload, Database, Cloud, Search } from 'lucide-react';
import { fetchMedicineDetails } from '@/app/actions/medication-guide';
import type { MedicineDetailsOutput } from '@/ai/flows/get-medicine-details';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { Input } from './ui/input';
import Link from 'next/link';


export function QRCodeScannerClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MedicineDetailsOutput | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; qrCode?: string } | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalysis = useCallback((qrCode: string) => {
    setErrorInfo(null);
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
        setErrorInfo({ message: errorMessage, qrCode: response.qrCode });
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
    
    function onScanSuccess(decodedText: string) {
      if (scanner.getState() === 2) { // 2 === SCANNING
        scanner.pause();
        handleAnalysis(decodedText);
      }
    }

    scanner.render(onScanSuccess, undefined);

    return () => {
       if (scanner && scanner.getState() !== 1) { // 1 === NOT_STARTED
        scanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [handleAnalysis]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Html5Qrcode.getCameras().then(() => {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCode.scanFile(file, true)
            .then(decodedText => {
                handleAnalysis(decodedText);
            })
            .catch(err => {
                toast({
                    variant: "destructive",
                    title: "Scan Failed",
                    description: "Could not decode QR code from the uploaded image.",
                });
            });
    }).catch(err => {
        console.error("Cannot get camera permissions for file scan", err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not initialize scanner to read the file.",
        });
    });
  };

  const handleRescan = () => {
      // This is a bit of a hack. The library doesn't expose a simple way to resume.
      // Reloading the component is the most reliable way to re-trigger the scanner.
      window.location.reload();
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
             {errorInfo && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Scan Failed</AlertTitle>
                  <AlertDescription>
                    {errorInfo.message}
                    {errorInfo.qrCode && (
                       <Link href={`https://www.google.com/search?q=${encodeURIComponent(errorInfo.qrCode)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 underline">
                           <Search className="h-4 w-4" />
                           Search for this code on Google
                       </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}
        </CardContent>
         <CardFooter className="grid grid-cols-2 gap-2">
            <Button onClick={handleRescan} disabled={isPending || (!result && !errorInfo)}>
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
        {!isPending && !result && !errorInfo && (
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
