'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleAnalysis = useCallback((imageDataUri: string) => {
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
  }, [toast]);
  
  const handleCodeScanned = useCallback((scannedCode: string) => {
    // This is a dummy function now, the real logic is in the scanner setup
    // We can use it to create an image from the video feed
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageDataUri = canvas.toDataURL('image/png');
            handleAnalysis(imageDataUri);
            return;
        }
    }
    // Fallback if video snapshot fails
    toast({
        variant: 'destructive',
        title: 'Scan Error',
        description: 'Could not capture QR code image from video. Please try uploading a file.',
    });
  }, [handleAnalysis, toast]);

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
    scannerRef.current = scanner;

    function onScanSuccess(decodedText: string, decodedResult: any) {
        setIsScanning(false);
        scanner.pause();
        handleCodeScanned(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }
    
    if (document.getElementById('reader')?.innerHTML === "") {
        scanner.render(onScanSuccess, onScanFailure).then(() => {
             const videoElement = document.querySelector('#reader video');
             if(videoElement) {
                videoRef.current = videoElement as HTMLVideoElement;
             }
        });
        setIsScanning(scanner.isScanning);
    }


    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [handleCodeScanned]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          handleAnalysis(dataUri);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleRescan = () => {
      setResult(null);
      setError(null);
      if(scannerRef.current && !isScanning && scannerRef.current.getState() !== 2) {
          scannerRef.current.render(
            (decodedText) => {
              setIsScanning(false);
              scannerRef.current?.pause();
              handleCodeScanned(decodedText);
            },
            (error) => { /* fail */ }
          ).then(() => {
             const videoElement = document.querySelector('#reader video');
             if(videoElement) {
                videoRef.current = videoElement as HTMLVideoElement;
             }
          });
          setIsScanning(true);
      } else if (scannerRef.current && scannerRef.current.getState() === 3 /* PAUSED */) {
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
            <Button onClick={handleRescan} disabled={isPending}>
                {isScanning && !result ? (
                    <>
                        <ScanLine className="mr-2 h-4 w-4 animate-pulse" />
                        Scanning...
                    </>
                ) : (
                    'Scan Again'
                )}
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
