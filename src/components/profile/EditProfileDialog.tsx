
'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User as UserIcon, MessageSquare } from 'lucide-react';
import { updateProfile, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageInput from '@/components/inventory/ImageInput';

import { profileSchema, type ProfileFormData } from './profile-schema';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { getCloudinarySignatureAction } from '@/lib/actions/cloudinary';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function EditProfileDialog({ children, user }: { children: ReactNode, user: User }) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      bio: '',
      photo: undefined,
    },
  });
  
  const handleOpenChange = async (isOpen: boolean) => {
      if (isOpen) {
          setIsLoadingBio(true);
          try {
              const userDocRef = doc(firestore, 'users', user.uid);
              const userSnap = await getDoc(userDocRef);
              const currentBio = userSnap.exists() ? (userSnap.data().bio || '') : '';
              
              form.reset({
                  displayName: user.displayName || '',
                  bio: currentBio,
                  photo: undefined,
              });
          } catch (e) {
              console.error("Failed to load user profile details:", e);
          } finally {
              setIsLoadingBio(false);
          }
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

    try {
      let photoURL = user.photoURL;

      if (values.photo && values.photo instanceof File) {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
           throw new Error("Cloudinary is not configured correctly.");
        }

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

      // 1. Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: values.displayName,
        photoURL: photoURL,
      });

      // 2. Update Firestore User Document (Non-Blocking Pattern)
      const userDocRef = doc(firestore, 'users', user.uid);
      const updateData = {
        displayName: values.displayName,
        photoURL: photoURL || '',
        bio: values.bio || '',
        updatedAt: new Date().toISOString(),
      };

      updateDoc(userDocRef, updateData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'update',
              requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      toast({ title: 'Profile Updated', description: 'Your identity has been refreshed.' });
      setOpen(false);

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: e.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-background/95 backdrop-blur-2xl sm:max-w-md overflow-hidden p-0">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription className="font-bold">Upgrade your look and bio.</DialogDescription>
        </DialogHeader>
        
        <div className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
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
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="How should we call you?" 
                            className="h-14 rounded-2xl font-bold bg-secondary/50 border-primary/10 focus:border-primary/30" 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        About Me
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                            placeholder="Tell your story in 160 characters..." 
                            className="min-h-24 rounded-2xl font-bold bg-secondary/50 border-primary/10 focus:border-primary/30 resize-none" 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSaving || isLoadingBio} 
                    className="w-full rounded-2xl py-8 font-black text-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : 'Save Profile'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
