'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '../../lib/config';

const API_BASE_URL = getServerApiUrl();

export interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'card' | 'paypal';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

export async function processCheckout(prevState: any, formData: FormData): Promise<string> {
  try {
    // Extract form data
    const checkoutData: CheckoutData = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      country: formData.get('country') as string || 'US',
      paymentMethod: formData.get('paymentMethod') as 'card' | 'paypal',
      cardNumber: formData.get('cardNumber') as string,
      expiryDate: formData.get('expiryDate') as string,
      cvv: formData.get('cvv') as string,
      cardName: formData.get('cardName') as string,
    };    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    if (!authToken) {
      return 'Error: Please log in to complete your order';
    }

    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!checkoutData[field as keyof CheckoutData]) {
        return `Error: ${field} is required`;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkoutData.email)) {
      return 'Error: Please enter a valid email address';
    }

    // Validate payment method specific fields
    if (checkoutData.paymentMethod === 'card') {
      if (!checkoutData.cardNumber || !checkoutData.expiryDate || !checkoutData.cvv || !checkoutData.cardName) {
        return 'Error: All card details are required';
      }

      // Basic card number validation (remove spaces and check length)
      const cleanCardNumber = checkoutData.cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return 'Error: Please enter a valid card number';
      }

      // Basic expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(checkoutData.expiryDate)) {
        return 'Error: Please enter expiry date in MM/YY format';
      }

      // CVV validation
      if (checkoutData.cvv.length < 3 || checkoutData.cvv.length > 4) {
        return 'Error: Please enter a valid CVV';
      }
    }

    // Process order through backend API
    console.log('Processing checkout for:', checkoutData);

    try {
      const orderResponse = await fetch(`${API_BASE_URL}/api/users/order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: checkoutData.email,
          shipping_address: {
            first_name: checkoutData.firstName,
            last_name: checkoutData.lastName,
            address: checkoutData.address,
            city: checkoutData.city,
            state: checkoutData.state,
            zip_code: checkoutData.zipCode,
            country: checkoutData.country
          },
          payment_method: checkoutData.paymentMethod,
          payment_details: checkoutData.paymentMethod === 'card' ? {
            card_number: checkoutData.cardNumber,
            expiry_date: checkoutData.expiryDate,
            cvv: checkoutData.cvv,
            card_name: checkoutData.cardName
          } : null
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => null);
        console.error('Order creation failed:', errorData);
        return `Error: ${errorData?.detail || errorData?.message || 'Failed to process order'}`;
      }

      const orderData = await orderResponse.json();
      console.log('Order processed successfully:', orderData);

      // Redirect to success page with the order ID from backend
      redirect(`/checkout/success?orderId=${orderData.id || orderData.order_id}`);

    } catch (apiError) {
      console.error('API call failed:', apiError);
      return 'Error: Unable to connect to server. Please check your connection and try again.';
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return 'Error: Something went wrong processing your order. Please try again.';
  }
}
