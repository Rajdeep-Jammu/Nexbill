import { getProducts } from "@/lib/data";
import CustomerProductCard from "./CustomerProductCard";

export default function ProductGrid() {
  const products = getProducts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <CustomerProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
