# Cart Item Delete Functionality

This document describes the implementation of cart item deletion functionality that makes DELETE calls to the backend API.

## Backend API Endpoint

The implementation makes DELETE calls to:
```
DELETE /api/users/carts/items/{product_id}
```

## Implementation Details

### 1. Cart Context (`components/cart/cart-context.tsx`)

Enhanced the cart context with:

- **`deleteCartItem` function**: A dedicated function for deleting items that makes API calls
- **Enhanced `updateCartItem` function**: Now includes API calls for delete operations
- **Graceful error handling**: Continues with local deletion even if backend API fails

### 2. Cart Actions (`components/cart/actions.ts`)

Updated the `removeItem` function to:

- Make DELETE API calls to the backend before local removal
- Include proper authentication headers with Bearer token
- Handle API errors gracefully while continuing with local operations

### 3. Cart Library (`lib/cart.ts`)

Added new functionality:

- **`removeItemFromApi` function**: Dedicated function for API-based item removal
- **Enhanced `removeFromCart` function**: Now integrates with the API for each removed item
- **Proper error handling and logging**

### 4. Existing Components

The existing `DeleteItemButton` component automatically benefits from these changes:

- Located in `components/cart/delete-item-button.tsx`
- Uses the updated `removeItem` action
- Already integrated into the cart modal
- Now makes backend API calls when deleting items

## Usage Examples

### Option 1: Using the DeleteItemButton (Recommended)

The existing `DeleteItemButton` component is already updated and used in the cart modal:

```tsx
import { DeleteItemButton } from 'components/cart/delete-item-button';

// This component automatically makes API calls when deleting items
<DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
```

### Option 2: Using the deleteCartItem function directly

```tsx
import { useCart } from 'components/cart/cart-context';

function MyComponent() {
  const { deleteCartItem } = useCart();

  const handleDelete = async (merchandiseId: string) => {
    await deleteCartItem(merchandiseId);
  };

  return (
    <button onClick={() => handleDelete(item.merchandise.id)}>
      Delete Item
    </button>
  );
}
```

### Option 3: Using the removeItem action

```tsx
import { removeItem } from 'components/cart/actions';
import { useActionState } from 'react';

function CustomDeleteButton({ merchandiseId }: { merchandiseId: string }) {
  const [message, formAction] = useActionState(removeItem, null);
  const removeItemAction = formAction.bind(null, merchandiseId);

  return (
    <form action={removeItemAction}>
      <button type="submit">Delete Item</button>
    </form>
  );
}
```

## API Integration Details

### Authentication
- Uses Bearer token from `localStorage.getItem('authToken')`
- Includes proper Authorization headers

### Error Handling
- Logs errors to console for debugging
- Continues with local operations even if API calls fail
- Provides graceful degradation

### Request Format
```typescript
fetch(`http://localhost:8000/api/users/carts/items/${productId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
});
```

## Benefits

1. **Seamless Integration**: Existing components automatically get API functionality
2. **Error Resilience**: Local cart operations continue even if backend is unavailable
3. **Multiple Usage Patterns**: Supports various ways to delete items
4. **Consistent State**: Keeps both local and backend cart state synchronized
5. **User Experience**: Optimistic updates provide immediate feedback

## Files Modified

- `components/cart/cart-context.tsx` - Enhanced with API integration
- `components/cart/actions.ts` - Updated removeItem function
- `lib/cart.ts` - Added API functions and enhanced local functions
- `components/cart/delete-example.tsx` - Example usage (new file)
