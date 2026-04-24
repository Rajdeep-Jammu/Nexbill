"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { useAuthStore } from "@/hooks/use-auth-store";
import { Logo } from "@/components/Logo";
import { PinInput } from "@/components/auth/PinInput";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { shopName, pin: storedPin, login } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs on the client after hydration
    const authState = useAuthStore.getState();
    if (!authState.shopName || !authState.pin) {
      router.replace("/welcome");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      if (pin === storedPin) {
        login();
        toast({
          title: "Success",
          description: `Welcome back, ${shopName}!`,
        });
        router.replace("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Incorrect PIN. Please try again.",
        });
        setPin("");
      }
      setIsLoggingIn(false);
    }, 500);
  };
  
  const handleBiometric = () => {
    if (storedPin) {
      setPin(storedPin);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-border bg-card/50 p-8 shadow-2xl"
      >
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="mt-6 font-headline text-3xl font-bold text-foreground">
          Welcome to {shopName}
        </h1>
        <p className="mt-2 text-muted-foreground">Enter your PIN to continue</p>

        <div className="my-8 flex items-center gap-4">
          <PinInput value={pin} onChange={setPin} />
        </div>

        <div className="flex w-full flex-col gap-4">
          <Button
            onClick={handleLogin}
            disabled={pin.length !== 4 || isLoggingIn}
            className="w-full text-base font-bold"
            size="lg"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" /> : "Login"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 text-base font-bold"
            onClick={handleBiometric}
          >
            <Fingerprint className="h-5 w-5 text-primary" />
            Use Biometric
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Not your shop?{" "}
          <Link href="/welcome" className="text-primary hover:underline">
            Set up a new one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
