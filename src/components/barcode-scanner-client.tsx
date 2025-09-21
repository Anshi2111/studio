'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Volume2, Upload } from 'lucide-react';
import type { QRCodeMedicationInfoOutput } from '@/ai/flows/qrcode-medication-info';
import { getQRCodeInfo } from '@/app/actions/medication-guide';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Input } from './ui/input';

export function QRCodeScannerClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<QRCodeMedicationInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!isScanning) return;
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText: string) => {
        setIsScanning(false);
        const videoElement = document.getElementById('reader__video') as HTMLVideoElement;
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const imageDataUri = canvas.toDataURL('image/png');
        handleAnalysis(imageDataUri);
    };

    const onScanFailure = (err: any) => {
        // console.warn(err);
    };

    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
      .catch((err) => {
        setError("Could not start QR code scanner. Please check camera permissions.");
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [isScanning]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          handleAnalysis(dataUri);
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = (imageDataUri: string) => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await getQRCodeInfo({ qrCodeImage: imageDataUri });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to get information for this QR code.');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not retrieve information for the scanned QR code.',
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
      setIsScanning(true);
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
            <div id="reader" className="w-full aspect-square bg-gray-100 rounded-md"></div>
             {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Scan Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
        </CardContent>
         <CardFooter className="grid grid-cols-2 gap-2">
            <Button onClick={handleRescan} disabled={isScanning || isPending}>
                {isScanning ? (
                    <>
                        <ScanLine className="mr-2 h-4 w-4 animate-pulse" />
                        Scanning...
                    </>
                ) : (
                    'Scan Again'
                )}
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
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
                Summary of the medication based on the scanned QR code.
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
        {!isPending && !result && (
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
