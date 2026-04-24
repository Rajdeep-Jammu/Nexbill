import { FieldValue } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  imageHint?: string;
  shopId?: string;
  shopOwnerId?: string;
  createdAt?: FieldValue | string;
  updatedAt?: FieldValue | string;
};

export type CartItem = Product & {
  cartQuantity: number;
};

export type Bill = {
    id: string;
    shopId: string;
    customerId?: string;
    customerAuthUid?: string;
    invoiceNumber: string;
    billDate: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    status: 'draft' | 'finalized' | 'paid' | 'cancelled';
    createdAt: FieldValue | string;
    updatedAt: FieldValue | string;
    itemCount?: number;
}

export type BillItem = {
    id: string;
    billId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    createdAt: FieldValue | string;
    updatedAt: FieldValue | string;
    shopOwnerId: string;
    customerAuthUid?: string;
}
