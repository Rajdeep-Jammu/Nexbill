"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LogOut, KeyRound, QrCode, Wallet } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangePinDialog } from "@/components/settings/ChangePinDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { shopName, reset: resetAuth, logout, biometricEnabled, toggleBiometric, upiId, qrCodeUrl, setPaymentDetails } = useAuthStore();
  const { clearCart } = useBillingStore();
  
  const [localUpiId, setLocalUpiId] = useState(upiId || "");
  const [localQrCodeUrl, setLocalQrCodeUrl] = useState(qrCodeUrl || "");

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const handleReset = () => {
    resetAuth();
    clearCart();
    toast({
      title: "Application Reset",
      description: "All your data has been cleared. Please set up a new shop.",
    });
    router.replace("/admin/setup");
  };

  const handlePaymentDetailsSave = () => {
    setPaymentDetails({ upiId: localUpiId, qrCodeUrl: localQrCodeUrl });
    toast({
      title: "Payment Details Saved",
      description: "Your UPI and QR code information has been updated.",
    });
  };

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
            <CardDescription>Details about your currently configured shop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Shop Name</p>
              <p className="font-semibold">{shopName}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className='w-full sm:w-auto'>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your application's security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
              <Label htmlFor="biometric-switch" className="flex flex-col gap-1 pr-4">
                <span className="font-semibold">Enable Biometric Login</span>
                <span className="text-sm text-muted-foreground">Use your device's biometrics for quick access.</span>
              </Label>
              <Switch id="biometric-switch" checked={biometricEnabled || false} onCheckedChange={toggleBiometric} />
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
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure QR code and UPI details for receiving payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="upiId" className="flex items-center"><Wallet className="mr-2 h-4 w-4" />UPI ID</Label>
                    <Input id="upiId" placeholder="your-name@upi" value={localUpiId} onChange={(e) => setLocalUpiId(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="qrCodeUrl" className="flex items-center"><QrCode className="mr-2 h-4 w-4" />QR Code Image URL</Label>
                    <Input id="qrCodeUrl" placeholder="https://your-image-url.com/qr.png" value={localQrCodeUrl} onChange={(e) => setLocalQrCodeUrl(e.target.value)} />
                </div>
                <Button onClick={handlePaymentDetailsSave}>Save Payment Details</Button>
            </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
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
                    This action cannot be undone. This will permanently delete all your shop data,
                    including sales history and settings. You will be redirected to the
                    welcome screen to start over.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">Yes, delete everything</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
