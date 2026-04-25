'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Check, AlertTriangle, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (dataUrl: string) => void;
}

export default function CameraCapture({ open, onOpenChange, onCapture }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  }, [stream]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!open) {
        cleanup();
        return;
      }
      setIsLoading(true);
      setHasPermission(null);
      
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    getCameraPermission();

    return () => {
      cleanup();
    };
  }, [open, toast, cleanup]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onOpenChange(false);
      }
    }
  };
  
  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
        cleanup();
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          )}
          {hasPermission === false && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <VideoOff className="h-12 w-12 text-destructive mb-4"/>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser to use this feature.
                  </AlertDescription>
                </Alert>
             </div>
          )}
          <video
            ref={videoRef}
            className={`h-full w-full object-cover ${stream ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          />
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <DialogFooter>
          <Button onClick={handleCapture} disabled={!stream}>
            <Check className="mr-2 h-4 w-4" />
            Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
