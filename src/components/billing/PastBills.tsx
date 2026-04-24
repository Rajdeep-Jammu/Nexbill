"use client";

import { useState } from "react";
import { useSalesStore, type Sale } from "@/hooks/use-sales-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Printer, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BillGeneratedDialog from "./BillGeneratedDialog";
import { useToast } from "@/hooks/use-toast";

export default function PastBills() {
  const { sales, deleteSale } = useSalesStore();
  const { toast } = useToast();
  const [billToView, setBillToView] = useState<Sale | null>(null);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (billToDelete) {
      deleteSale(billToDelete);
      toast({
        title: "Bill Deleted",
        description: "The selected bill has been removed.",
      });
      setBillToDelete(null);
    }
  };

  if (sales.length === 0) {
    return (
      <div>
        <h2 className="font-headline text-xl font-semibold mb-4">Past Bills</h2>
        <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
          <p className="text-muted-foreground">No past bills found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="font-headline text-xl font-semibold mb-4">Past Bills</h2>
        <Accordion type="single" collapsible className="w-full">
          {sales.map((sale) => (
            <AccordionItem value={sale.id} key={sale.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span className="font-mono text-sm">{sale.id}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sale.date).toLocaleString()}
                  </span>
                  <span className="font-semibold">₹{sale.total.toLocaleString()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-end items-center gap-2 p-4 bg-muted/50 rounded-md">
                  <Button variant="outline" size="sm" onClick={() => setBillToView(sale)}>
                    <Printer className="mr-2 h-4 w-4" /> Print / View / Download
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setBillToDelete(sale.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {billToView && (
        <BillGeneratedDialog
          billData={billToView}
          onClose={() => setBillToView(null)}
        />
      )}

      <AlertDialog open={!!billToDelete} onOpenChange={(open) => !open && setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bill record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBillToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
