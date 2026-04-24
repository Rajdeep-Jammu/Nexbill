"use client";

import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrintableBill } from "./PrintableBill";
import type { CartItem } from "@/lib/types";
import { Printer } from "lucide-react";

interface BillGeneratedDialogProps {
    billData: {
        items: CartItem[];
        total: number;
    };
    onClose: () => void;
}

export default function BillGeneratedDialog({ billData, onClose }: BillGeneratedDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(billData){
            setIsOpen(true);
        }
    }, [billData]);

    const handlePrint = () => {
        const printableContent = printableRef.current;
        if (!printableContent) {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow?.document;
        if (!doc) {
            document.body.removeChild(iframe);
            return;
        }

        doc.write('<html><head><title>Print Bill</title></head><body></body></html>');
        
        const parentHead = document.head.innerHTML;
        doc.head.innerHTML = parentHead;
        doc.body.innerHTML = printableContent.innerHTML;
        doc.documentElement.className = document.documentElement.className;

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            document.body.removeChild(iframe);
        }, 500);
    };

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Bill Generated</DialogTitle>
                </DialogHeader>
                <div className="my-4">
                    <PrintableBill ref={printableRef} items={billData.items} total={billData.total} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                    <Button onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print / Save PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
