"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { Logo } from "@/components/Logo";
import { PinInput } from "@/components/auth/PinInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const setupShop = useAuthStore((state) => state.setup);
  const { toast } = useToast();

  const handleNext = () => {
    if (shopName.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Shop name must be at least 3 characters long.",
      });
      return;
    }
    setStep(2);
  };

  const handleSetup = () => {
    if (pin.length !== 4) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Your PIN must be 4 digits long.",
      });
      return;
    }
    if (pin !== confirmPin) {
      toast({
        variant: "destructive",
        title: "PIN Mismatch",
        description: "The confirmation PIN does not match.",
      });
      setConfirmPin("");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setupShop(shopName, pin);
      toast({
        title: "Setup Complete!",
        description: `Welcome to ${shopName}. Your shop is ready.`,
      });
      router.replace("/admin/login");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-border bg-card/50 p-8 shadow-2xl"
      >
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">
          {step === 1 ? "Let's Get Started" : "Set Your Security PIN"}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {step === 1
            ? "First, what's the name of your shop?"
            : "This PIN will be used to secure your shop data."}
        </p>

        {step === 1 ? (
          <div className="mt-8 w-full space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                placeholder="e.g., The Corner Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <Button
              onClick={handleNext}
              className="w-full text-base font-bold"
              size="lg"
              disabled={shopName.trim().length < 3}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="mt-8 w-full space-y-6">
            <div className="space-y-2">
              <Label>Create a 4-digit PIN</Label>
              <PinInput value={pin} onChange={setPin} />
            </div>
            <div className="space-y-2">
              <Label>Confirm your PIN</Label>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <Button
              onClick={handleSetup}
              className="w-full text-base font-bold"
              size="lg"
              disabled={pin.length !== 4 || confirmPin.length !== 4 || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Finish Setup"}
            </Button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
