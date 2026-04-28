'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import CameraCapture from './CameraCapture';

interface ImageInputProps {
  onChange: (file: File | null) => void;
  initialImageUrl?: string | null;
}

export default function ImageInput({ onChange, initialImageUrl }: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This allows the preview to update if the initialImageUrl prop changes
    // (e.g., after a successful save in the settings page)
    if (!preview?.startsWith('data:')) { // Don't override a new local preview
        setPreview(initialImageUrl || null);
    }
  }, [initialImageUrl, preview]);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleCapture = (dataUrl: string) => {
    setPreview(dataUrl);
    const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
    onChange(file);
  };
  
  const handleRemoveImage = () => {
      setPreview(null);
      onChange(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square max-w-sm mx-auto border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
        {preview ? (
          <Image src={preview} alt="Image preview" layout="fill" objectFit="contain" />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Image Preview</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)}>
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        {preview && (
            <Button type="button" variant="destructive" size="icon" onClick={handleRemoveImage}>
                <Trash2 className="h-4 w-4"/>
            </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />

      <CameraCapture
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={handleCapture}
      />
    </div>
  );
}
