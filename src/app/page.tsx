import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/inventory/ProductGrid";
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
      <ProductGrid />
    </div>
  );
}
