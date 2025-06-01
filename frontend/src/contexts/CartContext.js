import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { productAPI } from '../services/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          // Reset reservation when cart changes
          reservationId: null,
          lastValidated: 0,
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
        // Reset reservation when cart changes
        reservationId: null,
        lastValidated: 0,
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        // Reset reservation when cart changes
        reservationId: null,
        lastValidated: 0,
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        // Reset reservation when cart changes
        reservationId: null,
        lastValidated: 0,
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        reservationId: null,
        lastValidated: 0,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
      
    case 'SET_RESERVATION':
      return {
        ...state,
        reservationId: action.payload,
        lastValidated: Date.now(),
        loading: false,
      };
    
    default:
      return state;
  }
};

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  loading: false,
  error: null,
  reservationId: localStorage.getItem('cartReservationId') || null,
  lastValidated: parseInt(localStorage.getItem('cartLastValidated')) || 0,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
    
    if (state.reservationId) {
      localStorage.setItem('cartReservationId', state.reservationId);
      localStorage.setItem('cartLastValidated', state.lastValidated.toString());
    } else {
      localStorage.removeItem('cartReservationId');
      localStorage.removeItem('cartLastValidated');
    }
  }, [state.items, state.reservationId, state.lastValidated]);

  const addItem = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id || product._id,
        title: product.title,
        price: product.price,
        image: product.images?.image1 || product.image,
        quantity,
        countInStock: product.countInStock,
      },
    });
  };

  const removeItem = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId,
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity },
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };
  
  // New function to check inventory and validate cart
  const validateCart = useCallback(async () => {
    // Skip validation if there are no items
    if (state.items.length === 0) return { valid: true };
    
    // Skip validation if it was done recently (within 5 minutes)
    const validationTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (state.lastValidated && (Date.now() - state.lastValidated < validationTimeLimit)) {
      return { valid: true, reservationId: state.reservationId };
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Format cart items for API
      const cartItems = state.items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      // Release previous reservation if it exists
      if (state.reservationId) {
        await productAPI.releaseInventory(state.reservationId);
      }
      
      // Try to reserve inventory
      const response = await productAPI.reserveInventory(cartItems);
      
      if (response.data.success) {
        dispatch({ 
          type: 'SET_RESERVATION', 
          payload: response.data.reservationId 
        });
        return { 
          valid: true, 
          reservationId: response.data.reservationId 
        };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.data.message });
        return { 
          valid: false, 
          issues: response.data.issues,
          message: response.data.message
        };
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to validate cart' 
      });
      return { valid: false, error };
    }
  }, [state.items, state.reservationId, state.lastValidated]);
  
  // Commit reservation after successful payment
  const commitReservation = async () => {
    if (!state.reservationId) return false;
    
    try {
      await productAPI.commitInventory(state.reservationId);
      clearCart();
      return true;
    } catch (error) {
      console.error('Failed to commit reservation:', error);
      return false;
    }
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    reservationId: state.reservationId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    validateCart,
    commitReservation
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
