"use client";

import React from "react";
import type { CartItem } from "@/lib/types";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Separator } from "@/components/ui/separator";

interface PrintableBillProps {
  items: CartItem[];
  total: number;
}

export const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ items, total }, ref) => {
  const shopName = useAuthStore((state) => state.shopName);
  const billId = `BILL-${Date.now().toString().slice(-6)}`;
  const billDate = new Date().toLocaleDateString("en-IN", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div ref={ref} className="p-8 font-sans text-sm text-black bg-white">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-serif">{shopName || "Your Shop"}</h1>
        <p className="text-gray-600">Invoice</p>
      </div>
      <div className="flex justify-between mb-4 text-xs">
        <p><strong>Bill No:</strong> {billId}</p>
        <p><strong>Date:</strong> {billDate}</p>
      </div>
      <Separator className="my-4 bg-gray-300" />
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 font-semibold text-center">Qty</th>
            <th className="py-2 font-semibold text-right">Price</th>
            <th className="py-2 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-center">{item.cartQuantity}</td>
              <td className="py-2 text-right">₹{item.price.toLocaleString()}</td>
              <td className="py-2 text-right">₹{(item.price * item.cartQuantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Separator className="my-4 bg-gray-300" />
      <div className="flex justify-end">
        <div className="w-1/2">
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
            </div>
        </div>
      </div>
      <div className="text-center mt-12 text-xs text-gray-500">
        <p>Thank you for your purchase!</p>
      </div>
    </div>
  );
});

PrintableBill.displayName = "PrintableBill";
