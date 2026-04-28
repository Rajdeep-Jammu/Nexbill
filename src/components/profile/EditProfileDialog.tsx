'use client';

import { useState, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { updateProfile, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ImageInput from '@/components/inventory/ImageInput';

import { profileSchema, type ProfileFormData } from './profile-schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { getCloudinarySignatureAction } from '@/lib/actions/cloudinary';

export function EditProfileDialog({ children, user }: { children: ReactNode, user: User }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      photo: undefined,
    },
  });
  
  const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) {
          form.reset({
              displayName: user.displayName || '',
              photo: undefined,
          })
      }
      setOpen(isOpen);
  }

  const onSubmit = async (values: ProfileFormData) => {
    setIsSaving(true);
    if (!auth.currentUser) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      setIsSaving(false);
      return;
    }
     if (values.photo && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)) {
        toast({
            variant: 'destructive',
            title: 'Cloudinary Not Configured',
            description: 'Please make sure Cloudinary is configured in your .env file to upload images.'
        });
        setIsSaving(false);
        return;
    }

    try {
      let photoURL = user.photoURL;

      if (values.photo && values.photo instanceof File) {
        const file = values.photo;
        const { timestamp, signature, error } = await getCloudinarySignatureAction('profiles');
        if (error) throw new Error(error);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', 'profiles');

        const endpoint = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          photoURL = data.secure_url;
        } else {
          const errorData = await response.json();
          throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }
      }

      await updateProfile(auth.currentUser, {
        displayName: values.displayName,
        photoURL: photoURL,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: values.displayName,
        photoURL: photoURL,
      });

      toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
      setOpen(false);

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: e.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <ImageInput onChange={field.onChange} initialImageUrl={user.photoURL} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
