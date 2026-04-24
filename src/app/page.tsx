import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/customer/ProductGrid";
import Cart from "@/components/customer/Cart";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function CustomerHomePage() {
  return (
    <div className="p-4">
      <PageHeader title="Our Products">
        <Link href="/admin/login">
          <Button variant="outline">
            <User className="mr-2" />
            Admin Panel
          </Button>
        </Link>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductGrid />
        </div>
        <div>
          <Cart />
        </div>
      </div>
    </div>
  );
}
