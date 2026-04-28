'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function ChangeShopNameDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { shopId, shopName, setShopName } = useAuthStore();
  const [newName, setNewName] = useState(shopName || '');
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newName.trim() || newName.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Shop name must be at least 3 characters long.',
      });
      return;
    }
    if (!shopId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Shop ID not found.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const batch = writeBatch(firestore);

      const shopRef = doc(firestore, 'shops', shopId);
      batch.update(shopRef, { name: newName });

      const publicConfigRef = doc(firestore, 'public', 'config');
      batch.update(publicConfigRef, { shopName: newName });

      await batch.commit();

      setShopName(newName);
      toast({ title: 'Success', description: 'Shop name updated successfully.' });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update shop name.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setNewName(shopName || '');
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Shop Name</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="shop-name">New Shop Name</Label>
          <Input
            id="shop-name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Your new shop name"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
