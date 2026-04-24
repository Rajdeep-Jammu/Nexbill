"use client";

import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PinInput } from "@/components/auth/PinInput";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ChangePinDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  
  const { toast } = useToast();
  const { pin: storedPin, changePin } = useAuthStore();

  const handlePinChange = () => {
    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      toast({ variant: "destructive", title: "Invalid input", description: "All PINs must be 4 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ variant: "destructive", title: "PINs do not match", description: "Your new PIN and confirmation PIN must be the same." });
      setConfirmPin("");
      return;
    }
    if (currentPin !== storedPin) {
        toast({ variant: "destructive", title: "Incorrect current PIN", description: "The current PIN you entered is incorrect." });
        setCurrentPin("");
        return;
    }

    setIsChanging(true);
    setTimeout(() => {
        const success = changePin(currentPin, newPin);
        if (success) {
            toast({ title: "Success", description: "Your PIN has been changed successfully." });
            setOpen(false);
            resetForm();
        } else {
            toast({ variant: "destructive", title: "Error", description: "Could not change PIN. Please try again." });
        }
        setIsChanging(false);
    }, 500);
  };

  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetForm();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
            <div className="space-y-2">
                <Label>Current PIN</Label>
                <PinInput value={currentPin} onChange={setCurrentPin} />
            </div>
            <div className="space-y-2">
                <Label>New PIN</Label>
                <PinInput value={newPin} onChange={setNewPin} />
            </div>
            <div className="space-y-2">
                <Label>Confirm New PIN</Label>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handlePinChange} disabled={isChanging}>
            {isChanging ? <Loader2 className="animate-spin" /> : "Change PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
