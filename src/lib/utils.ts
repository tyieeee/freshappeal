import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function parseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  stock: Record<string, number>;
  images: string[];
  isFeatured: boolean;
  createdAt: Date;
};

export function deserializeProduct(p: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sizes: string;
  stock: string;
  images: string;
  isFeatured: boolean;
  createdAt: Date;
}): ProductView {
  return {
    ...p,
    sizes: parseJSON<string[]>(p.sizes, []),
    stock: parseJSON<Record<string, number>>(p.stock, {}),
    images: parseJSON<string[]>(p.images, []),
  };
}
