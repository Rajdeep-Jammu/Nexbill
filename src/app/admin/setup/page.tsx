'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, getDoc } from 'firebase/firestore';

import { useAuthStore } from '@/hooks/use-auth-store';
import { Logo } from '@/components/Logo';
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
  const [shopName, setShopName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [existingShopConfig, setExistingShopConfig] = useState<PublicConfig | null>(null);

  const router = useRouter();
  const { setup, loadShopContext, shopId: existingShopId } = useAuthStore();
  const { toast } = useToast();
  const { user, isUserLoading, isAdmin } = useUser();
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

  useEffect(() => {
    if (existingShopId) {
      router.replace('/admin/dashboard');
    }
  }, [existingShopId, router]);
  
  useEffect(() => {
    const checkConfig = async () => {
      if (firestore && !existingShopId) {
          const configRef = doc(firestore, 'public', 'config');
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            const configData = configSnap.data() as PublicConfig;
            setExistingShopConfig(configData);
            setShopName(configData.shopName);
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

  const handleSetup = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Setup Failed', description: 'User not found. Please log in again.'});
      return;
    }

    if (!existingShopConfig && shopName.trim().length < 3) {
      toast({ variant: 'destructive', title: 'Invalid Name', description: 'Shop name must be at least 3 characters.'});
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (existingShopConfig) {
        const shopRef = doc(firestore, 'shops', existingShopConfig.activeShopId);
        const shopSnap = await getDoc(shopRef);
        if (!shopSnap.exists()) {
            throw new Error("Shop data not found.");
        }

        const shopData = shopSnap.data();

        if (shopData.secretCode !== secretCode.toUpperCase()) {
            toast({
                variant: 'destructive',
                title: 'Invalid Secret Code',
                description: 'The invite code you entered is incorrect.',
            });
            setIsSubmitting(false);
            return;
        }

        const { id, name, shopOwnerId } = shopData;
        loadShopContext({ shopId: id, shopName: name, shopOwnerId });

        toast({
          title: 'Shop Joined!',
          description: `You are now an admin for ${name}.`,
        });

      } else { 
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

        setup(shopName, shopId, user.uid);

        toast({
          title: 'Setup Complete!',
          description: `Welcome to ${shopName}.`,
        });
      }
      
      router.replace('/admin/dashboard');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: error.message,
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

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/10 bg-card/50 p-8 shadow-2xl backdrop-blur-lg"
      >
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="mt-6 font-headline text-3xl font-bold text-foreground text-center">
          {isJoining ? `Join ${shopName}` : "Create Your Shop"}
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          {isJoining
            ? 'Enter the secret invite code provided by the shop owner to gain admin access.'
            : "Let's set up your new inventory and billing system."}
        </p>

        <div className="mt-8 w-full space-y-6">
          {!isJoining ? (
             <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                placeholder="e.g., The Corner Store"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          ) : (
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

          <Button
            onClick={handleSetup}
            className="w-full text-base font-bold"
            size="lg"
            disabled={isSubmitting || (isJoining ? !secretCode : shopName.trim().length < 3)}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              isJoining ? 'Join Shop' : 'Get Started'
            )}
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
