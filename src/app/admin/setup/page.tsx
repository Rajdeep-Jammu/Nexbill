'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, getDoc } from 'firebase/firestore';

import { useAuthStore } from '@/hooks/use-auth-store';
import { Logo } from '@/components/Logo';
import { PinInput } from '@/components/auth/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';

type PublicConfig = {
  activeShopId: string;
  shopName: string;
};

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [existingShopConfig, setExistingShopConfig] = useState<PublicConfig | null>(null);

  const router = useRouter();
  const { setup, loadShopContext, setPin: setAuthPin, shopId: existingShopId } = useAuthStore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to set up or join a shop.',
      });
      router.replace('/login');
    }
  }, [user, isUserLoading, router, toast]);

  // If a shop is already configured in the store, redirect away from setup.
  useEffect(() => {
    if (existingShopId) {
      router.replace('/admin/login');
    }
  }, [existingShopId, router]);
  
  // Check for an existing public shop config.
  useEffect(() => {
    const checkConfig = async () => {
      if (firestore && !existingShopId) {
          const configRef = doc(firestore, 'public', 'config');
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            const configData = configSnap.data() as PublicConfig;
            setExistingShopConfig(configData);
            setShopName(configData.shopName);
            setStep(1); // Stay on step 1 to enter secret code
          }
      }
      setIsCheckingConfig(false);
    };

    if(!isUserLoading && !existingShopId) {
      checkConfig();
    } else {
      setIsCheckingConfig(false);
    }
  }, [firestore, isUserLoading, existingShopId]);


  const handleNext = () => {
    if (shopName.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Shop name must be at least 3 characters long.',
      });
      return;
    }
    setStep(2);
  };

  const handleSetup = async () => {
    if (pin.length !== 4) {
      toast({ variant: 'destructive', title: 'Invalid PIN', description: 'Your PIN must be 4 digits long.' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ variant: 'destructive', title: 'PIN Mismatch', description: 'The confirmation PIN does not match.' });
      setConfirmPin('');
      return;
    }
    if (!user) {
      toast({ variant: 'destructive', title: 'Setup Failed', description: 'User not found. Please log in again.'});
      return;
    }

    setIsSubmitting(true);
    
    try {
      // If an existing shop config was found, the user is JOINING it.
      if (existingShopConfig) {
        const shopRef = doc(firestore, 'shops', existingShopConfig.activeShopId);
        const shopSnap = await getDoc(shopRef);
        if (!shopSnap.exists()) {
            throw new Error("The permanent shop's data could not be found. Please contact support.");
        }

        const shopData = shopSnap.data();

        // Validate the secret code
        if (shopData.secretCode !== secretCode.toUpperCase()) {
            toast({
                variant: 'destructive',
                title: 'Invalid Secret Code',
                description: 'The invite code you entered is incorrect. Please check with the shop owner.',
            });
            setIsSubmitting(false);
            return;
        }

        const { id, name, shopOwnerId } = shopData;

        // Load the existing shop's details and set the new local PIN.
        loadShopContext({ shopId: id, shopName: name, shopOwnerId });
        setAuthPin(pin);

        toast({
          title: 'Shop Joined!',
          description: `You can now access ${name}.`,
        });

      } else { 
        // Otherwise, the user is CREATING a new shop.
        const newSecretCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const shopId = doc(collection(firestore, 'shops')).id;
        const shopRef = doc(firestore, 'shops', shopId);

        await setDoc(shopRef, {
          id: shopId,
          name: shopName,
          shopOwnerId: user.uid,
          currency: '₹',
          logoUrl: '',
          secretCode: newSecretCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        await setDoc(doc(firestore, 'public', 'config'), {
          activeShopId: shopId,
          shopName: shopName,
        });

        const adminRef = doc(firestore, 'admins', user.uid);
        await setDoc(adminRef, {
          uid: user.uid,
          role: 'ADMIN',
          email: user.email || '',
        });

        setup(shopName, pin, shopId, user.uid);

        toast({
          title: 'Setup Complete!',
          description: `Welcome to ${shopName}. Your shop is ready.`,
        });
      }
      
      router.replace('/admin/login');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: error.message || 'An unknown error occurred during setup.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading || !user || isCheckingConfig || existingShopId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isJoining = !!existingShopConfig;
  const showPinStep = !isJoining && step === 2;
  const showJoinStep = isJoining;

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/10 bg-card/50 p-8 shadow-2xl backdrop-blur-lg"
      >
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="mt-6 font-headline text-3xl font-bold text-foreground text-center">
          {isJoining
            ? `Join ${shopName}`
            : step === 1
            ? "Let's Get Started"
            : 'Set Your Security PIN'}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {isJoining
            ? 'Enter the secret invite code provided by the shop owner, then create a PIN for this device.'
            : step === 1
            ? "First, what's the name of your shop?"
            : 'This PIN will be used to secure your shop data on this device.'}
        </p>

        {!isJoining && step === 1 && (
          <div className="mt-8 w-full space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                placeholder="e.g., The Corner Store"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="h-12 text-base"
                disabled={isJoining}
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
        )}

        {(showPinStep || showJoinStep) && (
          <div className="mt-8 w-full space-y-6">
            {isJoining && (
              <div className="space-y-2">
                <Label htmlFor="secret-code">Shop Invite Code</Label>
                <Input
                  id="secret-code"
                  placeholder="Enter Invite Code"
                  value={secretCode}
                  onChange={e => setSecretCode(e.target.value)}
                  className="h-12 text-base font-mono uppercase"
                  autoCapitalize='characters'
                />
              </div>
            )}

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
              disabled={
                pin.length !== 4 ||
                confirmPin.length !== 4 ||
                isSubmitting ||
                (isJoining && secretCode.length === 0)
              }
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                isJoining ? 'Join Shop' : 'Finish Setup'
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
