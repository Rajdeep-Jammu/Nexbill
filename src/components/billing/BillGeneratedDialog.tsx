
'use client';

import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrintableBill } from "./PrintableBill";
import type { CartItem } from "@/lib/types";
import { Printer, Download, Loader2, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { getCloudinarySignatureAction } from "@/lib/actions/cloudinary";
import { useToast } from "@/hooks/use-toast";

interface BillGeneratedDialogProps {
    billData: {
        items: CartItem[];
        total: number;
    };
    onClose: () => void;
    title?: string;
}

export default function BillGeneratedDialog({ billData, onClose, title }: BillGeneratedDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const printableRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if(billData){
            setIsOpen(true);
        }
    }, [billData]);

    const handlePrint = () => {
        setIsPrinting(true);
        const printableContent = printableRef.current;
        if (!printableContent) {
            setIsPrinting(false);
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow?.document;
        if (!doc) {
            document.body.removeChild(iframe);
            setIsPrinting(false);
            return;
        }
        
        doc.open();
        doc.write('<html><head><title>Print Bill</title></head><body></body></html>');
        
        Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach(node => {
            doc.head.appendChild(node.cloneNode(true));
        });

        doc.body.innerHTML = printableContent.innerHTML;
        doc.documentElement.className = document.documentElement.className;
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch(e) {
                console.error("Print failed:", e);
            } finally {
                document.body.removeChild(iframe);
                setIsPrinting(false);
            }
        }, 500);
    };

    const handleSaveAsImage = async () => {
        setIsUploading(true);
        setUploadError(null);
        setDownloadUrl(null);
        const printableContent = printableRef.current;
        if (!printableContent) {
            setIsUploading(false);
            setUploadError("Printable content not found.");
            return;
        }

        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
            toast({
                variant: 'destructive',
                title: 'Cloudinary Not Configured',
                description: 'Please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY are set in your .env file.'
            });
            setIsUploading(false);
            return;
        }
    
        try {
            // Wait a tiny bit for any remaining layout stabilization
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(printableContent, { 
                scale: 3, // Higher scale for better image quality
                useCORS: true, 
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Convert data URL to Blob for upload
            const blobResponse = await fetch(imgData);
            const blob = await blobResponse.blob();
    
            const { timestamp, signature, error } = await getCloudinarySignatureAction('bills');
            if (error) throw new Error(error);
    
            const formData = new FormData();
            formData.append('file', blob, `bill-${Date.now()}.png`);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('folder', 'bills');
    
            // Using image/upload for standard image handling in Cloudinary
            const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                setDownloadUrl(data.secure_url);
                toast({
                    title: "Bill Image Generated!",
                    description: "The bill has been saved as an image."
                });
            } else {
                 const errorData = await response.json();
                 throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
            }
    
        } catch (error: any) {
            console.error("Error creating or uploading image:", error);
            setUploadError(error.message || "Failed to create or upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="font-headline text-2xl font-black">{title || 'Bill Generated'}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="border-4 border-dashed border-primary/10 rounded-3xl overflow-hidden shadow-inner bg-secondary/20">
                        <PrintableBill ref={printableRef} items={billData.items} total={billData.total} />
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 flex-col sm:flex-row gap-3 bg-secondary/5 border-t">
                    <Button variant="ghost" onClick={handleClose} className="rounded-xl font-bold h-12">
                        {title ? "Close" : "Close & New Bill"}
                    </Button>
                    <div className="flex flex-1 items-center gap-2 justify-end">
                        <Button variant="outline" onClick={handlePrint} disabled={isPrinting} className="rounded-xl h-12 gap-2 border-primary/20 hover:bg-primary/5">
                            {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4 text-primary" />}
                            <span className="font-bold">Print</span>
                        </Button>
                        
                        {!downloadUrl ? (
                            <Button onClick={handleSaveAsImage} disabled={isUploading} className="rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 flex-1 sm:flex-initial">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                <span className="font-bold">Save as Image</span>
                            </Button>
                        ) : (
                            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
                                <Button className="w-full rounded-xl h-12 gap-2 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                    <Download className="h-4 w-4" />
                                    <span className="font-bold">Download PNG</span>
                                </Button>
                            </a>
                        )}
                    </div>
                </DialogFooter>
                 {uploadError && <p className="text-destructive text-[10px] font-bold text-center pb-4 uppercase tracking-widest">{uploadError}</p>}
            </DialogContent>
        </Dialog>
    );
}
