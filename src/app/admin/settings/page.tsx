
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useBillingStore } from '@/hooks/use-billing-store';
import PageHeader from '@/components/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Wallet, Loader2, Edit, Copy, Store, Ticket, CreditCard, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ImageInput from '@/components/inventory/ImageInput';
import { getCloudinarySignatureAction } from '@/lib/actions/cloudinary';
import { ChangeShopNameDialog } from '@/components/settings/ChangeShopNameDialog';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const {
    shopName,
    reset: resetAuth,
    upiId,
    qrCodeUrl,
    setPaymentDetails,
    shopId,
  } = useAuthStore();
  const { clearCart } = useBillingStore();
  const firestore = useFirestore();

  const [localUpiId, setLocalUpiId] = useState(upiId || '');
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const shopRef = useMemoFirebase(
    () => (shopId ? doc(firestore, 'shops', shopId) : null),
    [firestore, shopId]
  );
  const { data: shopData, isLoading: isShopLoading } = useDoc(shopRef);

  const inviteCode = (shopData as any)?.inviteCode;
  const inviteCodeAt = (shopData as any)?.inviteCodeAt;
  const isOwner = user?.uid === (shopData as any)?.shopOwnerId;

  // Sync local state when shopData loads
  useEffect(() => {
    if (shopData) {
      if ((shopData as any).upiId) setLocalUpiId((shopData as any).upiId);
    }
  }, [shopData]);

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleReset = () => {
    resetAuth();
    clearCart();
    toast({
      title: 'Application Reset',
      description: 'System has been reset.',
    });
    router.replace('/admin/setup');
  };

  const handleGenerateInvite = async () => {
    if (!shopId || !isOwner) return;
    setIsGeneratingInvite(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const shopDocRef = doc(firestore, 'shops', shopId);
      await updateDoc(shopDocRef, {
        inviteCode: newCode,
        inviteCodeAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'Invite Code Generated',
        description: 'New code is valid for 10 minutes.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate code',
        description: e.message,
      });
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handlePaymentDetailsSave = async () => {
    if (!shopId) return;
    setIsSavingPayment(true);
    let finalQrCodeUrl = (shopData as any)?.qrCodeUrl || qrCodeUrl;

    try {
      if (qrCodeFile) {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
            throw new Error("Cloudinary not configured in .env");
        }

        const { timestamp, signature, error } = await getCloudinarySignatureAction('qrcodes');
        if (error) throw new Error(error);

        const formData = new FormData();
        formData.append('file', qrCodeFile);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', 'qrcodes');

        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        const response = await fetch(endpoint, { method: 'POST', body: formData });

        if (response.ok) {
          const data = await response.json();
          finalQrCodeUrl = data.secure_url;
        } else {
          const errorData = await response.json();
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }
      }

      const shopDocRef = doc(firestore, 'shops', shopId);
      await updateDoc(shopDocRef, {
        upiId: localUpiId,
        qrCodeUrl: finalQrCodeUrl,
        updatedAt: serverTimestamp()
      });

      setPaymentDetails({
        upiId: localUpiId,
        qrCodeUrl: finalQrCodeUrl || '',
      });

      toast({
        title: 'Cloud Synced',
        description: 'Payment details updated across all devices.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: e.message,
      });
    } finally {
      setIsSavingPayment(false);
      setQrCodeFile(null);
    }
  };

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    toast({
        title: "Copied!",
        description: "Invite code copied to clipboard.",
    });
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader title="Shop Settings" />
      
      <div className="grid gap-6 sm:gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Store className="h-5 w-5" />
                </div>
                Business Info
              </CardTitle>
              <CardDescription className="font-bold">Manage your core shop identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary/50">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Shop Name</p>
                  <p className="font-black text-xl">{shopName}</p>
                </div>
                <ChangeShopNameDialog>
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary/10">
                    <Edit className="h-5 w-5 text-primary" />
                  </Button>
                </ChangeShopNameDialog>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto rounded-xl font-black gap-2 h-12"
              >
                <LogOut className="h-5 w-5" />
                Exit Admin Panel
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Ticket className="h-5 w-5" />
                </div>
                Invite Shopkeepers
              </CardTitle>
              <CardDescription className="font-bold">Add other admins to your shop (Valid for 10 min).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isShopLoading ? (
                <Skeleton className="h-20 w-full rounded-2xl" />
              ) : isOwner ? (
                <div className="space-y-6">
                   {inviteCode ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div 
                                className="flex-1 cursor-pointer rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center group hover:bg-primary/10 transition-colors"
                                onClick={handleCopyCode}
                            >
                                <p className="font-mono text-4xl font-black tracking-[0.2em] text-primary">
                                {inviteCode}
                                </p>
                            </div>
                            <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-primary/20" onClick={handleCopyCode}>
                                <Copy className="h-6 w-6 text-primary" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-muted-foreground bg-secondary/50 py-2 rounded-xl">
                            <Clock className="h-3 w-3" />
                            Generated at {new Date(inviteCodeAt).toLocaleTimeString()}
                        </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/50">
                        <p className="text-sm text-muted-foreground font-bold italic mb-4">No active invite code. Generate one below.</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleGenerateInvite} 
                    disabled={isGeneratingInvite}
                    className="w-full rounded-xl py-6 font-black text-base gap-2 bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20"
                  >
                    {isGeneratingInvite ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    Generate Temporary Invite Code
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-bold italic text-center py-4 bg-secondary/20 rounded-xl border border-border/50">
                  Only the shop owner can generate invite codes.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                Payments
              </CardTitle>
              <CardDescription className="font-bold">Receive money via UPI and QR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="upiId" className="font-black text-xs uppercase tracking-widest text-muted-foreground">UPI ID</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="upiId"
                    placeholder="merchant@upi"
                    value={localUpiId}
                    onChange={e => setLocalUpiId(e.target.value)}
                    className="pl-10 h-12 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">Payment QR Code</Label>
                <div className="max-w-xs mx-auto">
                  <ImageInput onChange={setQrCodeFile} initialImageUrl={(shopData as any)?.qrCodeUrl || qrCodeUrl} />
                </div>
              </div>
              <Button
                onClick={handlePaymentDetailsSave}
                disabled={isSavingPayment}
                className="w-full rounded-xl py-6 font-black text-lg shadow-xl shadow-primary/20"
              >
                {isSavingPayment ? <Loader2 className="animate-spin" /> : 'Update Cloud Payment Assets'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="rounded-[2rem] border-destructive/20 bg-destructive/5 backdrop-blur-xl card-3d overflow-hidden border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Danger Zone
              </CardTitle>
              <CardDescription className="font-bold text-destructive/80">Irreversible actions. Be careful.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full rounded-xl py-6 font-black text-base shadow-xl shadow-red-500/10">
                    Full System Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black text-2xl">Absolute Certainty Required</AlertDialogTitle>
                    <AlertDialogDescription className="font-bold">
                      This will wipe all local shop context. The cloud data remains, but you'll need to join again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive hover:bg-destructive/90 rounded-xl font-black"
                    >
                      Reset Local Context
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
