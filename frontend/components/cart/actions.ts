  'use client';

  import {
    addProductToCart,
    getCart,
    removeFromCart,
    updateCart
  } from 'lib/cart';
  import { ProductVariant, Product } from 'lib/shopify/types';

  export async function addItem(
    prevState: any,
    selectedVariantId: string | undefined
  ) {
    if (!selectedVariantId) {
      return 'Error adding item to cart';
    }

    try {
      await addToCart([{ merchandiseId: selectedVariantId, quantity: 1 }]);
    } catch (e) {
      return 'Error adding item to cart';
    }
  }

  export async function removeItem(prevState: any, merchandiseId: string) {
    try {
      const cart = await getCart();

      if (!cart) {
        return 'Error fetching cart';
      }

      const lineItem = cart.lines.find(
        (line) => line.merchandise.id === merchandiseId
      );

      if (lineItem && lineItem.id) {
        await removeFromCart([lineItem.id]);
      } else {
        return 'Item not found in cart';
      }
    } catch (e) {
      return 'Error removing item from cart';
    }
  }

  export async function updateItemQuantity(
    prevState: any,
    payload: {
      merchandiseId: string;
      quantity: number;
    }
  ) {
    const { merchandiseId, quantity } = payload;

    try {
      // Если количество равно 0, удаляем товар
      if (quantity === 0) {
        return await removeItem(prevState, merchandiseId);
      }

      // Проверяем что количество в допустимых пределах
      if (quantity < 1 || quantity > 100) {
        throw new Error('Quantity must be between 1 and 100');
      }

      const cart = await getCart();

      if (!cart) {
        return 'Error fetching cart';
      }

      const lineItem = cart.lines.find(
        (line) => line.merchandise.id === merchandiseId
      );

      if (lineItem && lineItem.id) {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity
          }
        ]);
      } else if (quantity > 0) {
        await addToCart([{ merchandiseId, quantity }]);
      }
    } catch (e) {
      console.error(e);
      return 'Error updating item quantity';
    }
  }

  export async function redirectToCheckout() {
    let cart = await getCart();
    window.location.href = cart.checkoutUrl || '/checkout';
  }

  export async function createCartAndSetCookie() {
    // No need to explicitly create a cart or set a cookie,
    // the frontend cart implementation handles this internally
    await getCart(); // This will create a cart if one doesn't exist
  }

  // Helper functions that will be needed
  async function addToCart(lines: { merchandiseId: string; quantity: number }[]) {
    // This is a simplified version that doesn't have proper product details
    // In a real implementation, you'd need to fetch the product details first
    const cart = await getCart();

    for (const line of lines) {
      const { merchandiseId, quantity } = line;
      const existingItem = cart.lines.find(item => item.merchandise.id === merchandiseId);

      if (existingItem && existingItem.id) {
        await updateCart([{
          id: existingItem.id,
          merchandiseId,
          quantity: existingItem.quantity + quantity
        }]);
      } else {
        // In a real implementation, we would fetch product details here
        // For now just add a placeholder product
        const mockVariant: ProductVariant = {
          id: merchandiseId,
          title: 'Product Variant',
          availableForSale: true,
          selectedOptions: [],
          price: { amount: '0', currencyCode: 'USD' }
        };

        const mockProduct: Product = {
          id: 'mock-product',
          handle: 'mock-product',
          availableForSale: true,
          title: 'Product',
          description: '',
          descriptionHtml: '',
          options: [],
          priceRange: {
            maxVariantPrice: { amount: '0', currencyCode: 'USD' },
            minVariantPrice: { amount: '0', currencyCode: 'USD' }
          },
          variants: [],
          featuredImage: {
            url: '',
            altText: '',
            width: 0,
            height: 0
          },
          images: [],
          seo: {
            title: '',
            description: ''
          },
          tags: [],
          updatedAt: new Date().toISOString()
        };

        await addProductToCart(mockVariant, mockProduct, quantity);
      }
    }

    return cart;
  }
