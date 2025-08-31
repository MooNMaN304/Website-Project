/**
 * Type-safe mappers for converting between backend API types and frontend types
 */
import type { components } from '../api/types';
import { Product, ProductVariant, Image, Money } from 'lib/shopify/types';
import { getClientApiUrl } from '../config';

type BackendProduct = components['schemas']['ProductResponseSchema'];
type BackendMoney = components['schemas']['MoneySchema'];
type BackendImage = components['schemas']['ProductImageNodeSchema'];
type BackendVariant = components['schemas']['ProductVariantNodeSchema'];
type BackendVariantEdge = components['schemas']['VariantEdgeSchema'];
type BackendImageEdge = components['schemas']['ImageEdgeSchema'];
type BackendOption = components['schemas']['ProductOptionSchema'];
type BackendSelectedOption = components['schemas']['SelectedOptionSchema'];

// Simple backend product type that matches actual API response
interface SimpleBackendProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

/**
 * Convert backend money format to frontend money format
 */
function mapMoney(backendMoney: BackendMoney): Money {
  return {
    amount: backendMoney.amount,
    currencyCode: backendMoney.currencyCode
  };
}

/**
 * Convert backend image format to frontend image format
 */
function mapImage(backendImage: BackendImage): Image {
  const apiBaseUrl = getClientApiUrl();

  // If the URL starts with '/', prepend the API base URL
  const imageUrl = backendImage.url.startsWith('/')
    ? `${apiBaseUrl}${backendImage.url}`
    : backendImage.url;

  return {
    url: imageUrl,
    altText: backendImage.altText || '',
    width: backendImage.width || undefined,
    height: backendImage.height || undefined
  };
}

/**
 * Convert backend variant format to frontend variant format
 */
function mapVariant(backendVariant: BackendVariant): ProductVariant {
  return {
    id: backendVariant.id,
    title: backendVariant.selectedOptions
      .map((opt: BackendSelectedOption) => opt.value)
      .join(' / ') || 'Default',
    availableForSale: backendVariant.availableForSale,
    selectedOptions: backendVariant.selectedOptions,
    price: mapMoney(backendVariant.price)
  };
}

/**
 * Convert simple backend product format (actual API response) to frontend product format
 */
export function mapSimpleBackendProductToFrontend(product: SimpleBackendProduct): Product {
  const apiBaseUrl = getClientApiUrl();

  return {
    id: product.id.toString(),
    handle: `product-${product.id}`,
    title: product.name || 'Product',
    description: product.description || '',
    descriptionHtml: product.description || '',
    updatedAt: new Date().toISOString(),
    tags: [],
    priceRange: {
      maxVariantPrice: {
        amount: product.price?.toString() || '0',
        currencyCode: 'USD'
      },
      minVariantPrice: {
        amount: product.price?.toString() || '0',
        currencyCode: 'USD'
      }
    },
    variants: [{
      id: `variant-${product.id}`,
      title: 'Default',
      availableForSale: true,
      selectedOptions: [],
      price: {
        amount: product.price?.toString() || '0',
        currencyCode: 'USD'
      }
    }],
    featuredImage: product.image_url ? {
      url: `${apiBaseUrl}${product.image_url}`,
      altText: product.name || 'Product image',
      width: 300,
      height: 300
    } : {
      url: '/placeholder.svg',
      altText: 'No image',
      width: 300,
      height: 300
    },
    images: product.image_url ? [{
      url: `${apiBaseUrl}${product.image_url}`,
      altText: product.name || 'Product image',
      width: 300,
      height: 300
    }] : [{
      url: '/placeholder.svg',
      altText: 'No image',
      width: 300,
      height: 300
    }],
    seo: {
      title: product.name || 'Product',
      description: product.description || ''
    },
    options: [],
    availableForSale: true
  };
}

/**
 * Map array of simple backend products to frontend products
 */
export function mapSimpleBackendProductsToFrontend(products: SimpleBackendProduct[]): Product[] {
  return products.map(mapSimpleBackendProductToFrontend);
}

/**
 * Convert backend product format to frontend product format
 */
export function mapBackendProductToFrontend(backendProduct: BackendProduct): Product {
  // Extract variants from the edge structure - handle case where variants might not exist
  const variants: ProductVariant[] = [];
  if (backendProduct.variants && typeof backendProduct.variants === 'object') {
    Object.values(backendProduct.variants).forEach((variantEdges: BackendVariantEdge[]) => {
      variantEdges.forEach((edge: BackendVariantEdge) => {
        variants.push(mapVariant(edge.node));
      });
    });
  }

  // Extract images from the edge structure - handle case where images might not exist
  const images: Image[] = [];
  if (backendProduct.images && typeof backendProduct.images === 'object') {
    Object.values(backendProduct.images).forEach((imageEdges: BackendImageEdge[]) => {
      imageEdges.forEach((edge: BackendImageEdge) => {
        images.push(mapImage(edge.node));
      });
    });
  }

  // Create default price range if not provided
  const defaultPrice = { amount: '0.00', currencyCode: 'USD' };
  const priceRange = backendProduct.priceRange ? {
    maxVariantPrice: mapMoney(backendProduct.priceRange.maxVariantPrice),
    minVariantPrice: mapMoney(backendProduct.priceRange.minVariantPrice)
  } : {
    maxVariantPrice: defaultPrice,
    minVariantPrice: defaultPrice
  };

  // Create default featured image if not provided
  const featuredImage = backendProduct.featuredImage ?
    mapImage(backendProduct.featuredImage) :
    { url: '', altText: '', width: undefined, height: undefined };

  return {
    id: backendProduct.id,
    handle: backendProduct.handle || backendProduct.id.toString(),
    title: backendProduct.title || 'Untitled Product',
    description: backendProduct.description || '',
    descriptionHtml: backendProduct.descriptionHtml || backendProduct.description || '',
    updatedAt: backendProduct.updatedAt || new Date().toISOString(),
    tags: backendProduct.tags || [],
    priceRange,
    variants,
    images,
    featuredImage,
    seo: backendProduct.seo ? {
      title: backendProduct.seo.title,
      description: backendProduct.seo.description
    } : {
      title: backendProduct.title || 'Product',
      description: backendProduct.description || ''
    },
    options: backendProduct.options ? backendProduct.options.map((option: BackendOption) => ({
      id: option.id,
      name: option.name,
      values: option.values
    })) : [],
    availableForSale: backendProduct.availableForSale ?? true
  };
}

/**
 * Map array of backend products to frontend products
 */
export function mapBackendProductsToFrontend(backendProducts: BackendProduct[]): Product[] {
  return backendProducts.map(mapBackendProductToFrontend);
}
