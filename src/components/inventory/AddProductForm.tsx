'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, Loader2 } from 'lucide-react';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { productSchema, type ProductFormData } from '@/app/admin/inventory/product-schema';
import { generateDescriptionAction } from '@/app/admin/inventory/actions';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useFirestore, useStorage } from '@/firebase';
import ImageInput from './ImageInput';

const initialState = {
  message: '',
};

export function AddProductForm({ onFormSuccess }: { onFormSuccess: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { shopId, shopOwnerId } = useAuthStore();
  const firestore = useFirestore();
  const storage = useStorage();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [genState, genAction] = useActionState(generateDescriptionAction, initialState);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      price: 0,
      quantity: 0,
      category: '',
      features: '',
      description: '',
      image: undefined,
      imageHint: '',
    },
  });

  useEffect(() => {
    if (genState?.description) {
      form.setValue('description', genState.description);
      toast({
        title: 'Description Generated!',
        description: 'The AI-generated description has been added.',
      });
    }
     if (genState?.fields) {
      // Repopulate all fields from the state after generation
      Object.entries(genState.fields).forEach(([key, value]) => {
        form.setValue(key as keyof ProductFormData, value);
      });
    }
    if (genState?.issues) {
       toast({
        variant: 'destructive',
        title: 'Error generating description',
        description: genState.issues.join(', '),
      });
    }
  }, [genState, form, toast]);

  const handleFormSubmit = async (values: ProductFormData) => {
    setIsSubmitting(true);
    if (!shopId || !shopOwnerId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Shop context is missing. Please log in again.'
        });
        setIsSubmitting(false);
        return;
    }

    try {
        let imageUrl = '';
        let imageHint = values.imageHint || values.category;

        // Check if a new image file was provided
        if (values.image && values.image instanceof File) {
            const file = values.image;
            const filePath = `products/${shopId}/${Date.now()}-${file.name}`;
            const fileRef = storageRef(storage, filePath);

            await uploadBytes(fileRef, file);
            imageUrl = await getDownloadURL(fileRef);
        }

        const productsRef = collection(firestore, 'shops', shopId, 'products');
        const newDocRef = doc(productsRef);

        await setDoc(newDocRef, {
            id: newDocRef.id,
            shopId: shopId,
            shopOwnerId: shopOwnerId,
            name: values.productName,
            price: values.price,
            quantity: values.quantity,
            category: values.category,
            features: values.features,
            description: values.description,
            imageUrl: imageUrl,
            imageHint: imageHint,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast({
            title: 'Success',
            description: 'Product added successfully!',
        });
        form.reset();
        onFormSuccess();

    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: 'Error saving product',
            description: e.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form 
        ref={formRef} 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                   <ImageInput onChange={field.onChange} />
                </FormControl>
                <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Premium Running Shoes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="999.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Footwear, Electronics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Key Features</FormLabel>
              <FormControl>
                <Input placeholder="waterproof, long battery life, ergonomic..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <FormLabel>Description</FormLabel>
                <Button 
                    type="button" 
                    onClick={() => {
                        const formData = new FormData();
                        formData.append('productName', form.getValues('productName'));
                        formData.append('category', form.getValues('category'));
                        formData.append('features', form.getValues('features') || '');
                        formData.append('description', form.getValues('description') || '');
                        genAction(formData);
                    }}
                    variant="outline" size="sm" className="gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Generate with AI
                </Button>
              </div>
              <FormControl>
                <Textarea placeholder="A creative and informative product description..." className="min-h-24" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 flex justify-end">
             <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Add Product'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
