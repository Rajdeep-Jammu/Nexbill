import { getProducts } from "@/lib/data";
import CustomerProductCard from "./CustomerProductCard";

export default function ProductGrid() {
  const products = getProducts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <CustomerProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
