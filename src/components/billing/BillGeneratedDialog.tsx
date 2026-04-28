"use client";

import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrintableBill } from "./PrintableBill";
import type { CartItem } from "@/lib/types";
import { Printer, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

    const handleUploadPdf = async () => {
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
                description: 'Please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY are set in your .env file to upload PDFs.'
            });
            setIsUploading(false);
            return;
        }
    
        try {
            const canvas = await html2canvas(printableContent, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width + 40, canvas.height + 40] 
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
            
            const pdfBlob = pdf.output('blob');
    
            const { timestamp, signature, error } = await getCloudinarySignatureAction('bills');
            if (error) throw new Error(error);
    
            const formData = new FormData();
            formData.append('file', pdfBlob, `bill-${Date.now()}.pdf`);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('folder', 'bills');
    
            const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                setDownloadUrl(data.secure_url);
                toast({title: "PDF uploaded!", description: "Download link is available."})
            } else {
                 const errorData = await response.json();
                 throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
            }
    
        } catch (error: any) {
            console.error("Error creating or uploading PDF:", error);
            setUploadError(error.message || "Failed to create or upload PDF.");
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
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{title || 'Bill Generated'}</DialogTitle>
                </DialogHeader>
                <div className="my-4 border rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
                    <PrintableBill ref={printableRef} items={billData.items} total={billData.total} />
                </div>
                <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                    <Button variant="outline" onClick={handleClose}>{title ? "Close" : "Close & New Bill"}</Button>
                    <div className="flex items-center gap-2 justify-end">
                        <Button onClick={handlePrint} disabled={isPrinting}>
                            {isPrinting ? <Loader2 className="animate-spin" /> : <Printer />}
                            Print
                        </Button>
                        <Button onClick={handleUploadPdf} disabled={isUploading || !!downloadUrl}>
                            {isUploading ? <Loader2 className="animate-spin" /> : <Download />}
                            {downloadUrl ? "Uploaded" : "Save & Get Link"}
                        </Button>
                        {downloadUrl && (
                            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                            <Button>
                                <Download className="mr-2" /> Download PDF
                            </Button>
                            </a>
                        )}
                    </div>
                </DialogFooter>
                 {uploadError && <p className="text-destructive text-sm text-center pt-2">{uploadError}</p>}
            </DialogContent>
        </Dialog>
    );
}
