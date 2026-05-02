
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Ticket } from 'lucide-react';
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
        const storedCode = shopData.inviteCode;
        const codeGeneratedAt = shopData.inviteCodeAt;

        // Validation for Temporary Code
        if (!storedCode || storedCode !== secretCode.trim()) {
            toast({
                variant: 'destructive',
                title: 'Invalid Code',
                description: 'The invite code you entered is incorrect.',
            });
            setIsSubmitting(false);
            return;
        }

        const expiryTime = 10 * 60 * 1000; // 10 minutes
        const isExpired = Date.now() - new Date(codeGeneratedAt).getTime() > expiryTime;

        if (isExpired) {
            toast({
                variant: 'destructive',
                title: 'Code Expired',
                description: 'This invite code has expired. Please ask the owner for a new one.',
            });
            setIsSubmitting(false);
            return;
        }

        const { id, name, shopOwnerId } = shopData;

        // Grant Admin Role in Firestore
        const adminRef = doc(firestore, 'admins', user.uid);
        await setDoc(adminRef, {
          uid: user.uid,
          role: 'ADMIN',
          email: user.email || '',
        });

        loadShopContext({ shopId: id, shopName: name, shopOwnerId });

        toast({
          title: 'Shop Joined!',
          description: `You are now an admin for ${name}.`,
        });

      } else { 
        // Initial setup for Owner
        const shopId = doc(collection(firestore, 'shops')).id;
        const shopRef = doc(firestore, 'shops', shopId);

        await setDoc(shopRef, {
          id: shopId,
          name: shopName,
          shopOwnerId: user.uid,
          currency: '₹',
          logoUrl: '',
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
        className="flex w-full max-w-sm flex-col items-center rounded-[2.5rem] border border-white/10 bg-card/50 p-8 shadow-2xl backdrop-blur-lg"
      >
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="mt-6 font-headline text-3xl font-bold text-foreground text-center">
          {isJoining ? `Join ${shopName}` : "Create Your Shop"}
        </h1>
        <p className="mt-2 text-center text-muted-foreground font-bold text-sm">
          {isJoining
            ? 'Enter the 6-digit temporary invite code provided by the shop owner.'
            : "Let's set up your new premium inventory and billing system."}
        </p>

        <div className="mt-8 w-full space-y-6">
          {!isJoining ? (
             <div className="space-y-2">
              <Label htmlFor="shopName" className="font-black text-xs uppercase tracking-widest text-muted-foreground">Shop Name</Label>
              <Input
                id="shopName"
                placeholder="e.g., The Corner Store"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="h-14 rounded-2xl text-base font-bold bg-secondary/50 border-none"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secret-code" className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Ticket className="h-3 w-3" />
                    Shop Invite Code
                </Label>
                <Input
                    id="secret-code"
                    placeholder="000000"
                    maxLength={6}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value.replace(/\D/g, ''))}
                    className="h-16 text-center text-3xl font-mono font-black tracking-[0.3em] rounded-2xl bg-secondary/50 border-none"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleSetup}
            className="w-full h-14 rounded-2xl text-base font-black shadow-2xl shadow-primary/20"
            size="lg"
            disabled={isSubmitting || (isJoining ? secretCode.length < 6 : shopName.trim().length < 3)}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              isJoining ? 'Join Shop' : 'Launch Shop'
            )}
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
