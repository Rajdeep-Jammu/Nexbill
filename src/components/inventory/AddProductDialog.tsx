"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProductForm } from "./AddProductForm";
import { ReactNode, useState } from "react";

export default function AddProductDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background border-border overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Add New Product
          </DialogTitle>
        </DialogHeader>
        <AddProductForm onFormSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
