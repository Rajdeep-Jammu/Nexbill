import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/inventory/ProductGrid";
import AddProductDialog from "@/components/inventory/AddProductDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  return (
    <div>
      <PageHeader title="Inventory">
        <AddProductDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </AddProductDialog>
      </PageHeader>
      
      <ProductGrid />
    </div>
  );
}
