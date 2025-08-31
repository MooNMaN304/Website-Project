/**
 * Client-safe type definitions that don't import server-side modules
 * These types are extracted from lib/shopify/types to avoid server-side imports
 */

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: Image;
  images: Image[];
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  seo?: {
    title: string;
    description: string;
  };
  tags: string[];
  updatedAt: string;
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: Product;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
}

export interface Menu {
  title: string;
  path: string;
}

export interface Page {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Re-export for convenience
export type {
  Money as ShopifyMoney,
  Image as ShopifyImage,
  Product as ShopifyProduct,
  ProductVariant as ShopifyProductVariant,
  Cart as ShopifyCart,
  CartItem as ShopifyCartItem,
  Collection as ShopifyCollection,
  Menu as ShopifyMenu,
  Page as ShopifyPage
};
