"use client";

import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrintableBill } from "./PrintableBill";
import type { CartItem } from "@/lib/types";
import { Printer, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    const [isDownloading, setIsDownloading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

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

    const handleDownload = async () => {
        setIsDownloading(true);
        const printableContent = printableRef.current;
        if (!printableContent) {
            setIsDownloading(false);
            return;
        }

        try {
            const canvas = await html2canvas(printableContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width + 40, canvas.height + 40] 
            });
            pdf.addImage(imgData, 'PNG', 20, 20, canvas.width, canvas.height);
            pdf.save(`bill-${Date.now()}.pdf`);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setIsDownloading(false);
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
                        <Button onClick={handlePrint} disabled={isPrinting || isDownloading}>
                            {isPrinting ? <Loader2 className="animate-spin" /> : <Printer />}
                            Print
                        </Button>
                        <Button onClick={handleDownload} disabled={isPrinting || isDownloading}>
                           {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                            Download
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
