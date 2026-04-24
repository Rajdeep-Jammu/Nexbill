"use client";

import PageHeader from "@/components/PageHeader";
import ProductSelector from "@/components/billing/ProductSelector";
import CurrentBill from "@/components/billing/CurrentBill";
import { getProducts } from "@/lib/data";
import SessionLoader from "@/components/billing/SessionLoader";

export default function BillingPage() {
  const products = getProducts();

  return (
    <div>
      <PageHeader title="Billing" />
      <SessionLoader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ProductSelector products={products} />
        </div>
        <div>
            <CurrentBill />
        </div>
      </div>
    </div>
  );
}
