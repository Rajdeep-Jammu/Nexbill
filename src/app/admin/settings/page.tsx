'use client';

import { useState } from 'react';
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
import { LogOut, KeyRound, QrCode, Wallet, Loader2, Edit, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChangePinDialog } from '@/components/settings/ChangePinDialog';
import ImageInput from '@/components/inventory/ImageInput';
import { getCloudinarySignatureAction } from '@/lib/actions/cloudinary';
import { ChangeShopNameDialog } from '@/components/settings/ChangeShopNameDialog';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    shopName,
    reset: resetAuth,
    logout,
    biometricEnabled,
    toggleBiometric,
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

  const shopRef = useMemoFirebase(
    () => (shopId ? doc(firestore, 'shops', shopId) : null),
    [firestore, shopId]
  );
  const { data: shopData, isLoading: isShopLoading } = useDoc(shopRef);
  const secretCode = (shopData as any)?.secretCode;

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  const handleReset = () => {
    resetAuth();
    clearCart();
    toast({
      title: 'Application Reset',
      description: 'All your data has been cleared. Please set up a new shop.',
    });
    router.replace('/admin/setup');
  };

  const handlePaymentDetailsSave = async () => {
    setIsSavingPayment(true);
    let finalQrCodeUrl = qrCodeUrl;

    if (
      qrCodeFile &&
      (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)
    ) {
      toast({
        variant: 'destructive',
        title: 'Cloudinary Not Configured',
        description:
          'Please make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY are set in your .env file to upload a new QR code.',
      });
      setIsSavingPayment(false);
      return;
    }

    try {
      if (qrCodeFile) {
        const { timestamp, signature, error } =
          await getCloudinarySignatureAction('qrcodes');
        if (error) throw new Error(error);

        const formData = new FormData();
        formData.append('file', qrCodeFile);
        formData.append(
          'api_key',
          process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string
        );
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', 'qrcodes');

        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          finalQrCodeUrl = data.secure_url;
        } else {
          const errorData = await response.json();
          throw new Error(
            `Cloudinary upload failed: ${errorData.error.message}`
          );
        }
      }

      setPaymentDetails({
        upiId: localUpiId,
        qrCodeUrl: finalQrCodeUrl || '',
      });

      toast({
        title: 'Payment Details Saved',
        description: 'Your payment information has been updated.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error Saving Details',
        description: e.message || 'Could not save payment details.',
      });
    } finally {
      setIsSavingPayment(false);
      setQrCodeFile(null);
    }
  };

  const handleCopyCode = () => {
    if (!secretCode) return;
    navigator.clipboard.writeText(secretCode);
    toast({
        title: "Code Copied!",
        description: "The shop invite code has been copied to your clipboard.",
    });
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
            <CardDescription>
              Details about your currently configured shop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Shop Name</p>
                <p className="font-semibold">{shopName}</p>
              </div>
              <ChangeShopNameDialog>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </ChangeShopNameDialog>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your application's security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="biometric-switch"
                className="flex flex-col gap-1 pr-4"
              >
                <span className="font-semibold">Enable Biometric Login</span>
                <span className="text-sm text-muted-foreground">
                  Use your device's biometrics for quick access.
                </span>
              </Label>
              <Switch
                id="biometric-switch"
                checked={biometricEnabled || false}
                onCheckedChange={toggleBiometric}
              />
            </div>
            <ChangePinDialog>
              <Button variant="outline">
                <KeyRound className="mr-2 h-4 w-4" />
                Change PIN
              </Button>
            </ChangePinDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shop Invite Code</CardTitle>
            <CardDescription>
              Share this code with other users to allow them to join and manage
              this shop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isShopLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : secretCode ? (
              <div
                className="flex items-center gap-4"
                onClick={handleCopyCode}
              >
                <div className="flex-1 cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/50 p-4 text-center">
                  <p className="font-mono text-3xl font-bold tracking-widest text-primary">
                    {secretCode}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No invite code found for this shop.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Configure QR code and UPI details for receiving payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="upiId" className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" />
                UPI ID
              </Label>
              <Input
                id="upiId"
                placeholder="your-name@upi"
                value={localUpiId}
                onChange={e => setLocalUpiId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <QrCode className="mr-2 h-4 w-4" />
                QR Code Image
              </Label>
              <ImageInput onChange={setQrCodeFile} initialImageUrl={qrCodeUrl} />
            </div>
            <Button
              onClick={handlePaymentDetailsSave}
              disabled={isSavingPayment}
            >
              {isSavingPayment ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Save Payment Details'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These actions are irreversible. Please be certain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Application Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all your shop data, including sales history and settings. You
                    will be redirected to the welcome screen to start over.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
