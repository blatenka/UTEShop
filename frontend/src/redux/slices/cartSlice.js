import { createSlice } from '@reduxjs/toolkit';

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (cartItems) => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
};

// Helper function to load cart from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const initialState = {
  cartItems: loadCartFromLocalStorage(),
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { product, qty, title, price, image } = action.payload;

      // Check if item already exists
      const existingItem = state.cartItems.find(item => item.product === product);

      if (existingItem) {
        // Update quantity if item exists
        existingItem.qty += qty;
      } else {
        // Add new item to cart
        state.cartItems.push({
          product,
          title,
          qty,
          price,
          image,
        });
      }

      // Recalculate total price
      state.totalPrice = state.cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );

      saveCartToLocalStorage(state.cartItems);
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(item => item.product !== productId);

      // Recalculate total price
      state.totalPrice = state.cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );

      saveCartToLocalStorage(state.cartItems);
    },

    // Update quantity
    updateQuantity: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.cartItems.find(item => item.product === productId);

      if (item) {
        if (qty <= 0) {
          // Remove item if quantity is 0 or less
          state.cartItems = state.cartItems.filter(item => item.product !== productId);
        } else {
          item.qty = qty;
        }
      }

      // Recalculate total price
      state.totalPrice = state.cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );

      saveCartToLocalStorage(state.cartItems);
    },

    // Clear entire cart
    clearCart: (state) => {
      state.cartItems = [];
      state.totalPrice = 0;
      saveCartToLocalStorage([]);
    },

    // Calculate total price (useful when loading from localStorage)
    calculateTotal: (state) => {
      state.totalPrice = state.cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
      );
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, calculateTotal } =
  cartSlice.actions;

export default cartSlice.reducer;
