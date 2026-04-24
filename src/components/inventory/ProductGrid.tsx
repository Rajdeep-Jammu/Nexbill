import { getProducts } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const products = getProducts();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
