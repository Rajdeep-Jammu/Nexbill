export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  imageHint?: string;
};

export type CartItem = Product & {
  cartQuantity: number;
};
