'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Search } from 'lucide-react';
import { fetchMedicineDetails } from '@/app/actions/medication-guide';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';

interface QRCodeAddMedicineClientProps {
    onScan: (data: { name: string; expDate: string }) => void;
}

export function QRCodeAddMedicineClient({ onScan }: QRCodeAddMedicineClientProps) {
  const [isPending, startTransition] = useTransition();
  const [errorInfo, setErrorInfo] = useState<{ message: string; qrCode?: string } | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleAnalysis = useCallback((qrCode: string) => {
    setErrorInfo(null);
    setHasScanned(true);

    startTransition(async () => {
      const response = await fetchMedicineDetails({ qrCode });
      if (response.success && response.data) {
        onScan({ name: response.data.name, expDate: response.data.expDate });
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
  }, [toast, onScan]);

  const onScanSuccess = useCallback((decodedText: string) => {
      if (scannerRef.current) {
        try {
            scannerRef.current.pause(true);
        } catch(e) {
            console.error("Failed to pause scanner", e);
        }
      }
      handleAnalysis(decodedText);
  }, [handleAnalysis]);

  const handleRescan = () => {
    setHasScanned(false);
    setErrorInfo(null);
    if (scannerRef.current) {
        try {
            scannerRef.current.resume();
        } catch (e) {
            console.error("Failed to resume scanner", e)
        }
    }
  }

  useEffect(() => {
    // Do not render the scanner if it's already been cleared or exists.
    if (document.getElementById('add-med-reader')?.innerHTML !== "" || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'add-med-reader',
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
        rememberLastUsedCamera: true,
      },
      false // verbose
    );
    
    scanner.render(onScanSuccess, undefined);
    scannerRef.current = scanner;

    return () => {
       if (scannerRef.current) {
        try {
            scannerRef.current.clear();
        } catch(e) {
             console.error("Failed to clear html5QrcodeScanner on unmount.", e);
        } finally {
            scannerRef.current = null;
        }
      }
    };
  }, [onScanSuccess]);


  return (
    <Card className="shadow-lg mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan QR to Add
          </CardTitle>
          <CardDescription>
            Scan a QR code to pre-fill the name and expiry date in the form.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
            <div id="add-med-reader" className={hasScanned ? 'hidden' : ''}></div>

            {isPending && (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="font-medium">Fetching medicine data...</p>
                </div>
              </div>
            )}

            {!isPending && hasScanned && !errorInfo && (
                <Alert>
                    <AlertTitle>Scan Successful!</AlertTitle>
                    <AlertDescription>
                        The medicine details have been pre-filled. Switch to the "Manual Entry" tab to see them and save.
                    </AlertDescription>
                </Alert>
            )}

             {errorInfo && (
                <Alert variant="destructive">
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
         <CardFooter>
            <Button onClick={handleRescan} className="w-full" disabled={isPending || !hasScanned}>
              <ScanLine className="mr-2 h-4 w-4" />
              Scan Another
            </Button>
        </CardFooter>
    </Card>
  );
}
