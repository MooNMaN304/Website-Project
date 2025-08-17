'use client';

import { useCart } from './cart-context';

/**
 * Example component showing how to use the new delete functionality
 * This demonstrates both the existing DeleteItemButton and the new deleteCartItem function
 */
export function DeleteExample() {
  const { cart, updateCartItem } = useCart();

  // Example of using the updateCartItem function with 'delete' type
  const handleDeleteItem = async (merchandiseId: string) => {
    await updateCartItem(merchandiseId, 'delete');
  };

  if (!cart || cart.lines.length === 0) {
    return <p>No items in cart</p>;
  }

  return (
    <div className="space-y-4">
      <h3>Cart Items with Delete Options</h3>

      {cart.lines.map((item) => (
        <div key={item.id} className="flex items-center justify-between border p-4">
          <div>
            <p className="font-medium">{item.merchandise.product.title}</p>
            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
          </div>

          <div className="flex space-x-2">
            {/* Option 1: Use the direct deleteCartItem function */}
            <button
              onClick={() => handleDeleteItem(item.merchandise.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Item
            </button>

            {/* Option 2: The existing DeleteItemButton component is used in the cart modal */}
            {/* <DeleteItemButton item={item} optimisticUpdate={updateCartItem} /> */}
          </div>
        </div>
      ))}
    </div>
  );
}
