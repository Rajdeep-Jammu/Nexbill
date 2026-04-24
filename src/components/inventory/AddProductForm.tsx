"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Loader2 } from "lucide-react";

import { productSchema, type Product } from "@/app/(main)/inventory/product-schema";
import { addProduct, generateDescriptionAction } from "@/app/(main)/inventory/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" /> : "Add Product"}
    </Button>
  );
}

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 text-primary" />
          )}
          Generate with AI
        </Button>
    )
}

export function AddProductForm({ onFormSuccess }: { onFormSuccess: () => void }) {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(addProduct, initialState);
  const [genState, genAction] = useFormState(generateDescriptionAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      price: 0,
      quantity: 0,
      category: "",
      features: "",
      description: "",
    },
  });

  useEffect(() => {
    if (formState.message === "Product added successfully!") {
      toast({
        title: "Success",
        description: formState.message,
      });
      form.reset();
      onFormSuccess();
    } else if (formState.issues) {
      toast({
        variant: "destructive",
        title: "Error",
        description: formState.message,
      });
    }
  }, [formState, toast, form, onFormSuccess]);
  
  useEffect(() => {
    if (genState?.description) {
      form.setValue("description", genState.description);
      toast({
        title: "Description Generated!",
        description: "The AI-generated description has been added.",
      });
    }
    if (genState?.fields) {
      // Keep form fields populated after generation
      form.reset(genState.fields as Product);
    }
  }, [genState, form, toast]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4"
      >
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
                    type="submit"
                    formAction={genAction}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    >
                    <Wand2 className="h-4 w-4 text-primary" />
                    Generate with AI
                </Button>
              </div>
              <FormControl>
                <Textarea
                  placeholder="A creative and informative product description..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 flex justify-end">
            <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
