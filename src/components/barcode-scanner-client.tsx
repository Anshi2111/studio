'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, ScanLine, Info, Volume2, Play } from 'lucide-react';
import type { BarcodeMedicationInfoOutput } from '@/ai/flows/barcode-medication-info';
import { getBarcodeInfo } from '@/app/actions/medication-guide';

export function BarcodeScannerClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BarcodeMedicationInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

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
          description: 'Please enable camera permissions in your browser settings to use this feature.',
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
    setResult(null);

    startTransition(async () => {
      const response = await getBarcodeInfo({ barcodeImage: imageDataUri });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to get information for this barcode.');
      }
    });
  };
  
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

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
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-slate-200" autoPlay muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ScanLine className="h-2/3 w-2/3 text-white/50 animate-pulse" />
          </div>
          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature. You may need to change permissions in your browser settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleScan} disabled={isPending || !hasCameraPermission} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Barcode...
              </>
            ) : (
              'Scan'
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
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Scan Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
