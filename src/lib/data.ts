import type { Product } from "@/lib/types";
import { PlaceHolderImages } from "./placeholder-images";

const products: Product[] = [
  {
    id: "prod_001",
    name: "AeroRun Pro Sneakers",
    price: 8999,
    quantity: 45,
    category: "Footwear",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_001")?.imageUrl || "",
    imageHint: "running shoes"
  },
  {
    id: "prod_002",
    name: "ChronoWatch Series 8",
    price: 24999,
    quantity: 18,
    category: "Electronics",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_002")?.imageUrl || "",
    imageHint: "smart watch"
  },
  {
    id: "prod_003",
    name: "Artisan Ceramic Mug",
    price: 1299,
    quantity: 8,
    category: "Homeware",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_003")?.imageUrl || "",
    imageHint: "coffee mug"
  },
  {
    id: "prod_004",
    name: "SoundScape Wireless Buds",
    price: 12500,
    quantity: 32,
    category: "Electronics",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_004")?.imageUrl || "",
    imageHint: "wireless headphones"
  },
  {
    id: "prod_005",
    name: "Urban Explorer Backpack",
    price: 5499,
    quantity: 25,
    category: "Accessories",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_005")?.imageUrl || "",
    imageHint: "stylish backpack"
  },
  {
    id: "prod_006",
    name: "ErgoFlow Office Chair",
    price: 18000,
    quantity: 5,
    category: "Furniture",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_006")?.imageUrl || "",
    imageHint: "office chair"
  },
  {
    id: "prod_007",
    name: "LensMaster Pro 50mm",
    price: 45000,
    quantity: 11,
    category: "Photography",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_007")?.imageUrl || "",
    imageHint: "camera lens"
  },
  {
    id: "prod_008",
    name: "GlowDesk Minimal Lamp",
    price: 3200,
    quantity: 0,
    category: "Lighting",
    imageUrl: PlaceHolderImages.find(p => p.id === "prod_008")?.imageUrl || "",
    imageHint: "desk lamp"
  },
];

export const getProducts = () => {
  return products;
};
