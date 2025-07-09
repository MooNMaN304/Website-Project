'use client';

import { useState } from 'react';
import { useCart } from 'components/cart/cart-context';
import { useOrders } from 'components/orders/order-context';
import { createOrder, OrderRequest } from 'lib/api/orders';
import { useRouter } from 'next/navigation';

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'card' | 'paypal';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

interface UseCheckoutResult {
  isProcessing: boolean;
  error: string | null;
  processCheckout: (formData: CheckoutFormData) => Promise<void>;
  validateForm: (formData: CheckoutFormData) => string | null;
}

export function useCheckout(): UseCheckoutResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();

  const validateForm = (formData: CheckoutFormData): string | null => {
    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!formData[field as keyof CheckoutFormData]) {
        return `${field} is required`;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Validate payment method specific fields
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
        return 'All card details are required';
      }

      // Basic card number validation (remove spaces and check length)
      const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return 'Please enter a valid card number';
      }

      // Basic expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(formData.expiryDate)) {
        return 'Please enter expiry date in MM/YY format';
      }

      // CVV validation
      if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        return 'Please enter a valid CVV';
      }
    }

    return null;
  };

  const processCheckout = async (formData: CheckoutFormData): Promise<void> => {
    setError(null);
    setIsProcessing(true);

    try {
      // Validate form data
      const validationError = validateForm(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Prepare order data
      const orderData: OrderRequest = {
        email: formData.email,
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country
        },
        payment_method: formData.paymentMethod,
        payment_details: formData.paymentMethod === 'card' ? {
          card_number: formData.cardNumber,
          expiry_date: formData.expiryDate,
          cvv: formData.cvv,
          card_name: formData.cardName
        } : null
      };

      // Create order
      const orderResponse = await createOrder(orderData);

      // Add order to context
      addOrder(orderResponse);

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderResponse.id || orderResponse.order_id}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong processing your order. Please try again.';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    processCheckout,
    validateForm
  };
}
