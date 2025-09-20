'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Volume2, Play, VideoOff, Video } from 'lucide-react';
import type { BarcodeMedicationInfoOutput } from '@/ai/flows/barcode-medication-info';
import { getBarcodeInfo } from '@/app/actions/medication-guide';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

export function BarcodeScannerClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BarcodeMedicationInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
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

    function onScanSuccess(decodedText: string, decodedResult: any) {
        setIsScanning(false);
        scanner.pause();
        handleBarcodeScanned(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    scanner.render(onScanSuccess, onScanFailure);
    setIsScanning(scanner.isScanning);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.", error);
      });
    };
  }, []);

  const handleBarcodeScanned = (barcode: string) => {
    // We still need to send an "image" to the backend as the AI flow expects it.
    // We'll create a simple canvas image containing the barcode text.
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not create canvas for barcode.');
      return;
    }
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.font = '20px monospace';
    context.textAlign = 'center';
    context.fillText(`Barcode: ${barcode}`, canvas.width / 2, canvas.height / 2);
    const imageDataUri = canvas.toDataURL('image/png');

    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await getBarcodeInfo({ barcodeImage: imageDataUri });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to get information for this barcode.');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not retrieve information for the scanned barcode.',
        });
      }
    });
  };
  
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleRescan = () => {
      setResult(null);
      setError(null);
      if(scannerRef.current && !isScanning) {
          scannerRef.current.resume();
          setIsScanning(true);
      }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-6 w-6" />
            Scan Medication Barcode
          </CardTitle>
          <CardDescription>
            Point your camera at the barcode on your medication packaging to get instant information.
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
         <CardFooter>
            <Button onClick={handleRescan} disabled={isScanning || isPending} className="w-full">
                {isScanning ? (
                    <>
                        <ScanLine className="mr-2 h-4 w-4 animate-pulse" />
                        Scanning...
                    </>
                ) : isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                )
                : (
                    'Scan Again'
                )}
            </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-4">
        {isPending && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center h-full">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Fetching medication data...</p>
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
                    {result.medicationName}
                </div>
                 {result.audioSummary && (
                    <Button variant="outline" size="icon" onClick={playAudio}>
                        <Volume2 className="h-5 w-5" />
                    </Button>
                )}
              </CardTitle>
              <CardDescription>
                Summary of the medication based on the scanned barcode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.summary}</p>
              {result.audioSummary && (
                <audio ref={audioRef} src={result.audioSummary} className="hidden" />
              )}
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
